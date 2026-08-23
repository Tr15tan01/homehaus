import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

// Runs on Node.js runtime (Next.js 16 renamed middleware -> proxy and moved
// it off the Edge runtime). This only checks for the presence of a session
// cookie, so it can redirect obviously-logged-out visitors quickly.
// It is NOT the source of truth for authorization: every protected page and
// server action independently calls requireUser()/requireAdmin(), which
// validates the session against the database and checks role. That's what
// actually protects the data — this proxy is a UX shortcut only.
const PROTECTED_PREFIXES = ["/account", "/admin", "/checkout"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/checkout/:path*"],
};
