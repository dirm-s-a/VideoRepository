"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  Pencil,
  Search,
  Download,
  X,
} from "lucide-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { DataGrid } from "@/shared/ui/DataGrid";
import { useDataGridExport } from "@/shared/ui/useDataGridExport";

interface Ubicacion {
  id: number;
  nombre: string;
  created_at: string;
}

export default function UbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState("");
  const [displayedCount, setDisplayedCount] = useState(0);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [addError, setAddError] = useState("");

  // Edit modal
  const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ubicaciones");
      if (res.ok) setUbicaciones(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    const nombre = newNombre.trim();
    if (!nombre) return;
    setAddError("");
    const res = await fetch("/api/ubicaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });
    if (res.ok) {
      setNewNombre("");
      setShowAdd(false);
      load();
    } else {
      const data = await res.json();
      setAddError(data.error || "Error al crear");
    }
  }

  async function handleDelete(id: number, nombre: string) {
    if (!confirm(`Eliminar ubicacion "${nombre}"?`)) return;
    const res = await fetch(`/api/ubicaciones?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setUbicaciones((prev) => prev.filter((u) => u.id !== id));
    } else {
      alert("Error al eliminar");
    }
  }

  // AG-Grid column definitions
  const columnDefs = useMemo<ColDef<Ubicacion>[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 80,
        type: "numericColumn",
      },
      {
        field: "nombre",
        headerName: "Nombre",
        flex: 2,
        minWidth: 250,
      },
      {
        field: "created_at",
        headerName: "Creado",
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
        headerName: "Acciones",
        width: 120,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<Ubicacion>) => {
          if (!params.data) return null;
          const u = params.data;
          return (
            <div className="flex items-center gap-1 h-full">
              <button
                onClick={() => setEditingUbicacion(u)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(u.id, u.nombre)}
                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Export setup
  const exportColumns = useMemo(
    () => [
      { header: "ID", field: "id", width: 10 },
      { header: "Nombre", field: "nombre", width: 40 },
      { header: "Creado", field: "created_at", width: 25 },
    ],
    []
  );

  const { exportToExcel, exportToPdf, exportToCsv } = useDataGridExport({
    data: ubicaciones,
    columns: exportColumns,
    fileName: "ubicaciones",
    title: "Ubicaciones Principales",
  });

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Ubicaciones Principales</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowAdd(!showAdd);
              setAddError("");
              setNewNombre("");
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newNombre}
              onChange={(e) => {
                setNewNombre(e.target.value);
                setAddError("");
              }}
              placeholder="Nombre de la ubicacion (ej: Centro Belgrano 136)"
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <button
              onClick={handleAdd}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Crear
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
          </div>
          {addError && (
            <p className="mt-2 text-sm text-red-600">{addError}</p>
          )}
        </div>
      )}

      {/* Quick filter + Export */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              placeholder="Filtro rapido..."
              className="rounded-lg border py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="rounded-lg border bg-white px-4 py-2">
            <span className="text-sm text-gray-500">Total:</span>{" "}
            <span className="font-semibold">{displayedCount}</span>
            {displayedCount !== ubicaciones.length && (
              <span className="ml-1 text-xs text-gray-400">
                de {ubicaciones.length}
              </span>
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
        <DataGrid<Ubicacion>
          rowData={ubicaciones}
          columnDefs={columnDefs}
          height="calc(100vh - 300px)"
          quickFilter={quickFilter}
          loading={loading}
          noRowsMessage="No hay ubicaciones registradas. Agrega una para comenzar."
          paginationPageSize={50}
          onDisplayedRowCountChange={setDisplayedCount}
        />
      </div>

      {/* Edit modal */}
      {editingUbicacion && (
        <EditUbicacionModal
          ubicacion={editingUbicacion}
          onClose={() => setEditingUbicacion(null)}
          onSaved={() => {
            setEditingUbicacion(null);
            load();
          }}
        />
      )}
    </div>
  );
}

// ── Edit Ubicacion Modal ──

function EditUbicacionModal({
  ubicacion,
  onClose,
  onSaved,
}: {
  ubicacion: Ubicacion;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(ubicacion.nombre);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmed = nombre.trim();
    if (!trimmed) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/ubicaciones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ubicacion.id, nombre: trimmed }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json();
      setError(data.error || "Error al actualizar");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Editar Ubicacion</h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            autoFocus
          />
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !nombre.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
