"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ProductInfo } from "@/app/api/admin/ads/generate/route";

type AdType = "ai" | "upload";
type Step = "type" | "source" | "prompt" | "details";

const CTA_OPTIONS = [
  "Shop Now",
  "Grab the Deal",
  "Buy on Amazon",
  "Get Yours Today",
  "See the Deal",
  "Check Price",
  "Order Now",
  "View on Amazon",
  "Don't Miss Out",
  "Claim the Deal",
  "Save Now",
];

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

  // AI flow — screenshot
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const screenshotRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);

  // AI flow — prompt options
  const [productPosition, setProductPosition] = useState<"left" | "right">("right");
  const [ctaSelection, setCtaSelection] = useState("Shop Now");
  const [customCta, setCustomCta] = useState("");
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [geminiPrompt, setGeminiPrompt] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);

  // Image upload (both flows)
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const geminiUploadRef = useRef<HTMLInputElement>(null);

  // Shared details
  const [name, setName] = useState("");
  const [altText, setAltText] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("Shop Now");
  const [clickUrl, setClickUrl] = useState("");
  const [slotTarget, setSlotTarget] = useState("any");
  const [weight, setWeight] = useState(1);
  const [sponsoredLabel, setSponsoredLabel] = useState("Sponsored");
  const [useStartDate, setUseStartDate] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [useEndDate, setUseEndDate] = useState(false);
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const imageUrl = uploadedImageUrl;
  const effectiveCta = ctaSelection === "Custom" ? customCta : ctaSelection;

  // ── Screenshot handling ───────────────────────────────────────────────

  function handleScreenshotSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setAnalyzeError("");
    setProductInfo(null);
    setGeminiPrompt("");
  }

  async function handleAnalyze() {
    if (!screenshotFile) return;
    setAnalyzing(true); setAnalyzeError(""); setProductInfo(null); setGeminiPrompt("");

    const formData = new FormData();
    formData.append("screenshot", screenshotFile);

    const res = await fetch("/api/admin/ads/analyze-screenshot", { method: "POST", body: formData });
    const data = await res.json() as { productInfo?: ProductInfo; error?: string };
    setAnalyzing(false);

    if (data.error) { setAnalyzeError(data.error); return; }
    setProductInfo(data.productInfo!);
    setStep("prompt");
  }

  // ── Gemini prompt generation ──────────────────────────────────────────

  async function handleGeneratePrompt() {
    if (!productInfo) return;
    setGeneratingPrompt(true); setGeminiPrompt("");

    const res = await fetch("/api/admin/ads/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate-prompt",
        productInfo,
        productPosition,
        ctaText: effectiveCta,
      }),
    });
    const data = await res.json() as { geminiPrompt?: string; adName?: string; altText?: string; error?: string };
    setGeneratingPrompt(false);

    if (data.error) { setAnalyzeError(data.error); return; }
    setGeminiPrompt(data.geminiPrompt!);
    if (data.adName) setName(data.adName);
    if (data.altText) setAltText(data.altText);
  }

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(geminiPrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  }

  // ── Gemini result upload ──────────────────────────────────────────────

  async function handleGeminiImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadedImageUrl("");

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/ads/upload", { method: "POST", body: formData });
    const data = await res.json() as { url?: string; error?: string };
    setUploading(false);

    if (data.url) {
      setUploadedImageUrl(data.url);
      setStep("details");
    } else {
      setAnalyzeError(data.error ?? "Upload failed");
    }
    e.target.value = "";
  }

  // ── Upload flow ───────────────────────────────────────────────────────

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
        title: title || null, subtitle: subtitle || null,
        price_text: null, rating_text: null, social_proof: null,
        cta_text: effectiveCta || ctaText || "Shop Now",
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
            <button onClick={() => { setAdType("ai"); setStep("source"); }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-center group">
              <span className="text-4xl">🤖</span>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-green-700">AI Generated</p>
                <p className="text-xs text-gray-400 mt-1">Screenshot an Amazon product page. Claude reads it and builds a Gemini prompt to create a complete ad banner.</p>
              </div>
            </button>
            <button onClick={() => { setAdType("upload"); setStep("source"); }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group">
              <span className="text-4xl">🖼️</span>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-700">Upload Image</p>
                <p className="text-xs text-gray-400 mt-1">Upload a pre-made ad image (JPG, PNG, WebP — max 3MB) and fill in the details.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 2a: AI — Screenshot */}
      {step === "source" && adType === "ai" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900">Screenshot the Amazon product page</h2>
              <p className="text-sm text-gray-400 mt-1">Take a full-page screenshot and upload it. Claude will extract the product name, price, discount, rating, features and specs.</p>
            </div>

            <input ref={screenshotRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshotSelect} />

            {!screenshotPreview ? (
              <button onClick={() => screenshotRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 hover:border-green-400 rounded-xl p-10 text-center transition-colors group">
                <p className="text-3xl mb-2">📸</p>
                <p className="text-sm text-gray-500 group-hover:text-green-700">Click to upload screenshot</p>
                <p className="text-xs text-gray-300 mt-1">PNG, JPG — any size</p>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-gray-100">
                  <img src={screenshotPreview} alt="Screenshot preview" className="w-full max-h-64 object-contain bg-gray-50" />
                </div>
                <button onClick={() => screenshotRef.current?.click()} className="text-xs text-green-700 hover:underline">
                  Replace screenshot
                </button>
              </div>
            )}

            {analyzeError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{analyzeError}</p>}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !screenshotFile}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {analyzing ? "Analysing screenshot…" : "Analyse Screenshot →"}
          </button>
        </div>
      )}

      {/* Step 2b: Upload */}
      {step === "source" && adType === "upload" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Upload your ad image</h2>
          <p className="text-sm text-gray-400">Recommended size: 1200×400px. JPG, PNG, or WebP. Max 3MB.</p>
          <input ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />
          <button onClick={() => uploadRef.current?.click()} disabled={uploading}
            className="w-full border-2 border-dashed border-gray-200 hover:border-green-400 rounded-xl p-10 text-center transition-colors group">
            <p className="text-3xl mb-2">📁</p>
            <p className="text-sm text-gray-500 group-hover:text-green-700">{uploading ? "Uploading…" : "Click to choose a file"}</p>
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {/* Step 3: Prompt builder */}
      {step === "prompt" && adType === "ai" && (
        <div className="space-y-4">

          {/* Extracted product info */}
          {productInfo && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Extracted from screenshot</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="col-span-2"><span className="text-gray-400">Product:</span> <span className="text-gray-800">{productInfo.title?.slice(0, 80)}{(productInfo.title?.length ?? 0) > 80 ? "…" : ""}</span></div>
                <div><span className="text-gray-400">Brand:</span> <span className="text-gray-800">{productInfo.brand || "—"}</span></div>
                <div><span className="text-gray-400">Rating:</span> <span className="text-gray-800">{productInfo.rating ? `${productInfo.rating}★ (${productInfo.reviewCount})` : "—"}</span></div>
                <div><span className="text-gray-400">Price:</span> <span className="font-semibold text-gray-900">{productInfo.price || "—"}</span>{productInfo.rrp && <span className="text-gray-400 line-through ml-2">{productInfo.rrp}</span>}{productInfo.discount && <span className="text-green-600 ml-2">{productInfo.discount} off</span>}</div>
                {productInfo.socialProof && <div className="col-span-2"><span className="text-gray-400">Social proof:</span> <span className="text-gray-800">{productInfo.socialProof}</span></div>}
              </div>
              {productInfo.features?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {productInfo.features.slice(0, 4).map((f, i) => <li key={i} className="text-xs text-gray-500">• {f}</li>)}
                </ul>
              )}
            </div>
          )}

          {/* Options */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
            <h2 className="font-semibold text-gray-900">Ad options</h2>

            {/* Product position */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Product image position</label>
              <div className="grid grid-cols-2 gap-3">
                {(["right", "left"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setProductPosition(pos)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${productPosition === pos ? "border-green-400 bg-green-50 text-green-800" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                  >
                    {pos === "right" ? (
                      <><span className="text-base">📝</span> Copy left · Product right</>
                    ) : (
                      <><span className="text-base">🖼️</span> Product left · Copy right</>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA selection */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">CTA button text</label>
              <div className="flex flex-wrap gap-2">
                {CTA_OPTIONS.map((cta) => (
                  <button
                    key={cta}
                    onClick={() => setCtaSelection(cta)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${ctaSelection === cta ? "border-green-400 bg-green-50 text-green-800 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                  >
                    {cta}
                  </button>
                ))}
                <button
                  onClick={() => setCtaSelection("Custom")}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${ctaSelection === "Custom" ? "border-purple-400 bg-purple-50 text-purple-800 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  Custom…
                </button>
              </div>
              {ctaSelection === "Custom" && (
                <input
                  type="text"
                  value={customCta}
                  onChange={(e) => setCustomCta(e.target.value)}
                  placeholder="Enter your CTA text…"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              )}
            </div>

            <button
              onClick={handleGeneratePrompt}
              disabled={generatingPrompt || !productInfo || (ctaSelection === "Custom" && !customCta)}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {generatingPrompt ? "Generating prompt…" : "Generate Gemini Prompt →"}
            </button>
          </div>

          {/* Generated prompt */}
          {geminiPrompt && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Gemini prompt</h2>
                <button
                  onClick={handleCopyPrompt}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${promptCopied ? "bg-green-100 text-green-700" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                >
                  {promptCopied ? "✓ Copied!" : "Copy prompt"}
                </button>
              </div>
              <textarea
                readOnly
                value={geminiPrompt}
                rows={16}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-700 font-mono bg-gray-50 focus:outline-none resize-none"
              />
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 space-y-1.5">
                <p className="font-semibold">Next steps:</p>
                <ol className="space-y-1 text-blue-700 list-decimal list-inside">
                  <li>Copy the prompt above</li>
                  <li>Open Google Gemini and start a new chat</li>
                  <li>Upload your product screenshot</li>
                  <li>Paste the prompt and send</li>
                  <li>Download the generated banner image</li>
                  <li>Upload it below</li>
                </ol>
              </div>
            </div>
          )}

          {/* Upload Gemini result */}
          {geminiPrompt && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Upload the finished ad</h2>
              <p className="text-sm text-gray-400">Once Gemini has generated the banner, download it and upload it here.</p>
              <input ref={geminiUploadRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleGeminiImageUpload} />
              <button
                onClick={() => geminiUploadRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-gray-200 hover:border-green-400 rounded-xl p-8 text-center transition-colors group"
              >
                <p className="text-3xl mb-2">{uploading ? "⏳" : "⬆️"}</p>
                <p className="text-sm text-gray-500 group-hover:text-green-700">{uploading ? "Uploading…" : "Click to upload the Gemini-generated image"}</p>
                <p className="text-xs text-gray-300 mt-1">JPG, PNG or WebP</p>
              </button>
              {analyzeError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{analyzeError}</p>}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Details */}
      {step === "details" && (
        <div className="space-y-4">
          {imageUrl && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative w-full aspect-[3/1] bg-white">
                <Image src={imageUrl} alt="Ad preview" fill className="object-contain" unoptimized />
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Ad details</h2>

            <div className="space-y-3 text-sm">
              <Field label="Ad name (internal) *" value={name} onChange={setName} />

              {adType === "upload" && (
                <>
                  <Field label="Headline (optional)" value={title} onChange={setTitle} />
                  <Field label="Subtitle (optional)" value={subtitle} onChange={setSubtitle} />
                  <Field label="CTA button text" value={ctaText} onChange={setCtaText} />
                </>
              )}

              <Field label="Alt text (accessibility)" value={altText} onChange={setAltText} />

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Click URL (destination) *</label>
                <input type="url" value={clickUrl} onChange={(e) => setClickUrl(e.target.value)}
                  placeholder="https://amazon.com.au/dp/..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                <p className="text-xs text-gray-400 mt-1">UTM parameters will be added automatically.</p>
              </div>

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

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sponsored label</label>
                <input type="text" value={sponsoredLabel} onChange={(e) => setSponsoredLabel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1 cursor-pointer">
                    <input type="checkbox" checked={useStartDate} onChange={(e) => {
                      setUseStartDate(e.target.checked);
                      if (!e.target.checked) { setStartsAt(""); setUseEndDate(false); setEndsAt(""); }
                      else if (!startsAt) {
                        const d = new Date();
                        setStartsAt(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}T${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`);
                      }
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
                      else if (!endsAt) {
                        const d = new Date(); d.setMonth(d.getMonth() + 1);
                        setEndsAt(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}T${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`);
                      }
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

            <button onClick={handleSave} disabled={saving || !imageUrl || !clickUrl || !name}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors">
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
