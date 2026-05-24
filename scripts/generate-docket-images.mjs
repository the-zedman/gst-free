import { experimental_generateImage as generateImage } from "ai";
import { createGateway } from "@ai-sdk/gateway";
import fs from "fs";
import path from "path";
import { config } from "dotenv";
config({ path: ".env.local" });

const gateway = createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY });
const outDir = path.resolve("public/images/articles");
fs.mkdirSync(outDir, { recursive: true });

const images = [
  // Article 1: Everyday Rewards
  { file: "everyday-rewards-hero.jpg", prompt: "An Australian woman in her 40s happily scanning her Woolworths loyalty card at a modern supermarket checkout, warm natural lighting, photorealistic, no text or logos visible" },
  { file: "everyday-rewards-scan.jpg", prompt: "Close-up of a hand holding a green loyalty rewards card at a supermarket checkout scanner, warm retail lighting, photorealistic, shallow depth of field" },
  { file: "everyday-rewards-app.jpg", prompt: "A person checking supermarket loyalty points on a smartphone app while standing in a grocery aisle, modern phone screen glow, photorealistic" },

  // Article 2: GST Traps
  { file: "gst-traps-hero.jpg", prompt: "Overhead flat-lay of processed Australian supermarket snack foods — chips packets, muesli bars, flavoured drinks, dips — arranged on white marble, bright studio lighting, photorealistic, no text visible" },
  { file: "gst-traps-shelf.jpg", prompt: "Australian woman comparing two similar food products on a supermarket shelf, looking at labels carefully, natural store lighting, photorealistic" },
  { file: "gst-traps-receipt.jpg", prompt: "Close-up of a crumpled Australian supermarket receipt on a wooden kitchen table, with a coffee cup in the background, warm morning light, photorealistic" },

  // Article 3: Meal Plan
  { file: "meal-plan-hero.jpg", prompt: "Stunning overhead flat-lay of a week of fresh GST-free groceries — vegetables, eggs, meat, fruit, oats — on a clean white kitchen bench, natural daylight, photorealistic" },
  { file: "meal-plan-shopping.jpg", prompt: "Organised fresh grocery haul on a kitchen bench — carrots, broccoli, chicken, eggs, pasta — ready to be put away, warm kitchen lighting, photorealistic" },
  { file: "meal-plan-family.jpg", prompt: "Australian family of four sitting down to a home-cooked dinner together at a wooden dining table, warm evening lighting, relaxed and happy, photorealistic" },

  // Article 4: Flybuys vs Rewards
  { file: "flybuys-vs-rewards-hero.jpg", prompt: "Two Australian supermarket loyalty reward cards placed side by side on clean white marble, soft natural studio lighting, photorealistic, minimal composition" },
  { file: "flybuys-vs-rewards-cards.jpg", prompt: "Australian woman smiling while using supermarket self-checkout terminal, scanning groceries, bright modern store lighting, photorealistic" },
  { file: "flybuys-vs-rewards-redeem.jpg", prompt: "Person's hand holding a loyalty voucher or coupon at a supermarket checkout, about to redeem it, warm retail lighting, photorealistic" },

  // Article 5: Specials Tricks
  { file: "specials-tricks-hero.jpg", prompt: "Colourful Australian supermarket promotional display with yellow special price tags and discount labels on products, bright store lighting, wide angle, photorealistic" },
  { file: "specials-tricks-unit-price.jpg", prompt: "Close-up of a person's finger pointing at the unit price label on a supermarket shelf (price per 100g), making a comparison decision, photorealistic" },
  { file: "specials-tricks-catalogue.jpg", prompt: "Stack of Australian supermarket weekly specials catalogues on a kitchen bench, fanned out slightly, natural morning light, photorealistic" },

  // Article 6: Home Brand
  { file: "home-brand-hero.jpg", prompt: "Side-by-side flat-lay comparison of branded and home brand food products on white background — pasta, oats, canned tomatoes — clean studio lighting, photorealistic" },
  { file: "home-brand-comparison.jpg", prompt: "Australian person in supermarket aisle holding two similar products — one name brand, one home brand — comparing them thoughtfully, photorealistic" },
  { file: "home-brand-pantry.jpg", prompt: "Well-organised Australian home kitchen pantry with neatly arranged home brand food products on white shelves, warm natural light, photorealistic" },

  // Article 7: Freezer Method
  { file: "freezer-method-hero.jpg", prompt: "Open well-organised chest freezer with clearly labelled clear freezer bags of portioned meat and vegetables, bright clean interior lighting, photorealistic, top-down angle" },
  { file: "freezer-method-organised.jpg", prompt: "Neatly stacked labelled freezer bags in an organised home freezer drawer, close-up shot, cold blue-white lighting, photorealistic" },
  { file: "freezer-method-bulk.jpg", prompt: "Australian person portioning a large bulk pack of chicken thighs into individual freezer bags on a clean kitchen bench, photorealistic" },

  // Article 8: ALDI vs Woolworths vs Coles
  { file: "supermarket-comparison-hero.jpg", prompt: "Three shopping trolleys lined up side by side in a bright supermarket car park, clean composition, natural daylight, photorealistic" },
  { file: "supermarket-comparison-basket.jpg", prompt: "Overhead flat-lay of a typical Australian family weekly grocery basket — fresh vegetables, meat, eggs, dairy, pantry items — on a neutral surface, photorealistic" },
  { file: "supermarket-comparison-aldi.jpg", prompt: "Australian shopper comparing product prices in an ALDI supermarket, looking at the shelf carefully, bright store lighting, photorealistic" },

  // Article 9: Kids Shopping
  { file: "kids-shopping-hero.jpg", prompt: "Australian mother and young child shopping together in a supermarket produce aisle, child pointing at vegetables excitedly, warm natural store lighting, photorealistic" },
  { file: "kids-shopping-compare.jpg", prompt: "Child aged around 10 enthusiastically comparing two product prices on supermarket shelf labels, looking curious and engaged, photorealistic" },
  { file: "kids-shopping-list.jpg", prompt: "Child aged around 8 writing a grocery shopping list at a kitchen table with a parent helping, warm morning kitchen light, photorealistic" },

  // Article 10: Receipt Guide
  { file: "receipt-guide-hero.jpg", prompt: "Close-up of an Australian supermarket receipt spread flat on a wooden kitchen bench, person's hand pointing at a line item, warm light, photorealistic" },
  { file: "receipt-guide-closeup.jpg", prompt: "Very close macro shot of the bottom of an Australian supermarket receipt showing GST total section, printed text clear, warm light, photorealistic" },
  { file: "receipt-guide-gst.jpg", prompt: "Person at home comparing two supermarket receipts laid side by side on a wooden table, coffee cup nearby, thoughtful expression, warm morning light, photorealistic" },
];

for (const { file, prompt } of images) {
  const outPath = path.join(outDir, file);
  if (fs.existsSync(outPath)) {
    console.log(`⏭  Skipping ${file} (already exists)`);
    continue;
  }
  console.log(`🎨 Generating ${file}…`);
  try {
    const { image } = await generateImage({
      model: gateway.imageModel("bfl/flux-pro-1.1"),
      prompt,
      size: "1344x768",
    });
    const buf = image.uint8Array
      ? Buffer.from(image.uint8Array)
      : Buffer.from(image.base64, "base64");
    fs.writeFileSync(outPath, buf);
    console.log(`✅ Saved ${file}`);
    await new Promise(r => setTimeout(r, 1000));
  } catch (err) {
    console.error(`❌ Failed ${file}:`, err.message);
  }
}

console.log("\nAll done.");
