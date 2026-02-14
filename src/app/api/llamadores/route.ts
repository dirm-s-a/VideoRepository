import { NextResponse } from "next/server";
import { getLlamadorSummaries } from "@/shared/db/repository";

// GET /api/llamadores — List all llamadores with their assigned playlist info
export async function GET() {
  try {
    const llamadores = getLlamadorSummaries();
    return NextResponse.json(llamadores);
  } catch (error) {
    console.error("Error listing llamadores:", error);
    return NextResponse.json(
      { error: "Error al listar llamadores" },
      { status: 500 }
    );
  }
}
