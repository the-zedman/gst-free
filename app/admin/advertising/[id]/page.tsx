import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAdById, getAdDailyStats, getAdSlotStats, getAdDeviceStats } from "@/lib/ads";
import AdToggle from "../AdToggle";
import AdDeleteButton from "../AdDeleteButton";

function ctr(imp: number, clicks: number) {
  if (imp === 0) return "—";
  return ((clicks / imp) * 100).toFixed(2) + "%";
}

function MiniBar({ value, max, color = "bg-green-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} /></div>;
}

export default async function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adId = Number(id);
  if (isNaN(adId)) notFound();

  const [ad, daily, slotStats, deviceStats] = await Promise.all([
    getAdById(adId),
    getAdDailyStats(adId, 30),
    getAdSlotStats(adId),
    getAdDeviceStats(adId),
  ]);

  if (!ad) notFound();

  // Build full 30-day array
  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const date = d.toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
    const row = daily.find((r) => r.date === date);
    return { label: date.slice(5), impressions: row?.impressions ?? 0, clicks: row?.clicks ?? 0 };
  });
  const maxImp = Math.max(...days30.map((d) => d.impressions), 1);

  const createdDate = new Date(ad.created_at).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "medium" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/advertising" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← All Ads</Link>
        <h1 className="text-2xl font-bold text-gray-900 truncate">{ad.name}</h1>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${ad.type === "ai" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
          {ad.type === "ai" ? "AI" : "Upload"}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <AdToggle id={ad.id} active={ad.active} />
          <AdDeleteButton id={ad.id} name={ad.name} />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative w-full aspect-[3/1]">
          <Image src={ad.image_url} alt={ad.alt_text ?? ad.name} fill className="object-cover" unoptimized={ad.image_url.includes("blob.vercel-storage.com")} />
          {(ad.title || ad.subtitle) && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent flex flex-col justify-center px-6">
              {ad.title && <p className="text-white font-bold text-2xl drop-shadow">{ad.title}</p>}
              {ad.subtitle && <p className="text-white/90 mt-1 drop-shadow">{ad.subtitle}</p>}
              {ad.cta_text && <span className="mt-3 self-start bg-green-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg">{ad.cta_text}</span>}
            </div>
          )}
        </div>
        <div className="p-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
          <span><span className="font-medium text-gray-600">Click URL:</span> <a href={ad.click_url} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline truncate">{ad.click_url}</a></span>
          <span><span className="font-medium text-gray-600">Slot:</span> {ad.slot_target}</span>
          <span><span className="font-medium text-gray-600">Weight:</span> {ad.weight}×</span>
          <span><span className="font-medium text-gray-600">Created:</span> {createdDate}</span>
          {ad.starts_at && <span><span className="font-medium text-gray-600">Starts:</span> {new Date(ad.starts_at).toLocaleDateString("en-AU")}</span>}
          {ad.ends_at && <span><span className="font-medium text-gray-600">Ends:</span> {new Date(ad.ends_at).toLocaleDateString("en-AU")}</span>}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Impressions", value: ad.impressions.toLocaleString() },
          { label: "Unique impressions", value: ad.unique_impressions.toLocaleString() },
          { label: "Clicks", value: ad.clicks.toLocaleString() },
          { label: "CTR", value: ctr(ad.impressions, ad.clicks) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Daily chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Daily performance (last 30 days)</h2>
        <div className="flex items-end gap-px h-24 w-full">
          {days30.map(({ label, impressions, clicks }) => (
            <div key={label} className="flex-1 flex flex-col items-center justify-end group relative" title={`${label}: ${impressions} imp, ${clicks} clicks`}>
              {/* Impressions bar */}
              <div className="w-full bg-blue-200 rounded-t-sm min-h-[2px]" style={{ height: maxImp > 0 ? `${(impressions / maxImp) * 90}%` : "2px" }} />
              {/* Clicks overlay */}
              {clicks > 0 && (
                <div className="absolute bottom-0 w-full bg-green-500 rounded-t-sm" style={{ height: maxImp > 0 ? `${(clicks / maxImp) * 90}%` : "2px" }} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-300 mt-1">
          <span>30d ago</span><span>15d ago</span><span>Today</span>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-blue-200 inline-block" /> Impressions</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-green-500 inline-block" /> Clicks</span>
        </div>
      </div>

      {/* Slot + Device breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">By slot</h2>
          {slotStats.length === 0 ? <p className="text-xs text-gray-400">No data yet</p> : slotStats.map((s) => (
            <div key={s.slot} className="flex items-center gap-3 text-sm">
              <span className="text-xs text-gray-500 w-28 truncate shrink-0 font-mono">{s.slot}</span>
              <MiniBar value={s.impressions} max={Math.max(...slotStats.map(x => x.impressions), 1)} />
              <span className="text-xs text-gray-500 w-16 text-right shrink-0">{s.impressions} / {s.clicks}</span>
              <span className="text-xs text-green-600 font-medium w-12 text-right shrink-0">{ctr(s.impressions, s.clicks)}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">By device</h2>
          {deviceStats.length === 0 ? <p className="text-xs text-gray-400">No data yet</p> : deviceStats.map((s) => (
            <div key={s.device} className="flex items-center gap-3 text-sm">
              <span className="text-xs text-gray-500 w-16 shrink-0 capitalize">{s.device}</span>
              <MiniBar value={s.impressions} max={Math.max(...deviceStats.map(x => x.impressions), 1)} color="bg-purple-400" />
              <span className="text-xs text-gray-500 w-16 text-right shrink-0">{s.impressions} / {s.clicks}</span>
              <span className="text-xs text-green-600 font-medium w-12 text-right shrink-0">{ctr(s.impressions, s.clicks)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
