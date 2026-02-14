"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridReadyEvent,
  GridApi,
  GetContextMenuItemsParams,
  MenuItemDef,
} from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const customTheme = themeQuartz.withParams({
  accentColor: "#3b82f6",
  backgroundColor: "#ffffff",
  foregroundColor: "#1f2937",
  borderColor: "#e5e7eb",
  headerBackgroundColor: "#f9fafb",
  headerTextColor: "#1f2937",
  oddRowBackgroundColor: "#ffffff",
  rowHoverColor: "#f3f4f6",
  selectedRowBackgroundColor: "#eff6ff",
  fontFamily: "inherit",
  fontSize: 14,
  headerFontSize: 14,
  rowHeight: 40,
  headerHeight: 44,
});

export interface DataGridProps<T> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  height?: number | string;
  quickFilter?: string;
  pagination?: boolean;
  paginationPageSize?: number;
  noRowsMessage?: string;
  loading?: boolean;
  rowGroupPanelShow?: "never" | "always" | "onlyWhenGrouping";
  groupDefaultExpanded?: number;
  /** Optional React node rendered above the grid (e.g. export buttons) */
  toolbarSlot?: React.ReactNode;
  /** Called when the displayed row count changes (e.g. after filter/group) */
  onDisplayedRowCountChange?: (count: number) => void;
}

export function DataGrid<T>({
  rowData,
  columnDefs,
  height = 600,
  quickFilter,
  pagination = true,
  paginationPageSize = 50,
  noRowsMessage = "No hay datos para mostrar",
  loading = false,
  rowGroupPanelShow = "never",
  groupDefaultExpanded = -1,
  toolbarSlot,
  onDisplayedRowCountChange,
}: DataGridProps<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridApiRef = useRef<GridApi<any> | null>(null);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: false,
      minWidth: 100,
    }),
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onGridReady = useCallback((params: GridReadyEvent<any>) => {
    gridApiRef.current = params.api;
  }, []);

  const onModelUpdated = useCallback(() => {
    if (gridApiRef.current && onDisplayedRowCountChange) {
      onDisplayedRowCountChange(gridApiRef.current.getDisplayedRowCount());
    }
  }, [onDisplayedRowCountChange]);

  useEffect(() => {
    if (gridApiRef.current && quickFilter !== undefined) {
      gridApiRef.current.setGridOption("quickFilterText", quickFilter);
    }
  }, [quickFilter]);

  // Auto-size on first data load
  useEffect(() => {
    if (gridApiRef.current && rowData && rowData.length > 0) {
      setTimeout(() => {
        gridApiRef.current?.autoSizeAllColumns();
        gridApiRef.current?.sizeColumnsToFit();
      }, 100);
    }
  }, [rowData]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }, []);

  const getContextMenuItems = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (params: GetContextMenuItemsParams): any[] => {
      const items: ("separator" | MenuItemDef)[] = [
        {
          name: "Copiar celda",
          action: () => params.api.copyToClipboard(),
          icon: '<span class="ag-icon ag-icon-copy"></span>',
          shortcut: "Ctrl+C",
        },
        {
          name: "Copiar todo con encabezados",
          action: () => {
            const csvData = params.api.getDataAsCsv({
              columnSeparator: "\t",
              suppressQuotes: true,
            });
            if (csvData) copyToClipboard(csvData);
          },
          icon: '<span class="ag-icon ag-icon-copy"></span>',
        },
        "separator",
        {
          name: "Exportar",
          icon: '<span class="ag-icon ag-icon-save"></span>',
          subMenu: [
            {
              name: "Exportar a CSV",
              action: () => params.api.exportDataAsCsv(),
              icon: '<span class="ag-icon ag-icon-csv"></span>',
            },
            {
              name: "Exportar a Excel",
              action: () => params.api.exportDataAsExcel(),
              icon: '<span class="ag-icon ag-icon-excel"></span>',
            },
            {
              name: "Exportar a PDF",
              action: () => {
                document.dispatchEvent(
                  new CustomEvent("ag-grid-export-pdf", {
                    detail: { api: params.api },
                  })
                );
              },
              icon: '<span class="ag-icon ag-icon-save"></span>',
            },
          ],
        },
      ];
      return items;
    },
    [copyToClipboard]
  );

  const containerStyle = useMemo(
    () => ({
      height: typeof height === "number" ? `${height}px` : height,
      width: "100%",
    }),
    [height]
  );

  return (
    <div style={containerStyle}>
      {toolbarSlot}
      <AgGridReact
        theme={customTheme}
        rowData={rowData}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columnDefs={columnDefs as ColDef<any>[]}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onModelUpdated={onModelUpdated}
        loading={loading}
        overlayNoRowsTemplate={`<span class="text-gray-400">${noRowsMessage}</span>`}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={[10, 20, 50, 100, 500]}
        animateRows={true}
        suppressCellFocus={true}
        enableCellTextSelection={true}
        popupParent={typeof document !== "undefined" ? document.body : undefined}
        cellSelection={{ suppressMultiRanges: true }}
        allowContextMenuWithControlKey={true}
        getContextMenuItems={getContextMenuItems}
        rowGroupPanelShow={rowGroupPanelShow}
        groupDefaultExpanded={groupDefaultExpanded}
      />
    </div>
  );
}
