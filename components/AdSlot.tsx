import { getActiveAds, pickAdsForSlots } from "@/lib/ads";
import type { Ad } from "@/lib/ads";
import AdDisplay from "./AdDisplay";

const SLOTS = ["ad-hero", "ad-mid", "ad-prefooter"];

let cachedPicks: Record<string, Ad | null> | null = null;
let cacheAt = 0;

async function getPicks() {
  if (!cachedPicks || Date.now() - cacheAt > 60_000) {
    const ads = await getActiveAds().catch(() => []);
    cachedPicks = pickAdsForSlots(ads, SLOTS);
    cacheAt = Date.now();
  }
  return cachedPicks;
}

interface AdSlotProps {
  id: string;
  className?: string;
}

export default async function AdSlot({ id, className }: AdSlotProps) {
  const picks = await getPicks();
  const ad = picks[id] ?? null;

  if (!ad) {
    return (
      <div className={`w-full ${className ?? ""}`.trim()}>
        <div
          id={id}
          className="w-full min-h-[90px] rounded-xl border border-dashed border-gray-200 bg-gray-50/40 flex items-center justify-center"
        >
          <span className="text-xs text-gray-300 font-medium tracking-widest uppercase select-none">
            Advertisement
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className ?? ""}`.trim()}>
      <AdDisplay ad={ad} slot={id} />
    </div>
  );
}
