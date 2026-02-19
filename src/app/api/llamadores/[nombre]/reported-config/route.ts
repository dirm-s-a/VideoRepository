import { NextRequest, NextResponse } from "next/server";
import { getLlamador } from "@/shared/db/repository";

// GET /api/llamadores/[nombre]/reported-config
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ nombre: string }> }
) {
  try {
    const { nombre } = await params;
    const llamador = getLlamador(decodeURIComponent(nombre));

    if (!llamador) {
      return NextResponse.json(
        { error: "Llamador no encontrado" },
        { status: 404 }
      );
    }

    if (!llamador.reported_config) {
      return NextResponse.json(
        { error: "Este llamador no ha reportado su configuración aún. Asegúrese de que está conectado y actualizado." },
        { status: 404 }
      );
    }

    try {
      const config = JSON.parse(llamador.reported_config);
      return NextResponse.json({
        nombre: llamador.nombre,
        reportedAt: llamador.reported_config_at,
        config,
      });
    } catch {
      return NextResponse.json(
        { error: "La configuración reportada tiene formato inválido" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error getting reported config:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración reportada" },
      { status: 500 }
    );
  }
}
