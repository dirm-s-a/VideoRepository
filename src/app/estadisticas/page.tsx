"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { RefreshCw, Search, BarChart3, Download } from "lucide-react";
import type { ColDef } from "ag-grid-community";
import { DataGrid } from "@/shared/ui/DataGrid";
import { useDataGridExport } from "@/shared/ui/useDataGridExport";

interface VideoPlay {
  id: number;
  llamador_nombre: string;
  video_filename: string;
  video_id: number | null;
  played_at: string;
  duration_seconds: number | null;
  ubicacion_principal: string;
  ubicacion_secundaria: string;
  video_tipo: string;
}

interface LlamadorOption {
  nombre: string;
}

export default function EstadisticasPage() {
  const [plays, setPlays] = useState<VideoPlay[]>([]);
  const [llamadores, setLlamadores] = useState<LlamadorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState("");
  const [displayedCount, setDisplayedCount] = useState(0);

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedLlamador, setSelectedLlamador] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLlamador) params.set("llamador", selectedLlamador);
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", `${toDate}T23:59:59`);

      const [playsRes, llamRes] = await Promise.all([
        fetch(`/api/video-plays?${params}`),
        fetch("/api/llamadores"),
      ]);

      if (playsRes.ok) setPlays(await playsRes.json());
      if (llamRes.ok) setLlamadores(await llamRes.json());
    } finally {
      setLoading(false);
    }
  }, [selectedLlamador, fromDate, toDate]);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<VideoPlay>[]>(
    () => [
      {
        field: "video_filename",
        headerName: "Video",
        enableRowGroup: true,
        flex: 2,
        minWidth: 200,
      },
      {
        field: "video_tipo",
        headerName: "Tipo",
        enableRowGroup: true,
        width: 140,
        valueFormatter: (p: { value: string }) => p.value || "—",
      },
      {
        field: "llamador_nombre",
        headerName: "Llamador",
        enableRowGroup: true,
        width: 160,
      },
      {
        field: "ubicacion_principal",
        headerName: "Ubicacion Principal",
        enableRowGroup: true,
        width: 180,
      },
      {
        field: "ubicacion_secundaria",
        headerName: "Ubicacion Secundaria",
        enableRowGroup: true,
        width: 160,
      },
      {
        field: "played_at",
        headerName: "Fecha",
        enableRowGroup: true,
        width: 170,
        valueFormatter: (params: { value: string }) => {
          if (!params.value) return "";
          const d = new Date(params.value + "Z");
          return d.toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
      {
        field: "duration_seconds",
        headerName: "Duracion (s)",
        width: 120,
        type: "numericColumn",
        valueFormatter: (params: { value: number | null }) =>
          params.value != null ? params.value.toFixed(1) : "-",
      },
    ],
    []
  );

  // ── Export setup ──

  const exportColumns = useMemo(
    () => [
      { header: "Video", field: "video_filename", width: 35 },
      { header: "Tipo", field: "video_tipo", width: 15 },
      { header: "Llamador", field: "llamador_nombre", width: 18 },
      { header: "Ubicacion Principal", field: "ubicacion_principal", width: 22 },
      { header: "Ubicacion Secundaria", field: "ubicacion_secundaria", width: 18 },
      { header: "Fecha", field: "played_at", width: 22 },
      { header: "Duracion (s)", field: "duration_seconds", width: 12 },
    ],
    []
  );

  const { exportToExcel, exportToPdf, exportToCsv } = useDataGridExport({
    data: plays,
    columns: exportColumns,
    fileName: "estadisticas-reproducciones",
    title: "Estadisticas de Reproduccion de Videos",
  });

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Estadisticas de Reproduccion</h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Desde
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Hasta
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Llamador
          </label>
          <select
            value={selectedLlamador}
            onChange={(e) => setSelectedLlamador(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {llamadores.map((l) => (
              <option key={l.nombre} value={l.nombre}>
                {l.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              placeholder="Filtro rapido..."
              className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>
        {(fromDate || toDate || selectedLlamador) && (
          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
              setSelectedLlamador("");
            }}
            className="rounded-lg border px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Summary + Export */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="rounded-lg border bg-white px-4 py-2">
            <span className="text-sm text-gray-500">Total reproducciones:</span>{" "}
            <span className="font-semibold">{displayedCount}</span>
            {displayedCount !== plays.length && (
              <span className="ml-1 text-xs text-gray-400">de {plays.length}</span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            title="Exportar a Excel"
          >
            <Download className="h-3.5 w-3.5" />
            Excel
          </button>
          <button
            onClick={exportToPdf}
            className="flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            title="Exportar a PDF"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
          <button
            onClick={exportToCsv}
            className="flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            title="Exportar a CSV"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* AG Grid */}
      <div className="flex-1 overflow-hidden rounded-lg border bg-white">
        <DataGrid<VideoPlay>
          rowData={plays}
          columnDefs={columnDefs}
          height="calc(100vh - 340px)"
          quickFilter={quickFilter}
          loading={loading}
          noRowsMessage="No hay reproducciones registradas. Los datos apareceran cuando los llamadores reproduzcan videos."
          rowGroupPanelShow="always"
          groupDefaultExpanded={1}
          paginationPageSize={100}
          onDisplayedRowCountChange={setDisplayedCount}
        />
      </div>
    </div>
  );
}
