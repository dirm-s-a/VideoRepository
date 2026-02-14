import { NextRequest, NextResponse } from "next/server";
import { insertVideoPlay, getVideoPlays } from "@/shared/db/repository";
import { videoPlayReportSchema } from "@/shared/schemas";

// POST /api/video-plays — Record a video play event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = videoPlayReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    insertVideoPlay({
      llamadorNombre: parsed.data.nombreLlamador,
      videoFilename: parsed.data.videoFilename,
      videoId: parsed.data.videoId,
      durationSeconds: parsed.data.durationSeconds,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error recording video play:", error);
    return NextResponse.json(
      { error: "Error al registrar reproduccion" },
      { status: 500 }
    );
  }
}

// GET /api/video-plays — Get video play records with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const llamador = searchParams.get("llamador") || undefined;
    const fromDate = searchParams.get("fromDate") || undefined;
    const toDate = searchParams.get("toDate") || undefined;

    const plays = getVideoPlays({ llamadorNombre: llamador, fromDate, toDate });
    return NextResponse.json(plays);
  } catch (error) {
    console.error("Error getting video plays:", error);
    return NextResponse.json(
      { error: "Error al obtener reproducciones" },
      { status: 500 }
    );
  }
}
