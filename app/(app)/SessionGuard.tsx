"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const alive = sessionStorage.getItem("sgs_alive");
    if (!alive) {
      // Browser wurde geschlossen und neu geöffnet – automatisch abmelden
      fetch("/api/logout", { method: "POST" }).finally(() => {
        router.replace("/");
      });
    }
  }, [router]);

  return null;
}
