# 🥦 GST Free

**[gstfree.com.au](https://gstfree.com.au) — Australia's most complete GST-free food guide.**

Search 1,400+ ATO-confirmed items, instantly see whether food is GST-free or taxable, and find budget-friendly recipes to stretch your grocery budget further.

---

## What it does

Australian GST law means some foods cost 10% more than they need to. Plain flour is GST-free; a finished cake isn't. Fresh chicken is GST-free; a hot rotisserie chicken isn't. Knowing the difference can save a family hundreds — or even thousands — of dollars a year.

GST Free makes that knowledge accessible:

- **Search the database** — 1,400+ items from the ATO Detailed Food List, each clearly marked GST-Free ✓ or Taxable ✕ +10% GST
- **Filter by category** — Produce, Meat, Dairy, Bread, Pantry, Condiments, Beverages, Confectionery, Snacks, and more
- **Filter by GST status** — view only GST-free items, only taxable items, or everything
- **Barcode lookup** — type or paste any product barcode to get its GST status via Open Food Facts
- **Item detail pages** — full ATO reference, legal notes, and plain-English explanation
- **Mobile-first** — designed for use in the supermarket aisle

## Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Database | [Neon](https://neon.tech) (Postgres, serverless) |
| Auth | [Clerk](https://clerk.com) |
| Hosting | [Vercel](https://vercel.com) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Barcode data | [Open Food Facts](https://world.openfoodfacts.org) (CC BY-SA 4.0) |

## Updating the ATO food list

When the ATO publishes an updated food list:

1. Drop the new JSON file into `data/ato-gst-food-list.json` (replacing the existing file)
2. Run the update script from the project root:

```bash
chmod +x update-ato-json.sh   # first time only
./update-ato-json.sh
```

The script will show you the item count and extraction date, ask for confirmation, then run the seed. At the end it tells you to deploy with `vercel --prod`.

The seed is safe to re-run at any time — it inserts new items, updates changed items, and removes items no longer in the ATO list. The output shows exactly how many items were inserted, updated, and removed.

> **Note:** After seeding, glance at the category breakdown in the output. Any new items that land in the `other` bucket may need manual category assignment.

## Updating barcode data

Barcode lookups are powered by [Open Food Facts](https://world.openfoodfacts.org) and cached in the `barcodes` table in Neon. The cache is kept fresh automatically — any barcode looked up by a user is refreshed from the API after 30 days.

To **pre-populate** the database with Australian products in bulk:

```bash
npm run seed:barcodes
```

This paginates through all Australian products in Open Food Facts (~50–200k products, takes a few minutes) and inserts or updates them in the `barcodes` table. GST status is inferred from the product's category tags and stored alongside the product name and brand.

To seed just a small sample for testing:

```bash
npm run seed:barcodes -- --limit 2000
```

The seed script is safe to re-run at any time — it upserts on barcode, so existing entries are updated rather than duplicated. Run it periodically (monthly or quarterly) to pick up new products and updated categories.

### How barcode GST status is determined

GST status is inferred from the product's Open Food Facts category tags, mapped against ATO food schedules:

- **GST-free**: fresh produce, meat, fish, dairy, bread, water, fruit juice, flour, rice, pasta, spices, nuts, coffee/tea, baby food
- **Taxable**: confectionery, chocolate, soft drinks, chips/crisps, biscuits/cakes, ice cream, alcohol, energy drinks, muesli bars
- **Unknown**: categories not clearly covered by ATO rules — these show as "Low confidence — verify manually"

Confidence is always shown to the user. The feature is a guide, not a tax opinion.

## Data source

All GST status data is sourced from the official **[ATO Detailed Food List](https://www.ato.gov.au/law/view/document?DocID=GII/GSTIIFL1/NAT/ATO/00001)** — the authoritative reference for GST food classification in Australia.

Product data for barcode lookup comes from **[Open Food Facts](https://world.openfoodfacts.org)**, an open database of food products from around the world, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

> **Disclaimer:** This site is for informational purposes only. Always verify GST status with your receipt or a qualified tax professional. Not financial or legal advice.

## Roadmap

- [x] Barcode lookup — type or paste any product barcode
- [ ] Recipes — 30 budget-friendly meals highlighting GST-free ingredients
- [ ] Community food support directory — foodbanks, OzHarvest, SecondBite
- [ ] User accounts — save favourites and shopping lists
- [ ] Supermarket own-brand price comparisons
- [ ] Weekly meal plans and shopping list builder
