/** Parse a SQLite datetime('now') string as UTC */
function parseUtc(dateStr: string): Date {
  // SQLite datetime('now') returns "YYYY-MM-DD HH:MM:SS" in UTC
  // new Date() without "Z" interprets as local time — append Z to force UTC
  const iso = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
  return new Date(iso.endsWith("Z") ? iso : iso + "Z");
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = parseUtc(dateStr);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export { parseUtc };

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "nunca";
  const date = parseUtc(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays}d`;
}
