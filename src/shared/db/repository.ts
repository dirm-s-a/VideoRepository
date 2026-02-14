import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

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

/** Close the database connection so the file can be replaced. */
export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

export function getDbPath(): string {
  return DB_PATH;
}

export function getDataDir(): string {
  return DATA_DIR;
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

    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS llamadores (
      nombre TEXT PRIMARY KEY,
      descripcion TEXT DEFAULT '',
      last_seen_at TEXT,
      last_status TEXT,
      ip_address TEXT,
      observacion TEXT DEFAULT '',
      ubicacion TEXT DEFAULT '',
      layout TEXT DEFAULT 'horizontal',
      marca_modelo_tv TEXT DEFAULT '',
      foto TEXT DEFAULT '',
      playlist_id INTEGER REFERENCES playlists(id) ON DELETE SET NULL
    );

  `);

  // ── Migrate existing DBs ──

  // 1. Add new columns to llamadores if missing (from previous migration)
  const cols = db.prepare("PRAGMA table_info(llamadores)").all() as { name: string }[];
  const colNames = new Set(cols.map((c) => c.name));
  if (!colNames.has("observacion")) {
    db.exec("ALTER TABLE llamadores ADD COLUMN observacion TEXT DEFAULT ''");
  }
  if (!colNames.has("ubicacion")) {
    db.exec("ALTER TABLE llamadores ADD COLUMN ubicacion TEXT DEFAULT ''");
  }
  if (!colNames.has("layout")) {
    db.exec("ALTER TABLE llamadores ADD COLUMN layout TEXT DEFAULT 'horizontal'");
  }
  if (!colNames.has("marca_modelo_tv")) {
    db.exec("ALTER TABLE llamadores ADD COLUMN marca_modelo_tv TEXT DEFAULT ''");
  }
  if (!colNames.has("foto")) {
    db.exec("ALTER TABLE llamadores ADD COLUMN foto TEXT DEFAULT ''");
  }
  if (!colNames.has("playlist_id")) {
    db.exec("ALTER TABLE llamadores ADD COLUMN playlist_id INTEGER REFERENCES playlists(id) ON DELETE SET NULL");
  }
  if (!colNames.has("ubicacion_principal")) {
    db.exec("ALTER TABLE llamadores ADD COLUMN ubicacion_principal TEXT DEFAULT ''");
  }
  if (!colNames.has("ubicacion_secundaria")) {
    db.exec("ALTER TABLE llamadores ADD COLUMN ubicacion_secundaria TEXT DEFAULT ''");
  }
  if (!colNames.has("resolucion_pantalla")) {
    db.exec("ALTER TABLE llamadores ADD COLUMN resolucion_pantalla TEXT DEFAULT ''");
  }
  // Migrate old ubicacion data to ubicacion_principal
  db.exec("UPDATE llamadores SET ubicacion_principal = ubicacion WHERE ubicacion != '' AND ubicacion_principal = ''");

  // 2. Migrate playlist_items from llamador_nombre to playlist_id (one-time migration)
  const piCols = db.prepare("PRAGMA table_info(playlist_items)").all() as { name: string }[];
  const piColNames = new Set(piCols.map((c) => c.name));

  if (piColNames.has("llamador_nombre")) {
    // Old schema detected — migrate data
    db.exec("BEGIN TRANSACTION");
    try {
      // Create a playlist for each llamador that has playlist items
      db.exec(`
        INSERT OR IGNORE INTO playlists (nombre, descripcion)
        SELECT DISTINCT pi.llamador_nombre, ''
        FROM playlist_items pi
      `);

      // Create new playlist_items table with playlist_id FK
      db.exec(`
        CREATE TABLE playlist_items_v2 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
          video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
          orden INTEGER NOT NULL,
          UNIQUE(playlist_id, video_id)
        )
      `);

      // Copy data mapping llamador_nombre -> playlist_id
      db.exec(`
        INSERT INTO playlist_items_v2 (playlist_id, video_id, orden)
        SELECT p.id, pi.video_id, pi.orden
        FROM playlist_items pi
        JOIN playlists p ON p.nombre = pi.llamador_nombre
      `);

      // Drop old table and indexes
      db.exec("DROP INDEX IF EXISTS idx_playlist_llamador");
      db.exec("DROP INDEX IF EXISTS idx_playlist_orden");
      db.exec("DROP TABLE playlist_items");

      // Rename new table
      db.exec("ALTER TABLE playlist_items_v2 RENAME TO playlist_items");

      // Recreate indexes
      db.exec("CREATE INDEX idx_playlist_playlist_id ON playlist_items(playlist_id)");
      db.exec("CREATE INDEX idx_playlist_orden ON playlist_items(playlist_id, orden)");

      // Assign playlist_id to llamadores
      db.exec(`
        UPDATE llamadores
        SET playlist_id = (SELECT p.id FROM playlists p WHERE p.nombre = llamadores.nombre)
      `);

      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  } else if (!piColNames.has("playlist_id")) {
    // Fresh install or table doesn't exist yet — create with new schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS playlist_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
        video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
        orden INTEGER NOT NULL
      )
    `);
  }

  // Ensure indexes exist (safe for both migrated and fresh DBs)
  db.exec("CREATE INDEX IF NOT EXISTS idx_playlist_playlist_id ON playlist_items(playlist_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_playlist_orden ON playlist_items(playlist_id, orden)");

  // 2b. Remove UNIQUE(playlist_id, video_id) to allow duplicate videos in playlists
  const piSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='playlist_items'").get() as { sql: string } | undefined;
  if (piSql && piSql.sql.includes("UNIQUE")) {
    db.exec("BEGIN TRANSACTION");
    try {
      db.exec(`
        CREATE TABLE playlist_items_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
          video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
          orden INTEGER NOT NULL
        )
      `);
      db.exec("INSERT INTO playlist_items_new SELECT * FROM playlist_items");
      db.exec("DROP TABLE playlist_items");
      db.exec("ALTER TABLE playlist_items_new RENAME TO playlist_items");
      db.exec("CREATE INDEX idx_playlist_playlist_id ON playlist_items(playlist_id)");
      db.exec("CREATE INDEX idx_playlist_orden ON playlist_items(playlist_id, orden)");
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }

  // 3. Create video_plays table for playback tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS video_plays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      llamador_nombre TEXT NOT NULL,
      video_filename TEXT NOT NULL,
      video_id INTEGER,
      played_at TEXT DEFAULT (datetime('now')),
      duration_seconds REAL,
      ubicacion_principal TEXT DEFAULT '',
      ubicacion_secundaria TEXT DEFAULT ''
    )
  `);
  db.exec("CREATE INDEX IF NOT EXISTS idx_vp_llamador ON video_plays(llamador_nombre)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_vp_played_at ON video_plays(played_at)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_vp_video ON video_plays(video_filename)");

  // 4. Add tipo column to videos if missing
  const videoCols = db.prepare("PRAGMA table_info(videos)").all() as { name: string }[];
  const videoColNames = new Set(videoCols.map((c) => c.name));
  if (!videoColNames.has("tipo")) {
    db.exec("ALTER TABLE videos ADD COLUMN tipo TEXT DEFAULT ''");
  }

  // 5. Users table for authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Seed default admin user if no users exist
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    const hash = bcrypt.hashSync("admin", 10);
    db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run("admin", hash);
  }
}

export function getVideosDir(): string {
  return VIDEOS_DIR;
}

// ── Integrity check ──

export interface IntegrityReport {
  dbVideos: number;
  diskFiles: number;
  missingFiles: string[];     // in DB but not on disk
  orphanedFiles: string[];    // on disk but not in DB
  removedFromDb: string[];    // entries cleaned from DB
  removedFromDisk: string[];  // files cleaned from disk
}

/**
 * Check and optionally fix consistency between DB video entries and disk files.
 * @param autoClean if true, removes DB entries without files and files without DB entries
 */
export function checkIntegrity(autoClean: boolean = false): IntegrityReport {
  const db = getDb();
  const videos = db.prepare("SELECT id, filename FROM videos").all() as { id: number; filename: string }[];
  const dbFilenames = new Set(videos.map((v) => v.filename));

  // List actual files on disk
  let diskFiles: string[] = [];
  if (fs.existsSync(VIDEOS_DIR)) {
    diskFiles = fs.readdirSync(VIDEOS_DIR).filter((f) => !f.startsWith("."));
  }
  const diskFilenames = new Set(diskFiles);

  // Videos in DB but missing from disk
  const missingFiles = videos
    .filter((v) => !diskFilenames.has(v.filename))
    .map((v) => v.filename);

  // Files on disk but not in DB
  const orphanedFiles = diskFiles.filter((f) => !dbFilenames.has(f));

  const removedFromDb: string[] = [];
  const removedFromDisk: string[] = [];

  if (autoClean) {
    // Remove DB entries for missing files
    if (missingFiles.length > 0) {
      const deletePlaylistItems = db.prepare(
        "DELETE FROM playlist_items WHERE video_id = ?"
      );
      const deleteVideo = db.prepare("DELETE FROM videos WHERE id = ?");

      for (const v of videos) {
        if (!diskFilenames.has(v.filename)) {
          deletePlaylistItems.run(v.id);
          deleteVideo.run(v.id);
          removedFromDb.push(v.filename);
        }
      }
    }

    // Remove orphaned files from disk
    for (const f of orphanedFiles) {
      fs.unlinkSync(path.join(VIDEOS_DIR, f));
      removedFromDisk.push(f);
    }
  }

  return {
    dbVideos: videos.length,
    diskFiles: diskFiles.length,
    missingFiles,
    orphanedFiles,
    removedFromDb,
    removedFromDisk,
  };
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
  tipo: string;
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
  tipo?: string;
}): VideoRow {
  const stmt = getDb().prepare(
    `INSERT INTO videos (filename, original_name, sha256, size_bytes, description, tipo)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const result = stmt.run(
    data.filename,
    data.original_name,
    data.sha256,
    data.size_bytes,
    data.description ?? "",
    data.tipo ?? ""
  );
  return getVideoById(Number(result.lastInsertRowid))!;
}

export function updateVideoDescription(id: number, description: string): VideoRow | undefined {
  getDb().prepare("UPDATE videos SET description = ? WHERE id = ?").run(description, id);
  return getVideoById(id);
}

export function updateVideo(
  id: number,
  data: { description?: string; tipo?: string }
): VideoRow | undefined {
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }
  if (data.tipo !== undefined) {
    fields.push("tipo = ?");
    values.push(data.tipo);
  }

  if (fields.length === 0) return getVideoById(id);

  values.push(id);
  getDb()
    .prepare(`UPDATE videos SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);
  return getVideoById(id);
}

export function deleteVideo(id: number): boolean {
  const result = getDb().prepare("DELETE FROM videos WHERE id = ?").run(id);
  return result.changes > 0;
}

// ── Playlist operations ──

export interface PlaylistRow {
  id: number;
  nombre: string;
  descripcion: string;
  created_at: string;
}

export interface PlaylistItemRow {
  id: number;
  playlist_id: number;
  video_id: number;
  orden: number;
}

export interface PlaylistVideoRow extends VideoRow {
  orden: number;
}

export function getAllPlaylists(): PlaylistRow[] {
  return getDb().prepare("SELECT * FROM playlists ORDER BY nombre").all() as PlaylistRow[];
}

export function getPlaylistById(id: number): PlaylistRow | undefined {
  return getDb().prepare("SELECT * FROM playlists WHERE id = ?").get(id) as PlaylistRow | undefined;
}

export function createPlaylist(data: {
  nombre: string;
  descripcion?: string;
}): PlaylistRow {
  const stmt = getDb().prepare(
    "INSERT INTO playlists (nombre, descripcion) VALUES (?, ?)"
  );
  const result = stmt.run(data.nombre, data.descripcion ?? "");
  return getPlaylistById(Number(result.lastInsertRowid))!;
}

export function updatePlaylist(
  id: number,
  data: { nombre?: string; descripcion?: string }
): PlaylistRow | undefined {
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (data.nombre !== undefined) {
    fields.push("nombre = ?");
    values.push(data.nombre);
  }
  if (data.descripcion !== undefined) {
    fields.push("descripcion = ?");
    values.push(data.descripcion);
  }

  if (fields.length === 0) return getPlaylistById(id);

  values.push(id);
  getDb()
    .prepare(`UPDATE playlists SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);
  return getPlaylistById(id);
}

export function deletePlaylist(id: number): boolean {
  // Unassign llamadores that reference this playlist
  getDb().prepare("UPDATE llamadores SET playlist_id = NULL WHERE playlist_id = ?").run(id);
  const result = getDb().prepare("DELETE FROM playlists WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getPlaylistVideos(playlistId: number): PlaylistVideoRow[] {
  return getDb()
    .prepare(
      `SELECT v.*, pi.orden
       FROM playlist_items pi
       JOIN videos v ON v.id = pi.video_id
       WHERE pi.playlist_id = ?
       ORDER BY pi.orden`
    )
    .all(playlistId) as PlaylistVideoRow[];
}

export function setPlaylistVideos(
  playlistId: number,
  items: { videoId: number; orden: number }[]
): void {
  const db = getDb();
  const transaction = db.transaction(() => {
    db.prepare("DELETE FROM playlist_items WHERE playlist_id = ?").run(playlistId);

    const insert = db.prepare(
      "INSERT INTO playlist_items (playlist_id, video_id, orden) VALUES (?, ?, ?)"
    );
    for (const item of items) {
      insert.run(playlistId, item.videoId, item.orden);
    }
  });
  transaction();
}

export function getPlaylistForLlamador(llamadorNombre: string): PlaylistVideoRow[] {
  const llamador = getLlamador(llamadorNombre);
  if (!llamador || !llamador.playlist_id) return [];
  return getPlaylistVideos(llamador.playlist_id);
}

export function getPlaylistSummaries(): {
  id: number;
  nombre: string;
  descripcion: string;
  created_at: string;
  videoCount: number;
  llamadores: string[];
}[] {
  const playlists = getDb()
    .prepare(
      `SELECT p.id, p.nombre, p.descripcion, p.created_at,
              COUNT(pi.id) as videoCount
       FROM playlists p
       LEFT JOIN playlist_items pi ON pi.playlist_id = p.id
       GROUP BY p.id
       ORDER BY p.nombre`
    )
    .all() as { id: number; nombre: string; descripcion: string; created_at: string; videoCount: number }[];

  const stmt = getDb().prepare(
    "SELECT nombre FROM llamadores WHERE playlist_id = ? ORDER BY nombre"
  );

  return playlists.map((p) => ({
    ...p,
    llamadores: (stmt.all(p.id) as { nombre: string }[]).map((l) => l.nombre),
  }));
}

// ── Llamador operations ──

export interface LlamadorRow {
  nombre: string;
  descripcion: string;
  last_seen_at: string | null;
  last_status: string | null;
  ip_address: string | null;
  observacion: string;
  ubicacion: string;
  ubicacion_principal: string;
  ubicacion_secundaria: string;
  resolucion_pantalla: string;
  layout: string;
  marca_modelo_tv: string;
  foto: string;
  playlist_id: number | null;
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

export function updateLlamador(
  nombre: string,
  data: {
    observacion?: string;
    ubicacion_principal?: string;
    ubicacion_secundaria?: string;
    resolucion_pantalla?: string;
    layout?: string;
    marca_modelo_tv?: string;
    foto?: string;
    playlist_id?: number | null;
  }
): LlamadorRow | undefined {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.observacion !== undefined) {
    fields.push("observacion = ?");
    values.push(data.observacion);
  }
  if (data.ubicacion_principal !== undefined) {
    fields.push("ubicacion_principal = ?");
    values.push(data.ubicacion_principal);
  }
  if (data.ubicacion_secundaria !== undefined) {
    fields.push("ubicacion_secundaria = ?");
    values.push(data.ubicacion_secundaria);
  }
  if (data.resolucion_pantalla !== undefined) {
    fields.push("resolucion_pantalla = ?");
    values.push(data.resolucion_pantalla);
  }
  if (data.layout !== undefined) {
    fields.push("layout = ?");
    values.push(data.layout);
  }
  if (data.marca_modelo_tv !== undefined) {
    fields.push("marca_modelo_tv = ?");
    values.push(data.marca_modelo_tv);
  }
  if (data.foto !== undefined) {
    fields.push("foto = ?");
    values.push(data.foto);
  }
  if (data.playlist_id !== undefined) {
    fields.push("playlist_id = ?");
    values.push(data.playlist_id);
  }

  if (fields.length === 0) return getLlamador(nombre);

  values.push(nombre);
  getDb()
    .prepare(`UPDATE llamadores SET ${fields.join(", ")} WHERE nombre = ?`)
    .run(...values);
  return getLlamador(nombre);
}

export function deleteLlamador(nombre: string): boolean {
  const result = getDb().prepare("DELETE FROM llamadores WHERE nombre = ?").run(nombre);
  return result.changes > 0;
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

export function getLlamadorSummaries(): (LlamadorRow & {
  playlistNombre: string | null;
  videoCount: number;
})[] {
  return getDb()
    .prepare(
      `SELECT l.*, p.nombre as playlistNombre,
              COALESCE((SELECT COUNT(*) FROM playlist_items pi WHERE pi.playlist_id = l.playlist_id), 0) as videoCount
       FROM llamadores l
       LEFT JOIN playlists p ON p.id = l.playlist_id
       ORDER BY l.nombre`
    )
    .all() as (LlamadorRow & { playlistNombre: string | null; videoCount: number })[];
}

// ── Video play tracking ──

export interface VideoPlayRow {
  id: number;
  llamador_nombre: string;
  video_filename: string;
  video_id: number | null;
  played_at: string;
  duration_seconds: number | null;
  ubicacion_principal: string;
  ubicacion_secundaria: string;
  video_tipo: string;
}

export function insertVideoPlay(data: {
  llamadorNombre: string;
  videoFilename: string;
  videoId?: number;
  durationSeconds?: number;
}): void {
  const llamador = getLlamador(data.llamadorNombre);
  getDb()
    .prepare(
      `INSERT INTO video_plays (llamador_nombre, video_filename, video_id, duration_seconds, ubicacion_principal, ubicacion_secundaria)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.llamadorNombre,
      data.videoFilename,
      data.videoId ?? null,
      data.durationSeconds ?? null,
      llamador?.ubicacion_principal ?? "",
      llamador?.ubicacion_secundaria ?? ""
    );
}

export function getVideoPlays(filters?: {
  llamadorNombre?: string;
  fromDate?: string;
  toDate?: string;
}): VideoPlayRow[] {
  let sql = `SELECT vp.*, COALESCE(v.tipo, '') as video_tipo
     FROM video_plays vp
     LEFT JOIN videos v ON v.filename = vp.video_filename
     WHERE 1=1`;
  const params: unknown[] = [];

  if (filters?.llamadorNombre) {
    sql += " AND vp.llamador_nombre = ?";
    params.push(filters.llamadorNombre);
  }
  if (filters?.fromDate) {
    sql += " AND vp.played_at >= ?";
    params.push(filters.fromDate);
  }
  if (filters?.toDate) {
    sql += " AND vp.played_at <= ?";
    params.push(filters.toDate);
  }

  sql += " ORDER BY vp.played_at DESC";
  return getDb().prepare(sql).all(...params) as VideoPlayRow[];
}

// ── User operations ──

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export function getAllUsers(): Omit<UserRow, "password_hash">[] {
  return getDb()
    .prepare("SELECT id, username, created_at FROM users ORDER BY username")
    .all() as Omit<UserRow, "password_hash">[];
}

export function getUserByUsername(username: string): UserRow | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as UserRow | undefined;
}

export function getUserById(id: number): UserRow | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(id) as UserRow | undefined;
}

export function createUser(
  username: string,
  passwordHash: string
): Omit<UserRow, "password_hash"> {
  const result = getDb()
    .prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
    .run(username, passwordHash);
  const user = getUserById(Number(result.lastInsertRowid))!;
  return { id: user.id, username: user.username, created_at: user.created_at };
}

export function updateUserPassword(id: number, passwordHash: string): boolean {
  const result = getDb()
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .run(passwordHash, id);
  return result.changes > 0;
}

export function deleteUser(id: number): boolean {
  const result = getDb()
    .prepare("DELETE FROM users WHERE id = ?")
    .run(id);
  return result.changes > 0;
}
