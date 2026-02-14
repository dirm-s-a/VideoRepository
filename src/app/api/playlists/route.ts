import { NextRequest, NextResponse } from "next/server";
import { getPlaylistSummaries, createPlaylist } from "@/shared/db/repository";
import { playlistCreateSchema } from "@/shared/schemas";

// GET /api/playlists — List all playlists with video counts and assigned llamadores
export async function GET() {
  try {
    const summaries = getPlaylistSummaries();
    return NextResponse.json(summaries);
  } catch (error) {
    console.error("Error listing playlists:", error);
    return NextResponse.json(
      { error: "Error al listar playlists" },
      { status: 500 }
    );
  }
}

// POST /api/playlists — Create a new playlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = playlistCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const playlist = createPlaylist(parsed.data);
    return NextResponse.json(playlist, { status: 201 });
  } catch (error: unknown) {
    const sqlError = error as { code?: string };
    if (sqlError?.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return NextResponse.json(
        { error: "Ya existe una playlist con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { error: "Error al crear playlist" },
      { status: 500 }
    );
  }
}
