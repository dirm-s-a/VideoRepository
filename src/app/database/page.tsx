"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  DatabaseBackup,
  Upload,
  RotateCcw,
  Database,
  AlertTriangle,
  Clock,
  Play,
} from "lucide-react";

interface BackupConfig {
  enabled: boolean;
  hour: number;
  keepDays: number;
}

interface BackupFile {
  filename: string;
  size: number;
  date: string;
}

export default function DatabasePage() {
  const [restoring, setRestoring] = useState(false);
  const [resetting, setResetting] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Backup schedule state
  const [scheduleConfig, setScheduleConfig] = useState<BackupConfig>({
    enabled: true,
    hour: 3,
    keepDays: 7,
  });
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [runningBackup, setRunningBackup] = useState(false);

  const loadSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/backup?action=schedule");
      if (res.ok) {
        const data = await res.json();
        setScheduleConfig(data.config);
        setBackups(data.backups);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingSchedule(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  async function saveSchedule(config: BackupConfig) {
    setSavingSchedule(true);
    try {
      const res = await fetch("/api/backup?action=schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const data = await res.json();
        setScheduleConfig(data.config);
        setBackups(data.backups);
      }
    } catch {
      alert("Error al guardar configuracion");
    } finally {
      setSavingSchedule(false);
    }
  }

  async function runManualBackup() {
    setRunningBackup(true);
    try {
      const res = await fetch("/api/backup?action=run", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setBackups(data.backups);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert("Error de conexion");
    } finally {
      setRunningBackup(false);
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Database className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Base de Datos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup */}
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-blue-50 p-2">
              <DatabaseBackup className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">Backup Manual</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Descarga una copia de la base de datos SQLite actual. Incluye toda
            la configuracion, videos, playlists, llamadores y usuarios.
          </p>
          <a
            href="/api/backup"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <DatabaseBackup className="h-4 w-4" />
            Descargar Backup
          </a>
        </div>

        {/* Restaurar */}
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-amber-50 p-2">
              <Upload className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold">Restaurar</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Reemplaza la base de datos actual con un archivo de backup
            previamente descargado. Se perderan los datos actuales.
          </p>
          <input
            ref={restoreInputRef}
            type="file"
            accept=".db,.sqlite,.sqlite3"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (
                !confirm(
                  `Restaurar la base de datos desde "${file.name}"?\n\nEsto reemplazara toda la configuracion actual.`
                )
              ) {
                e.target.value = "";
                return;
              }
              setRestoring(true);
              try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/backup?action=restore", {
                  method: "POST",
                  body: formData,
                });
                const data = await res.json();
                if (res.ok) {
                  alert(data.message || "Restaurado correctamente");
                  window.location.reload();
                } else {
                  alert(`Error: ${data.error}`);
                }
              } catch {
                alert("Error de conexion al restaurar");
              } finally {
                setRestoring(false);
                e.target.value = "";
              }
            }}
          />
          <button
            onClick={() => restoreInputRef.current?.click()}
            disabled={restoring}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {restoring ? "Restaurando..." : "Seleccionar Archivo"}
          </button>
        </div>

        {/* Backup Programado */}
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-green-50 p-2">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold">Backup Programado</h2>
          </div>

          {loadingSchedule ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : (
            <>
              {/* Toggle */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Backup automatico diario
                </span>
                <button
                  onClick={() => {
                    const next = {
                      ...scheduleConfig,
                      enabled: !scheduleConfig.enabled,
                    };
                    setScheduleConfig(next);
                    saveSchedule(next);
                  }}
                  disabled={savingSchedule}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    scheduleConfig.enabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      scheduleConfig.enabled
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Hour */}
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm text-gray-600 w-24">Hora:</label>
                <select
                  value={scheduleConfig.hour}
                  onChange={(e) => {
                    const next = {
                      ...scheduleConfig,
                      hour: Number(e.target.value),
                    };
                    setScheduleConfig(next);
                    saveSchedule(next);
                  }}
                  disabled={savingSchedule || !scheduleConfig.enabled}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>

              {/* Retention */}
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm text-gray-600 w-24">Retener:</label>
                <select
                  value={scheduleConfig.keepDays}
                  onChange={(e) => {
                    const next = {
                      ...scheduleConfig,
                      keepDays: Number(e.target.value),
                    };
                    setScheduleConfig(next);
                    saveSchedule(next);
                  }}
                  disabled={savingSchedule || !scheduleConfig.enabled}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  {[3, 5, 7, 14, 30, 60, 90].map((d) => (
                    <option key={d} value={d}>
                      {d} dias
                    </option>
                  ))}
                </select>
              </div>

              {/* Run now */}
              <button
                onClick={runManualBackup}
                disabled={runningBackup}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {runningBackup ? "Ejecutando..." : "Ejecutar Ahora"}
              </button>

              {/* Backup list */}
              {backups.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Backups guardados ({backups.length})
                  </h3>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {backups.map((b) => (
                      <li
                        key={b.filename}
                        className="flex items-center justify-between text-xs text-gray-600"
                      >
                        <span className="truncate mr-2" title={b.filename}>
                          {b.filename}
                        </span>
                        <span className="shrink-0 text-gray-400">
                          {formatSize(b.size)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Reiniciar */}
        <div className="rounded-lg border border-red-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-red-50 p-2">
              <RotateCcw className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-red-700">
              Reiniciar Base de Datos
            </h2>
          </div>
          <div className="flex items-start gap-2 mb-4 rounded-lg bg-red-50 p-3">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">
              Esta accion eliminara <strong>todos</strong> los datos: videos,
              playlists, llamadores, usuarios y estadisticas. Se creara un
              usuario admin/admin por defecto.
            </p>
          </div>
          <button
            onClick={async () => {
              if (
                !confirm(
                  "Se descargara un backup antes de reiniciar.\n\nDescargar backup ahora?"
                )
              )
                return;

              const link = document.createElement("a");
              link.href = "/api/backup";
              link.click();

              await new Promise((r) => setTimeout(r, 1500));

              if (
                !confirm(
                  "ATENCION: Esto eliminara TODOS los datos:\n- Videos\n- Playlists\n- Llamadores\n- Usuarios\n- Estadisticas\n\nSe creara un usuario admin/admin por defecto.\n\nContinuar con el reinicio?"
                )
              )
                return;

              setResetting(true);
              try {
                const res = await fetch("/api/backup?action=reset", {
                  method: "POST",
                });
                const data = await res.json();
                if (res.ok) {
                  alert(data.message || "Base de datos reiniciada");
                  window.location.href = "/login";
                } else {
                  alert(`Error: ${data.error}`);
                }
              } catch {
                alert("Error de conexion al reiniciar");
              } finally {
                setResetting(false);
              }
            }}
            disabled={resetting}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            {resetting ? "Reiniciando..." : "Reiniciar Base de Datos"}
          </button>
        </div>
      </div>
    </div>
  );
}
