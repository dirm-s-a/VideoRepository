import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  closeDb,
  getDb,
  getDbPath,
  getDataDir,
  getVideosDir,
  checkIntegrity,
  getBackupConfig,
  saveBackupConfig,
  listBackups,
  createScheduledBackup,
  type BackupConfig,
} from "@/shared/db/repository";

const SQLITE_MAGIC = "SQLite format 3\0";

// GET /api/backup — Download SQLite database backup
// GET /api/backup?action=integrity — Check DB vs disk consistency
// GET /api/backup?action=schedule — Get backup schedule config + backup list
export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");

  if (action === "integrity") {
    return handleIntegrity(request);
  }

  if (action === "schedule") {
    return handleGetSchedule();
  }

  // Default: download backup (safe atomic copy via VACUUM INTO)
  try {
    const dataDir = getDataDir();
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const filename = `video-repository-backup-${timestamp}.db`;
    const tempPath = path.join(dataDir, filename);

    // VACUUM INTO creates an atomic, consistent backup even while DB is in use
    const db = getDb();
    db.exec(`VACUUM INTO '${tempPath.replace(/'/g, "''")}'`);

    const dbBuffer = fs.readFileSync(tempPath);

    // Clean up temp file after reading into memory
    fs.unlinkSync(tempPath);

    return new NextResponse(dbBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(dbBuffer.length),
      },
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { error: "Error al crear backup" },
      { status: 500 }
    );
  }
}

// POST /api/backup?action=restore — Restore database from uploaded .db file
// POST /api/backup?action=reset — Reset database to zero (delete everything)
// POST /api/backup?action=integrity — Fix DB vs disk inconsistencies
// POST /api/backup?action=schedule — Update backup schedule config
// POST /api/backup?action=run — Trigger manual scheduled backup (to backups dir)
export async function POST(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");

  if (action === "restore") {
    return handleRestore(request);
  }
  if (action === "reset") {
    return handleReset();
  }
  if (action === "integrity") {
    return handleIntegrityFix();
  }
  if (action === "schedule") {
    return handleUpdateSchedule(request);
  }
  if (action === "run") {
    return handleRunBackup();
  }

  return NextResponse.json({ error: "Accion invalida" }, { status: 400 });
}

// Check integrity (read-only)
function handleIntegrity(_request: NextRequest) {
  try {
    const report = checkIntegrity(false);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error checking integrity:", error);
    return NextResponse.json(
      { error: "Error al verificar integridad" },
      { status: 500 }
    );
  }
}

// Fix integrity issues (auto-clean)
function handleIntegrityFix() {
  try {
    const report = checkIntegrity(true);
    return NextResponse.json({
      ok: true,
      ...report,
    });
  } catch (error) {
    console.error("Error fixing integrity:", error);
    return NextResponse.json(
      { error: "Error al corregir integridad" },
      { status: 500 }
    );
  }
}

// Get schedule config + existing backups
function handleGetSchedule() {
  try {
    const config = getBackupConfig();
    const backups = listBackups();
    return NextResponse.json({ config, backups });
  } catch (error) {
    console.error("Error getting backup schedule:", error);
    return NextResponse.json(
      { error: "Error al obtener configuracion de backup" },
      { status: 500 }
    );
  }
}

// Update schedule config
async function handleUpdateSchedule(request: NextRequest) {
  try {
    const body = await request.json();
    const config: BackupConfig = {
      enabled: Boolean(body.enabled),
      hour: Math.max(0, Math.min(23, Number(body.hour) || 3)),
      keepDays: Math.max(1, Math.min(90, Number(body.keepDays) || 7)),
    };
    saveBackupConfig(config);
    const backups = listBackups();
    return NextResponse.json({ ok: true, config, backups });
  } catch (error) {
    console.error("Error updating backup schedule:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuracion de backup" },
      { status: 500 }
    );
  }
}

// Trigger a manual backup to the backups directory
function handleRunBackup() {
  try {
    const filename = createScheduledBackup();
    if (filename) {
      const backups = listBackups();
      return NextResponse.json({ ok: true, filename, backups });
    }
    return NextResponse.json(
      { error: "Error al crear backup" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error running manual backup:", error);
    return NextResponse.json(
      { error: "Error al crear backup" },
      { status: 500 }
    );
  }
}

async function handleRestore(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibio archivo" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate SQLite magic bytes
    const header = buffer.slice(0, 16).toString("ascii");
    if (header !== SQLITE_MAGIC) {
      return NextResponse.json(
        { error: "El archivo no es una base de datos SQLite valida" },
        { status: 400 }
      );
    }

    const dbPath = getDbPath();

    // Close current connection
    closeDb();

    // Backup current before replacing (safety net)
    const backupPath = dbPath + ".pre-restore";
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
    }

    // Remove WAL/SHM files if present
    for (const ext of ["-wal", "-shm"]) {
      const f = dbPath + ext;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }

    // Write new database
    fs.writeFileSync(dbPath, buffer);

    // Run integrity check with auto-clean after restore
    const integrity = checkIntegrity(true);

    return NextResponse.json({
      ok: true,
      message: "Base de datos restaurada correctamente",
      integrity,
    });
  } catch (error) {
    console.error("Error restoring backup:", error);
    return NextResponse.json(
      { error: "Error al restaurar backup" },
      { status: 500 }
    );
  }
}

async function handleReset() {
  try {
    const dbPath = getDbPath();
    const videosDir = getVideosDir();

    // Close current connection
    closeDb();

    // Delete database files
    for (const ext of ["", "-wal", "-shm"]) {
      const f = dbPath + ext;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }

    // Delete all video files
    if (fs.existsSync(videosDir)) {
      const files = fs.readdirSync(videosDir);
      for (const file of files) {
        fs.unlinkSync(path.join(videosDir, file));
      }
    }

    // Ensure directories exist for re-init
    const dataDir = getDataDir();
    fs.mkdirSync(dataDir, { recursive: true });
    fs.mkdirSync(videosDir, { recursive: true });

    return NextResponse.json({
      ok: true,
      message:
        "Base de datos reiniciada. Se creo el usuario admin/admin por defecto.",
    });
  } catch (error) {
    console.error("Error resetting database:", error);
    return NextResponse.json(
      { error: "Error al reiniciar base de datos" },
      { status: 500 }
    );
  }
}
