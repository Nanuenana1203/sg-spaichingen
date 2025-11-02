"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

export default function BackLink({
  className = "",
  children,
}: { className?: string; children?: ReactNode }) {
  const sp = useSearchParams();
  const fromAuth = sp.get("from") === "auth";

  // Session-Keks vorhanden?
  const hasSession =
    typeof document !== "undefined" &&
    document.cookie.split("; ").some(c => c.startsWith("sgs_session="));

  // Failsafe: ohne Session ODER mit from=auth => immer zur Anmeldemaske
  const href = (!hasSession || fromAuth) ? "/" : "/dashboard";

  return (
    <Link href={href} className={className}>
      {children ?? "Zurück"}
    </Link>
  );
}
