import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/shared/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  return NextResponse.json({
    id: Number(payload.sub),
    username: payload.username,
  });
}
