import { NextRequest, NextResponse } from "next/server";
import { upsertLlamador, updateLlamadorStatus } from "@/shared/db/repository";
import { llamadorStatusSchema } from "@/shared/schemas";

// POST /api/status — Llamador reports its current status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = llamadorStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { nombreLlamador, ipAddress, ...statusData } = parsed.data;

    // Ensure llamador is registered
    upsertLlamador({ nombre: nombreLlamador, ip_address: ipAddress });

    // Update status
    updateLlamadorStatus(
      nombreLlamador,
      JSON.stringify(statusData),
      ipAddress
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Error al actualizar estado" },
      { status: 500 }
    );
  }
}
