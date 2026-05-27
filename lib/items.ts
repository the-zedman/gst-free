import "server-only";
import { sql } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/constants";
import { expandPatterns, synonymsFor } from "@/lib/synonyms";

export type { CategoryValue, GstStatus, GstFilter } from "@/lib/constants";
export { CATEGORIES, CATEGORY_COLORS, GST_STATUS_FILTERS, PAGE_SIZE, shortName } from "@/lib/constants";

export interface Item {
  id: number;
  ato_id: string;
  name: string;
  category: string;
  gst_status: string;
  slug: string;
}

export interface SearchResult {
  items: Item[];
  total: number;
  synonymsUsed: string[];
}

function statusSql(gstFilter: string): string {
  if (gstFilter === "gst-free") return "GST-free";
  if (gstFilter === "taxable") return "taxable";
  return "";
}

export async function searchItems(
  q: string,
  category: string,
  gstFilter: string,
  page: number
): Promise<SearchResult> {
  const offset = (page - 1) * PAGE_SIZE;
  const hasQ = q.trim().length > 0;
  const hasCat = category !== "all";
  const hasStatus = gstFilter !== "all";

  // Expand query to include synonym patterns.
  // allPatterns[0] is always the direct pattern (%q%).
  // prefix is used only for ordering (starts-with gets priority).
  const allPatterns = hasQ ? expandPatterns(q) : [];
  const prefix = `${q.trim()}%`;
  const statusVal = statusSql(gstFilter);
  const synonymsUsed = hasQ ? synonymsFor(q) : [];

  type Row = Item & { total_count: string };
  let rows: Row[];

  // ORDER BY: starts-with-query > contains-query > synonym-only match
  // When no synonyms, ELSE 1 is never reached for synonym case but that's fine.

  if (hasQ && hasCat && hasStatus) {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items
      WHERE name ILIKE ANY(${allPatterns}) AND category = ${category} AND gst_status = ${statusVal}
      ORDER BY
        CASE WHEN name ILIKE ${prefix} THEN 0
             WHEN name ILIKE ${allPatterns[0]} THEN 1
             ELSE 2 END,
        name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}` as Row[];
  } else if (hasQ && hasCat) {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items
      WHERE name ILIKE ANY(${allPatterns}) AND category = ${category}
      ORDER BY
        CASE WHEN name ILIKE ${prefix} THEN 0
             WHEN name ILIKE ${allPatterns[0]} THEN 1
             ELSE 2 END,
        name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}` as Row[];
  } else if (hasQ && hasStatus) {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items
      WHERE name ILIKE ANY(${allPatterns}) AND gst_status = ${statusVal}
      ORDER BY
        CASE WHEN name ILIKE ${prefix} THEN 0
             WHEN name ILIKE ${allPatterns[0]} THEN 1
             ELSE 2 END,
        name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}` as Row[];
  } else if (hasQ) {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items
      WHERE name ILIKE ANY(${allPatterns})
      ORDER BY
        CASE WHEN name ILIKE ${prefix} THEN 0
             WHEN name ILIKE ${allPatterns[0]} THEN 1
             ELSE 2 END,
        name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}` as Row[];
  } else if (hasCat && hasStatus) {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items WHERE category = ${category} AND gst_status = ${statusVal}
      ORDER BY name ASC LIMIT ${PAGE_SIZE} OFFSET ${offset}` as Row[];
  } else if (hasCat) {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items WHERE category = ${category}
      ORDER BY name ASC LIMIT ${PAGE_SIZE} OFFSET ${offset}` as Row[];
  } else if (hasStatus) {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items WHERE gst_status = ${statusVal}
      ORDER BY name ASC LIMIT ${PAGE_SIZE} OFFSET ${offset}` as Row[];
  } else {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items ORDER BY name ASC LIMIT ${PAGE_SIZE} OFFSET ${offset}` as Row[];
  }

  const total = rows.length > 0 ? parseInt(rows[0].total_count) : 0;
  return { items: rows, total, synonymsUsed };
}
