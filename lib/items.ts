import { sql } from "@/lib/db";

export const PAGE_SIZE = 24;

export const CATEGORIES = [
  { value: "all",         label: "All Items",      emoji: "🛒" },
  { value: "produce",     label: "Produce",         emoji: "🥦" },
  { value: "meat",        label: "Meat & Poultry",  emoji: "🥩" },
  { value: "seafood",     label: "Seafood",         emoji: "🐟" },
  { value: "dairy",       label: "Dairy",           emoji: "🥛" },
  { value: "bread",       label: "Bread & Bakery",  emoji: "🍞" },
  { value: "pantry",      label: "Pantry",          emoji: "🫙" },
  { value: "condiments",  label: "Condiments",      emoji: "🧴" },
  { value: "herbs-spices",label: "Herbs & Spices",  emoji: "🌿" },
  { value: "beverages",   label: "Beverages",       emoji: "☕" },
  { value: "baby-food",   label: "Baby Food",       emoji: "🍼" },
  { value: "other",       label: "Other",           emoji: "📦" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const CATEGORY_COLORS: Record<string, string> = {
  produce:      "bg-green-100 text-green-800",
  meat:         "bg-red-100 text-red-800",
  seafood:      "bg-cyan-100 text-cyan-800",
  dairy:        "bg-blue-100 text-blue-800",
  bread:        "bg-amber-100 text-amber-800",
  pantry:       "bg-orange-100 text-orange-800",
  condiments:   "bg-purple-100 text-purple-800",
  "herbs-spices": "bg-emerald-100 text-emerald-800",
  beverages:    "bg-sky-100 text-sky-800",
  "baby-food":  "bg-pink-100 text-pink-800",
  other:        "bg-gray-100 text-gray-700",
};

export interface Item {
  id: number;
  ato_id: string;
  name: string;
  category: string;
  slug: string;
}

export interface SearchResult {
  items: Item[];
  total: number;
}

/** Returns a display-friendly short name by stripping verbose qualifiers. */
export function shortName(name: string): string {
  return name
    .replace(/\s*[–—-]\s*.+$/, "")   // strip "– joints, steaks..." suffixes
    .replace(/\s*\(.+\).*$/, "")       // strip "(non-alcoholic)..." parentheticals
    .replace(/\s*that\s.+$/i, "")      // strip "that contain..." clauses
    .replace(/\s*,\s*(fresh|frozen|tinned|dried|raw|cold).+$/i, "")
    .replace(/\s*\band\b.+$/i, "")     // strip "and roll mixes" etc when preceded by short text
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case
}

export async function searchItems(
  q: string,
  category: string,
  page: number
): Promise<SearchResult> {
  const offset = (page - 1) * PAGE_SIZE;
  const hasQ = q.trim().length > 0;
  const hasCat = category !== "all";
  const pattern = `%${q.trim()}%`;
  const prefix  = `${q.trim()}%`;

  let rows: Item[];

  if (hasQ && hasCat) {
    rows = await sql`
      SELECT id, ato_id, name, category, slug,
        COUNT(*) OVER() AS total_count
      FROM items
      WHERE name ILIKE ${pattern}
        AND category = ${category}
      ORDER BY
        CASE WHEN name ILIKE ${prefix} THEN 0 ELSE 1 END,
        name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    ` as unknown as Item[];
  } else if (hasQ) {
    rows = await sql`
      SELECT id, ato_id, name, category, slug,
        COUNT(*) OVER() AS total_count
      FROM items
      WHERE name ILIKE ${pattern}
      ORDER BY
        CASE WHEN name ILIKE ${prefix} THEN 0 ELSE 1 END,
        name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    ` as unknown as Item[];
  } else if (hasCat) {
    rows = await sql`
      SELECT id, ato_id, name, category, slug,
        COUNT(*) OVER() AS total_count
      FROM items
      WHERE category = ${category}
      ORDER BY name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    ` as unknown as Item[];
  } else {
    rows = await sql`
      SELECT id, ato_id, name, category, slug,
        COUNT(*) OVER() AS total_count
      FROM items
      ORDER BY name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    ` as unknown as Item[];
  }

  const total = rows.length > 0 ? parseInt((rows[0] as any).total_count) : 0;
  return { items: rows, total };
}
