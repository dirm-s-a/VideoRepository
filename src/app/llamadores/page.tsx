"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Monitor,
  Plus,
  RefreshCw,
  Trash2,
  Settings,
  X,
  Camera,
  MapPin,
  Tv,
  MessageSquare,
  ListMusic,
} from "lucide-react";
import { timeAgo, parseUtc } from "@/components/format-utils";

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

export default function LlamadoresPage() {
  const [llamadores, setLlamadores] = useState<LlamadorInfo[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistOption[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingLlamador, setEditingLlamador] = useState<LlamadorInfo | null>(null);

  const load = useCallback(async () => {
    const [llamRes, plRes] = await Promise.all([
      fetch("/api/llamadores"),
      fetch("/api/playlists"),
    ]);
    if (llamRes.ok) setLlamadores(await llamRes.json());
    if (plRes.ok) setPlaylists(await plRes.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddLlamador() {
    if (!newName.trim()) return;
    // Use the backward-compatible sync endpoint to auto-register
    await fetch(`/api/playlists/${encodeURIComponent(newName.trim())}`);
    setNewName("");
    setShowAdd(false);
    load();
  }

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

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Llamadores</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Agregar Llamador
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del llamador (ej: llamador3ero)"
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAddLlamador()}
            autoFocus
          />
          <button
            onClick={handleAddLlamador}
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
      )}

      {llamadores.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          <Monitor className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p>No hay llamadores registrados</p>
          <p className="text-sm">
            Agrega un llamador o espera a que se registre automaticamente al
            sincronizar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {llamadores.map((ll) => {
            const isOnline =
              ll.last_seen_at &&
              Date.now() - parseUtc(ll.last_seen_at).getTime() <
                10 * 60 * 1000;

            return (
              <div
                key={ll.nombre}
                className="group relative rounded-lg border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
              >
                {/* Action buttons */}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setEditingLlamador(ll)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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

                <div className="mb-3 flex items-center gap-3">
                  {/* Photo thumbnail - larger */}
                  {ll.foto ? (
                    <img
                      src={ll.foto}
                      alt={ll.nombre}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      <Tv className="h-7 w-7" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{ll.nombre}</h3>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isOnline ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    </div>
                    {ll.ubicacion_principal && (
                      <p className="text-xs text-gray-400">
                        {ll.ubicacion_principal}
                        {ll.ubicacion_secundaria && ` - ${ll.ubicacion_secundaria}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-500">
                  {/* Assigned playlist */}
                  <p className="flex items-center gap-1">
                    <ListMusic className="h-3.5 w-3.5" />
                    {ll.playlistNombre ? (
                      <span>
                        <span className="font-medium text-gray-700">{ll.playlistNombre}</span>
                        {" "}({ll.videoCount} video{ll.videoCount !== 1 ? "s" : ""})
                      </span>
                    ) : (
                      <span className="italic text-gray-400">Sin playlist</span>
                    )}
                  </p>
                  {ll.layout && (
                    <p className="text-xs">
                      Layout: {ll.layout === "vertical" ? "Vertical" : "Horizontal"}
                    </p>
                  )}
                  {ll.marca_modelo_tv && (
                    <p className="text-xs">TV: {ll.marca_modelo_tv}</p>
                  )}
                  {ll.resolucion_pantalla && (
                    <p className="text-xs">Res: {ll.resolucion_pantalla}</p>
                  )}
                  {ll.ip_address && (
                    <p className="text-xs">IP: {ll.ip_address}</p>
                  )}
                  <p className="text-xs">Visto: {timeAgo(ll.last_seen_at)}</p>
                  {ll.observacion && (
                    <p className="mt-1 text-xs italic text-gray-400">
                      {ll.observacion}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit llamador modal */}
      {editingLlamador && (
        <LlamadorEditModal
          llamador={editingLlamador}
          playlists={playlists}
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
  onClose,
  onSaved,
}: {
  llamador: LlamadorInfo;
  playlists: PlaylistOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [observacion, setObservacion] = useState(llamador.observacion || "");
  const [ubicacionPrincipal, setUbicacionPrincipal] = useState(llamador.ubicacion_principal || "");
  const [ubicacionSecundaria, setUbicacionSecundaria] = useState(llamador.ubicacion_secundaria || "");
  const [resolucionPantalla, setResolucionPantalla] = useState(llamador.resolucion_pantalla || "");
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setSaving(true);
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
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
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

          <div className="space-y-4">
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

            {/* Photo - larger preview */}
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <Camera className="h-4 w-4" />
                Foto
              </label>
              <div className="flex items-center gap-3">
                {foto ? (
                  <img
                    src={foto}
                    alt="Foto"
                    className="h-32 w-32 cursor-pointer rounded-lg object-cover transition-all hover:ring-2 hover:ring-blue-400"
                    onClick={() => setShowLightbox(true)}
                    title="Click para ver en grande"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                    <Tv className="h-12 w-12" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
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
                </div>
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

            {/* Ubicacion Principal */}
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4" />
                Ubicacion Principal
              </label>
              <input
                type="text"
                value={ubicacionPrincipal}
                onChange={(e) => setUbicacionPrincipal(e.target.value)}
                placeholder="Ej: Centro Belgrano 136"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
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
