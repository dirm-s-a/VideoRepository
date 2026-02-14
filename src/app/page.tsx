"use client";

import { useEffect, useState, useCallback } from "react";
import { Film, HardDrive, Monitor, ListMusic, RefreshCw, Play } from "lucide-react";
import { formatBytes, timeAgo, parseUtc } from "@/components/format-utils";

interface LlamadorInfo {
  nombre: string;
  videoCount: number;
  last_seen_at: string | null;
  last_status: string | null;
  ip_address: string | null;
  playlistNombre: string | null;
}

interface DashboardData {
  videoCount: number;
  diskUsage: number;
  playlistCount: number;
  llamadores: LlamadorInfo[];
  videoDescriptions: Record<string, string>;
}

interface ParsedStatus {
  currentVideo?: string;
  cacheStatus?: string;
  cachedCount?: number;
  totalCount?: number;
}

function parseStatus(raw: string | null): ParsedStatus {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getStatusStyle(
  lastSeen: string | null,
  cacheStatus?: string
): { bg: string; ring: string; label: string; badge: string } {
  if (!lastSeen) {
    return {
      bg: "bg-gray-50",
      ring: "ring-gray-300",
      label: "Sin conexion",
      badge: "bg-gray-200 text-gray-700",
    };
  }

  const diffMin = (Date.now() - parseUtc(lastSeen).getTime()) / 60000;

  if (diffMin > 10) {
    return {
      bg: "bg-red-50",
      ring: "ring-red-300",
      label: "Offline",
      badge: "bg-red-200 text-red-800",
    };
  }

  if (cacheStatus === "error") {
    return {
      bg: "bg-yellow-50",
      ring: "ring-yellow-300",
      label: "Error sync",
      badge: "bg-yellow-200 text-yellow-800",
    };
  }

  if (cacheStatus === "syncing") {
    return {
      bg: "bg-blue-50",
      ring: "ring-blue-300",
      label: "Sincronizando",
      badge: "bg-blue-200 text-blue-800",
    };
  }

  return {
    bg: "bg-green-50",
    ring: "ring-green-300",
    label: "Online",
    badge: "bg-green-200 text-green-800",
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  const load = useCallback(async () => {
    const [videosRes, playlistsRes, llamadoresRes] = await Promise.all([
      fetch("/api/videos"),
      fetch("/api/playlists"),
      fetch("/api/llamadores"),
    ]);
    const videos = await videosRes.json();
    const playlists = await playlistsRes.json();
    const llamadores = await llamadoresRes.json();

    const diskUsage = Array.isArray(videos)
      ? videos.reduce(
          (sum: number, v: { size_bytes: number }) => sum + v.size_bytes,
          0
        )
      : 0;

    const videoDescriptions: Record<string, string> = {};
    if (Array.isArray(videos)) {
      for (const v of videos) {
        if (v.filename && v.description) {
          videoDescriptions[v.filename] = v.description;
        }
      }
    }

    setData({
      videoCount: Array.isArray(videos) ? videos.length : 0,
      diskUsage,
      playlistCount: Array.isArray(playlists) ? playlists.length : 0,
      llamadores: Array.isArray(llamadores) ? llamadores : [],
      videoDescriptions,
    });
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (!data) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-gray-400 text-lg">Cargando...</div>
      </div>
    );
  }

  const onlineLlamadores = data.llamadores.filter((l) => {
    if (!l.last_seen_at) return false;
    const diff = Date.now() - parseUtc(l.last_seen_at).getTime();
    return diff < 10 * 60 * 1000;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Film}
          label="Videos"
          value={String(data.videoCount)}
          color="blue"
        />
        <StatCard
          icon={HardDrive}
          label="Espacio Usado"
          value={formatBytes(data.diskUsage)}
          color="purple"
        />
        <StatCard
          icon={ListMusic}
          label="Playlists"
          value={String(data.playlistCount)}
          color="green"
        />
        <StatCard
          icon={Monitor}
          label="Llamadores Online"
          value={`${onlineLlamadores.length}/${data.llamadores.length}`}
          color="emerald"
        />
      </div>

      {/* Llamadores status */}
      <h2 className="text-lg font-semibold mb-4">Estado de Llamadores</h2>
      {data.llamadores.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay llamadores registrados</p>
          <p className="text-sm">
            Los llamadores se registran automaticamente al sincronizar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {data.llamadores.map((l) => {
            const status = parseStatus(l.last_status);
            const style = getStatusStyle(l.last_seen_at, status.cacheStatus);

            return (
              <div
                key={l.nombre}
                className={`rounded-lg border p-3 ring-1 ${style.bg} ${style.ring}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-sm truncate">{l.nombre}</h3>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ml-2 ${style.badge}`}
                  >
                    {style.label}
                  </span>
                </div>

                <div className="text-xs space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {l.ip_address && (
                        <span className="font-mono">{l.ip_address}</span>
                      )}
                    </span>
                    <span className="text-gray-500">
                      {l.playlistNombre && (
                        <span className="font-medium text-gray-700">{l.playlistNombre}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Videos: <span className="font-medium text-gray-700">{l.videoCount}</span>
                      {status.cachedCount !== undefined && (
                        <span className="ml-2">
                          Cache: <span className="font-medium text-gray-700">
                            {status.cachedCount}/{status.totalCount ?? l.videoCount}
                          </span>
                        </span>
                      )}
                    </span>
                    <span className="text-gray-400">{timeAgo(l.last_seen_at)}</span>
                  </div>

                  {status.currentVideo && (
                    <div className="flex items-center gap-1 mt-1 rounded bg-white/60 px-2 py-1 truncate">
                      <Play className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate font-medium text-gray-700">
                        {status.currentVideo}
                        {data.videoDescriptions[status.currentVideo] && (
                          <span className="font-normal text-gray-500">
                            {" "}({data.videoDescriptions[status.currentVideo]})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
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

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorMap[color] ?? colorMap.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
