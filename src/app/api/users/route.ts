import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, createUser, getUserByUsername } from "@/shared/db/repository";
import { hashPassword } from "@/shared/auth";
import { createUserSchema } from "@/shared/schemas";

// GET /api/users — List all users (no password hashes)
export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { error: "Error al listar usuarios" },
      { status: 500 }
    );
  }
}

// POST /api/users — Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { username, password, role } = parsed.data;

    if (getUserByUsername(username)) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese nombre" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = createUser(username, passwordHash, role);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
