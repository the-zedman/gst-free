import Link from "next/link";
import type { BarcodeProduct } from "@/lib/barcodes";

const STATUS_CONFIG = {
  "GST-free": {
    bg: "bg-green-50",
    border: "border-green-300",
    badgeBg: "bg-green-600",
    badgeText: "text-white",
    icon: "✓",
    label: "GST-Free",
  },
  taxable: {
    bg: "bg-red-50",
    border: "border-red-300",
    badgeBg: "bg-red-600",
    badgeText: "text-white",
    icon: "✕",
    label: "TAXABLE +10% GST",
  },
  "mixed supply": {
    bg: "bg-amber-50",
    border: "border-amber-300",
    badgeBg: "bg-amber-500",
    badgeText: "text-white",
    icon: "⚠",
    label: "Mixed Supply",
  },
  unknown: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    badgeBg: "bg-gray-200",
    badgeText: "text-gray-700",
    icon: "?",
    label: "Status Unknown",
  },
};

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence — verify manually",
};

export default function BarcodeResult({
  product,
  barcode,
}: {
  product: BarcodeProduct | null;
  barcode: string;
}) {
  if (!product) {
    return (
      <div className="max-w-lg mx-auto mt-8 p-8 bg-gray-50 border border-gray-200 rounded-2xl text-center">
        <p className="text-4xl mb-3">📦</p>
        <p className="text-lg font-semibold text-gray-800">Barcode not found</p>
        <p className="text-sm text-gray-500 mt-2">
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{barcode}</span>
          {" "}isn&apos;t in the Open Food Facts database yet.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Try searching by product name below.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-sm font-medium text-green-700 hover:underline"
        >
          ← Back to search
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[product.gst_status];
  const firstWord = product.product_name.split(" ")[0];

  return (
    <div className="max-w-lg mx-auto mt-8 mb-4">
      <p className="text-xs text-center text-gray-400 mb-3 font-mono">
        {product.barcode}
        {product.source === "cache" && (
          <span className="ml-2 text-gray-300">(cached)</span>
        )}
      </p>

      <div className={`border-2 ${cfg.border} ${cfg.bg} rounded-2xl overflow-hidden shadow-sm`}>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-xl font-bold text-gray-900 leading-tight">
                {product.product_name}
              </p>
              {product.brand && (
                <p className="text-sm text-gray-500 mt-0.5">{product.brand}</p>
              )}
            </div>
            <span
              className={`shrink-0 text-sm font-bold px-3 py-1.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText} whitespace-nowrap`}
            >
              {cfg.icon} {cfg.label}
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              {product.gst_notes ??
                "GST status could not be determined automatically."}
            </p>
            <p
              className={`text-xs mt-2 font-medium ${
                product.gst_confidence === "low"
                  ? "text-amber-600"
                  : "text-gray-400"
              }`}
            >
              {CONFIDENCE_LABEL[product.gst_confidence]}
            </p>
          </div>

          {product.off_categories && (
            <p className="text-xs text-gray-400 mt-3 line-clamp-2">
              Category: {product.off_categories}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm px-1">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          ← Back to search
        </Link>
        <Link
          href={`/?q=${encodeURIComponent(firstWord)}`}
          className="text-green-700 hover:underline font-medium"
        >
          Search ATO database for &ldquo;{firstWord}&rdquo; →
        </Link>
      </div>

      <p className="text-center text-xs text-gray-300 mt-6">
        Product data from{" "}
        <a
          href="https://world.openfoodfacts.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-400"
        >
          Open Food Facts
        </a>{" "}
        (CC BY-SA 4.0). GST classification based on ATO food schedules.
      </p>
    </div>
  );
}
