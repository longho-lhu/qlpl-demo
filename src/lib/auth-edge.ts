import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-only-insecure-secret");

// edge-safe check used by the proxy - jsonwebtoken/bcryptjs are not edge-runtime compatible
export async function hasValidAuthCookie(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
