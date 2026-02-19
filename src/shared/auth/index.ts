import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "video-repo-default-secret-change-me";
const secret = new TextEncoder().encode(JWT_SECRET);

export const COOKIE_NAME = "auth-token";
const TOKEN_EXPIRY = "24h";

export interface TokenPayload {
  sub: string;
  username: string;
  role: string;
}

export async function createToken(
  userId: number,
  username: string,
  role: string
): Promise<string> {
  return new SignJWT({ username, role } as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      username: payload.username as string,
      role: (payload.role as string) || "user",
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
