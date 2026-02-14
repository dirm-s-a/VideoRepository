"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Film,
  ListMusic,
  Monitor,
  BarChart3,
  Server,
  Users,
  Database,
  LogOut,
} from "lucide-react";
import { setupAgGridLicense } from "@/shared/config/ag-grid-license";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/videos", label: "Videos", icon: Film },
  { href: "/playlists", label: "Playlists", icon: ListMusic },
  { href: "/llamadores", label: "Llamadores", icon: Monitor },
  { href: "/estadisticas", label: "Estadisticas", icon: BarChart3 },
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/database", label: "Base de Datos", icon: Database },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    setupAgGridLicense();
  }, []);

  // Fetch current user (skip on login page)
  useEffect(() => {
    if (pathname === "/login") {
      setCurrentUser(null);
      return;
    }
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.username) setCurrentUser(data.username);
      })
      .catch(() => {});
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  // Login page: no sidebar
  if (pathname === "/login") {
    return (
      <html lang="es">
        <body className="bg-gray-50 text-gray-900 min-h-screen">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-700 flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-400" />
            <h1 className="text-lg font-bold">Video Repository</h1>
          </div>
          <nav className="flex-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-700">
            {currentUser && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400 truncate">
                  {currentUser}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-800 hover:text-white"
                  title="Cerrar sesion"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Salir
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500">Video Repository v1.0</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
