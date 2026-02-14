"use client";

import { useState, useRef } from "react";
import {
  DatabaseBackup,
  Upload,
  RotateCcw,
  Database,
  AlertTriangle,
} from "lucide-react";

export default function DatabasePage() {
  const [restoring, setRestoring] = useState(false);
  const [resetting, setResetting] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Database className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Base de Datos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Backup */}
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-blue-50 p-2">
              <DatabaseBackup className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">Backup</h2>
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
