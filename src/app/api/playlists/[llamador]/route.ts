import { NextRequest, NextResponse } from "next/server";
import {
  getPlaylist,
  setPlaylist,
  upsertLlamador,
  getLlamador,
} from "@/shared/db/repository";
import { playlistUpdateSchema } from "@/shared/schemas";

// GET /api/playlists/[llamador] — Get playlist for a specific llamador
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ llamador: string }> }
) {
  try {
    const { llamador } = await params;
    const nombreLlamador = decodeURIComponent(llamador);

    // Ensure llamador is registered
    upsertLlamador({ nombre: nombreLlamador });

    const videos = getPlaylist(nombreLlamador);
    const llamadorData = getLlamador(nombreLlamador);

    return NextResponse.json({
      nombreLlamador,
      updatedAt: new Date().toISOString(),
      videos: videos.map((v) => ({
        videoId: v.id,
        filename: v.filename,
        sha256: v.sha256,
        sizeBytes: v.size_bytes,
        order: v.orden,
      })),
      descripcion: llamadorData?.descripcion ?? "",
    });
  } catch (error) {
    console.error("Error getting playlist:", error);
    return NextResponse.json(
      { error: "Error al obtener playlist" },
      { status: 500 }
    );
  }
}

// PUT /api/playlists/[llamador] — Update playlist for a llamador
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ llamador: string }> }
) {
  try {
    const { llamador } = await params;
    const nombreLlamador = decodeURIComponent(llamador);

    const body = await request.json();
    const parsed = playlistUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Ensure llamador exists
    upsertLlamador({ nombre: nombreLlamador });

    // Update playlist
    setPlaylist(nombreLlamador, parsed.data.videos);

    // Return updated playlist
    const videos = getPlaylist(nombreLlamador);

    return NextResponse.json({
      nombreLlamador,
      updatedAt: new Date().toISOString(),
      videos: videos.map((v) => ({
        videoId: v.id,
        filename: v.filename,
        sha256: v.sha256,
        sizeBytes: v.size_bytes,
        order: v.orden,
      })),
    });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return NextResponse.json(
      { error: "Error al actualizar playlist" },
      { status: 500 }
    );
  }
}
