import "./globals.css";
import type { ReactNode } from "react";


export const metadata = { title: "SGS" };

export default function RootLayout({ children }: { children: ReactNode }) {
  const start = 2025;
  const year = new Date().getFullYear();
  const years = year <= start ? `${start}` : `${start}–${year}`;

  return (
    <html lang="de">
      <body className="min-h-screen bg-slate-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}
