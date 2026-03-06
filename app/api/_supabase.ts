import { cookies } from "next/headers";

export const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const headers: Record<string,string> = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

export type SessionUser = { id: number; name: string; isAdmin: boolean };

export function toBool(v: unknown): boolean {
  if (v === true || v === 1) return true;
  if (v === false || v === 0 || v == null) return false;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "1" || s === "true" || s === "t" || s === "yes";
  }
  return false;
}

export async function requireAuth(): Promise<SessionUser | null> {
  try {
    const c = await cookies();
    const val = c.get("sgs_user")?.value;
    if (!val) return null;
    const j = JSON.parse(val);
    if (j && typeof j.id === "number") {
      return { id: j.id, name: String(j.name ?? ""), isAdmin: toBool(j.isAdmin) };
    }
  } catch {}
  return null;
}
