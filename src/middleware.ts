import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "auth-token";
const JWT_SECRET = process.env.JWT_SECRET || "video-repo-default-secret-change-me";
const secret = new TextEncoder().encode(JWT_SECRET);

// API paths that must remain unauthenticated (device-facing + auth)
const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/status",
  "/api/video-plays",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public pages (no auth required)
  if (pathname === "/login" || pathname === "/manual" || pathname === "/manualLlamador") {
    return NextResponse.next();
  }

  // Public API paths
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Device playlist sync: GET /api/playlists/[non-numeric-slug]
  if (pathname.startsWith("/api/playlists/")) {
    const slug = pathname.split("/api/playlists/")[1];
    if (slug && !/^\d+$/.test(decodeURIComponent(slug)) && request.method === "GET") {
      return NextResponse.next();
    }
  }

  // Device video download: GET /api/videos/[id]/download
  if (/^\/api\/videos\/\d+\/download$/.test(pathname) && request.method === "GET") {
    return NextResponse.next();
  }

  // Check JWT cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Token invalido" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico)$).*)",
  ],
};
