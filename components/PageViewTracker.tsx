"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>("");
  const { user } = useUser();

  useEffect(() => {
    if (user?.publicMetadata?.role === "admin") return;

    const full =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    if (full === lastTracked.current) return;
    lastTracked.current = full;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: full,
        referrer: document.referrer || null,
        ua: navigator.userAgent,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
