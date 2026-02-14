"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ListMusic,
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  X,
  Monitor,
} from "lucide-react";

interface PlaylistSummary {
  id: number;
  nombre: string;
  descripcion: string;
  created_at: string;
  videoCount: number;
  llamadores: string[];
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistSummary | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/playlists");
    if (res.ok) setPlaylists(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    if (!newName.trim()) return;
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: newName.trim(), descripcion: newDesc.trim() }),
    });
    if (res.ok) {
      setNewName("");
      setNewDesc("");
      setShowAdd(false);
      load();
    } else {
      const err = await res.json();
      alert(err.error || "Error al crear");
    }
  }

  async function handleDelete(pl: PlaylistSummary) {
    if (!confirm(`Eliminar playlist "${pl.nombre}"? ${pl.llamadores.length > 0 ? `Los llamadores ${pl.llamadores.join(", ")} quedarán sin playlist asignada.` : ""}`))
      return;
    const res = await fetch(`/api/playlists/${pl.id}`, { method: "DELETE" });
    if (res.ok) {
      setPlaylists((prev) => prev.filter((p) => p.id !== pl.id));
    } else {
      alert("Error al eliminar");
    }
  }

  async function handleSaveEdit() {
    if (!editingPlaylist) return;
    const res = await fetch(`/api/playlists/${editingPlaylist.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: editingPlaylist.nombre,
        descripcion: editingPlaylist.descripcion,
      }),
    });
    if (res.ok) {
      setEditingPlaylist(null);
      load();
    } else {
      alert("Error al guardar");
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Playlists</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nueva Playlist
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
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre de la playlist"
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <button
              onClick={handleCreate}
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
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Descripcion (opcional)"
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          <ListMusic className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p>No hay playlists creadas</p>
          <p className="text-sm">Crea una playlist y asignale videos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="group relative rounded-lg border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
            >
              {/* Action buttons */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingPlaylist({ ...pl });
                  }}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Editar nombre"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(pl);
                  }}
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <Link
                href={`/playlists/${pl.id}`}
                className="block"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <ListMusic className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-blue-600">
                      {pl.nombre}
                    </h3>
                    {pl.descripcion && (
                      <p className="text-xs text-gray-400">{pl.descripcion}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-500">
                  <p>
                    <span className="font-medium text-gray-700">
                      {pl.videoCount}
                    </span>{" "}
                    video{pl.videoCount !== 1 ? "s" : ""}
                  </p>

                  {/* Assigned llamadores */}
                  {pl.llamadores.length > 0 ? (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {pl.llamadores.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          <Monitor className="h-3 w-3" />
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-400">
                      Sin llamadores asignados
                    </p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Edit playlist modal */}
      {editingPlaylist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setEditingPlaylist(null)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Editar Playlist</h2>
              <button
                onClick={() => setEditingPlaylist(null)}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingPlaylist.nombre}
                  onChange={(e) =>
                    setEditingPlaylist({ ...editingPlaylist, nombre: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Descripcion
                </label>
                <textarea
                  value={editingPlaylist.descripcion}
                  onChange={(e) =>
                    setEditingPlaylist({ ...editingPlaylist, descripcion: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditingPlaylist(null)}
                className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
