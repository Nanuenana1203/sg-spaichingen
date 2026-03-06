import "../globals.css";
export const dynamic = "force-dynamic";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
