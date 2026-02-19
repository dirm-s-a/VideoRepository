import { NextRequest, NextResponse } from "next/server";
import { getLlamadorConfig, updateLlamadorConfig, getLlamador } from "@/shared/db/repository";

// GET /api/config/[nombre] — Get caller's central config
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ nombre: string }> }
) {
  try {
    const { nombre } = await params;
    const decodedName = decodeURIComponent(nombre);

    const result = getLlamadorConfig(decodedName);
    if (!result) {
      // Check if the llamador exists at all
      const llamador = getLlamador(decodedName);
      if (!llamador) {
        return NextResponse.json(
          { error: "Llamador no encontrado" },
          { status: 404 }
        );
      }
      // Llamador exists but has no config — return 404
      return NextResponse.json(
        { error: "Sin configuración central para este llamador" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting llamador config:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

// PUT /api/config/[nombre] — Update caller's central config
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ nombre: string }> }
) {
  try {
    const { nombre } = await params;
    const decodedName = decodeURIComponent(nombre);

    const llamador = getLlamador(decodedName);
    if (!llamador) {
      return NextResponse.json(
        { error: "Llamador no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const configJson = JSON.stringify(body.config ?? body);

    const result = updateLlamadorConfig(decodedName, configJson);
    if (!result) {
      return NextResponse.json(
        { error: "JSON inválido" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating llamador config:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}

// DELETE /api/config/[nombre] — Clear caller's central config
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ nombre: string }> }
) {
  try {
    const { nombre } = await params;
    const decodedName = decodeURIComponent(nombre);

    const llamador = getLlamador(decodedName);
    if (!llamador) {
      return NextResponse.json(
        { error: "Llamador no encontrado" },
        { status: 404 }
      );
    }

    updateLlamadorConfig(decodedName, "");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error clearing llamador config:", error);
    return NextResponse.json(
      { error: "Error al limpiar configuración" },
      { status: 500 }
    );
  }
}
