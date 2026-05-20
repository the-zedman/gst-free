import Link from "next/link";
import { CATEGORIES, CATEGORY_COLORS, shortName } from "@/lib/constants";
import type { Item } from "@/lib/items";

interface ItemCardProps {
  item: Item;
}

function GstBadge({ status }: { status: string }) {
  if (status === "GST-free") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
        ✓ GST-Free
      </span>
    );
  }
  if (status === "taxable") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-600 text-white whitespace-nowrap">
        ✕ TAXABLE +10% GST
      </span>
    );
  }
  if (status === "mixed supply") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 whitespace-nowrap">
        ⚠ Mixed Supply
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
      ? See Notes
    </span>
  );
}

export default function ItemCard({ item }: ItemCardProps) {
  const cat = CATEGORIES.find((c) => c.value === item.category);
  const colorClass = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other;
  const display = shortName(item.name);
  const isTruncated =
    display.replace(/\s+/g, " ").trim() !== item.name.replace(/\s+/g, " ").trim();
  const isTaxable = item.gst_status === "taxable";

  return (
    <Link
      href={`/items/${item.slug}`}
      className={`group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:shadow-md ${
        isTaxable
          ? "bg-red-50 border-red-200 hover:border-red-300"
          : "bg-white border-gray-100 hover:border-green-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`font-medium leading-snug transition-colors ${
            isTaxable
              ? "text-gray-800 group-hover:text-red-700"
              : "text-gray-900 group-hover:text-green-700"
          }`}
          title={isTruncated ? item.name : undefined}
        >
          {display}
        </p>
        <GstBadge status={item.gst_status} />
      </div>

      {isTruncated && (
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {item.name}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}
        >
          {cat?.emoji} {cat?.label ?? item.category}
        </span>
        <span className="text-xs text-gray-300">#{item.ato_id}</span>
      </div>
    </Link>
  );
}
