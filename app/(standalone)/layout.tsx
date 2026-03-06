import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function StandaloneLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.has("sgs_user")) redirect("/");
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
