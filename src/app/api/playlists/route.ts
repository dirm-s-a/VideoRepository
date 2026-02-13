import { NextResponse } from "next/server";
import { getPlaylistSummaries, getAllLlamadores } from "@/shared/db/repository";

// GET /api/playlists — List all llamadores with playlist summaries
export async function GET() {
  try {
    const summaries = getPlaylistSummaries();
    const llamadores = getAllLlamadores();

    // Merge summaries with full llamador data
    const result = summaries.map((s) => {
      const llamador = llamadores.find((l) => l.nombre === s.nombre);
      return {
        ...s,
        last_status: llamador?.last_status ?? null,
        ip_address: llamador?.ip_address ?? null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing playlists:", error);
    return NextResponse.json(
      { error: "Error al listar playlists" },
      { status: 500 }
    );
  }
}
