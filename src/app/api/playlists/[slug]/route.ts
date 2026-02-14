import { NextRequest, NextResponse } from "next/server";
import {
  getPlaylistById,
  getPlaylistVideos,
  setPlaylistVideos,
  getPlaylistForLlamador,
  upsertLlamador,
  getLlamador,
  updatePlaylist,
  deletePlaylist,
} from "@/shared/db/repository";
import { playlistUpdateSchema } from "@/shared/schemas";

function isNumericId(slug: string): boolean {
  return /^\d+$/.test(slug);
}

function mapVideos(videos: { id: number; filename: string; original_name: string; description: string; sha256: string; size_bytes: number; orden: number }[]) {
  return videos.map((v) => ({
    videoId: v.id,
    filename: v.filename,
    originalName: v.original_name,
    description: v.description,
    sha256: v.sha256,
    sizeBytes: v.size_bytes,
    order: v.orden,
  }));
}

// GET /api/playlists/[slug]
// If slug is numeric: return playlist by ID (for admin UI)
// If slug is a string: backward-compatible sync endpoint for LlamadorNew
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decoded = decodeURIComponent(slug);

    if (isNumericId(decoded)) {
      const id = Number(decoded);
      const playlist = getPlaylistById(id);
      if (!playlist) {
        return NextResponse.json({ error: "Playlist no encontrada" }, { status: 404 });
      }
      const videos = getPlaylistVideos(id);
      return NextResponse.json({
        id: playlist.id,
        nombre: playlist.nombre,
        descripcion: playlist.descripcion,
        updatedAt: new Date().toISOString(),
        videos: mapVideos(videos),
      });
    } else {
      // Backward-compatible llamador sync path
      upsertLlamador({ nombre: decoded });
      const videos = getPlaylistForLlamador(decoded);
      const llamadorData = getLlamador(decoded);
      return NextResponse.json({
        nombreLlamador: decoded,
        updatedAt: new Date().toISOString(),
        videos: mapVideos(videos),
        descripcion: llamadorData?.descripcion ?? "",
      });
    }
  } catch (error) {
    console.error("Error getting playlist:", error);
    return NextResponse.json({ error: "Error al obtener playlist" }, { status: 500 });
  }
}

// PUT /api/playlists/[slug] — Update playlist videos (numeric ID only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decoded = decodeURIComponent(slug);

    if (!isNumericId(decoded)) {
      return NextResponse.json(
        { error: "PUT solo soportado por ID numerico de playlist" },
        { status: 400 }
      );
    }

    const id = Number(decoded);
    const playlist = getPlaylistById(id);
    if (!playlist) {
      return NextResponse.json({ error: "Playlist no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = playlistUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    setPlaylistVideos(id, parsed.data.videos);
    const videos = getPlaylistVideos(id);

    return NextResponse.json({
      id: playlist.id,
      nombre: playlist.nombre,
      updatedAt: new Date().toISOString(),
      videos: mapVideos(videos),
    });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return NextResponse.json({ error: "Error al actualizar playlist" }, { status: 500 });
  }
}

// PATCH /api/playlists/[slug] — Update playlist metadata (nombre, descripcion)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const id = Number(decodeURIComponent(slug));
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const body = await request.json();
    const updated = updatePlaylist(id, {
      nombre: body.nombre,
      descripcion: body.descripcion,
    });

    if (!updated) {
      return NextResponse.json({ error: "Playlist no encontrada" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating playlist:", error);
    return NextResponse.json({ error: "Error al actualizar playlist" }, { status: 500 });
  }
}

// DELETE /api/playlists/[slug] — Delete playlist
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const id = Number(decodeURIComponent(slug));
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const deleted = deletePlaylist(id);
    if (!deleted) {
      return NextResponse.json({ error: "Playlist no encontrada" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json({ error: "Error al eliminar playlist" }, { status: 500 });
  }
}
