import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Ursprüngliche einfache Variante: nutzt nur das Login-Cookie "sgs_user"
export async function GET() {
  try {
    const c = await cookies();
    const raw = c.get("sgs_user")?.value || "";
    let user: any = null;

    try {
      const j = JSON.parse(raw);
      if (j && typeof j === "object") {
        user = {
          id: j.id ?? 0,
          name: j.name ?? "",
          email: j.email ?? null,
          isAdmin:
            j.isAdmin === true ||
            j.isAdmin === 1 ||
            String(j.isAdmin).toLowerCase() === "true" ||
            String(j.isAdmin).toLowerCase() === "t",
        };
      }
    } catch {}

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
