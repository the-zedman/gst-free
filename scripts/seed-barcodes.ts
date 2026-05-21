import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set — run: vercel env pull .env.local");

const sql = neon(DATABASE_URL);

const TAXABLE_TAGS = [
  "en:confectioneries", "en:chocolates", "en:chocolate-bars", "en:chocolate-candies",
  "en:soft-drinks", "en:sodas", "en:carbonated-drinks",
  "en:energy-drinks", "en:sports-drinks",
  "en:snacks", "en:chips-and-crisps", "en:crisps", "en:popcorn",
  "en:biscuits-and-cakes", "en:cookies", "en:cakes", "en:pastries", "en:sweet-pastries",
  "en:ice-creams", "en:frozen-desserts", "en:sorbets",
  "en:alcoholic-beverages", "en:beers", "en:wines", "en:spirits", "en:ciders", "en:liqueurs",
  "en:chewing-gums", "en:candies", "en:sweet-snacks",
  "en:muesli-bars", "en:breakfast-bars", "en:cereal-bars", "en:snack-bars",
];

const FREE_TAGS = [
  "en:fresh-vegetables", "en:vegetables", "en:fresh-fruits", "en:fruits",
  "en:meats", "en:fresh-meats",
  "en:fish", "en:seafoods", "en:shellfishes", "en:crustaceans",
  "en:breads", "en:bread-rolls", "en:sourdough-breads", "en:flatbreads", "en:wraps",
  "en:milks", "en:cheeses", "en:yogurts", "en:dairy-products",
  "en:eggs",
  "en:waters", "en:spring-waters", "en:mineral-waters",
  "en:fruit-juices", "en:fruit-nectars", "en:vegetable-juices",
  "en:flours", "en:rice", "en:pasta", "en:noodles",
  "en:honey", "en:olive-oils", "en:vegetable-oils", "en:cooking-oils",
  "en:spices", "en:herbs", "en:dried-herbs",
  "en:nuts", "en:seeds",
  "en:coffees", "en:teas",
  "en:baby-foods", "en:infant-formulas",
];

function inferGst(tags: string[]): { status: string; confidence: string; notes: string } {
  for (const tag of tags) {
    for (const pattern of TAXABLE_TAGS) {
      if (tag === pattern || tag.startsWith(pattern + ":")) {
        return {
          status: "taxable",
          confidence: "high",
          notes: `ATO Schedule 1 — ${tag.replace("en:", "").replace(/-/g, " ")}`,
        };
      }
    }
  }
  for (const tag of tags) {
    for (const pattern of FREE_TAGS) {
      if (tag === pattern || tag.startsWith(pattern + ":")) {
        return {
          status: "GST-free",
          confidence: "high",
          notes: `GST-free basic food — ${tag.replace("en:", "").replace(/-/g, " ")}`,
        };
      }
    }
  }
  return {
    status: "unknown",
    confidence: "low",
    notes: "Product category not in ATO GST food rules — verify at ato.gov.au",
  };
}

interface OffProduct {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  categories?: string;
  categories_tags?: string[];
}

interface OffSearchResponse {
  count: number;
  page: number;
  page_count: number;
  page_size: number;
  products: OffProduct[];
}

async function fetchPage(page: number, pageSize: number): Promise<OffSearchResponse> {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("action", "process");
  url.searchParams.set("tagtype_0", "countries");
  url.searchParams.set("tag_contains_0", "contains");
  url.searchParams.set("tag_0", "en:australia");
  url.searchParams.set("fields", "code,product_name,product_name_en,brands,categories,categories_tags");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", String(pageSize));
  url.searchParams.set("page", String(page));

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "GSTFree.com.au data seed - open source - see github.com/the-zedman/gst-free" },
  });
  if (!res.ok) throw new Error(`OFF API error: ${res.status}`);
  return res.json() as Promise<OffSearchResponse>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const limitFlag = args.indexOf("--limit");
  const maxProducts = limitFlag !== -1 ? parseInt(args[limitFlag + 1]) : Infinity;
  const PAGE_SIZE = 500;

  console.log("\nCreating barcodes table if not exists...");
  await sql`
    CREATE TABLE IF NOT EXISTS barcodes (
      barcode        TEXT PRIMARY KEY,
      product_name   TEXT NOT NULL,
      brand          TEXT,
      off_categories TEXT,
      gst_status     TEXT NOT NULL DEFAULT 'unknown',
      gst_confidence TEXT NOT NULL DEFAULT 'low',
      gst_notes      TEXT,
      image_url      TEXT,
      source         TEXT DEFAULT 'off',
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS barcodes_gst_idx ON barcodes (gst_status)`;

  console.log("Fetching Australian products from Open Food Facts...\n");

  const first = await fetchPage(1, PAGE_SIZE);
  const totalProducts = Math.min(first.count, maxProducts === Infinity ? first.count : maxProducts);
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  console.log(`Total Australian products in OFF: ${first.count.toLocaleString()}`);
  if (maxProducts !== Infinity) {
    console.log(`Limiting to first ${maxProducts.toLocaleString()} products`);
  }
  console.log(`Pages to fetch: ${totalPages} (${PAGE_SIZE} per page)\n`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const statusCounts: Record<string, number> = {};

  async function processPage(products: OffProduct[]) {
    for (const p of products) {
      const barcode = p.code?.trim();
      const name = (p.product_name_en || p.product_name || "").trim();
      if (!barcode || !name || !/^\d{8,14}$/.test(barcode)) {
        skipped++;
        continue;
      }

      const tags = p.categories_tags ?? [];
      const { status, confidence, notes } = inferGst(tags);
      const brand = (p.brands ?? "").split(",")[0].trim() || null;
      const off_categories = p.categories ?? null;

      const result = await sql`
        INSERT INTO barcodes (barcode, product_name, brand, off_categories, gst_status, gst_confidence, gst_notes)
        VALUES (${barcode}, ${name}, ${brand}, ${off_categories}, ${status}, ${confidence}, ${notes})
        ON CONFLICT (barcode) DO UPDATE SET
          product_name   = EXCLUDED.product_name,
          brand          = EXCLUDED.brand,
          off_categories = EXCLUDED.off_categories,
          gst_status     = EXCLUDED.gst_status,
          gst_confidence = EXCLUDED.gst_confidence,
          gst_notes      = EXCLUDED.gst_notes,
          updated_at     = NOW()
        RETURNING (xmax = 0) AS is_insert
      ` as { is_insert: boolean }[];

      if (result[0]?.is_insert) inserted++;
      else updated++;

      statusCounts[status] = (statusCounts[status] ?? 0) + 1;
    }
  }

  await processPage(first.products);
  console.log(`Page 1/${totalPages} done`);

  for (let page = 2; page <= totalPages; page++) {
    await sleep(1200);
    const data = await fetchPage(page, PAGE_SIZE);
    await processPage(data.products);
    if (page % 5 === 0 || page === totalPages) {
      console.log(`Page ${page}/${totalPages} done — ${(inserted + updated).toLocaleString()} products so far`);
    }
  }

  console.log(`\nInserted: ${inserted}  |  Updated: ${updated}  |  Skipped: ${skipped}`);

  console.log(`\nGST status breakdown:`);
  for (const [k, v] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(16)} ${v}`);
  }

  console.log(`\nDone. Deploy when ready: vercel --prod\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
