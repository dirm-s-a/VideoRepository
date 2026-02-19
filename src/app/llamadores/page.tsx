"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Monitor,
  RefreshCw,
  Trash2,
  Settings,
  X,
  Camera,
  MapPin,
  Tv,
  MessageSquare,
  ListMusic,
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  FileJson,
} from "lucide-react";
import { timeAgo, parseUtc } from "@/components/format-utils";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { DataGrid } from "@/shared/ui/DataGrid";
import { useDataGridExport } from "@/shared/ui/useDataGridExport";
import ConfigTabEditor from "./ConfigTabEditor";

interface LlamadorInfo {
  nombre: string;
  descripcion: string;
  last_seen_at: string | null;
  ip_address: string | null;
  observacion: string;
  ubicacion_principal: string;
  ubicacion_secundaria: string;
  resolucion_pantalla: string;
  layout: string;
  marca_modelo_tv: string;
  foto: string;
  playlist_id: number | null;
  playlistNombre: string | null;
  videoCount: number;
}

interface PlaylistOption {
  id: number;
  nombre: string;
  videoCount: number;
}

interface UbicacionOption {
  id: number;
  nombre: string;
}

export default function LlamadoresPage() {
  const [llamadores, setLlamadores] = useState<LlamadorInfo[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistOption[]>([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionOption[]>([]);
  const [editingLlamador, setEditingLlamador] = useState<LlamadorInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState("");
  const [displayedCount, setDisplayedCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [llamRes, plRes, ubRes] = await Promise.all([
        fetch("/api/llamadores"),
        fetch("/api/playlists"),
        fetch("/api/ubicaciones"),
      ]);
      if (llamRes.ok) setLlamadores(await llamRes.json());
      if (plRes.ok) setPlaylists(await plRes.json());
      if (ubRes.ok) setUbicaciones(await ubRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(nombre: string) {
    if (!confirm(`Eliminar llamador "${nombre}"?`)) return;
    const res = await fetch(`/api/llamadores/${encodeURIComponent(nombre)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setLlamadores((prev) => prev.filter((l) => l.nombre !== nombre));
    } else {
      alert("Error al eliminar");
    }
  }

  // AG-Grid column definitions
  const columnDefs = useMemo<ColDef<LlamadorInfo>[]>(
    () => [
      {
        field: "nombre",
        headerName: "Nombre",
        flex: 1,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams<LlamadorInfo>) => {
          if (!params.data) return null;
          const ll = params.data;
          const isOnline =
            ll.last_seen_at &&
            Date.now() - parseUtc(ll.last_seen_at).getTime() < 10 * 60 * 1000;
          return (
            <div className="flex items-center gap-2 h-full">
              <span
                className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                  isOnline ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="font-medium">{ll.nombre}</span>
            </div>
          );
        },
      },
      {
        field: "ubicacion_principal",
        headerName: "Ubicacion Principal",
        enableRowGroup: true,
        width: 200,
        valueFormatter: (p: { value: string }) => p.value || "—",
      },
      {
        field: "ubicacion_secundaria",
        headerName: "Ubicacion Secundaria",
        width: 180,
        valueFormatter: (p: { value: string }) => p.value || "—",
      },
      {
        field: "playlistNombre",
        headerName: "Playlist",
        enableRowGroup: true,
        width: 180,
        cellRenderer: (params: ICellRendererParams<LlamadorInfo>) => {
          if (!params.data) return null;
          const ll = params.data;
          if (!ll.playlistNombre) {
            return (
              <span className="italic text-gray-400">Sin playlist</span>
            );
          }
          return (
            <span>
              {ll.playlistNombre}{" "}
              <span className="text-gray-400">
                ({ll.videoCount} video{ll.videoCount !== 1 ? "s" : ""})
              </span>
            </span>
          );
        },
      },
      {
        field: "layout",
        headerName: "Layout",
        enableRowGroup: true,
        width: 120,
        valueFormatter: (p: { value: string }) =>
          p.value === "vertical" ? "Vertical" : "Horizontal",
      },
      {
        field: "marca_modelo_tv",
        headerName: "TV",
        width: 180,
        valueFormatter: (p: { value: string }) => p.value || "—",
      },
      {
        field: "resolucion_pantalla",
        headerName: "Resolucion",
        width: 130,
        valueFormatter: (p: { value: string }) => p.value || "—",
      },
      {
        field: "ip_address",
        headerName: "IP",
        width: 140,
        valueFormatter: (p: { value: string | null }) => p.value || "—",
      },
      {
        field: "last_seen_at",
        headerName: "Ultimo contacto",
        width: 150,
        valueFormatter: (params: { value: string | null }) =>
          timeAgo(params.value),
      },
      {
        field: "observacion",
        headerName: "Observacion",
        width: 200,
        valueFormatter: (p: { value: string }) => p.value || "—",
      },
      {
        headerName: "Acciones",
        width: 110,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: (params: ICellRendererParams<LlamadorInfo>) => {
          if (!params.data) return null;
          const ll = params.data;
          return (
            <div className="flex items-center gap-1 h-full">
              <button
                onClick={() => setEditingLlamador(ll)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                title="Configurar"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(ll.nombre)}
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
      { header: "Nombre", field: "nombre", width: 20 },
      { header: "Ubicacion Principal", field: "ubicacion_principal", width: 22 },
      { header: "Ubicacion Secundaria", field: "ubicacion_secundaria", width: 20 },
      { header: "Playlist", field: "playlistNombre", width: 18 },
      { header: "Layout", field: "layout", width: 12 },
      { header: "TV", field: "marca_modelo_tv", width: 22 },
      { header: "Resolucion", field: "resolucion_pantalla", width: 14 },
      { header: "IP", field: "ip_address", width: 16 },
      { header: "Observacion", field: "observacion", width: 25 },
    ],
    []
  );

  const { exportToExcel, exportToPdf, exportToCsv } = useDataGridExport({
    data: llamadores,
    columns: exportColumns,
    fileName: "llamadores",
    title: "Listado de Llamadores",
  });

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Llamadores</h1>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

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
            {displayedCount !== llamadores.length && (
              <span className="ml-1 text-xs text-gray-400">
                de {llamadores.length}
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
        <DataGrid<LlamadorInfo>
          rowData={llamadores}
          columnDefs={columnDefs}
          height="calc(100vh - 280px)"
          quickFilter={quickFilter}
          loading={loading}
          noRowsMessage="No hay llamadores registrados. Agrega un llamador o espera a que se registre automaticamente."
          rowGroupPanelShow="always"
          groupDefaultExpanded={1}
          paginationPageSize={50}
          onDisplayedRowCountChange={setDisplayedCount}
        />
      </div>

      {/* Edit llamador modal */}
      {editingLlamador && (
        <LlamadorEditModal
          llamador={editingLlamador}
          playlists={playlists}
          ubicaciones={ubicaciones}
          onClose={() => setEditingLlamador(null)}
          onSaved={() => {
            setEditingLlamador(null);
            load();
          }}
        />
      )}
    </div>
  );
}

// ── Llamador Edit Modal ──

function LlamadorEditModal({
  llamador,
  playlists,
  ubicaciones,
  onClose,
  onSaved,
}: {
  llamador: LlamadorInfo;
  playlists: PlaylistOption[];
  ubicaciones: UbicacionOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [observacion, setObservacion] = useState(llamador.observacion || "");
  const [ubicacionPrincipal, setUbicacionPrincipal] = useState(
    llamador.ubicacion_principal || ""
  );
  const [ubicacionSecundaria, setUbicacionSecundaria] = useState(
    llamador.ubicacion_secundaria || ""
  );
  const [resolucionPantalla, setResolucionPantalla] = useState(
    llamador.resolucion_pantalla || ""
  );
  const [layout, setLayout] = useState(llamador.layout || "horizontal");
  const [marcaModeloTv, setMarcaModeloTv] = useState(
    llamador.marca_modelo_tv || ""
  );
  const [foto, setFoto] = useState(llamador.foto || "");
  const [playlistId, setPlaylistId] = useState<number | null>(
    llamador.playlist_id
  );
  const [saving, setSaving] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const configJsonRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setSaving(true);

    // Save llamador fields
    const res = await fetch(
      `/api/llamadores/${encodeURIComponent(llamador.nombre)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observacion,
          ubicacion_principal: ubicacionPrincipal,
          ubicacion_secundaria: ubicacionSecundaria,
          resolucion_pantalla: resolucionPantalla,
          layout,
          marca_modelo_tv: marcaModeloTv,
          foto,
          playlist_id: playlistId,
        }),
      }
    );

    // Save config if the editor was opened
    if (showConfigEditor && configLoaded) {
      const configText = configJsonRef.current.trim();
      if (configText) {
        await fetch(
          `/api/config/${encodeURIComponent(llamador.nombre)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: configText,
          }
        );
      } else {
        // Clear config
        await fetch(
          `/api/config/${encodeURIComponent(llamador.nombre)}`,
          { method: "DELETE" }
        );
      }
    }

    setSaving(false);
    if (res.ok) {
      onSaved();
    } else {
      alert("Error al guardar");
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 400;
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = (h / w) * maxSize;
            w = maxSize;
          } else {
            w = (w / h) * maxSize;
            h = maxSize;
          }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        setFoto(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <div
          className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Configurar: {llamador.nombre}
            </h2>
            <button
              onClick={onClose}
              className="rounded p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-6">
            {/* Left column: form fields */}
            <div className="flex-1 space-y-4">
              {/* Playlist assignment */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <ListMusic className="h-4 w-4" />
                  Playlist asignada
                </label>
                <select
                  value={playlistId ?? ""}
                  onChange={(e) =>
                    setPlaylistId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Sin playlist</option>
                  {playlists.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.videoCount} videos)
                    </option>
                  ))}
                </select>
              </div>

              {/* Ubicacion Principal - SELECT dropdown */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4" />
                  Ubicacion Principal
                </label>
                <select
                  value={ubicacionPrincipal}
                  onChange={(e) => setUbicacionPrincipal(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Sin ubicacion</option>
                  {ubicaciones.map((u) => (
                    <option key={u.id} value={u.nombre}>
                      {u.nombre}
                    </option>
                  ))}
                  {/* Show current value if not in list (legacy data) */}
                  {ubicacionPrincipal &&
                    !ubicaciones.some((u) => u.nombre === ubicacionPrincipal) && (
                      <option value={ubicacionPrincipal}>
                        {ubicacionPrincipal} (no registrada)
                      </option>
                    )}
                </select>
              </div>

              {/* Ubicacion Secundaria */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4" />
                  Ubicacion Secundaria
                </label>
                <input
                  type="text"
                  value={ubicacionSecundaria}
                  onChange={(e) => setUbicacionSecundaria(e.target.value)}
                  placeholder="Ej: 2do Piso"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              {/* Layout */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Monitor className="h-4 w-4" />
                  Layout
                </label>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>

              {/* Marca/modelo TV */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Tv className="h-4 w-4" />
                  Marca y modelo de TV
                </label>
                <input
                  type="text"
                  value={marcaModeloTv}
                  onChange={(e) => setMarcaModeloTv(e.target.value)}
                  placeholder='Ej: Samsung UN43AU7000 43"'
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              {/* Resolucion de pantalla */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Monitor className="h-4 w-4" />
                  Resolucion de Pantalla
                </label>
                <input
                  type="text"
                  value={resolucionPantalla}
                  onChange={(e) => setResolucionPantalla(e.target.value)}
                  placeholder="Ej: 1920x1080"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              {/* Observacion */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <MessageSquare className="h-4 w-4" />
                  Observacion
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Notas, comentarios..."
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Right column: photo */}
            <div className="flex w-48 shrink-0 flex-col items-center gap-3">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <Camera className="h-4 w-4" />
                Foto
              </label>
              {foto ? (
                <img
                  src={foto}
                  alt="Foto"
                  className="h-44 w-44 cursor-pointer rounded-lg object-cover transition-all hover:ring-2 hover:ring-blue-400"
                  onClick={() => setShowLightbox(true)}
                  title="Click para ver en grande"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                  <Tv className="h-14 w-14" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                {foto ? "Cambiar foto" : "Subir foto"}
              </button>
              {foto && (
                <button
                  onClick={() => setFoto("")}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Quitar foto
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Central Config Editor */}
          <div className="mt-6 border-t pt-4">
            <button
              type="button"
              onClick={() => setShowConfigEditor(!showConfigEditor)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              {showConfigEditor ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <FileJson className="h-4 w-4" />
              Configuración Central
              {configJsonRef.current.trim() && (
                <span className="ml-1 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                  ACTIVA
                </span>
              )}
            </button>
            <p className="mt-1 text-xs text-gray-400">
              Configuración que se aplica como override en los llamadores con repositorio central
            </p>

            {showConfigEditor && (
              <ConfigTabEditor
                nombre={llamador.nombre}
                configLoaded={configLoaded}
                onLoaded={() => setConfigLoaded(true)}
                configJsonRef={configJsonRef}
              />
            )}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox overlay for full-size photo */}
      {showLightbox && foto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={() => setShowLightbox(false)}
        >
          <img
            src={foto}
            alt="Foto completa"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
          <button
            className="absolute right-4 top-4 text-white hover:text-gray-300"
            onClick={() => setShowLightbox(false)}
          >
            <X className="h-8 w-8" />
          </button>
        </div>
      )}
    </>
  );
}
