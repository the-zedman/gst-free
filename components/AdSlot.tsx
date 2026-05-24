import { cache } from "react";
import { getActiveAds, pickAdsForSlots } from "@/lib/ads";
import type { Ad } from "@/lib/ads";
import AdDisplay from "./AdDisplay";

// Each group draws from the full "any" pool independently so slots on one
// page don't exhaust the supply for another page.
const SLOT_GROUPS: Record<string, string[]> = {
  home:    ["ad-hero", "ad-mid", "ad-prefooter"],
  recipes: ["recipe-top", "recipe-bottom"],
};

function groupFor(slotId: string): string {
  for (const [group, slots] of Object.entries(SLOT_GROUPS)) {
    if (slots.includes(slotId)) return group;
  }
  return "home";
}

// Module-level cache for active ads (avoids repeated DB hits across requests)
let cachedAds: Awaited<ReturnType<typeof getActiveAds>> | null = null;
let cacheAt = 0;
async function getAds() {
  if (!cachedAds || Date.now() - cacheAt > 60_000) {
    cachedAds = await getActiveAds().catch(() => []);
    cacheAt = Date.now();
  }
  return cachedAds;
}

// React cache() ensures all AdSlot components on the same page share one
// pick result per group — prevents concurrent renders each computing their
// own independent random picks and overwriting each other.
const getPicksForGroup = cache(async (group: string): Promise<Record<string, Ad | null>> => {
  const ads = await getAds();
  return pickAdsForSlots(ads, SLOT_GROUPS[group] ?? []);
});

interface AdSlotProps {
  id: string;
  className?: string;
}

export default async function AdSlot({ id, className }: AdSlotProps) {
  const picks = await getPicksForGroup(groupFor(id));
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
