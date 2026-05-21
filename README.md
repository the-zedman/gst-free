# 🥦 GST Free

**Australia's most complete GST-free food guide.**

Search 1,400+ ATO-confirmed items, instantly see whether food is GST-free or taxable, and find budget-friendly recipes to stretch your grocery budget further.

🌐 **[gst-free.vercel.app](https://gst-free.vercel.app)**

---

## What it does

Australian GST law means some foods cost 10% more than they need to. Plain flour is GST-free; a finished cake isn't. Fresh chicken is GST-free; a hot rotisserie chicken isn't. Knowing the difference can save a family hundreds — or even thousands — of dollars a year.

GST Free makes that knowledge accessible:

- **Search the database** — 1,400+ items from the ATO Detailed Food List, each clearly marked GST-Free ✓ or Taxable ✕ +10% GST
- **Filter by category** — Produce, Meat, Dairy, Bread, Pantry, Condiments, Beverages, Confectionery, Snacks, and more
- **Filter by GST status** — view only GST-free items, only taxable items, or everything
- **Item detail pages** — full ATO reference, legal notes, and plain-English explanation of the GST status
- **Mobile-first** — designed for use in the supermarket aisle

## Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Database | [Neon](https://neon.tech) (Postgres, serverless) |
| Auth | [Clerk](https://clerk.com) |
| Hosting | [Vercel](https://vercel.com) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |

## Data source

All GST status data is sourced from the official **[ATO Detailed Food List](https://www.ato.gov.au/law/view/document?DocID=GII/GSTIIFL1/NAT/ATO/00001)** — the authoritative reference for GST food classification in Australia.

> **Disclaimer:** This site is for informational purposes only. Always verify GST status with your receipt or a qualified tax professional. Not financial or legal advice.

## Roadmap

- [ ] Recipes — 30 budget-friendly meals highlighting GST-free ingredients
- [ ] Community food support directory — foodbanks, OzHarvest, SecondBite
- [ ] User accounts — save favourites and shopping lists
- [ ] Supermarket own-brand price comparisons
- [ ] Barcode scanner
- [ ] Weekly meal plans and shopping list builder
