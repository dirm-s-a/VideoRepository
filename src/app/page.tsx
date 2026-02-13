"use client";

import { useEffect, useState } from "react";
import { Film, HardDrive, Monitor, ListMusic } from "lucide-react";
import { formatBytes, timeAgo } from "@/components/format-utils";

interface DashboardData {
  videoCount: number;
  diskUsage: number;
  llamadores: {
    nombre: string;
    videoCount: number;
    last_seen_at: string | null;
    last_status: string | null;
    ip_address: string | null;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function load() {
      const [videosRes, playlistsRes] = await Promise.all([
        fetch("/api/videos"),
        fetch("/api/playlists"),
      ]);
      const videos = await videosRes.json();
      const playlists = await playlistsRes.json();

      const diskUsage = Array.isArray(videos)
        ? videos.reduce(
            (sum: number, v: { size_bytes: number }) => sum + v.size_bytes,
            0
          )
        : 0;

      setData({
        videoCount: Array.isArray(videos) ? videos.length : 0,
        diskUsage,
        llamadores: Array.isArray(playlists) ? playlists : [],
      });
    }
    load();
  }, []);

  if (!data) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-gray-400 text-lg">Cargando...</div>
      </div>
    );
  }

  const onlineLlamadores = data.llamadores.filter((l) => {
    if (!l.last_seen_at) return false;
    const diff = Date.now() - new Date(l.last_seen_at).getTime();
    return diff < 10 * 60 * 1000; // 10 minutes
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

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
          icon={Monitor}
          label="Llamadores"
          value={String(data.llamadores.length)}
          color="green"
        />
        <StatCard
          icon={ListMusic}
          label="Online"
          value={String(onlineLlamadores.length)}
          color="emerald"
        />
      </div>

      {/* Llamadores status */}
      <h2 className="text-lg font-semibold mb-4">Estado de Llamadores</h2>
      {data.llamadores.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          No hay llamadores registrados. Los llamadores se registran
          automaticamente al sincronizar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.llamadores.map((l) => {
            const isOnline =
              l.last_seen_at &&
              Date.now() - new Date(l.last_seen_at).getTime() < 10 * 60 * 1000;
            let status: { currentVideo?: string; cacheStatus?: string } = {};
            try {
              if (l.last_status) status = JSON.parse(l.last_status);
            } catch {
              /* ignore */
            }

            return (
              <div
                key={l.nombre}
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{l.nombre}</h3>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isOnline ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Videos: {l.videoCount}</p>
                  {l.ip_address && <p>IP: {l.ip_address}</p>}
                  {status.currentVideo && (
                    <p>Reproduciendo: {status.currentVideo}</p>
                  )}
                  {status.cacheStatus && <p>Cache: {status.cacheStatus}</p>}
                  <p>Visto: {timeAgo(l.last_seen_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
