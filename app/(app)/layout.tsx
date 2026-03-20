import "../globals.css";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";
import SessionGuard from "./SessionGuard";

export const metadata = { title: "SGS" };

const navItem = "block px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors";
const navSection = "flex items-center gap-2 px-1 pt-3 pb-1";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.has("sgs_user")) redirect("/");
  const start = 2025;
  const year = new Date().getFullYear();
  const years = year <= start ? `${start}` : `${start}–${year}`;

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-7xl flex">
        <aside className="w-52 shrink-0 sticky top-0 h-screen overflow-y-auto bg-white border-r border-slate-200">
          {/* Sidebar-Header mit SGS-Branding */}
          <div className="px-3 py-3 border-b border-blue-700 bg-blue-600">
            <div className="flex items-center gap-2.5">
              <Image src="/sg-logo.png" alt="SG Spaichingen" width={32} height={58} className="shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">SG Spaichingen</p>
                <p className="text-[10px] text-blue-200 leading-tight">Kassensystem</p>
              </div>
            </div>
          </div>
          <nav className="space-y-0.5 p-3">
            <div className={navSection}>
              <span className="w-1 h-3.5 rounded-full bg-blue-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Kasse</span>
            </div>
            <Link className={navItem} href="/kasse">Kasse</Link>
            <Link className={navItem} href="/bahnbuchung">Buchungsübersicht</Link>

            <div className={navSection}>
              <span className="w-1 h-3.5 rounded-full bg-blue-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Stammdaten</span>
            </div>
            <Link className={navItem} href="/mitglieder">Kunden</Link>
            <Link className={navItem} href="/artikel">Artikel</Link>

            <div className={navSection}>
              <span className="w-1 h-3.5 rounded-full bg-blue-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Buchhaltung</span>
            </div>
            <Link className={navItem} href="/kassenbuch">Kassenbuch</Link>
            <Link className={navItem} href="/kassenbestand">Bestand prüfen</Link>

            <div className={navSection}>
              <span className="w-1 h-3.5 rounded-full bg-blue-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Administration</span>
            </div>
            <Link className={navItem} href="/admin/entnahme">Entnahme buchen</Link>
            <Link className={navItem} href="/mitgliederverwaltung">Mitgliederverwaltung</Link>
            <Link className={navItem} href="/benutzer">Benutzer</Link>
            <Link className={navItem} href="/bahnen">Bahnen</Link>
            <Link className={navItem} href="/zeitregeln">Zeitslots</Link>
            <Link className={navItem} href="/dienste">Dienste</Link>
            <Link className={navItem} href="/dienstbuchung">Dienstübersicht</Link>

            <div className="my-2 h-px bg-slate-200" />
            <Link className={navItem} href="/passwort">Kennwort ändern</Link>
            <LogoutButton />
          </nav>
        </aside>

        <main className="flex-1 p-6 pb-24 min-w-0">
          <SessionGuard />
          {children}
        </main>
      </div>

      <div
        className="fixed bottom-4 right-6 z-[2147483647] pointer-events-none text-xs text-slate-400 bg-white/85 backdrop-blur px-3 py-2 rounded-lg border border-blue-100 shadow"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        Copyright © {years} Nanuenana
      </div>
    </div>
  );
}
