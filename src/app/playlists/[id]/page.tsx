"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatBytes } from "@/components/format-utils";

interface Video {
  id: number;
  filename: string;
  original_name: string;
  description: string;
  size_bytes: number;
}

interface PlaylistVideo {
  videoId: number;
  filename: string;
  originalName: string;
  description: string;
  sha256: string;
  sizeBytes: number;
  order: number;
}

export default function PlaylistEditorPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;

  const [playlistName, setPlaylistName] = useState("");
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [playlist, setPlaylist] = useState<PlaylistVideo[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    const [videosRes, playlistRes] = await Promise.all([
      fetch("/api/videos"),
      fetch(`/api/playlists/${playlistId}`),
    ]);

    if (videosRes.ok) setAllVideos(await videosRes.json());
    if (playlistRes.ok) {
      const data = await playlistRes.json();
      setPlaylistName(data.nombre);
      setPlaylist(data.videos);
    }
  }, [playlistId]);

  useEffect(() => {
    load();
  }, [load]);

  // All videos available to add (duplicates allowed)
  const availableVideos = allVideos;

  function addVideo(video: Video) {
    const maxOrder = playlist.length > 0
      ? Math.max(...playlist.map((v) => v.order))
      : 0;
    setPlaylist([
      ...playlist,
      {
        videoId: video.id,
        filename: video.filename,
        originalName: video.original_name,
        description: video.description || "",
        sha256: "",
        sizeBytes: video.size_bytes,
        order: maxOrder + 1,
      },
    ]);
    setDirty(true);
  }

  function removeVideo(index: number) {
    setPlaylist(playlist.filter((_, i) => i !== index));
    setDirty(true);
  }

  function moveVideo(index: number, direction: "up" | "down") {
    const newList = [...playlist];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newList.length) return;

    [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];

    // Renumber orders
    newList.forEach((v, i) => (v.order = i + 1));
    setPlaylist(newList);
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videos: playlist.map((v, i) => ({
            videoId: v.videoId,
            orden: i + 1,
          })),
        }),
      });

      if (res.ok) {
        setDirty(false);
        const data = await res.json();
        setPlaylist(data.videos);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch {
      alert("Error de red al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/playlists")}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{playlistName || "Playlist"}</h1>
          <p className="text-sm text-gray-500">Editor de Playlist</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm ${
            dirty && !saving
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current playlist */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <GripVertical className="w-5 h-5 text-gray-400" />
            Playlist Actual ({playlist.length} videos)
          </h2>

          {playlist.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed rounded-lg p-8 text-center text-gray-400">
              Playlist vacia. Agrega videos desde el catalogo de la derecha.
            </div>
          ) : (
            <div className="space-y-2">
              {playlist.map((video, index) => (
                <div
                  key={`${video.videoId}-${index}`}
                  className="bg-white border rounded-lg p-3 flex items-center gap-3 hover:shadow-sm"
                >
                  <span className="text-sm font-mono text-gray-400 w-6 text-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {video.originalName || video.filename}
                      {video.description && (
                        <span className="ml-1 text-gray-400 font-normal">
                          ({video.description})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {video.filename} &middot; {formatBytes(video.sizeBytes)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveVideo(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveVideo(index, "down")}
                      disabled={index === playlist.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeVideo(index)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available videos catalog */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Catalogo de Videos ({availableVideos.length} disponibles)
          </h2>

          {availableVideos.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed rounded-lg p-8 text-center text-gray-400">
              No hay videos en el repositorio. Sube videos desde la seccion Videos.
            </div>
          ) : (
            <div className="space-y-2">
              {availableVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white border rounded-lg p-3 flex items-center gap-3 hover:shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {video.original_name}
                      {video.description && (
                        <span className="ml-1 text-gray-400 font-normal">
                          ({video.description})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {video.filename} &middot; {formatBytes(video.size_bytes)}
                    </p>
                  </div>
                  <button
                    onClick={() => addVideo(video)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
