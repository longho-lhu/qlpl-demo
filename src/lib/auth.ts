import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { NextApiRequest } from "next";
import type { JwtPayload, PublicUser, UserRow } from "@/types/user";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret";
const JWT_EXPIRES_IN = "7d";
export { AUTH_COOKIE_NAME };

interface CookieOptions {
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  path?: string;
  maxAge?: number;
}

// minimal Set-Cookie serializer to avoid ESM interop issues with the `cookie` package
export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  parts.push(`Path=${options.path ?? "/"}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite[0].toUpperCase()}${options.sameSite.slice(1)}`);
  return parts.join("; ");
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
  } catch {
    return null;
  }
}

// reads the JWT from the auth cookie or an Authorization: Bearer header
export function getAuthFromRequest(req: NextApiRequest): JwtPayload | null {
  const cookieToken = req.cookies[AUTH_COOKIE_NAME];
  const header = req.headers.authorization;
  const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const token = cookieToken || bearerToken;
  if (!token) return null;
  return verifyToken(token);
}

export function toPublicUser(row: UserRow): PublicUser {
  const { password_hash: _password_hash, ...publicUser } = row;
  return publicUser;
}
