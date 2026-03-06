import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/kasse",
  "/mitglieder",
  "/artikel",
  "/bahnen",
  "/benutzer",
  "/kassenbuch",
  "/kassenbestand",
  "/zeitregeln",
  "/admin",
  "/bahnbuchung",
  "/dienste",
  "/dienstbuchung",
  "/dienstbuchung-storno",
  "/mitgliederverwaltung",
  "/passwort",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const hasSession = req.cookies.has("sgs_user");
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/kasse/:path*",
    "/mitglieder/:path*",
    "/artikel/:path*",
    "/bahnen/:path*",
    "/benutzer/:path*",
    "/kassenbuch/:path*",
    "/kassenbestand/:path*",
    "/zeitregeln/:path*",
    "/admin/:path*",
    "/bahnbuchung/:path*",
    "/dienste/:path*",
    "/dienstbuchung/:path*",
    "/dienstbuchung-storno/:path*",
    "/mitgliederverwaltung/:path*",
    "/passwort/:path*",
  ],
};
