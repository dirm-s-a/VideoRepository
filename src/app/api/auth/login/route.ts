import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername } from "@/shared/db/repository";
import { comparePassword, createToken, COOKIE_NAME } from "@/shared/auth";
import { loginSchema } from "@/shared/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;
    const user = getUserByUsername(username);

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return NextResponse.json(
        { error: "Usuario o clave incorrectos" },
        { status: 401 }
      );
    }

    const token = await createToken(user.id, user.username, user.role || "user");

    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, username: user.username, role: user.role || "user" },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Error login:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesion" },
      { status: 500 }
    );
  }
}
