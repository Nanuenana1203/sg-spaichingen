import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAMES = ["kasse_session", "sgs_session", "iron-session", "session"];

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") || "/dashboard";

  const hasSession = SESSION_COOKIE_NAMES.some((n) => req.cookies.has(n));
  const target = req.nextUrl.clone();
  target.pathname = hasSession ? from : "/";

  return NextResponse.redirect(target);
}
