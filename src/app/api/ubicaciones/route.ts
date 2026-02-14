import { NextRequest, NextResponse } from "next/server";
import {
  getAllUbicaciones,
  createUbicacion,
  updateUbicacion,
  deleteUbicacion,
} from "@/shared/db/repository";

// GET /api/ubicaciones — List all ubicaciones
export async function GET() {
  try {
    const ubicaciones = getAllUbicaciones();
    return NextResponse.json(ubicaciones);
  } catch (error) {
    console.error("Error listing ubicaciones:", error);
    return NextResponse.json(
      { error: "Error al listar ubicaciones" },
      { status: 500 }
    );
  }
}

// POST /api/ubicaciones — Create a new ubicacion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nombre = body.nombre?.trim();
    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }
    const ubicacion = createUbicacion(nombre);
    return NextResponse.json(ubicacion, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return NextResponse.json(
        { error: "Ya existe una ubicacion con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error creating ubicacion:", error);
    return NextResponse.json(
      { error: "Error al crear ubicacion" },
      { status: 500 }
    );
  }
}

// PATCH /api/ubicaciones — Update an existing ubicacion
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nombre } = body;
    if (!id || !nombre?.trim()) {
      return NextResponse.json(
        { error: "ID y nombre son requeridos" },
        { status: 400 }
      );
    }
    const ubicacion = updateUbicacion(id, nombre);
    if (!ubicacion) {
      return NextResponse.json(
        { error: "Ubicacion no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(ubicacion);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return NextResponse.json(
        { error: "Ya existe una ubicacion con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error updating ubicacion:", error);
    return NextResponse.json(
      { error: "Error al actualizar ubicacion" },
      { status: 500 }
    );
  }
}

// DELETE /api/ubicaciones — Delete an ubicacion by id
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json(
        { error: "ID es requerido" },
        { status: 400 }
      );
    }
    const deleted = deleteUbicacion(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Ubicacion no encontrada" },
        { status: 404 }
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting ubicacion:", error);
    return NextResponse.json(
      { error: "Error al eliminar ubicacion" },
      { status: 500 }
    );
  }
}
