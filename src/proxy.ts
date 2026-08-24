import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { hasValidAuthCookie } from "@/lib/auth-edge";

const GUEST_ONLY_PATHS = ["/auth/login", "/auth/register"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoggedIn = await hasValidAuthCookie(req.cookies.get(AUTH_COOKIE_NAME)?.value);
  const isGuestOnlyPage = GUEST_ONLY_PATHS.some((path) => pathname.startsWith(path));

  if (isLoggedIn && isGuestOnlyPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!isLoggedIn && !isGuestOnlyPage) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
