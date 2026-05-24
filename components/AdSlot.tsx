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

const picksCache: Record<string, { picks: Record<string, Ad | null>; at: number }> = {};

async function getPicksForGroup(group: string): Promise<Record<string, Ad | null>> {
  const cached = picksCache[group];
  if (cached && Date.now() - cached.at < 60_000) return cached.picks;
  const ads = await getActiveAds().catch(() => []);
  const picks = pickAdsForSlots(ads, SLOT_GROUPS[group] ?? []);
  picksCache[group] = { picks, at: Date.now() };
  return picks;
}

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
