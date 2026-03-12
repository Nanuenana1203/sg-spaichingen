import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Öffentlich zugängliche Pfade (kein Login nötig)
const PUBLIC_PATHS = [
  "/",
  "/auth",
  "/bahnbuchung-public",
  "/bahnbuchung-storno",
  "/dienstbuchung-public",
  "/dienstbuchung-storno",
  "/api/login",
  "/api/logout",
  "/api/session",
  "/api/available-days",
  "/api/slots",
  "/api/buchen",
  "/api/buchungen",
  "/api/dienste-public",
  "/api/dienst-buchen-public",
  "/api/dienst-storno-public",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Statische Dateien und Next.js-interne Pfade immer durchlassen
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Öffentliche Pfade durchlassen
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));

  // Alle anderen Pfade: Session prüfen
  const hasSession = req.cookies.has("sgs_user");
  if (!isPublic && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Pathname als Header weiterleiten (wird vom (standalone)-Layout gelesen)
  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
