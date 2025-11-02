import { NextResponse, NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/benutzer"];
const SESSION_COOKIE_NAMES = ["kasse_session", "sgs_session", "iron-session", "session"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Nur schützen, wenn Route betroffen ist
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  // Cookie vorhanden?
  const hasSession = SESSION_COOKIE_NAMES.some((name) => req.cookies.has(name));
  if (hasSession) return NextResponse.next();

  // Kein Cookie → Loginseite
  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/benutzer/:path*"],
};
