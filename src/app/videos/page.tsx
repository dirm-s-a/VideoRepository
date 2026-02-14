"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Upload,
  Trash2,
  Film,
  RefreshCw,
  Pencil,
  Check,
  X,
  Eye,
  Download,
} from "lucide-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { formatBytes, formatDate } from "@/components/format-utils";
import { DataGrid } from "@/shared/ui/DataGrid";
import { useDataGridExport } from "@/shared/ui/useDataGridExport";

const VIDEO_TIPOS = ["Institucionales", "Marketing", "Publicidad", "Otros"] as const;

interface Video {
  id: number;
  filename: string;
  original_name: string;
  sha256: string;
  size_bytes: number;
  uploaded_at: string;
  description: string;
  tipo: string;
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
  const [uploadTipo, setUploadTipo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDesc, setEditingDesc] = useState("");
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [quickFilter, setQuickFilter] = useState("");
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
    tipo: string,
    index: number
  ): Promise<Video | null> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", desc);
      formData.append("tipo", tipo);

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

    const items: UploadItem[] = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));
    setUploads(items);

    for (let i = 0; i < items.length; i++) {
      const uploaded = await uploadFile(items[i].file, description, uploadTipo, i);
      if (uploaded) {
        setVideos((prev) => [uploaded, ...prev]);
      }
    }

    setTimeout(() => {
      setUploads([]);
      setDescription("");
      setUploadTipo("");
    }, 2000);

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

  // ── AG Grid column definitions ──

  const columnDefs = useMemo<ColDef<Video>[]>(
    () => [
      {
        headerName: "Nombre",
        field: "original_name",
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: "Tamano",
        field: "size_bytes",
        width: 120,
        type: "numericColumn",
        valueFormatter: (p) =>
          p.value != null ? formatBytes(p.value) : "",
      },
      {
        headerName: "Subido",
        field: "uploaded_at",
        width: 160,
        valueFormatter: (p) =>
          p.value ? formatDate(p.value) : "",
      },
      {
        headerName: "Tipo",
        field: "tipo",
        width: 150,
        enableRowGroup: true,
        cellRenderer: (params: ICellRendererParams<Video>) => {
          const video = params.data;
          if (!video) return null;
          return (
            <select
              value={video.tipo || ""}
              onChange={async (e) => {
                const newTipo = e.target.value;
                const res = await fetch(`/api/videos/${video.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ tipo: newTipo }),
                });
                if (res.ok) {
                  const updated: Video = await res.json();
                  setVideos((prev) =>
                    prev.map((v) => (v.id === video.id ? updated : v))
                  );
                }
              }}
              className="w-full rounded border-0 bg-transparent px-1 py-0.5 text-sm focus:ring-1 focus:ring-blue-400"
            >
              <option value="">—</option>
              {VIDEO_TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          );
        },
      },
      {
        headerName: "Descripcion",
        field: "description",
        flex: 1,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams<Video>) => {
          const video = params.data;
          if (!video) return null;

          if (editingId === video.id) {
            return (
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
            );
          }

          return (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">
                {video.description || "\u2014"}
              </span>
              <button
                onClick={() => startEdit(video)}
                className="rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-600"
                title="Editar descripcion"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        },
      },
      {
        headerName: "Acciones",
        width: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<Video>) => {
          const video = params.data;
          if (!video) return null;
          return (
            <div className="flex items-center gap-1">
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
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingId, editingDesc]
  );

  // ── Export setup ──

  const exportColumns = useMemo(
    () => [
      { header: "Nombre", field: "original_name", width: 40 },
      { header: "Tipo", field: "tipo", width: 15 },
      { header: "Tamano (bytes)", field: "size_bytes", width: 15 },
      { header: "Subido", field: "uploaded_at", width: 20 },
      { header: "Descripcion", field: "description", width: 35 },
    ],
    []
  );

  const { exportToExcel, exportToPdf, exportToCsv } = useDataGridExport({
    data: videos,
    columns: exportColumns,
    fileName: "videos",
    title: "Videos del Repositorio",
  });

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
          <div className="flex gap-4">
            <div className="flex-1 max-w-md">
              <label className="mb-1 block text-sm text-gray-600">
                Descripcion (opcional, se aplica a todos los archivos)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Promo cardiologia 2026"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={isUploading}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Tipo
              </label>
              <select
                value={uploadTipo}
                onChange={(e) => setUploadTipo(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
                disabled={isUploading}
              >
                <option value="">Sin tipo</option>
                {VIDEO_TIPOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
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
            Formatos: MP4, WebM, OGG, AVI, MKV, MOV. Maximo recomendado: 500MB
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

      {/* Video list - AG Grid */}
      {videos.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          <Film className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p>No hay videos en el repositorio</p>
          <p className="text-sm">
            Subi tu primer video usando el boton de arriba
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <DataGrid
            rowData={videos}
            columnDefs={columnDefs}
            height="calc(100vh - 480px)"
            quickFilter={quickFilter}
            paginationPageSize={50}
            toolbarSlot={
              <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
                <span className="text-sm text-gray-500">
                  {videos.length} video{videos.length !== 1 ? "s" : ""} en el
                  repositorio
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value)}
                    placeholder="Buscar..."
                    className="rounded-lg border px-3 py-1.5 text-sm"
                  />
                  <div className="flex gap-1 border-l pl-2 ml-1">
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
              </div>
            }
          />
        </div>
      )}

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
