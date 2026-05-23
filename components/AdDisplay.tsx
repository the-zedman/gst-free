"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Ad } from "@/lib/ads";

interface Props {
  ad: Ad;
  slot: string;
}

export default function AdDisplay({ ad, slot }: Props) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch("/api/ads/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: ad.id, eventType: "impression", slot, ua: navigator.userAgent }),
      keepalive: true,
    }).catch(() => {});
  }, [ad.id, slot]);

  function handleClick() {
    fetch("/api/ads/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: ad.id, eventType: "click", slot, ua: navigator.userAgent }),
      keepalive: true,
    }).catch(() => {});
  }

  // Build the UTM-tagged click URL
  const clickUrl = (() => {
    try {
      const u = new URL(ad.click_url);
      if (!u.searchParams.has("utm_source")) {
        u.searchParams.set("utm_source", "gstfree");
        u.searchParams.set("utm_medium", "display");
        u.searchParams.set("utm_campaign", ad.name.toLowerCase().replace(/\s+/g, "-"));
      }
      return u.toString();
    } catch {
      return ad.click_url;
    }
  })();

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
      <a
        href={clickUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="block"
        aria-label={ad.alt_text ?? ad.title ?? "Advertisement"}
      >
        <div className="relative w-full aspect-[3/1] bg-gray-100 min-h-[90px]">
          <Image
            src={ad.image_url}
            alt={ad.alt_text ?? ad.title ?? "Advertisement"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            unoptimized={ad.image_url.includes("blob.vercel-storage.com")}
          />

          {/* Overlay with ad copy, shown on all if title exists */}
          {(ad.title || ad.subtitle) && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent flex flex-col justify-center px-6">
              {ad.title && (
                <p className="text-white font-bold text-lg sm:text-2xl leading-tight drop-shadow">
                  {ad.title}
                </p>
              )}
              {ad.subtitle && (
                <p className="text-white/90 text-sm sm:text-base mt-1 drop-shadow">
                  {ad.subtitle}
                </p>
              )}
              {ad.cta_text && (
                <span className="mt-3 self-start bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
                  {ad.cta_text}
                </span>
              )}
            </div>
          )}
        </div>
      </a>

      {/* Sponsored label */}
      <span className="absolute top-1.5 right-2 text-[10px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded pointer-events-none">
        {ad.sponsored_label}
      </span>
    </div>
  );
}
