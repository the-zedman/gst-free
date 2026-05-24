import Link from "next/link";
import Image from "next/image";
import { getAllAds } from "@/lib/ads";
import AdToggle from "./AdToggle";
import AdDeleteButton from "./AdDeleteButton";

function ctr(impressions: number, clicks: number) {
  if (impressions === 0) return "—";
  return ((clicks / impressions) * 100).toFixed(1) + "%";
}

function isLive(ad: { active: boolean; starts_at: string | null; ends_at: string | null }) {
  if (!ad.active) return false;
  const now = new Date();
  if (ad.starts_at && new Date(ad.starts_at) > now) return false;
  if (ad.ends_at && new Date(ad.ends_at) < now) return false;
  return true;
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney", day: "numeric", month: "short", year: "2-digit" });
}

export default async function AdvertisingPage() {
  const ads = await getAllAds();

  const active = ads.filter((a) => a.active).length;
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Advertising</h1>
        <Link
          href="/admin/advertising/new"
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          + New Ad
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total ads", value: ads.length },
          { label: "Active", value: active },
          { label: "Total impressions", value: totalImpressions.toLocaleString() },
          { label: "Overall CTR", value: ctr(totalImpressions, totalClicks) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Ad list */}
      {ads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">📢</p>
          <p className="text-gray-500 font-medium">No ads yet</p>
          <Link href="/admin/advertising/new" className="mt-4 inline-block text-sm text-green-700 hover:underline font-medium">
            Create your first ad →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {ads.map((ad) => (
              <div key={ad.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                {/* Thumbnail */}
                <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={ad.image_url}
                    alt={ad.alt_text ?? ad.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized={ad.image_url.includes("blob.vercel-storage.com")}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <Link href={`/admin/advertising/${ad.id}`} className="text-sm font-semibold text-gray-900 hover:text-green-700 truncate transition-colors">
                      {ad.name}
                    </Link>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${ad.type === "ai" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {ad.type === "ai" ? "AI" : "Upload"}
                    </span>
                    {isLive(ad) && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-green-500 text-white tracking-wide">
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{ad.click_url}</p>
                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 flex-wrap">
                    <span><span className="text-gray-500 font-medium">Slot:</span> {ad.slot_target === "any" ? "Any" : ad.slot_target}</span>
                    <span><span className="text-gray-500 font-medium">Weight:</span> {ad.weight}×</span>
                    <span><span className="text-gray-500 font-medium">Created:</span> {fmtDate(ad.created_at)}</span>
                    {ad.starts_at && <span><span className="text-gray-500 font-medium">Starts:</span> {fmtDate(ad.starts_at)}</span>}
                    {ad.ends_at && <span><span className="text-gray-500 font-medium">Ends:</span> {fmtDate(ad.ends_at)}</span>}
                  </div>
                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span title="Impressions">👁 {ad.impressions.toLocaleString()}</span>
                    <span title="Unique impressions">👤 {ad.unique_impressions.toLocaleString()}</span>
                    <span title="Clicks">🖱 {ad.clicks.toLocaleString()}</span>
                    <span title="CTR" className={ad.clicks > 0 ? "text-green-600 font-semibold" : ""}>CTR {ctr(ad.impressions, ad.clicks)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <AdToggle id={ad.id} active={ad.active} />
                  <Link
                    href={`/admin/advertising/${ad.id}`}
                    className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Stats
                  </Link>
                  <AdDeleteButton id={ad.id} name={ad.name} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
