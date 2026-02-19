import { NextRequest, NextResponse } from "next/server";
import { getLlamador, updateLlamador, deleteLlamador } from "@/shared/db/repository";

// GET /api/llamadores/[nombre] — Get llamador details
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
    return NextResponse.json(llamador);
  } catch (error) {
    console.error("Error getting llamador:", error);
    return NextResponse.json(
      { error: "Error al obtener llamador" },
      { status: 500 }
    );
  }
}

// PATCH /api/llamadores/[nombre] — Update llamador details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ nombre: string }> }
) {
  try {
    const { nombre } = await params;
    const body = await request.json();

    const llamador = updateLlamador(decodeURIComponent(nombre), {
      observacion: body.observacion,
      ubicacion_principal: body.ubicacion_principal,
      ubicacion_secundaria: body.ubicacion_secundaria,
      resolucion_pantalla: body.resolucion_pantalla,
      layout: body.layout,
      marca_modelo_tv: body.marca_modelo_tv,
      foto: body.foto,
      playlist_id: body.playlist_id,
      config_json: body.config_json,
    });

    if (!llamador) {
      return NextResponse.json(
        { error: "Llamador no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(llamador);
  } catch (error) {
    console.error("Error updating llamador:", error);
    return NextResponse.json(
      { error: "Error al actualizar llamador" },
      { status: 500 }
    );
  }
}

// DELETE /api/llamadores/[nombre] — Delete llamador and its playlist
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ nombre: string }> }
) {
  try {
    const { nombre } = await params;
    const deleted = deleteLlamador(decodeURIComponent(nombre));

    if (!deleted) {
      return NextResponse.json(
        { error: "Llamador no encontrado" },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting llamador:", error);
    return NextResponse.json(
      { error: "Error al eliminar llamador" },
      { status: 500 }
    );
  }
}
