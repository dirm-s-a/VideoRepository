"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Users,
  Plus,
  Trash2,
  KeyRound,
  RefreshCw,
  X,
  Search,
  Download,
} from "lucide-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { DataGrid } from "@/shared/ui/DataGrid";
import { useDataGridExport } from "@/shared/ui/useDataGridExport";

interface User {
  id: number;
  username: string;
  created_at: string;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [changePasswordUser, setChangePasswordUser] = useState<User | null>(
    null
  );
  const [quickFilter, setQuickFilter] = useState("");
  const [displayedCount, setDisplayedCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, meRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/auth/me"),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (meRes.ok) {
        const me = await meRes.json();
        setCurrentUserId(me.id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(user: User) {
    if (!confirm(`Eliminar usuario "${user.username}"?`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      const err = await res.json();
      alert(err.error || "Error al eliminar");
    }
  }

  const columnDefs = useMemo<ColDef<User>[]>(
    () => [
      {
        field: "username",
        headerName: "Usuario",
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: ICellRendererParams<User>) => {
          if (!params.data) return null;
          return (
            <div className="flex items-center gap-2 h-full">
              <span className="font-medium">{params.data.username}</span>
              {params.data.id === currentUserId && (
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">
                  tu
                </span>
              )}
            </div>
          );
        },
      },
      {
        field: "created_at",
        headerName: "Creado",
        width: 170,
        valueFormatter: (params: { value: string }) => {
          if (!params.value) return "";
          const d = new Date(params.value + "Z");
          return d.toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
      {
        headerName: "Acciones",
        width: 220,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: (params: ICellRendererParams<User>) => {
          if (!params.data) return null;
          const user = params.data;
          const isAdmin = user.username.toLowerCase() === "admin";
          const isSelf = user.id === currentUserId;
          return (
            <div className="flex items-center gap-1 h-full">
              <button
                onClick={() => setChangePasswordUser(user)}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                title="Cambiar clave"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Cambiar Clave
              </button>
              <button
                onClick={() => handleDelete(user)}
                disabled={isSelf || isAdmin}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                title={
                  isAdmin
                    ? "El usuario admin no se puede eliminar"
                    : isSelf
                      ? "No se puede eliminar el usuario actual"
                      : "Eliminar"
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>
            </div>
          );
        },
      },
    ],
    [currentUserId]
  );

  // Export setup
  const exportColumns = useMemo(
    () => [
      { header: "ID", field: "id", width: 10 },
      { header: "Usuario", field: "username", width: 30 },
      { header: "Creado", field: "created_at", width: 25 },
    ],
    []
  );

  const { exportToExcel, exportToPdf, exportToCsv } = useDataGridExport({
    data: users,
    columns: exportColumns,
    fileName: "usuarios",
    title: "Listado de Usuarios",
  });

  return (
    <div className="flex h-full flex-col p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Users className="h-6 w-6" />
          Usuarios
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick filter + Export */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              placeholder="Filtro rapido..."
              className="rounded-lg border py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="rounded-lg border bg-white px-4 py-2">
            <span className="text-sm text-gray-500">Total:</span>{" "}
            <span className="font-semibold">{displayedCount}</span>
            {displayedCount !== users.length && (
              <span className="ml-1 text-xs text-gray-400">
                de {users.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
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

      {/* AG Grid */}
      <div className="flex-1 overflow-hidden rounded-lg border bg-white">
        <DataGrid<User>
          rowData={users}
          columnDefs={columnDefs}
          height="calc(100vh - 280px)"
          quickFilter={quickFilter}
          loading={loading}
          noRowsMessage="No hay usuarios registrados."
          paginationPageSize={50}
          onDisplayedRowCountChange={setDisplayedCount}
        />
      </div>

      {/* Create user modal */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {/* Change password modal */}
      {changePasswordUser && (
        <ChangePasswordModal
          user={changePasswordUser}
          onClose={() => setChangePasswordUser(null)}
          onSaved={() => setChangePasswordUser(null)}
        />
      )}
    </div>
  );
}

// ── Create User Modal ──

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear usuario");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nuevo Usuario</h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              autoFocus
              autoComplete="off"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Clave
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !username || !password}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Change Password Modal ──

function ChangePasswordModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setError(data.error || "Error al cambiar clave");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Cambiar Clave: {user.username}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nueva Clave
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              autoFocus
              autoComplete="new-password"
              placeholder="Minimo 4 caracteres"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || password.length < 4}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
