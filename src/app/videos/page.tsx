"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Upload,
  Trash2,
  Film,
  RefreshCw,
  Pencil,
  Check,
  X,
  Eye,
} from "lucide-react";
import { formatBytes, formatDate } from "@/components/format-utils";

interface Video {
  id: number;
  filename: string;
  original_name: string;
  sha256: string;
  size_bytes: number;
  uploaded_at: string;
  description: string;
}

interface UploadItem {
  file: File;
  progress: number; // 0-100
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDesc, setEditingDesc] = useState("");
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadVideos = useCallback(async () => {
    const res = await fetch("/api/videos");
    if (res.ok) setVideos(await res.json());
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // ── Upload with XHR for progress tracking ──

  function uploadFile(
    file: File,
    desc: string,
    index: number
  ): Promise<Video | null> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", desc);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploads((prev) =>
            prev.map((u, i) => (i === index ? { ...u, progress: percent } : u))
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploads((prev) =>
            prev.map((u, i) =>
              i === index ? { ...u, status: "done", progress: 100 } : u
            )
          );
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve(null);
          }
        } else {
          let errorMsg = "Error desconocido";
          try {
            errorMsg = JSON.parse(xhr.responseText).error || errorMsg;
          } catch {
            /* ignore */
          }
          setUploads((prev) =>
            prev.map((u, i) =>
              i === index ? { ...u, status: "error", error: errorMsg } : u
            )
          );
          resolve(null);
        }
      });

      xhr.addEventListener("error", () => {
        setUploads((prev) =>
          prev.map((u, i) =>
            i === index ? { ...u, status: "error", error: "Error de red" } : u
          )
        );
        resolve(null);
      });

      setUploads((prev) =>
        prev.map((u, i) =>
          i === index ? { ...u, status: "uploading" } : u
        )
      );

      xhr.open("POST", "/api/videos");
      xhr.send(formData);
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Build upload items
    const items: UploadItem[] = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));
    setUploads(items);

    // Upload one by one, updating list as each completes
    for (let i = 0; i < items.length; i++) {
      const uploaded = await uploadFile(items[i].file, description, i);
      if (uploaded) {
        // Add to list immediately
        setVideos((prev) => [uploaded, ...prev]);
      }
    }

    // Clear after a short delay so user sees final state
    setTimeout(() => {
      setUploads([]);
      setDescription("");
    }, 2000);

    // Reset file input
    e.target.value = "";
  }

  // ── Delete ──

  async function handleDelete(video: Video) {
    if (
      !confirm(
        `Eliminar "${video.original_name}"? Se eliminará de todas las playlists.`
      )
    ) {
      return;
    }

    const res = await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
    if (res.ok) {
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
    } else {
      alert("Error al eliminar video");
    }
  }

  // ── Edit description ──

  function startEdit(video: Video) {
    setEditingId(video.id);
    setEditingDesc(video.description || "");
  }

  async function saveEdit(videoId: number) {
    const res = await fetch(`/api/videos/${videoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: editingDesc }),
    });
    if (res.ok) {
      const updated: Video = await res.json();
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? updated : v))
      );
    }
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  // ── Upload progress bar ──

  const isUploading = uploads.some(
    (u) => u.status === "pending" || u.status === "uploading"
  );
  const totalProgress =
    uploads.length > 0
      ? Math.round(
          uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length
        )
      : 0;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Videos</h1>
        <button
          onClick={loadVideos}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Upload section */}
      <div className="mb-6 rounded-lg border bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Upload className="h-5 w-5" />
          Subir Videos
        </h2>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Descripción (opcional, se aplica a todos los archivos)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Promo cardiología 2026"
              className="w-full max-w-md rounded-lg border px-3 py-2 text-sm"
              disabled={isUploading}
            />
          </div>

          <div className="flex items-center gap-4">
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors ${
                isUploading
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Subiendo..." : "Seleccionar archivos"}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-gray-400">
            Formatos: MP4, WebM, OGG, AVI, MKV, MOV. Máximo recomendado: 500MB
            por archivo.
          </p>
        </div>

        {/* Upload progress list */}
        {uploads.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-gray-700">
              <span>
                Progreso general: {totalProgress}% (
                {uploads.filter((u) => u.status === "done").length}/
                {uploads.length})
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              />
            </div>

            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
              {uploads.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1 truncate">
                    {item.file.name}{" "}
                    <span className="text-gray-400">
                      ({formatBytes(item.file.size)})
                    </span>
                  </div>
                  <div className="flex w-32 items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === "error"
                            ? "bg-red-500"
                            : item.status === "done"
                              ? "bg-green-500"
                              : "bg-blue-500"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span
                      className={`w-10 text-right text-xs ${
                        item.status === "error"
                          ? "text-red-500"
                          : item.status === "done"
                            ? "text-green-600"
                            : "text-gray-500"
                      }`}
                    >
                      {item.status === "error"
                        ? "Error"
                        : item.status === "done"
                          ? "OK"
                          : `${item.progress}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video list */}
      <div className="rounded-lg border bg-white">
        {videos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Film className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p>No hay videos en el repositorio</p>
            <p className="text-sm">
              Subí tu primer video usando el botón de arriba
            </p>
          </div>
        ) : (
          <>
            <div className="border-b bg-gray-50 px-4 py-2 text-sm text-gray-500">
              {videos.length} video{videos.length !== 1 ? "s" : ""} en el
              repositorio
            </div>
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Tamaño
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Subido
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {videos.map((video) => (
                  <tr key={video.id} className="group hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">
                        {video.original_name}
                      </div>
                      <div className="font-mono text-xs text-gray-400">
                        {video.filename}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatBytes(video.size_bytes)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(video.uploaded_at)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingId === video.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingDesc}
                            onChange={(e) => setEditingDesc(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(video.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="w-full rounded border px-2 py-1 text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(video.id)}
                            className="rounded p-1 text-green-600 hover:bg-green-50"
                            title="Guardar"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100"
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">
                            {video.description || "—"}
                          </span>
                          <button
                            onClick={() => startEdit(video)}
                            className="rounded p-1 text-gray-300 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
                            title="Editar descripción"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewVideo(video)}
                          className="rounded p-1 text-blue-500 hover:bg-blue-50 hover:text-blue-700"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(video)}
                          className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Video preview modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-lg bg-black p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <h3 className="truncate text-sm font-medium text-white">
                {previewVideo.original_name}
                {previewVideo.description && (
                  <span className="ml-2 text-gray-400">
                    — {previewVideo.description}
                  </span>
                )}
              </h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="rounded p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <video
              src={`/api/videos/${previewVideo.id}/download`}
              controls
              autoPlay
              className="w-full rounded"
              style={{ maxHeight: "80vh" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
