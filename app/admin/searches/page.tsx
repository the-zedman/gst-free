import { getRecentSearches } from "@/lib/analytics";

function parseSearch(path: string): { type: "text" | "barcode"; query: string } {
  try {
    const params = new URLSearchParams(path.split("?")[1] ?? "");
    if (params.get("barcode")) return { type: "barcode", query: params.get("barcode")! };
    if (params.get("q")) return { type: "text", query: params.get("q")! };
  } catch {}
  return { type: "text", query: path };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const COUNTRY_FLAGS: Record<string, string> = {
  AU: "🇦🇺", US: "🇺🇸", GB: "🇬🇧", NZ: "🇳🇿", CA: "🇨🇦", IN: "🇮🇳",
};

export default async function SearchesPage() {
  const rows = await getRecentSearches(300);

  const textCount = rows.filter((r) => parseSearch(r.path).type === "text").length;
  const barcodeCount = rows.length - textCount;

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

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
          No searches recorded yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {rows.map((row, i) => {
              const { type, query } = parseSearch(row.path);
              const flag = row.country ? (COUNTRY_FLAGS[row.country] ?? row.country) : null;
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                  <span className="text-base w-5 shrink-0" title={type === "barcode" ? "Barcode scan" : "Text search"}>
                    {type === "barcode" ? "📷" : "🔍"}
                  </span>
                  <span className="flex-1 text-sm text-gray-800 font-mono truncate" title={query}>
                    {query}
                  </span>
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
