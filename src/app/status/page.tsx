"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, RefreshCw, Monitor } from "lucide-react";
import { timeAgo } from "@/components/format-utils";

interface LlamadorInfo {
  nombre: string;
  descripcion: string;
  videoCount: number;
  last_seen_at: string | null;
  last_status: string | null;
  ip_address: string | null;
}

interface ParsedStatus {
  currentVideo?: string;
  cacheStatus?: string;
  cachedCount?: number;
  totalCount?: number;
}

export default function StatusPage() {
  const [llamadores, setLlamadores] = useState<LlamadorInfo[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/playlists");
    if (res.ok) setLlamadores(await res.json());
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [load]);

  function parseStatus(raw: string | null): ParsedStatus {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  function getStatusColor(
    lastSeen: string | null,
    cacheStatus?: string
  ): { bg: string; ring: string; label: string } {
    if (!lastSeen) {
      return {
        bg: "bg-gray-100",
        ring: "ring-gray-300",
        label: "Sin conexion",
      };
    }

    const diffMin =
      (Date.now() - new Date(lastSeen).getTime()) / 60000;

    if (diffMin > 10) {
      return {
        bg: "bg-red-50",
        ring: "ring-red-300",
        label: "Offline",
      };
    }

    if (cacheStatus === "error") {
      return {
        bg: "bg-yellow-50",
        ring: "ring-yellow-300",
        label: "Error sync",
      };
    }

    if (cacheStatus === "syncing") {
      return {
        bg: "bg-blue-50",
        ring: "ring-blue-300",
        label: "Sincronizando",
      };
    }

    return {
      bg: "bg-green-50",
      ring: "ring-green-300",
      label: "Online",
    };
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Estado de Llamadores
        </h1>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {llamadores.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay llamadores registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {llamadores.map((l) => {
            const status = parseStatus(l.last_status);
            const statusStyle = getStatusColor(
              l.last_seen_at,
              status.cacheStatus
            );

            return (
              <div
                key={l.nombre}
                className={`rounded-lg border p-5 ring-2 ${statusStyle.bg} ${statusStyle.ring}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{l.nombre}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      statusStyle.label === "Online"
                        ? "bg-green-200 text-green-800"
                        : statusStyle.label === "Offline"
                          ? "bg-red-200 text-red-800"
                          : statusStyle.label === "Sincronizando"
                            ? "bg-blue-200 text-blue-800"
                            : statusStyle.label === "Error sync"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                <div className="text-sm space-y-2">
                  {l.ip_address && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">IP:</span>
                      <span className="font-mono">{l.ip_address}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500">Videos en playlist:</span>
                    <span className="font-medium">{l.videoCount}</span>
                  </div>

                  {status.cachedCount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Videos cacheados:</span>
                      <span className="font-medium">
                        {status.cachedCount}/{status.totalCount ?? l.videoCount}
                      </span>
                    </div>
                  )}

                  {status.currentVideo && (
                    <div>
                      <span className="text-gray-500">Reproduciendo:</span>
                      <p className="font-medium truncate mt-0.5">
                        {status.currentVideo}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between pt-1 border-t">
                    <span className="text-gray-500">Ultima vez visto:</span>
                    <span>{timeAgo(l.last_seen_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6 text-center">
        Esta pagina se actualiza automaticamente cada 30 segundos
      </p>
    </div>
  );
}
