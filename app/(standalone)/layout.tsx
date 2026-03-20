import type { ReactNode } from "react";
import Image from "next/image";
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
    <div className="min-h-screen flex flex-col text-slate-900">
      <header className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/sg-logo.png" alt="SG Spaichingen" width={28} height={50} />
          <div>
            <p className="text-sm font-bold leading-tight">SG Spaichingen</p>
            <p className="text-xs opacity-75 leading-tight">Kassensystem</p>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>

      <footer className="mt-auto px-6 py-3 text-xs text-slate-400 text-right border-t border-blue-100">
        Copyright © {years} Nanuenana
      </footer>
    </div>
  );
}
