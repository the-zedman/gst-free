import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set — run: vercel env pull .env.local");

const sql = neon(DATABASE_URL);

interface AtoItem {
  detailed_food_list_id: string;
  item: string;
  gst_status: string;
  notes: string;
}

function assignCategory(item: string, notes: string): string {
  const n = notes.toLowerCase();
  const i = item.toLowerCase();

  // Dairy via Schedule 2 item 1
  if (/schedule 2, item 1/.test(n)) return "dairy";

  // Beverages via Schedule 2 items 5, 7–12
  if (/schedule 2, item (5|7|8|9|10|11|12)/.test(n)) return "beverages";

  // Note-prefix categories
  if (n.startsWith("condiment")) return "condiments";
  if (n.startsWith("flavouring")) return "herbs-spices";
  if (n.startsWith("seasoning")) return "herbs-spices";
  if (n.startsWith("garnish")) return "pantry";
  if (n.startsWith("fat/oil")) return "pantry";
  if (n.startsWith("ingredients for food")) return "pantry";
  if (n.includes("exempt food additive")) return "pantry";
  if (n.startsWith("crustacean")) return "seafood";
  if (n.startsWith("mollusc")) return "seafood";
  if (n.includes("pulses supplied as food")) return "produce";

  // Item name keywords — most specific first
  if (/\b(baby|infant|toddler)\b/.test(i)) return "baby-food";

  if (/\b(chicken|beef|pork|lamb|veal|turkey|duck|ham|bacon|sausage|salami|chorizo|pepperoni|prosciutto|pancetta|mortadella|devon|cabanossi|biltong|jerky|mince|steak|schnitzel|poultry|liver|kidney|brain|tripe|offal|bratwurst|chipolata|boerewors|csabai|chevapcici|black pudding|blood pudding|camp pie|corned beef|cold meat|braised meat|bones|buffalo|venison|rabbit|kangaroo|emu|goat|quail|pheasant|partridge|pigeon|goose)\b/.test(i)) return "meat";

  if (/\b(fish|tuna|salmon|prawn|shrimp|crab|lobster|oyster|mussel|scallop|squid|octopus|calamari|abalone|clam|anchovy|sardine|herring|seafood|marinara|bonito|barramundi|cod|flathead|snapper|whiting|bream|trout|mackerel|eel|caviar|roe)\b/.test(i)) return "seafood";

  if (/\b(milk|cheese|yoghurt|yogurt|cream|butter|buttermilk|dairy|casein|whey|ricotta|bocconcini|mozzarella|feta|cheddar|parmesan|cottage cheese|condensed milk|evaporated milk|gouda|camembert|brie|mascarpone|quark|kefir|colostrum|crème fraiche|fromage|ghee)\b/.test(i)) return "dairy";

  if (/\b(bread|roll|bagel|baguette|crumpet|english muffin|pita|wrap|tortilla|flatbread|naan|chapati|chapatti|damper|focaccia|ciabatta|sourdough|pretzel|challah|roti|lavash|injera|pikelet|crêpe|loaf|breadcrumb|bread flour|bread mix|bun|muffin)\b/.test(i)) return "bread";

  if (/\b(coffee|tea|juice|cordial|nectar|chocolate drink|hot chocolate|cocoa drink|malt drink|drinking preparation|apple cider|coconut juice|fruit drink)\b/.test(i)) return "beverages";

  if (/\b(herb|spice|pepper|cinnamon|cumin|turmeric|paprika|oregano|basil|thyme|rosemary|bay leaf|clove|nutmeg|cardamom|coriander|dill|parsley|chive|mint|sage|marjoram|aniseed|fennel seed|mustard seed|fenugreek|wasabi|horseradish)\b/.test(i)) return "herbs-spices";

  if (/\b(apple|banana|orange|tomato|potato|carrot|onion|garlic|lemon|lime|grape|strawberry|berr|lettuce|spinach|broccoli|cauliflower|cabbage|celery|cucumber|zucchini|pumpkin|pea|lentil|chickpea|mushroom|sprout|avocado|mango|pineapple|melon|peach|plum|cherry|kiwi|fig|date|artichoke|asparagus|beetroot|eggplant|leek|radish|silverbeet|sweet potato|yam|taro|cassava|corn|fennel|capsicum|chilli|ginger|alfalfa|bamboo|fruit|vegetable|fresh|frozen veg|salad|produce|stone fruit|citrus|tropical)\b/.test(i)) return "produce";

  return "other";
}

function generateSlug(item: string, atoId: string): string {
  const base = item
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Truncate cleanly at ~80 chars on a word boundary
  const truncated =
    base.length > 80 ? base.substring(0, 80).replace(/-[^-]*$/, "") : base;

  return `${truncated}-${atoId}`;
}

async function main() {
  const jsonPath = "/Volumes/Portable-2/Coding/random/ato-gst-free-items.json";
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);
  const items: AtoItem[] = data.items;

  console.log(`\nCreating table and indexes...`);

  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id             SERIAL PRIMARY KEY,
      ato_id         TEXT NOT NULL UNIQUE,
      name           TEXT NOT NULL,
      ato_notes      TEXT,
      category       TEXT NOT NULL DEFAULT 'other',
      slug           TEXT NOT NULL UNIQUE,
      search_vector  TSVECTOR GENERATED ALWAYS AS (
                       to_tsvector('english', name || ' ' || COALESCE(ato_notes, ''))
                     ) STORED,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS items_search_idx   ON items USING GIN(search_vector)`;
  await sql`CREATE INDEX IF NOT EXISTS items_category_idx ON items (category)`;
  await sql`CREATE INDEX IF NOT EXISTS items_slug_idx     ON items (slug)`;

  console.log(`Seeding ${items.length} items...`);

  let inserted = 0;
  let skipped = 0;

  for (const item of items) {
    const category = assignCategory(item.item, item.notes);
    const slug = generateSlug(item.item, item.detailed_food_list_id);

    const result = await sql`
      INSERT INTO items (ato_id, name, ato_notes, category, slug)
      VALUES (
        ${item.detailed_food_list_id},
        ${item.item},
        ${item.notes},
        ${category},
        ${slug}
      )
      ON CONFLICT (ato_id) DO NOTHING
      RETURNING id
    `;

    if (result.length > 0) inserted++;
    else skipped++;
  }

  console.log(`\nInserted: ${inserted}  |  Skipped (already existed): ${skipped}`);

  const counts = await sql`
    SELECT category, COUNT(*) AS count
    FROM items
    GROUP BY category
    ORDER BY count DESC
  `;

  console.log("\nCategory breakdown:");
  for (const row of counts) {
    console.log(`  ${String(row.category).padEnd(16)} ${row.count}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
