import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

// Standalone-Seiten die ohne Login erreichbar sein sollen
const PUBLIC_STANDALONE = ["/dienstbuchung-storno"];

export default async function StandaloneLayout({ children }: { children: ReactNode }) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "";
  const isPublic = PUBLIC_STANDALONE.some(p => pathname === p || pathname.startsWith(p + "/"));
  const cookieStore = await cookies();
  if (!isPublic && !cookieStore.has("sgs_user")) redirect("/");
  const start = 2025;
  const year = new Date().getFullYear();
  const years = year <= start ? `${start}` : `${start}–${year}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <main className="flex-1">
        {children}
      </main>

      <footer className="mt-auto px-6 py-3 text-xs text-slate-400 text-right">
        Copyright © {years} Nanuenana
      </footer>
    </div>
  );
}
