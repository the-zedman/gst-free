"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import type { Ad } from "@/lib/ads";

const SLOTS = [
  { value: "any", label: "Any slot (cycling)" },
  { value: "ad-hero", label: "Home — Hero" },
  { value: "ad-mid", label: "Home — Mid-page" },
  { value: "ad-prefooter", label: "Home — Pre-footer" },
  { value: "recipe-top", label: "Recipes — Top" },
  { value: "recipe-bottom", label: "Recipes — Bottom" },
];

function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowDateTimeLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nextMonthDateTimeLocal(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditAdPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [ad, setAd] = useState<Ad | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [clickUrl, setClickUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [slotTarget, setSlotTarget] = useState("any");
  const [weight, setWeight] = useState(1);
  const [sponsoredLabel, setSponsoredLabel] = useState("Sponsored");
  const [useStartDate, setUseStartDate] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [useEndDate, setUseEndDate] = useState(false);
  const [endsAt, setEndsAt] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/ads/${id}`)
      .then((r) => r.json())
      .then((data: { ad?: Ad }) => {
        const a = data.ad;
        if (!a) return;
        setAd(a);
        setName(a.name);
        setClickUrl(a.click_url);
        setAltText(a.alt_text ?? "");
        setTitle(a.title ?? "");
        setSubtitle(a.subtitle ?? "");
        setCtaText(a.cta_text);
        setSlotTarget(a.slot_target);
        setWeight(a.weight);
        setSponsoredLabel(a.sponsored_label);
        if (a.starts_at) { setUseStartDate(true); setStartsAt(toDateTimeLocal(a.starts_at)); }
        if (a.ends_at) { setUseEndDate(true); setEndsAt(toDateTimeLocal(a.ends_at)); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!name || !clickUrl) { setError("Name and click URL are required"); return; }
    setSaving(true); setError("");

    const res = await fetch(`/api/admin/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, click_url: clickUrl, alt_text: altText || null,
        title: title || null, subtitle: subtitle || null, cta_text: ctaText,
        slot_target: slotTarget, weight, sponsored_label: sponsoredLabel,
        starts_at: useStartDate && startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: useEndDate && endsAt ? new Date(endsAt).toISOString() : null,
      }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);

    if (data.ok) router.push(`/admin/advertising/${id}`);
    else setError(data.error ?? "Failed to save");
  }

  if (loading) return <div className="text-sm text-gray-400">Loading…</div>;
  if (!ad) return <div className="text-sm text-red-500">Ad not found.</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(`/admin/advertising/${id}`)} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Ad</h1>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative w-full aspect-[3/1] bg-white">
          <Image src={ad.image_url} alt={ad.alt_text ?? ad.name} fill className="object-contain" unoptimized={ad.image_url.includes("blob.vercel-storage.com")} />
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Ad settings</h2>

        <div className="space-y-3 text-sm">
          <Field label="Ad name (internal) *" value={name} onChange={setName} />

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Click URL *</label>
            <input type="url" value={clickUrl} onChange={(e) => setClickUrl(e.target.value)}
              placeholder="https://amazon.com.au/dp/..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            <p className="text-xs text-gray-400 mt-1">UTM parameters are added automatically.</p>
          </div>

          <Field label="Alt text (accessibility)" value={altText} onChange={setAltText} />

          {/* Show copy fields for upload ads */}
          {ad.type === "upload" && (
            <>
              <Field label="Headline (optional)" value={title} onChange={setTitle} />
              <Field label="Subtitle (optional)" value={subtitle} onChange={setSubtitle} />
              <Field label="CTA button text" value={ctaText} onChange={setCtaText} />
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Slot</label>
              <select value={slotTarget} onChange={(e) => setSlotTarget(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                {SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Weight (rotation priority)</label>
              <input type="number" min={1} max={10} value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>

          <Field label="Sponsored label" value={sponsoredLabel} onChange={setSponsoredLabel} />

          {/* Dates with checkboxes */}
          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1 cursor-pointer">
                <input type="checkbox" checked={useStartDate} onChange={(e) => {
                  setUseStartDate(e.target.checked);
                  if (!e.target.checked) { setStartsAt(""); setUseEndDate(false); setEndsAt(""); }
                  else if (!startsAt) setStartsAt(nowDateTimeLocal());
                }} className="rounded" />
                Set start date
              </label>
              {useStartDate && (
                <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              )}
            </div>
            <div>
              <label className={`flex items-center gap-2 text-xs font-medium mb-1 cursor-pointer ${useStartDate ? "text-gray-600" : "text-gray-300"}`}>
                <input type="checkbox" checked={useEndDate} disabled={!useStartDate} onChange={(e) => {
                  setUseEndDate(e.target.checked);
                  if (!e.target.checked) setEndsAt("");
                  else if (!endsAt) setEndsAt(nextMonthDateTimeLocal());
                }} className="rounded disabled:opacity-30" />
                Set end date <span className="font-normal">(runs forever if not set)</span>
              </label>
              {useEndDate && (
                <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        <button onClick={handleSave} disabled={saving || !name || !clickUrl}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
    </div>
  );
}
