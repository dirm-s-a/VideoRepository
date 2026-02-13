import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "repository.db");
const VIDEOS_DIR = path.join(DATA_DIR, "videos");

// Ensure directories exist
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(VIDEOS_DIR, { recursive: true });

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      original_name TEXT NOT NULL,
      sha256 TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      duration_seconds REAL,
      uploaded_at TEXT DEFAULT (datetime('now')),
      description TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS llamadores (
      nombre TEXT PRIMARY KEY,
      descripcion TEXT DEFAULT '',
      last_seen_at TEXT,
      last_status TEXT,
      ip_address TEXT
    );

    CREATE TABLE IF NOT EXISTS playlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      llamador_nombre TEXT NOT NULL REFERENCES llamadores(nombre) ON DELETE CASCADE,
      video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
      orden INTEGER NOT NULL,
      UNIQUE(llamador_nombre, video_id)
    );

    CREATE INDEX IF NOT EXISTS idx_playlist_llamador ON playlist_items(llamador_nombre);
    CREATE INDEX IF NOT EXISTS idx_playlist_orden ON playlist_items(llamador_nombre, orden);
  `);
}

export function getVideosDir(): string {
  return VIDEOS_DIR;
}

// ── Video operations ──

export interface VideoRow {
  id: number;
  filename: string;
  original_name: string;
  sha256: string;
  size_bytes: number;
  duration_seconds: number | null;
  uploaded_at: string;
  description: string;
}

export function getAllVideos(): VideoRow[] {
  return getDb().prepare("SELECT * FROM videos ORDER BY uploaded_at DESC").all() as VideoRow[];
}

export function getVideoById(id: number): VideoRow | undefined {
  return getDb().prepare("SELECT * FROM videos WHERE id = ?").get(id) as VideoRow | undefined;
}

export function insertVideo(data: {
  filename: string;
  original_name: string;
  sha256: string;
  size_bytes: number;
  description?: string;
}): VideoRow {
  const stmt = getDb().prepare(
    `INSERT INTO videos (filename, original_name, sha256, size_bytes, description)
     VALUES (?, ?, ?, ?, ?)`
  );
  const result = stmt.run(
    data.filename,
    data.original_name,
    data.sha256,
    data.size_bytes,
    data.description ?? ""
  );
  return getVideoById(Number(result.lastInsertRowid))!;
}

export function updateVideoDescription(id: number, description: string): VideoRow | undefined {
  getDb().prepare("UPDATE videos SET description = ? WHERE id = ?").run(description, id);
  return getVideoById(id);
}

export function deleteVideo(id: number): boolean {
  const result = getDb().prepare("DELETE FROM videos WHERE id = ?").run(id);
  return result.changes > 0;
}

// ── Llamador operations ──

export interface LlamadorRow {
  nombre: string;
  descripcion: string;
  last_seen_at: string | null;
  last_status: string | null;
  ip_address: string | null;
}

export function getAllLlamadores(): LlamadorRow[] {
  return getDb().prepare("SELECT * FROM llamadores ORDER BY nombre").all() as LlamadorRow[];
}

export function getLlamador(nombre: string): LlamadorRow | undefined {
  return getDb().prepare("SELECT * FROM llamadores WHERE nombre = ?").get(nombre) as LlamadorRow | undefined;
}

export function upsertLlamador(data: {
  nombre: string;
  descripcion?: string;
  ip_address?: string;
}): void {
  getDb()
    .prepare(
      `INSERT INTO llamadores (nombre, descripcion, ip_address, last_seen_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(nombre) DO UPDATE SET
         descripcion = COALESCE(excluded.descripcion, descripcion),
         ip_address = COALESCE(excluded.ip_address, ip_address),
         last_seen_at = datetime('now')`
    )
    .run(data.nombre, data.descripcion ?? "", data.ip_address ?? null);
}

export function updateLlamadorStatus(
  nombre: string,
  status: string,
  ipAddress?: string
): void {
  getDb()
    .prepare(
      `UPDATE llamadores SET last_status = ?, last_seen_at = datetime('now'),
       ip_address = COALESCE(?, ip_address) WHERE nombre = ?`
    )
    .run(status, ipAddress ?? null, nombre);
}

// ── Playlist operations ──

export interface PlaylistItemRow {
  id: number;
  llamador_nombre: string;
  video_id: number;
  orden: number;
}

export interface PlaylistVideoRow extends VideoRow {
  orden: number;
}

export function getPlaylist(llamadorNombre: string): PlaylistVideoRow[] {
  return getDb()
    .prepare(
      `SELECT v.*, pi.orden
       FROM playlist_items pi
       JOIN videos v ON v.id = pi.video_id
       WHERE pi.llamador_nombre = ?
       ORDER BY pi.orden`
    )
    .all(llamadorNombre) as PlaylistVideoRow[];
}

export function setPlaylist(
  llamadorNombre: string,
  items: { videoId: number; orden: number }[]
): void {
  const db = getDb();
  const transaction = db.transaction(() => {
    // Ensure llamador exists
    upsertLlamador({ nombre: llamadorNombre });

    // Clear existing playlist
    db.prepare("DELETE FROM playlist_items WHERE llamador_nombre = ?").run(
      llamadorNombre
    );

    // Insert new items
    const insert = db.prepare(
      `INSERT INTO playlist_items (llamador_nombre, video_id, orden) VALUES (?, ?, ?)`
    );
    for (const item of items) {
      insert.run(llamadorNombre, item.videoId, item.orden);
    }
  });
  transaction();
}

export function getPlaylistSummaries(): {
  nombre: string;
  descripcion: string;
  videoCount: number;
  last_seen_at: string | null;
}[] {
  return getDb()
    .prepare(
      `SELECT l.nombre, l.descripcion,
              COUNT(pi.id) as videoCount,
              l.last_seen_at
       FROM llamadores l
       LEFT JOIN playlist_items pi ON pi.llamador_nombre = l.nombre
       GROUP BY l.nombre
       ORDER BY l.nombre`
    )
    .all() as { nombre: string; descripcion: string; videoCount: number; last_seen_at: string | null }[];
}
