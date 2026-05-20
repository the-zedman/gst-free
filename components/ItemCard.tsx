import Link from "next/link";
import { CATEGORIES, CATEGORY_COLORS, shortName, type Item } from "@/lib/items";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const cat = CATEGORIES.find((c) => c.value === item.category);
  const colorClass = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other;
  const display = shortName(item.name);
  const isTruncated = display.replace(/\s+/g, " ").trim() !== item.name.replace(/\s+/g, " ").trim();

  return (
    <Link
      href={`/items/${item.slug}`}
      className="group flex flex-col gap-2 bg-white rounded-xl border border-gray-100 p-4 hover:border-green-200 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="font-medium text-gray-900 group-hover:text-green-700 transition-colors leading-snug"
          title={isTruncated ? item.name : undefined}
        >
          {display}
        </p>
        <span className="shrink-0 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-100 mt-0.5">
          GST‑Free
        </span>
      </div>

      {isTruncated && (
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {item.name}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
          {cat?.emoji} {cat?.label ?? item.category}
        </span>
        <span className="text-xs text-gray-300">#{item.ato_id}</span>
      </div>
    </Link>
  );
}
