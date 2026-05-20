export const PAGE_SIZE = 24;

export const CATEGORIES = [
  { value: "all",          label: "All Items",      emoji: "🛒" },
  { value: "produce",      label: "Produce",         emoji: "🥦" },
  { value: "meat",         label: "Meat & Poultry",  emoji: "🥩" },
  { value: "seafood",      label: "Seafood",         emoji: "🐟" },
  { value: "dairy",        label: "Dairy",           emoji: "🥛" },
  { value: "bread",        label: "Bread & Bakery",  emoji: "🍞" },
  { value: "pantry",       label: "Pantry",          emoji: "🫙" },
  { value: "condiments",   label: "Condiments",      emoji: "🧴" },
  { value: "herbs-spices", label: "Herbs & Spices",  emoji: "🌿" },
  { value: "beverages",    label: "Beverages",       emoji: "☕" },
  { value: "baby-food",    label: "Baby Food",       emoji: "🍼" },
  { value: "other",        label: "Other",           emoji: "📦" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const CATEGORY_COLORS: Record<string, string> = {
  produce:        "bg-green-100 text-green-800",
  meat:           "bg-red-100 text-red-800",
  seafood:        "bg-cyan-100 text-cyan-800",
  dairy:          "bg-blue-100 text-blue-800",
  bread:          "bg-amber-100 text-amber-800",
  pantry:         "bg-orange-100 text-orange-800",
  condiments:     "bg-purple-100 text-purple-800",
  "herbs-spices": "bg-emerald-100 text-emerald-800",
  beverages:      "bg-sky-100 text-sky-800",
  "baby-food":    "bg-pink-100 text-pink-800",
  other:          "bg-gray-100 text-gray-700",
};

/** Strips verbose ATO qualifiers to produce a clean display name. */
export function shortName(name: string): string {
  return name
    .replace(/\s*[–—-]\s*.+$/, "")
    .replace(/\s*\(.+\).*$/, "")
    .replace(/\s*that\s.+$/i, "")
    .replace(/\s*,\s*(fresh|frozen|tinned|dried|raw|cold).+$/i, "")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
