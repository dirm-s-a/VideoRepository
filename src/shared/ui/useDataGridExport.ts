'use client';

import { useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  field: string;
  width?: number;
}

interface UseDataGridExportOptions<T> {
  /** Datos a exportar (estáticos) - se usa si no se provee getData */
  data?: T[];
  /** Función para obtener datos (permite exportar datos filtrados) */
  getData?: () => T[];
  /** Columnas para exportación */
  columns: ExportColumn[];
  /** Nombre del archivo (sin extensión) */
  fileName?: string;
  /** Título del reporte PDF */
  title?: string;
  /** Habilitar escucha del evento de menú contextual para PDF (default: true) */
  listenContextMenuPdf?: boolean;
}

/**
 * Hook para exportar datos del DataGrid a Excel, PDF y CSV
 * Soporta exportar datos filtrados mediante la función getData
 */
export function useDataGridExport<T extends object>({
  data,
  getData,
  columns,
  fileName = 'export',
  title = 'Reporte',
  listenContextMenuPdf = true,
}: UseDataGridExportOptions<T>) {
  // Obtener datos: priorizar getData (filtrados) sobre data (todos)
  const resolveData = useCallback(() => {
    if (getData) {
      return getData();
    }
    return data ?? [];
  }, [getData, data]);

  /**
   * Exportar a Excel usando xlsx
   */
  const exportToExcel = useCallback(() => {
    const exportData = resolveData();

    // Preparar datos con headers
    const headers = columns.map((col) => col.header);
    const rows = exportData.map((row) =>
      columns.map((col) => {
        const value = (row as Record<string, unknown>)[col.field];
        // Formatear valores especiales
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? 'Sí' : 'No';
        if (value instanceof Date) return value.toLocaleDateString('es-AR');
        return value;
      })
    );

    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Ajustar anchos de columna
    const colWidths = columns.map((col) => ({
      wch: col.width || Math.max(col.header.length, 15),
    }));
    ws['!cols'] = colWidths;

    // Crear workbook y exportar
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }, [resolveData, columns, fileName]);

  /**
   * Exportar a PDF usando jsPDF + autoTable
   */
  const exportToPdf = useCallback(() => {
    const exportData = resolveData();

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Título
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    // Fecha de generación y cantidad de registros
    doc.setFontSize(10);
    doc.text(
      `Generado: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')} - ${exportData.length} registros`,
      14,
      22
    );

    // Tabla con autoTable
    const headers = columns.map((col) => col.header);
    const rows = exportData.map((row) =>
      columns.map((col) => {
        const value = (row as Record<string, unknown>)[col.field];
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? 'Sí' : 'No';
        if (value instanceof Date) return value.toLocaleDateString('es-AR');
        if (typeof value === 'number') {
          return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value);
        }
        return String(value);
      })
    );

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 28,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Guardar
    doc.save(`${fileName}.pdf`);
  }, [resolveData, columns, fileName, title]);

  /**
   * Exportar a CSV
   */
  const exportToCsv = useCallback(() => {
    const exportData = resolveData();

    const headers = columns.map((col) => col.header);
    const rows = exportData.map((row) =>
      columns.map((col) => {
        const value = (row as Record<string, unknown>)[col.field];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return String(value);
      })
    );

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  }, [resolveData, columns, fileName]);

  // Escuchar evento de PDF desde el menú contextual de AG Grid
  useEffect(() => {
    if (!listenContextMenuPdf) return;

    const handleContextMenuPdf = () => {
      exportToPdf();
    };

    document.addEventListener('ag-grid-export-pdf', handleContextMenuPdf);
    return () => {
      document.removeEventListener('ag-grid-export-pdf', handleContextMenuPdf);
    };
  }, [listenContextMenuPdf, exportToPdf]);

  return {
    exportToExcel,
    exportToPdf,
    exportToCsv,
  };
}
