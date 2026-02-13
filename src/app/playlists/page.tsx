"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ListMusic, Plus, RefreshCw } from "lucide-react";
import { timeAgo } from "@/components/format-utils";

interface PlaylistSummary {
  nombre: string;
  descripcion: string;
  videoCount: number;
  last_seen_at: string | null;
  ip_address: string | null;
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/playlists");
    if (res.ok) setPlaylists(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddLlamador() {
    if (!newName.trim()) return;

    // Create by fetching its playlist (auto-registers)
    await fetch(`/api/playlists/${encodeURIComponent(newName.trim())}`);
    setNewName("");
    setShowAdd(false);
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Playlists por Llamador</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Agregar Llamador
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add llamador form */}
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del llamador (ej: llamador3ero)"
            className="border rounded-lg px-3 py-2 text-sm flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAddLlamador()}
            autoFocus
          />
          <button
            onClick={handleAddLlamador}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Crear
          </button>
          <button
            onClick={() => setShowAdd(false)}
            className="px-4 py-2 text-gray-600 text-sm hover:text-gray-900"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Llamadores grid */}
      {playlists.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          <ListMusic className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay llamadores registrados</p>
          <p className="text-sm">
            Agrega un llamador o espera a que se registre automaticamente al
            sincronizar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => {
            const isOnline =
              pl.last_seen_at &&
              Date.now() - new Date(pl.last_seen_at).getTime() <
                10 * 60 * 1000;

            return (
              <Link
                key={pl.nombre}
                href={`/playlists/${encodeURIComponent(pl.nombre)}`}
                className="bg-white rounded-lg border p-4 hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold group-hover:text-blue-600">
                    {pl.nombre}
                  </h3>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOnline ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <span className="font-medium text-gray-700">
                      {pl.videoCount}
                    </span>{" "}
                    video{pl.videoCount !== 1 ? "s" : ""} en playlist
                  </p>
                  {pl.ip_address && <p>IP: {pl.ip_address}</p>}
                  <p>Visto: {timeAgo(pl.last_seen_at)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
