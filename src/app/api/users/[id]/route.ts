import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUserPassword, deleteUser } from "@/shared/db/repository";
import { hashPassword, verifyToken, COOKIE_NAME } from "@/shared/auth";
import { changePasswordSchema } from "@/shared/schemas";

// PATCH /api/users/[id] — Change user password
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    updateUserPassword(userId, passwordHash);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Error al cambiar clave" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] — Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    // Prevent deleting the admin user
    const targetUser = getUserById(userId);
    if (targetUser && targetUser.username.toLowerCase() === "admin") {
      return NextResponse.json(
        { error: "El usuario admin no se puede eliminar" },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload && Number(payload.sub) === userId) {
        return NextResponse.json(
          { error: "No se puede eliminar el usuario actual" },
          { status: 400 }
        );
      }
    }

    const deleted = deleteUser(userId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
