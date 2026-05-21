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

function normaliseStatus(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (s === "gst-free") return "GST-free";
  if (s === "taxable") return "taxable";
  if (s.includes("mixed")) return "mixed supply";
  return "see Notes";
}

function assignCategory(item: string, notes: string): string {
  const n = notes.toLowerCase();
  const i = item.toLowerCase();

  if (/schedule 2, item 1/.test(n)) return "dairy";
  if (/schedule 2, item (5|7|8|9|10|11|12)/.test(n)) return "beverages";
  if (/schedule 1, item (11|13|14|15)/.test(n)) return "beverages";
  if (/not a beverage of a kind specified in schedule 2/.test(n)) return "beverages";
  if (/schedule 1, item (1|2|3|4|5|6)/.test(n)) return "other";
  if (/dine-in|takeaway|take.?away|on the premises/.test(n)) return "other";
  if (/not food for human consumption/.test(n)) return "other";
  if (/not a beverage for human consumption/.test(n)) return "other";
  if (/live animal|live plant/.test(n)) return "produce";
  if (/schedule 1, item 8/.test(n)) return "confectionery";
  if (/(confectionery|lolly|lollies|chocolate bar|candy|toffee|fudge|nougat|marzipan|fondant|caramel|marshmallow|licorice|liquorice)/.test(i)) return "confectionery";
  if (/schedule 1, item (11|16|17|18|19|20|21|32)/.test(n)) return "snacks";
  if (/(chips?|crisps?|popcorn|pretzels?|pork rind|corn chip|rice cracker|cracker|muesli bar|health.?bar|cereal bar|protein bar|nut bar|seed bar|trail mix|party mix|snack mix)/.test(i)) return "snacks";
  if (/schedule 1, item (22|23|24|25|26|27)/.test(n)) return "bread";
  if (/schedule 1, item 28/.test(n)) return "dairy";
  if (n.startsWith("condiment")) return "condiments";
  if (n.startsWith("flavouring")) return "herbs-spices";
  if (n.startsWith("seasoning")) return "herbs-spices";
  if (n.startsWith("garnish")) return "pantry";
  if (n.startsWith("fat/oil")) return "pantry";
  if (n.startsWith("ingredients for food")) return "pantry";
  if (n.includes("exempt food additive") || n.includes("not an exempt food additive")) return "pantry";
  if (n.startsWith("crustacean")) return "seafood";
  if (n.startsWith("mollusc")) return "seafood";
  if (n.includes("pulses supplied as food")) return "produce";
  if (/(baby|infant|toddler)/.test(i)) return "baby-food";
  if (/(chicken|beef|pork|lamb|veal|turkey|duck|ham|bacon|sausage|salami|chorizo|pepperoni|prosciutto|pancetta|mortadella|devon|cabanossi|biltong|jerky|mince|steak|schnitzel|poultry|liver|kidney|brain|tripe|offal|bratwurst|chipolata|boerewors|csabai|chevapcici|black pudding|blood pudding|camp pie|corned beef|cold meat|braised meat|bones|buffalo|venison|rabbit|kangaroo|goat|quail)/.test(i)) return "meat";
  if (/(fish|tuna|salmon|prawn|shrimp|crab|lobster|oyster|mussel|scallop|squid|octopus|calamari|abalone|clam|anchovy|sardine|herring|seafood|marinara|bonito|barramundi|cod|flathead|snapper|whiting|bream|trout|mackerel|caviar|roe)/.test(i)) return "seafood";
  if (/(milk|cheese|yoghurt|yogurt|cream|butter|buttermilk|dairy|casein|whey|ricotta|bocconcini|mozzarella|feta|cheddar|parmesan|cottage cheese|condensed milk|evaporated milk|gouda|camembert|brie|mascarpone|colostrum|crème fraiche|ice cream|gelato|sorbet|frozen yogurt)/.test(i)) return "dairy";
  if (/(bread|roll|bagel|baguette|crumpet|pita|wrap|tortilla|flatbread|naan|chapati|damper|focaccia|ciabatta|sourdough|pretzel|challah|roti|lavash|pikelet|loaf|breadcrumb|bread flour|bread mix|bun|muffin|pie|pastry|pasty|sausage roll|quiche|croissant|danish|scroll|donut|doughnut|eclair|brioche)/.test(i)) return "bread";
  if (/(coffee|tea|juice|cordial|nectar|chocolate drink|hot chocolate|cocoa drink|malt drink|drinking preparation|apple cider|coconut juice|soft drink|soda|cola|lemonade|kombucha|energy drink|sports drink|electrolyte|alcohol|beer|wine|spirits|cider|liqueur|champagne)/.test(i)) return "beverages";
  if (/(herb|spice|pepper|cinnamon|cumin|turmeric|paprika|oregano|basil|thyme|rosemary|bay leaf|clove|nutmeg|cardamom|coriander|dill|parsley|chive|mint|sage|marjoram|aniseed|fennel seed|mustard seed|fenugreek|wasabi|horseradish)/.test(i)) return "herbs-spices";
  if (/(chocolate|lolly|lollies|candy|sweet|confection|toffee|fudge|nougat|marzipan|marshmallow|licorice|liquorice|chewing gum|bubble gum|jelly bean|gummy|peppermint|boiled sweet)/.test(i)) return "confectionery";
  if (/(apple|banana|orange|tomato|potato|carrot|onion|garlic|lemon|lime|grape|strawberry|berr|lettuce|spinach|broccoli|cauliflower|cabbage|celery|cucumber|zucchini|pumpkin|pea|lentil|chickpea|mushroom|sprout|avocado|mango|pineapple|melon|peach|plum|cherry|kiwi|fig|date|artichoke|asparagus|beetroot|eggplant|leek|radish|silverbeet|sweet potato|yam|taro|corn|fennel|capsicum|chilli|ginger|alfalfa|bamboo|fruit|vegetable|salad|produce|fresh|frozen veg)/.test(i)) return "produce";
  if (/(condiment|sauce|dip|spread|jam|jelly|relish|chutney|mayo|mayonnaise|mustard|ketchup|vinegar|dressing|paste)/.test(i)) return "condiments";
  return "other";
}

function generateSlug(item: string, atoId: string): string {
  const base = item
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const truncated =
    base.length > 80 ? base.substring(0, 80).replace(/-[^-]*$/, "") : base;
  return `${truncated}-${atoId}`;
}

async function main() {
  const jsonPath = path.resolve(process.cwd(), "data/ato-gst-food-list.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);
  const items: AtoItem[] = data.items;

  console.log(`
Dropping and recreating items table...`);
  await sql`DROP TABLE IF EXISTS items`;
  await sql`
    CREATE TABLE items (
      id             SERIAL PRIMARY KEY,
      ato_id         TEXT NOT NULL UNIQUE,
      name           TEXT NOT NULL,
      ato_notes      TEXT,
      gst_status     TEXT NOT NULL DEFAULT 'GST-free',
      category       TEXT NOT NULL DEFAULT 'other',
      slug           TEXT NOT NULL UNIQUE,
      search_vector  TSVECTOR GENERATED ALWAYS AS (
                       to_tsvector('english', name || ' ' || COALESCE(ato_notes, ''))
                     ) STORED,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX items_search_idx     ON items USING GIN(search_vector)`;
  await sql`CREATE INDEX items_category_idx   ON items (category)`;
  await sql`CREATE INDEX items_gst_status_idx ON items (gst_status)`;
  await sql`CREATE INDEX items_slug_idx       ON items (slug)`;

  console.log(`Seeding ${items.length} items...`);

  const jsonIds = new Set(items.map((i) => i.detailed_food_list_id));
  let inserted = 0;
  let updated = 0;
  const statusCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};

  for (const item of items) {
    const gst_status = normaliseStatus(item.gst_status);
    const category = assignCategory(item.item, item.notes);
    const slug = generateSlug(item.item, item.detailed_food_list_id);

    const result = await sql`
      INSERT INTO items (ato_id, name, ato_notes, gst_status, category, slug)
      VALUES (
        ${item.detailed_food_list_id},
        ${item.item},
        ${item.notes},
        ${gst_status},
        ${category},
        ${slug}
      )
      ON CONFLICT (ato_id) DO UPDATE SET
        name       = EXCLUDED.name,
        ato_notes  = EXCLUDED.ato_notes,
        gst_status = EXCLUDED.gst_status,
        category   = EXCLUDED.category,
        slug       = EXCLUDED.slug,
        updated_at = NOW()
      RETURNING (xmax = 0) AS is_insert
    ` as { is_insert: boolean }[];

    if (result[0]?.is_insert) inserted++;
    else updated++;

    statusCounts[gst_status] = (statusCounts[gst_status] || 0) + 1;
    catCounts[category] = (catCounts[category] || 0) + 1;
  }

  // Remove items no longer in the ATO list
  const dbRows = await sql`SELECT ato_id FROM items` as { ato_id: string }[];
  const toDelete = dbRows.map((r) => r.ato_id).filter((id) => !jsonIds.has(id));

  if (toDelete.length > 0) {
    for (const id of toDelete) {
      await sql`DELETE FROM items WHERE ato_id = ${id}`;
    }
    console.log(`
Removed ${toDelete.length} item(s) no longer in the ATO list:`);
    toDelete.forEach((id) => console.log(`  #${id}`));
  } else {
    console.log(`
No items removed (all DB items still present in ATO list)`);
  }

  console.log(`
Inserted: ${inserted}  |  Updated: ${updated}  |  Removed: ${toDelete.length}`);

  console.log("
GST status breakdown:");
  for (const [k, v] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(16)} ${v}`);
  }

  console.log("
Category breakdown:");
  for (const [k, v] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(16)} ${v}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
