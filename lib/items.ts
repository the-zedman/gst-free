import "server-only";
import { sql } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/constants";

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
  const pattern = `%${q.trim()}%`;
  const prefix = `${q.trim()}%`;
  const statusVal = statusSql(gstFilter);

  type Row = Item & { total_count: string };

  // Build 8 variants: (q|noQ) × (cat|noCat) × (status|noStatus)
  let rows: Row[];

  if (hasQ && hasCat && hasStatus) {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items WHERE name ILIKE ${pattern} AND category = ${category} AND gst_status = ${statusVal}
      ORDER BY CASE WHEN name ILIKE ${prefix} THEN 0 ELSE 1 END, name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}` as Row[];
  } else if (hasQ && hasCat) {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items WHERE name ILIKE ${pattern} AND category = ${category}
      ORDER BY CASE WHEN name ILIKE ${prefix} THEN 0 ELSE 1 END, name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}` as Row[];
  } else if (hasQ && hasStatus) {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items WHERE name ILIKE ${pattern} AND gst_status = ${statusVal}
      ORDER BY CASE WHEN name ILIKE ${prefix} THEN 0 ELSE 1 END, name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}` as Row[];
  } else if (hasQ) {
    rows = await sql`
      SELECT id, ato_id, name, category, gst_status, slug, COUNT(*) OVER() AS total_count
      FROM items WHERE name ILIKE ${pattern}
      ORDER BY CASE WHEN name ILIKE ${prefix} THEN 0 ELSE 1 END, name ASC
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
  return { items: rows, total };
}
