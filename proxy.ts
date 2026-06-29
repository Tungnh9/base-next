import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Paths không cần auth
const PUBLIC_PATHS = ["/login", "/register", "/api/health"];
// Paths bỏ qua hoàn toàn (static assets)
const SKIP_PREFIXES = ["/_next", "/favicon.ico"];

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua static assets và internals
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Public paths — không cần token
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "session";
  const token = request.cookies.get(sessionCookieName)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const secret = getSecret();
  if (!secret) {
    console.error("JWT_SECRET is not set");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
