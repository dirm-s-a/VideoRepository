import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  closeDb,
  getDbPath,
  getDataDir,
  getVideosDir,
  checkIntegrity,
} from "@/shared/db/repository";

const SQLITE_MAGIC = "SQLite format 3\0";

// GET /api/backup — Download SQLite database backup
// GET /api/backup?action=integrity — Check DB vs disk consistency
export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");

  if (action === "integrity") {
    return handleIntegrity(request);
  }

  // Default: download backup
  try {
    const dbPath = getDbPath();
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json(
        { error: "Base de datos no encontrada" },
        { status: 404 }
      );
    }

    const dbBuffer = fs.readFileSync(dbPath);
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const filename = `video-repository-backup-${timestamp}.db`;

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
