import { NextRequest, NextResponse } from "next/server";
import { getVideoById, deleteVideo, updateVideo } from "@/shared/db/repository";
import { deleteVideoFile } from "@/shared/storage/video-storage";

// GET /api/videos/[id] — Get video metadata
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const videoId = parseInt(id, 10);
    if (isNaN(videoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const video = getVideoById(videoId);
    if (!video) {
      return NextResponse.json(
        { error: "Video no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error getting video:", error);
    return NextResponse.json(
      { error: "Error al obtener video" },
      { status: 500 }
    );
  }
}

// PATCH /api/videos/[id] — Update video metadata (description, tipo)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const videoId = parseInt(id, 10);
    if (isNaN(videoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();

    const video = updateVideo(videoId, {
      description: typeof body.description === "string" ? body.description : undefined,
      tipo: typeof body.tipo === "string" ? body.tipo : undefined,
    });
    if (!video) {
      return NextResponse.json(
        { error: "Video no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Error al actualizar video" },
      { status: 500 }
    );
  }
}

// DELETE /api/videos/[id] — Delete video (file + DB)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const videoId = parseInt(id, 10);
    if (isNaN(videoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const video = getVideoById(videoId);
    if (!video) {
      return NextResponse.json(
        { error: "Video no encontrado" },
        { status: 404 }
      );
    }

    // Delete file from disk
    deleteVideoFile(video.filename);

    // Delete from database (cascades to playlist_items)
    deleteVideo(videoId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Error al eliminar video" },
      { status: 500 }
    );
  }
}
