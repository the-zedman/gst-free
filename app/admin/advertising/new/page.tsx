"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type AdType = "ai" | "upload";
type Step = "type" | "source" | "copy" | "details" | "saving";

interface ProductInfo {
  title: string; price: string; description: string;
  features: string[]; imageUrl: string | null; rating: string; reviewCount: string;
}
interface GeneratedCopy {
  adName: string; title: string; subtitle: string; ctaText: string;
  altText: string; imagePrompt: string;
}

const SLOTS = [
  { value: "any", label: "Any slot (cycling)" },
  { value: "ad-hero", label: "Hero (top of page)" },
  { value: "ad-mid", label: "Mid-page" },
  { value: "ad-prefooter", label: "Pre-footer" },
];

export default function NewAdPage() {
  const router = useRouter();
  const [adType, setAdType] = useState<AdType | null>(null);
  const [step, setStep] = useState<Step>("type");

  // AI flow state
  const [amazonUrl, setAmazonUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [copy, setCopy] = useState<GeneratedCopy | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");

  // Upload flow state
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Shared ad details
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("Shop Now");
  const [altText, setAltText] = useState("");
  const [clickUrl, setClickUrl] = useState("");
  const [slotTarget, setSlotTarget] = useState("any");
  const [weight, setWeight] = useState(1);
  const [sponsoredLabel, setSponsoredLabel] = useState("Sponsored");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const imageUrl = adType === "ai" ? generatedImageUrl : uploadedImageUrl;

  // ── AI flow actions ────────────────────────────────────────────────────

  async function handleScrape() {
    setScraping(true); setScrapeError(""); setProductInfo(null); setCopy(null);
    const res = await fetch("/api/admin/ads/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "scrape", amazonUrl }),
    });
    const data = await res.json() as { productInfo?: ProductInfo; error?: string };
    setScraping(false);
    if (data.error) { setScrapeError(data.error); return; }
    setProductInfo(data.productInfo!);
    setStep("copy");
    handleGenerateCopy(data.productInfo!);
  }

  async function handleGenerateCopy(info?: ProductInfo) {
    const product = info ?? productInfo;
    if (!product) return;
    setGeneratingCopy(true); setCopy(null);
    const res = await fetch("/api/admin/ads/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate-copy", productInfo: product }),
    });
    const data = await res.json() as { copy?: GeneratedCopy; error?: string };
    setGeneratingCopy(false);
    if (data.copy) {
      setCopy(data.copy);
      setName(data.copy.adName);
      setTitle(data.copy.title);
      setSubtitle(data.copy.subtitle);
      setCtaText(data.copy.ctaText);
      setAltText(data.copy.altText);
    }
  }

  async function handleGenerateImage() {
    if (!productInfo || !copy) return;
    setGeneratingImage(true); setGeneratedImageUrl("");
    const res = await fetch("/api/admin/ads/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate-image", productInfo: { ...productInfo, imagePrompt: copy.imagePrompt } }),
    });
    const data = await res.json() as { imageUrl?: string; error?: string };
    setGeneratingImage(false);
    if (data.imageUrl) setGeneratedImageUrl(data.imageUrl);
  }

  // ── Upload flow actions ───────────────────────────────────────────────

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadedImageUrl("");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/ads/upload", { method: "POST", body: formData });
    const data = await res.json() as { url?: string; error?: string };
    setUploading(false);
    if (data.url) { setUploadedImageUrl(data.url); setStep("details"); }
    else setError(data.error ?? "Upload failed");
  }

  // ── Save ──────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!imageUrl || !clickUrl || !name) { setError("Name, image and click URL are required"); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, type: adType, image_url: imageUrl, click_url: clickUrl,
        title: title || null, subtitle: subtitle || null, cta_text: ctaText,
        alt_text: altText || null, slot_target: slotTarget, weight,
        active: true, sponsored_label: sponsoredLabel,
        starts_at: startsAt || null, ends_at: endsAt || null,
      }),
    });
    const data = await res.json() as { ad?: { id: number }; error?: string };
    setSaving(false);
    if (data.ad) router.push(`/admin/advertising/${data.ad.id}`);
    else setError(data.error ?? "Failed to save ad");
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/advertising")} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">New Ad</h1>
      </div>

      {/* Step 1: Choose type */}
      {step === "type" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">How would you like to create this ad?</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setAdType("ai"); setStep("source"); }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-center group"
            >
              <span className="text-4xl">🤖</span>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-green-700">AI Generated</p>
                <p className="text-xs text-gray-400 mt-1">Paste an Amazon URL — Claude extracts product info and generates the ad image and copy.</p>
              </div>
            </button>
            <button
              onClick={() => { setAdType("upload"); setStep("source"); }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group"
            >
              <span className="text-4xl">🖼️</span>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-700">Upload Image</p>
                <p className="text-xs text-gray-400 mt-1">Upload a pre-made ad image (JPG, PNG, WebP — max 3MB) and fill in the details.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 2a: AI — Amazon URL */}
      {step === "source" && adType === "ai" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Paste the Amazon product URL</h2>
          <p className="text-sm text-gray-400">Claude will fetch the page, extract the product details, then generate ad copy and a product image. You can edit everything before saving.</p>
          <input
            type="url"
            value={amazonUrl}
            onChange={(e) => setAmazonUrl(e.target.value)}
            placeholder="https://www.amazon.com.au/dp/..."
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {scrapeError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{scrapeError}</p>}
          <button
            onClick={handleScrape}
            disabled={scraping || !amazonUrl}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            {scraping ? "Fetching product…" : "Fetch & Generate →"}
          </button>
        </div>
      )}

      {/* Step 2b: Upload */}
      {step === "source" && adType === "upload" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Upload your ad image</h2>
          <p className="text-sm text-gray-400">Recommended size: 1200×400px. JPG, PNG, or WebP. Max 3MB.</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-200 hover:border-green-400 rounded-xl p-10 text-center transition-colors group"
          >
            <p className="text-3xl mb-2">📁</p>
            <p className="text-sm text-gray-500 group-hover:text-green-700">{uploading ? "Uploading…" : "Click to choose a file"}</p>
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {/* Step 3: AI — review copy and generate image */}
      {step === "copy" && adType === "ai" && (
        <div className="space-y-4">
          {/* Product info card */}
          {productInfo && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Extracted product info</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">Product:</span> <span className="text-gray-800">{productInfo.title.slice(0, 80)}{productInfo.title.length > 80 ? "…" : ""}</span></div>
                <div><span className="text-gray-400">Price:</span> <span className="text-gray-800 font-semibold">{productInfo.price || "—"}</span></div>
                <div><span className="text-gray-400">Rating:</span> <span className="text-gray-800">{productInfo.rating || "—"} ★ ({productInfo.reviewCount || "—"} reviews)</span></div>
              </div>
              {productInfo.features.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {productInfo.features.slice(0, 4).map((f, i) => <li key={i} className="text-xs text-gray-500">• {f}</li>)}
                </ul>
              )}
            </div>
          )}

          {/* Generated copy */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Generated ad copy</h2>
              <button onClick={() => handleGenerateCopy()} disabled={generatingCopy} className="text-xs text-green-700 hover:underline disabled:opacity-50">
                {generatingCopy ? "Generating…" : "↺ Regenerate copy"}
              </button>
            </div>
            {generatingCopy ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ) : copy ? (
              <div className="space-y-3 text-sm">
                <Field label="Ad name" value={name} onChange={setName} />
                <Field label="Headline" value={title} onChange={setTitle} />
                <Field label="Subtitle" value={subtitle} onChange={setSubtitle} />
                <Field label="CTA button" value={ctaText} onChange={setCtaText} />
                <Field label="Alt text" value={altText} onChange={setAltText} />
              </div>
            ) : null}
          </div>

          {/* Image generation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Ad image</h2>
              {generatedImageUrl && (
                <button onClick={handleGenerateImage} disabled={generatingImage} className="text-xs text-green-700 hover:underline disabled:opacity-50">
                  {generatingImage ? "Generating…" : "↺ Regenerate image"}
                </button>
              )}
            </div>

            {!generatedImageUrl && !generatingImage && (
              <button
                onClick={handleGenerateImage}
                disabled={!copy || generatingCopy}
                className="w-full border-2 border-dashed border-gray-200 hover:border-purple-400 rounded-xl p-8 text-center transition-colors disabled:opacity-40 group"
              >
                <p className="text-3xl mb-2">🎨</p>
                <p className="text-sm text-gray-500 group-hover:text-purple-700">Generate ad image with AI</p>
                <p className="text-xs text-gray-300 mt-1">Uses Flux 2 Pro via AI Gateway (~30s)</p>
              </button>
            )}

            {generatingImage && (
              <div className="w-full aspect-[3/1] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                <p className="text-sm text-gray-400">Generating image… this takes ~30 seconds</p>
              </div>
            )}

            {generatedImageUrl && (
              <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden border border-gray-100">
                <Image src={generatedImageUrl} alt="Generated ad" fill className="object-cover" unoptimized />
              </div>
            )}
          </div>

          {generatedImageUrl && copy && (
            <button
              onClick={() => setStep("details")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
            >
              Continue to ad details →
            </button>
          )}
        </div>
      )}

      {/* Step 4: Details (shared between AI and upload) */}
      {step === "details" && (
        <div className="space-y-4">
          {/* Preview */}
          {imageUrl && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden">
                <Image src={imageUrl} alt="Ad preview" fill className="object-cover" unoptimized />
                {(title || subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent flex flex-col justify-center px-6">
                    {title && <p className="text-white font-bold text-xl drop-shadow">{title}</p>}
                    {subtitle && <p className="text-white/90 text-sm mt-1 drop-shadow">{subtitle}</p>}
                    {ctaText && <span className="mt-3 self-start bg-green-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg">{ctaText}</span>}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Ad details</h2>

            {adType === "upload" && (
              <div className="space-y-3 text-sm pb-4 border-b border-gray-50">
                <Field label="Ad name (internal)" value={name} onChange={setName} />
                <Field label="Headline (optional)" value={title} onChange={setTitle} />
                <Field label="Subtitle (optional)" value={subtitle} onChange={setSubtitle} />
                <Field label="CTA button text" value={ctaText} onChange={setCtaText} />
                <Field label="Alt text" value={altText} onChange={setAltText} />
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Click URL (destination) *</label>
                <input type="url" value={clickUrl} onChange={(e) => setClickUrl(e.target.value)}
                  placeholder="https://amazon.com.au/dp/..." className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                <p className="text-xs text-gray-400 mt-1">UTM parameters will be added automatically.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slot</label>
                  <select value={slotTarget} onChange={(e) => setSlotTarget(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    {SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Weight (rotation priority)</label>
                  <input type="number" min={1} max={10} value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sponsored label</label>
                <input type="text" value={sponsoredLabel} onChange={(e) => setSponsoredLabel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start date (optional)</label>
                  <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End date (optional)</label>
                  <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving || !imageUrl || !clickUrl || !name}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {saving ? "Saving…" : "Save ad"}
            </button>
          </div>
        </div>
      )}
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
