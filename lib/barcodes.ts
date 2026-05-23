import "server-only";
import { sql } from "./db";

export interface BarcodeProduct {
  barcode: string;
  product_name: string;
  brand: string | null;
  gst_status: "GST-free" | "taxable" | "mixed supply" | "unknown";
  gst_confidence: "high" | "medium" | "low";
  gst_notes: string | null;
  image_url: string | null;
  off_categories: string | null;
  source: "cache" | "api";
}

type GstResult = Pick<BarcodeProduct, "gst_status" | "gst_confidence" | "gst_notes">;

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
  // Produce
  "en:fresh-vegetables", "en:vegetables", "en:fresh-fruits", "en:fruits",
  "en:frozen-vegetables", "en:frozen-fruits", "en:dried-fruits", "en:raisins",
  // Meat & seafood
  "en:meats", "en:fresh-meats", "en:frozen-meats", "en:poultry",
  "en:fish", "en:seafoods", "en:shellfishes", "en:crustaceans",
  "en:canned-fish", "en:canned-tuna", "en:canned-salmon", "en:canned-sardines", "en:tinned-fish",
  // Bread & bakery
  "en:breads", "en:bread-rolls", "en:sourdough-breads", "en:flatbreads", "en:wraps",
  // Dairy & eggs
  "en:milks", "en:cheeses", "en:yogurts", "en:dairy-products",
  "en:butters", "en:margarines",
  "en:plant-milks", "en:soy-milks", "en:oat-milks", "en:almond-milks", "en:rice-milks",
  "en:eggs",
  // Beverages
  "en:waters", "en:spring-waters", "en:mineral-waters",
  "en:fruit-juices", "en:fruit-nectars", "en:vegetable-juices",
  "en:coffees", "en:teas",
  // Grains, pasta, legumes
  "en:flours", "en:rice", "en:pasta", "en:dried-pasta", "en:noodles",
  "en:oats", "en:oat-flakes", "en:rolled-oats",
  "en:legumes", "en:beans", "en:lentils", "en:chickpeas", "en:peas", "en:dried-legumes",
  "en:canned-vegetables", "en:canned-tomatoes", "en:canned-legumes",
  // Oils, condiments, seasonings
  "en:honey", "en:olive-oils", "en:vegetable-oils", "en:cooking-oils",
  "en:spices", "en:herbs", "en:dried-herbs",
  "en:salts", "en:table-salts", "en:sea-salts", "en:rock-salts", "en:iodised-salts",
  "en:vinegars",
  "en:broths", "en:stocks", "en:soups",
  // Nuts & seeds
  "en:nuts", "en:seeds", "en:nut-butters", "en:peanut-butters",
  // Baby food
  "en:baby-foods", "en:infant-formulas",
];

export function inferGstFromTags(tags: string[]): GstResult {
  for (const tag of tags) {
    for (const pattern of TAXABLE_TAGS) {
      if (tag === pattern || tag.startsWith(pattern + ":")) {
        return {
          gst_status: "taxable",
          gst_confidence: "high",
          gst_notes: `ATO Schedule 1 — ${tag.replace("en:", "").replace(/-/g, " ")}`,
        };
      }
    }
  }
  for (const tag of tags) {
    for (const pattern of FREE_TAGS) {
      if (tag === pattern || tag.startsWith(pattern + ":")) {
        return {
          gst_status: "GST-free",
          gst_confidence: "high",
          gst_notes: `GST-free basic food — ${tag.replace("en:", "").replace(/-/g, " ")}`,
        };
      }
    }
  }
  return {
    gst_status: "unknown",
    gst_confidence: "low",
    gst_notes: "Product category not in ATO GST food rules — verify at ato.gov.au",
  };
}

// Words that appear in product names but never in ATO food category names
const NAME_STOP_WORDS = new Set([
  "original", "classic", "natural", "pure", "real", "lite", "light",
  "reduced", "extra", "super", "premium", "select", "special", "regular",
  "plain", "simple", "family", "value", "finest", "organic", "gluten",
  "australian", "australia", "picnic", "party", "bbq", "grill",
  "bag", "box", "tin", "bottle", "jar", "pouch", "pack", "tub",
  "new", "old", "mini", "large", "small", "sliced", "diced", "whole",
]);

// Try each word from the product name individually against the ATO items table
async function searchAtoByName(productName: string): Promise<GstResult | null> {
  const words = productName
    .replace(/\d+(\.\d+)?\s*(g|kg|ml|l|cl|mg|oz|lb|pack|pk|x)\b/gi, "")
    .replace(/[^a-z\s]/gi, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !NAME_STOP_WORDS.has(w))
    .sort((a, b) => b.length - a.length); // longer words first — more specific

  for (const word of words) {
    try {
      const rows = await sql`
        SELECT name, gst_status
        FROM items
        WHERE name ILIKE ${"%" + word + "%"}
        ORDER BY length(name) ASC
        LIMIT 1
      ` as Array<{ name: string; gst_status: string }>;

      if (rows.length) {
        const { name, gst_status } = rows[0];
        return {
          gst_status: gst_status as GstResult["gst_status"],
          gst_confidence: "medium",
          gst_notes: `Matched ATO item: "${name}" — verify this applies to your product`,
        };
      }
    } catch { /* try next word */ }
  }
  return null;
}

async function ensureTable(): Promise<void> {
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
}

async function fetchFromApi(barcode: string): Promise<BarcodeProduct | null> {
  let res: Response;
  try {
    res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json` +
        `?fields=product_name,product_name_en,brands,categories_tags,categories,image_front_url`,
      {
        headers: { "User-Agent": "GSTFree.com.au - open source barcode lookup" },
        signal: AbortSignal.timeout(8000),
      }
    );
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const data = (await res.json()) as {
    status: number;
    product?: Record<string, unknown>;
  };
  if (data.status !== 1 || !data.product) return null;

  const p = data.product;
  const name = ((p.product_name_en ?? p.product_name ?? "") as string).trim();
  if (!name) return null;

  const tags = (p.categories_tags ?? []) as string[];
  let { gst_status, gst_confidence, gst_notes } = inferGstFromTags(tags);
  if (gst_status === "unknown") {
    const atoMatch = await searchAtoByName(name);
    if (atoMatch) ({ gst_status, gst_confidence, gst_notes } = atoMatch);
  }
  const rawBrand = ((p.brands ?? "") as string).split(",")[0].trim();
  const brand = rawBrand || null;
  const image_url = (p.image_front_url ?? null) as string | null;
  const off_categories = (p.categories ?? null) as string | null;

  await sql`
    INSERT INTO barcodes
      (barcode, product_name, brand, off_categories, gst_status, gst_confidence, gst_notes, image_url)
    VALUES
      (${barcode}, ${name}, ${brand}, ${off_categories}, ${gst_status}, ${gst_confidence}, ${gst_notes}, ${image_url})
    ON CONFLICT (barcode) DO UPDATE SET
      product_name   = EXCLUDED.product_name,
      brand          = EXCLUDED.brand,
      off_categories = EXCLUDED.off_categories,
      gst_status     = EXCLUDED.gst_status,
      gst_confidence = EXCLUDED.gst_confidence,
      gst_notes      = EXCLUDED.gst_notes,
      image_url      = EXCLUDED.image_url,
      updated_at     = NOW()
  `;

  return {
    barcode,
    product_name: name,
    brand,
    gst_status,
    gst_confidence,
    gst_notes,
    image_url,
    off_categories,
    source: "api",
  };
}

export async function lookupBarcode(barcode: string): Promise<BarcodeProduct | null> {
  await ensureTable();

  const rows = (await sql`
    SELECT barcode, product_name, brand, off_categories,
           gst_status, gst_confidence, gst_notes, image_url, updated_at
    FROM barcodes
    WHERE barcode = ${barcode}
  `) as Array<Record<string, unknown>>;

  if (rows.length > 0) {
    const c = rows[0];
    const ageMs = Date.now() - new Date(c.updated_at as string).getTime();
    if (ageMs < 30 * 24 * 60 * 60 * 1000) {
      // Re-run ATO name search on cached unknowns to improve them without a full API call
      if (c.gst_status === "unknown") {
        const atoMatch = await searchAtoByName(c.product_name as string);
        if (atoMatch) {
          await sql`
            UPDATE barcodes SET
              gst_status = ${atoMatch.gst_status},
              gst_confidence = ${atoMatch.gst_confidence},
              gst_notes = ${atoMatch.gst_notes},
              updated_at = NOW()
            WHERE barcode = ${barcode}
          `;
          return {
            barcode: c.barcode as string,
            product_name: c.product_name as string,
            brand: c.brand as string | null,
            gst_status: atoMatch.gst_status,
            gst_confidence: atoMatch.gst_confidence,
            gst_notes: atoMatch.gst_notes,
            image_url: c.image_url as string | null,
            off_categories: c.off_categories as string | null,
            source: "cache",
          };
        }
      }
      return {
        barcode: c.barcode as string,
        product_name: c.product_name as string,
        brand: c.brand as string | null,
        gst_status: c.gst_status as BarcodeProduct["gst_status"],
        gst_confidence: c.gst_confidence as BarcodeProduct["gst_confidence"],
        gst_notes: c.gst_notes as string | null,
        image_url: c.image_url as string | null,
        off_categories: c.off_categories as string | null,
        source: "cache",
      };
    }
  }

  return fetchFromApi(barcode);
}

export function isBarcode(q: string): boolean {
  return /^\d{8,14}$/.test(q.trim());
}
