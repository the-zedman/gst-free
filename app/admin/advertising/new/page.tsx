"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ProductInfo, GeneratedCopy } from "@/app/api/admin/ads/generate/route";

type AdType = "ai" | "upload";
type Step = "type" | "source" | "copy" | "details";

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
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const screenshotRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);

  // AI flow — product images (up to 6)
  const [productImages, setProductImages] = useState<Array<{ file: File; preview: string; url: string | null }>>([]);
  const productImageRef = useRef<HTMLInputElement>(null);

  // AI flow — copy + image generation
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [copy, setCopy] = useState<GeneratedCopy | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");

  // Upload flow
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  // Shared details
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [priceText, setPriceText] = useState("");
  const [ratingText, setRatingText] = useState("");
  const [socialProofText, setSocialProofText] = useState("");
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

  // ── Screenshot handling ───────────────────────────────────────────────

  function handleScreenshotSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setAnalyzeError("");
    setProductInfo(null);
    setCopy(null);
    setGeneratedImageUrl("");
  }

  async function handleAnalyze() {
    if (!screenshotFile) return;
    setAnalyzing(true); setAnalyzeError(""); setProductInfo(null); setCopy(null);

    const formData = new FormData();
    formData.append("screenshot", screenshotFile);

    const res = await fetch("/api/admin/ads/analyze-screenshot", { method: "POST", body: formData });
    const data = await res.json() as { productInfo?: ProductInfo; error?: string };
    setAnalyzing(false);

    if (data.error) { setAnalyzeError(data.error); return; }
    setProductInfo(data.productInfo!);
    setStep("copy");
    handleGenerateCopy(data.productInfo!);
  }

  // ── Product images ────────────────────────────────────────────────────

  function handleProductImagesSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 6 - productImages.length;
    const toAdd = files.slice(0, remaining);

    const newImages = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      url: null as string | null,
    }));
    setProductImages((prev) => [...prev, ...newImages]);

    // Upload each to blob
    newImages.forEach((img, i) => {
      const idx = productImages.length + i;
      uploadProductImage(img.file, idx);
    });

    e.target.value = "";
  }

  async function uploadProductImage(file: File, idx: number) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/ads/upload", { method: "POST", body: formData });
    const data = await res.json() as { url?: string };
    if (data.url) {
      setProductImages((prev) => prev.map((img, i) => i === idx ? { ...img, url: data.url! } : img));
    }
  }

  function removeProductImage(idx: number) {
    setProductImages((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Copy + image generation ───────────────────────────────────────────

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
      setPriceText(data.copy.price ?? "");
      setRatingText(data.copy.rating ?? "");
      setSocialProofText(data.copy.socialProof ?? "");
      setCtaText(data.copy.ctaText);
      setAltText(data.copy.altText);
    }
  }

  async function handleGenerateImage() {
    if (!productInfo || !copy) return;
    setGeneratingImage(true); setGeneratedImageUrl("");

    const productImageUrls = productImages.filter((img) => img.url).map((img) => img.url!);

    const res = await fetch("/api/admin/ads/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate-image",
        productInfo: { ...productInfo, imagePrompt: copy.imagePrompt },
        productImageUrls,
        copy,
      }),
    });
    const data = await res.json() as { imageUrl?: string; error?: string };
    setGeneratingImage(false);
    if (data.imageUrl) setGeneratedImageUrl(data.imageUrl);
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
        price_text: priceText || null, rating_text: ratingText || null, social_proof: socialProofText || null,
        cta_text: ctaText, alt_text: altText || null, slot_target: slotTarget, weight,
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
                <p className="text-xs text-gray-400 mt-1">Screenshot an Amazon product page. Claude reads it and generates compelling ad copy and a product image.</p>
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

      {/* Step 2a: AI — Screenshot + product images */}
      {step === "source" && adType === "ai" && (
        <div className="space-y-4">
          {/* Screenshot upload */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900">Screenshot the Amazon product page</h2>
              <p className="text-sm text-gray-400 mt-1">Take a screenshot of the full product page and upload it here. Claude will extract the product name, price, discount, rating, features and specs.</p>
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

          {/* Product images */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900">Product photos <span className="text-gray-400 font-normal">(optional, recommended)</span></h2>
              <p className="text-sm text-gray-400 mt-1">Upload up to 6 product photos from the Amazon listing. Claude will use these to accurately describe the product&apos;s appearance when generating the ad image — much better results than without them.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {productImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group">
                  <img src={img.preview} alt={`Product image ${i + 1}`} className="w-full h-full object-contain" />
                  {!img.url && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-xs text-gray-500">Uploading…</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeProductImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/40 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >✕</button>
                </div>
              ))}

              {productImages.length < 6 && (
                <button
                  onClick={() => productImageRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 flex flex-col items-center justify-center text-gray-300 hover:text-green-600 transition-colors"
                >
                  <span className="text-2xl">+</span>
                  <span className="text-xs mt-1">{productImages.length === 0 ? "Add photos" : "Add more"}</span>
                </button>
              )}
            </div>

            <input
              ref={productImageRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleProductImagesSelect}
            />
            <p className="text-xs text-gray-300">{productImages.length}/6 photos added</p>
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

      {/* Step 3: Review copy + generate image */}
      {step === "copy" && adType === "ai" && (
        <div className="space-y-4">
          {/* Extracted product info */}
          {productInfo && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Extracted from screenshot</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div><span className="text-gray-400">Product:</span> <span className="text-gray-800">{productInfo.title?.slice(0, 70)}{(productInfo.title?.length ?? 0) > 70 ? "…" : ""}</span></div>
                <div><span className="text-gray-400">Brand:</span> <span className="text-gray-800">{productInfo.brand || "—"}</span></div>
                <div><span className="text-gray-400">Price:</span> <span className="font-semibold text-gray-900">{productInfo.price || "—"}</span>{productInfo.rrp && <span className="text-gray-400 line-through ml-2">{productInfo.rrp}</span>}{productInfo.discount && <span className="text-green-600 ml-2">{productInfo.discount} off</span>}</div>
                <div><span className="text-gray-400">Rating:</span> <span className="text-gray-800">{productInfo.rating || "—"}★ ({productInfo.reviewCount || "—"})</span></div>
                {productInfo.socialProof && <div className="col-span-2"><span className="text-gray-400">Social proof:</span> <span className="text-gray-800">{productInfo.socialProof}</span></div>}
              </div>
              {productInfo.features?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {productInfo.features.slice(0, 5).map((f, i) => <li key={i} className="text-xs text-gray-500">• {f}</li>)}
                </ul>
              )}
              {productInfo.specs && Object.keys(productInfo.specs).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                  {Object.entries(productInfo.specs).map(([k, v]) => <span key={k}><span className="font-medium text-gray-500">{k}:</span> {v}</span>)}
                </div>
              )}
            </div>
          )}

          {/* Generated copy */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Generated ad copy</h2>
              <button onClick={() => handleGenerateCopy()} disabled={generatingCopy} className="text-xs text-green-700 hover:underline disabled:opacity-50">
                {generatingCopy ? "Generating…" : "↺ Regenerate"}
              </button>
            </div>
            {generatingCopy ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ) : copy && (
              <div className="space-y-3">
                <Field label="Ad name (internal)" value={name} onChange={setName} />
                <Field label="Headline" value={title} onChange={setTitle} />
                <Field label="Subtitle (feature copy)" value={subtitle} onChange={setSubtitle} />
                <Field label="Price display" value={priceText} onChange={setPriceText} />
                <Field label="Rating" value={ratingText} onChange={setRatingText} />
                <Field label="Social proof" value={socialProofText} onChange={setSocialProofText} />
                <Field label="CTA button" value={ctaText} onChange={setCtaText} />
                <Field label="Alt text" value={altText} onChange={setAltText} />
              </div>
            )}
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

            {productImages.length > 0 && (
              <p className="text-xs text-gray-400">
                ✓ {productImages.filter(i => i.url).length}/{productImages.length} product photos uploaded
              </p>
            )}

            {/* Use a product photo directly as the banner */}
            {productImages.some(i => i.url) && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">Use a product photo as your banner:</p>
                <div className="grid grid-cols-3 gap-2">
                  {productImages.filter(i => i.url).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setGeneratedImageUrl(img.url!)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${generatedImageUrl === img.url ? "border-green-400 ring-2 ring-green-200" : "border-gray-200 hover:border-green-300"}`}
                    >
                      <div className="aspect-[3/1] bg-white">
                        <img src={img.preview} alt={`Product ${i + 1}`} className="w-full h-full object-contain" />
                      </div>
                      <span className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-end justify-center pb-1">
                        <span className="text-[10px] text-white bg-black/40 rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100">Use this</span>
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-300">Or generate a new image with AI below.</p>
              </div>
            )}

            {!generatedImageUrl && !generatingImage && (
              <button
                onClick={handleGenerateImage}
                disabled={!copy || generatingCopy}
                className="w-full border-2 border-dashed border-gray-200 hover:border-purple-400 rounded-xl p-8 text-center transition-colors disabled:opacity-40 group"
              >
                <p className="text-3xl mb-2">🎨</p>
                <p className="text-sm text-gray-500 group-hover:text-purple-700">Generate AI banner image</p>
                <p className="text-xs text-gray-300 mt-1">Flux 2 Pro · ~30–45s · stylised interpretation of product</p>
              </button>
            )}

            {generatingImage && (
              <div className="w-full aspect-[3/1] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                <p className="text-sm text-gray-400">Generating… {productImages.length > 0 ? "using your product photos as reference" : ""}</p>
              </div>
            )}

            {generatedImageUrl && (
              <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden border border-gray-100 bg-white">
                <Image src={generatedImageUrl} alt="Generated ad" fill className="object-contain" unoptimized />
                {(title || priceText || ratingText || socialProofText) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex flex-col justify-center px-5 gap-0.5 pointer-events-none">
                    {title && <p className="text-white font-bold text-base sm:text-xl leading-tight drop-shadow">{title}</p>}
                    {priceText && <p className="text-yellow-300 font-semibold text-sm leading-tight drop-shadow">{priceText}</p>}
                    {(ratingText || socialProofText) && <p className="text-white/80 text-xs leading-tight drop-shadow">{[ratingText, socialProofText].filter(Boolean).join(" · ")}</p>}
                    {subtitle && <p className="text-white/85 text-xs leading-tight drop-shadow">{subtitle}</p>}
                    {ctaText && <span className="mt-2 self-start bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">{ctaText}</span>}
                  </div>
                )}
              </div>
            )}
          </div>

          {generatedImageUrl && copy && (
            <button onClick={() => setStep("details")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors">
              Continue to ad details →
            </button>
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
                {(title || priceText || ratingText || socialProofText) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex flex-col justify-center px-5 gap-0.5 pointer-events-none">
                    {title && <p className="text-white font-bold text-base sm:text-xl leading-tight drop-shadow">{title}</p>}
                    {priceText && <p className="text-yellow-300 font-semibold text-sm leading-tight drop-shadow">{priceText}</p>}
                    {(ratingText || socialProofText) && <p className="text-white/80 text-xs leading-tight drop-shadow">{[ratingText, socialProofText].filter(Boolean).join(" · ")}</p>}
                    {subtitle && <p className="text-white/85 text-xs leading-tight drop-shadow">{subtitle}</p>}
                    {ctaText && <span className="mt-2 self-start bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">{ctaText}</span>}
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
                  placeholder="https://amazon.com.au/dp/..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                <p className="text-xs text-gray-400 mt-1">UTM parameters will be added automatically for GA4 tracking.</p>
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
