import "server-only";
import { sql } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/constants";

export type { CategoryValue } from "@/lib/constants";
export { CATEGORIES, CATEGORY_COLORS, PAGE_SIZE, shortName } from "@/lib/constants";

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

export async function searchItems(
  q: string,
  category: string,
  page: number
): Promise<SearchResult> {
  const offset = (page - 1) * PAGE_SIZE;
  const hasQ = q.trim().length > 0;
  const hasCat = category !== "all";
  const pattern = `%${q.trim()}%`;
  const prefix = `${q.trim()}%`;

  let rows: (Item & { total_count: string })[];

  if (hasQ && hasCat) {
    rows = await sql`
      SELECT id, ato_id, name, category, slug, COUNT(*) OVER() AS total_count
      FROM items
      WHERE name ILIKE ${pattern} AND category = ${category}
      ORDER BY CASE WHEN name ILIKE ${prefix} THEN 0 ELSE 1 END, name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    ` as typeof rows;
  } else if (hasQ) {
    rows = await sql`
      SELECT id, ato_id, name, category, slug, COUNT(*) OVER() AS total_count
      FROM items
      WHERE name ILIKE ${pattern}
      ORDER BY CASE WHEN name ILIKE ${prefix} THEN 0 ELSE 1 END, name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    ` as typeof rows;
  } else if (hasCat) {
    rows = await sql`
      SELECT id, ato_id, name, category, slug, COUNT(*) OVER() AS total_count
      FROM items
      WHERE category = ${category}
      ORDER BY name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    ` as typeof rows;
  } else {
    rows = await sql`
      SELECT id, ato_id, name, category, slug, COUNT(*) OVER() AS total_count
      FROM items
      ORDER BY name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    ` as typeof rows;
  }

  const total = rows.length > 0 ? parseInt(rows[0].total_count) : 0;
  return { items: rows, total };
}
