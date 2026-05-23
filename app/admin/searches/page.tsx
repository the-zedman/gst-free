import Link from "next/link";
import { getRecentSearches, getBarcodeNames } from "@/lib/analytics";

function parseSearch(path: string): { type: "text" | "barcode"; query: string; href: string } {
  try {
    const params = new URLSearchParams(path.split("?")[1] ?? "");
    const barcode = params.get("barcode");
    const q = params.get("q");
    if (barcode) return { type: "barcode", query: barcode, href: `/?barcode=${encodeURIComponent(barcode)}` };
    if (q) return { type: "text", query: q, href: `/?q=${encodeURIComponent(q)}` };
  } catch {}
  return { type: "text", query: path, href: "/" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const COUNTRY_FLAGS: Record<string, string> = {
  AU: "🇦🇺", US: "🇺🇸", GB: "🇬🇧", NZ: "🇳🇿", CA: "🇨🇦", IN: "🇮🇳",
};

export default async function SearchesPage() {
  const rows = await getRecentSearches(300);

  const parsed = rows.map((r) => ({ ...r, ...parseSearch(r.path) }));

  const barcodeList = [...new Set(parsed.filter((r) => r.type === "barcode").map((r) => r.query))];
  const barcodeNames = await getBarcodeNames(barcodeList);

  const textCount = parsed.filter((r) => r.type === "text").length;
  const barcodeCount = parsed.length - textCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Recent Searches</h1>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>🔍 {textCount} text</span>
          <span>·</span>
          <span>📷 {barcodeCount} barcode</span>
          <span>·</span>
          <span>last {rows.length}</span>
        </div>
      </div>

      {parsed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
          No searches recorded yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {parsed.map((row, i) => {
              const description = row.type === "barcode"
                ? (barcodeNames[row.query] ?? null)
                : null;
              const flag = row.country ? (COUNTRY_FLAGS[row.country] ?? row.country) : null;

              return (
                <Link
                  key={i}
                  href={row.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-base w-5 shrink-0" title={row.type === "barcode" ? "Barcode scan" : "Text search"}>
                    {row.type === "barcode" ? "📷" : "🔍"}
                  </span>

                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-800 font-mono group-hover:text-green-700 transition-colors truncate block">
                      {row.query}
                    </span>
                    {description && (
                      <span className="text-xs text-gray-400 truncate block">{description}</span>
                    )}
                  </div>

                  <span className="text-xs text-gray-300 shrink-0 hidden sm:block capitalize">
                    {row.device}
                  </span>
                  {flag && (
                    <span className="text-sm shrink-0" title={row.country ?? undefined}>
                      {flag}
                    </span>
                  )}
                  <span className="text-xs text-gray-300 shrink-0 w-16 text-right">
                    {timeAgo(row.created_at)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
