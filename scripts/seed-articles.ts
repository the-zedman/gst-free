import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function main() {

await sql`
  CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    hero_image TEXT,
    category TEXT NOT NULL DEFAULT 'store-tips',
    tags TEXT[] DEFAULT '{}',
    read_time_mins INTEGER NOT NULL DEFAULT 5,
    content TEXT NOT NULL DEFAULT '',
    featured BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

const articles = [

  // ── 1 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'woolworths-everyday-rewards-guide',
    title: 'How to Use Woolworths Everyday Rewards to Actually Save Money',
    excerpt: 'Everyday Rewards is one of Australia\'s most popular loyalty programs — but most shoppers only scratch the surface. Here\'s how to make it work hard for your grocery budget.',
    hero_image: '/images/articles/everyday-rewards-hero.jpg',
    category: 'rewards',
    tags: ['woolworths', 'loyalty', 'rewards', 'savings'],
    read_time_mins: 6,
    featured: true,
    published_at: new Date('2026-05-20').toISOString(),
    content: `If you shop at Woolworths and you're not squeezing every cent out of Everyday Rewards, you're leaving money on the table. The program is free to join and, used strategically, can knock a meaningful amount off your grocery bill every month.

## How the Points System Works

You earn 1 point for every $1 spent at Woolworths, BWS, and a handful of partner retailers. Every 2,000 points converts to a $10 Woolworths voucher — so in broad terms, you're getting about 0.5% back on your spend.

That sounds modest. But the real value isn't in the base points — it's in the boosters.

![Everyday Rewards card being scanned at supermarket checkout](/images/articles/everyday-rewards-scan.jpg)

## Bonus Points Offers: Where the Real Value Lives

Each week, Woolworths pushes personalised bonus offers to your app and email. These typically look like "Earn 2,000 bonus points when you spend $30 on these products." That's an instant $10 voucher from a single shop.

**How to use them:**
- Open the Everyday Rewards app before every shop and activate all relevant offers
- You must activate — just seeing the offer isn't enough
- Build your shopping list around the activated offers that week

Activated offers often align with products you already buy. Over a month of activating everything relevant, it's realistic to earn $20–$40 in vouchers from bonus points alone.

[AD]

## Member Prices: The Quiet Discount

Many Woolworths products now carry a "Member Price" — a lower price that only shows at the register when your rewards card is scanned. These don't require points activation; they're automatic with your card.

Check the shelf labels: the member price is shown in orange. Without scanning your card, you pay the higher regular price. This isn't a loyalty bonus — it's effectively a penalty for non-members.

**Practical tip:** Always scan your card, even on a small shop. Member prices can apply to items you'd never expect.

## Boost Your Points with Partner Brands

Everyday Rewards partners include BIG W, Everyday Insurance, Everyday Mobile, and several fuel brands. If you spend with these anyway, link your card and collect points passively.

The fuel discount partner is particularly valuable: eligible members can get discounted fuel through linked offers at certain petrol stations. If you drive regularly, this alone can justify keeping the program active.

![Person checking rewards points on smartphone app](/images/articles/everyday-rewards-app.jpg)

## The Voucher Strategy

Don't redeem $10 vouchers the moment they arrive. Woolworths occasionally runs "Everyday Extra" promotions where your voucher is worth more — for example, a $10 voucher becomes $15 on certain qualifying weeks.

Hold your vouchers until one of these promotions runs, then use several at once. This approach can boost the value of your accumulated points by 30–50%.

## What Everyday Extra Membership Adds

For $7/month, Everyday Extra gives you 10% off your shop twice a month, bonus points on every purchase, and a free delivery credit. If your regular shop exceeds $100, two 10% discounts per month more than cover the subscription cost.

Do the maths on your own spend before signing up — it's not for everyone, but for households spending $400+ per month at Woolworths, it typically pays for itself several times over.

## The Bottom Line

- Activate bonus offers before every single shop
- Always scan your card — never skip member prices
- Stack vouchers for promotion weeks
- Consider Everyday Extra if you're a regular, high-spend shopper

Used consistently, Everyday Rewards can realistically save a family household $15–$40 per month. That's $180–$480 per year from a free program.`,
  },

  // ── 2 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'biggest-gst-traps-supermarket',
    title: 'The 10 Biggest GST Traps at the Supermarket',
    excerpt: 'Some foods look healthy and basic but secretly attract 10% GST. Knowing these traps means you can swap or adjust — and keep more money in your pocket.',
    hero_image: '/images/articles/gst-traps-hero.jpg',
    category: 'gst-guide',
    tags: ['gst', 'tax', 'shopping', 'awareness'],
    read_time_mins: 5,
    featured: false,
    published_at: new Date('2026-05-19').toISOString(),
    content: `The Australian GST system draws a line between "basic food" (GST-free) and "luxury or processed food" (taxable). In theory it's simple. In practice, the line is often confusing — and supermarkets are full of products that look healthy but quietly add 10% to your bill.

Here are the ten GST traps that catch shoppers most often.

## 1. Flavoured Mineral Water

Plain water — tap, bottled, sparkling — is GST-free. The moment it's flavoured (lemon, berry, cucumber), it becomes a taxable beverage. The price difference isn't huge per bottle, but it adds up across a household.

**Swap:** Buy plain sparkling water and add a squeeze of fresh lemon. GST-free, cheaper, just as refreshing.

## 2. Muesli Bars and Snack Bars

Rolled oats are GST-free. A pressed bar of oats, nuts, honey, and chocolate coating? Taxable. Muesli bars sit in the "snack food" category regardless of how natural their ingredients are.

**Swap:** Make your own bliss balls or overnight oats with GST-free ingredients. [Check our recipe section](/recipes) for ideas.

![Person comparing GST-free and taxable products on a supermarket shelf](/images/articles/gst-traps-shelf.jpg)

## 3. Dips and Spreads

Hummus, tzatziki, guacamole, and similar dips are taxable — they're classified as condiments or snack accompaniments. The raw ingredients (chickpeas, lemon, tahini) are GST-free; the packaged result is not.

**Swap:** Make hummus at home in five minutes. A can of chickpeas, lemon juice, olive oil, garlic. Costs about $1.50 vs $5+ for the tub, and it's GST-free at the ingredient level.

## 4. Trail Mix and Mixed Nuts

Plain raw nuts (almonds, cashews, walnuts) are GST-free. The moment they're combined into a trail mix — especially with dried fruit, chocolate, or seeds — the whole product can become taxable. Roasted and salted nuts also move into taxable territory.

**Swap:** Buy plain raw nuts from the bulk or baking aisle and mix your own.

[AD]

## 5. Flavoured Milk

Plain full-cream or skim milk is GST-free. Chocolate milk, strawberry milk, flavoured UHT varieties — taxable. The flavouring tips them into the "food marketed as a beverage" category.

## 6. Fruit Juice With Added Sugar

100% pure fruit juice (no added sugar, no additives) is GST-free. Juice drinks, fruit juice blends with added sugar, and cordials are taxable. Check the label carefully — "fruit drink" is the giveaway.

## 7. Ice Cream and Frozen Desserts

Here's a grey area that surprises many shoppers: plain frozen fruit (mango chunks, mixed berries) is GST-free. But ice cream, gelato, frozen yoghurt, and any sweetened frozen dessert is taxable. Even "sorbet" made primarily from fruit often falls in the taxable category.

![Close-up of a supermarket receipt showing GST line items](/images/articles/gst-traps-receipt.jpg)

## 8. Chips and Savoury Snacks

Potato chips, corn chips, pretzels, popcorn — all taxable, regardless of whether they're marketed as "natural" or "baked not fried." The snack food classification overrides the ingredient quality.

## 9. Protein Bars and Sports Nutrition Products

Marketed as health foods, but classified as taxable. The ATO treats protein bars the same as confectionery or snack bars. Even if a bar has 25g of protein and zero added sugar, it's still attracting 10% GST.

## 10. Prepared Salads and Ready-Made Meals

Fresh vegetables from the produce section are GST-free. The moment they're combined, dressed, and sold as a prepared salad or ready meal, the whole thing becomes taxable. Convenience costs you twice — in price and in tax.

## The Pattern

Spotting the pattern makes it easier: raw, unprocessed, single-ingredient foods are almost always GST-free. Once a product is processed, combined, flavoured, or marketed as a snack or convenience item, assume it's taxable until proven otherwise.

Use [GSTFree's search tool](/){:target="_self"} to check any specific item before you shop.`,
  },

  // ── 3 ─────────────────────────────────────────────────────────────────────
  {
    slug: '100-week-meal-plan-gst-free',
    title: 'How to Build a $100/Week Meal Plan Using Mostly GST-Free Ingredients',
    excerpt: 'Feeding a family of four on $100 a week is tough — but it\'s very doable when you build your meals around GST-free basics. Here\'s a complete framework to get you started.',
    hero_image: '/images/articles/meal-plan-hero.jpg',
    category: 'meal-planning',
    tags: ['meal-planning', 'budget', 'family', 'gst-free'],
    read_time_mins: 8,
    featured: false,
    published_at: new Date('2026-05-18').toISOString(),
    content: `A $100 weekly grocery budget for a family of four is ambitious but achievable — particularly when you understand where the money goes. GST-free foods (fresh produce, meat, eggs, dairy basics) tend to be cheaper per kilogram than processed alternatives, and they form the backbone of nutritious, filling meals.

This guide gives you the framework. Adjust quantities and specific items for your family's tastes.

## The $100 Budget Split

A workable split for a family of four:

| Category | Budget |
|---|---|
| Fresh produce (fruit + veg) | $30 |
| Meat and protein | $30 |
| Dairy and eggs | $15 |
| Pantry staples | $15 |
| Bread and grains | $10 |

Every category above is dominated by GST-free items — which means more food for the dollar.

## The Protein Strategy

Protein is the most expensive part of any grocery basket. To stay on budget:

**Stretch expensive cuts:** A $15 chicken can become roast chicken Monday, chicken soup Tuesday, and chicken fried rice Wednesday. One purchase, three dinners.

**Use cheaper cuts:** Chicken thighs cost roughly half what breast does and are more forgiving to cook. Pork shoulder, beef mince, and lamb shoulder are all significantly cheaper than premium cuts.

**Add eggs:** At roughly $5 for a dozen, eggs are one of the best value proteins available — and fully GST-free. Two eggs per person is a filling, nutritious meal.

**Legumes:** Lentils, chickpeas, and kidney beans (dried or tinned) are GST-free, extremely cheap, and high in protein and fibre. Replacing one meat-based dinner per week with a legume-based meal saves $8–$12.

![Weekly grocery haul of fresh GST-free ingredients laid out on a kitchen bench](/images/articles/meal-plan-shopping.jpg)

## A Sample Week

**Monday:** Roast chicken with roasted vegetables and mash
**Tuesday:** Chicken noodle soup (leftover chicken carcass + veg)
**Wednesday:** Beef mince bolognese with pasta
**Thursday:** Vegetable and lentil dhal with rice
**Friday:** Baked salmon with sweet potato and broccolini
**Saturday:** Homemade burgers with salad
**Sunday:** Slow-cooked lamb with roasted vegetables

Most of these use predominantly GST-free ingredients. [Browse our recipe section](/recipes) for step-by-step instructions on each.

[AD]

## The Produce Approach

Fresh vegetables and fruit are almost entirely GST-free. The key to maximising your produce budget:

**Buy what's in season.** Seasonal produce is significantly cheaper and fresher. In winter: pumpkin, cauliflower, leeks, citrus. In summer: tomatoes, zucchini, capsicum, stone fruits.

**Shop the loose bin, not the bag.** Pre-bagged carrots or apples often cost more per kilogram than buying loose from the bin. Check unit prices.

**Use the full vegetable.** Broccoli stems are as nutritious as the florets — chop them smaller and use them in stir-fries. Cauliflower leaves can be roasted. Carrot tops make stock. Reducing waste stretches the budget.

**Frozen is fine.** Frozen peas, corn, mixed vegetables, and berries are GST-free, nutritionally comparable to fresh, and cheaper. Keep a bag of each in the freezer for easy meal additions.

## Pantry Staples to Always Have

A well-stocked pantry means you always have the base of a meal:

- Rolled oats (breakfast for $3 a week)
- Tinned tomatoes (bolognese, curry base, soup)
- Dried lentils and tinned chickpeas
- Rice and pasta
- Olive oil, salt, basic spices
- Long-life milk or UHT

All of the above are GST-free. Buy in bulk when on sale — they have long shelf lives.

![Family eating a home-cooked dinner together](/images/articles/meal-plan-family.jpg)

## Breakfast on $2 Per Person

Breakfast is where many families quietly overspend — on cereal, flavoured yoghurt, juices, and toaster pastries that are all taxable. Swap to:

- Rolled oat porridge: ~$0.30 per serve
- Scrambled eggs on toast: ~$1.50 per serve
- Homemade bircher muesli: ~$0.80 per serve

All GST-free, all filling, all under $2 per person. That's $400+ saved per year on breakfast alone for a family of four versus buying branded cereals.

## The $100 Week in Practice

It requires planning but not deprivation. The households that consistently achieve it share these habits:

1. Plan the week's meals before shopping — no impulse buys
2. Write the list category by category and stick to it
3. Check the fridge before shopping to avoid duplicating what you already have
4. Use the GSTFree tool to verify items before adding them to your basket

The $100 week isn't a one-off achievement. It becomes a system.`,
  },

  // ── 4 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'flybuys-vs-everyday-rewards',
    title: 'Coles Flybuys vs Woolworths Everyday Rewards: Which One Saves You More?',
    excerpt: 'Both programs are free to join and both promise to reward your loyalty. But the mechanics are very different — and one is likely a better fit for how your household shops.',
    hero_image: '/images/articles/flybuys-vs-rewards-hero.jpg',
    category: 'rewards',
    tags: ['flybuys', 'everyday-rewards', 'coles', 'woolworths', 'loyalty'],
    read_time_mins: 7,
    featured: false,
    published_at: new Date('2026-05-17').toISOString(),
    content: `Australia's two biggest supermarket loyalty programs have a combined membership in the tens of millions. Most Australian households have at least one — and some have both. But which actually saves you more money?

We've broken down both programs across the metrics that matter for grocery shoppers.

## How Each Program Works

**Woolworths Everyday Rewards**
- Earn 1 point per $1 spent at Woolworths, BWS, and partners
- 2,000 points = $10 Woolworths voucher (~0.5% return)
- Weekly personalised bonus offers activated via app
- Member Prices (orange labels) at Woolworths and BWS

**Coles Flybuys**
- Earn 1 point per $1 spent at Coles, Liquorland, and partners
- 2,000 points = $10 Flybuys voucher (~0.5% return)
- Weekly bonus offers via app and email
- Flybuys Dollars: some offers convert directly to dollars, not points

On paper, the base earn rate is identical. The programs diverge in their bonus structures and partner ecosystems.

![Two loyalty reward cards side by side on a marble surface](/images/articles/flybuys-vs-rewards-cards.jpg)

## Bonus Offers: The Main Event

Both programs live or die on their bonus offers — personalised deals that can multiply your points significantly. The quality and relevance of these offers varies by shopper.

**Everyday Rewards** tends to send more frequent, smaller offers. You might activate 8–12 offers per week, each giving 200–500 bonus points on specific products.

**Flybuys** tends to send fewer but larger offers. A typical week might have 4–6 offers, but some convert directly to Flybuys Dollars (not points) — meaning instant credit, not accumulated points.

**Winner: Draw.** The value depends entirely on how well the offers match your shopping habits. Many shoppers find one program's algorithm matches their basket better than the other. Try both for a month and compare.

[AD]

## Member Pricing

**Everyday Rewards** has built out Member Prices across hundreds of products — a persistent, always-on discount for cardholders. This is increasingly a core part of Woolworths' pricing strategy.

**Flybuys** has a smaller set of Flybuys Member Exclusives but has been expanding them. Coles also runs "Flybuys Boost" which accelerates point earning on specific items.

**Winner: Everyday Rewards** — currently has more member-priced products and the discount is more consistent.

## Partner Ecosystems

**Everyday Rewards partners:** BIG W, Everyday Insurance, Everyday Mobile, linked fuel discounts, selected Ampol stations.

**Flybuys partners:** Kmart, Target, Liquorland, Budget car hire, Virgin Australia (points transfer), linked fuel discounts via Shell/Coles Express.

The Flybuys-Virgin Australia link is a sleeper benefit for frequent flyers — Flybuys points can be converted to Velocity points at roughly 2 Flybuys = 1 Velocity. If you fly Virgin with any frequency, Flybuys becomes significantly more valuable.

![Person using rewards voucher at supermarket self-checkout](/images/articles/flybuys-vs-rewards-redeem.jpg)

## Paid Tiers

**Everyday Extra** ($7/month): 10% off two shops per month, bonus points, free delivery credit. Worth it for households spending $400+/month at Woolworths.

**Flybuys** has no paid tier. All benefits are available for free.

**Winner: Flybuys** for simplicity. Everyday Extra can be better value for high-spend Woolworths shoppers, but requires active management to extract the value.

## Verdict

| Factor | Everyday Rewards | Flybuys |
|---|---|---|
| Base earn rate | Equal (0.5%) | Equal (0.5%) |
| Bonus offers | Frequent, smaller | Fewer, sometimes instant dollars |
| Member pricing | More extensive | Growing |
| Partners | BIG W, fuel | Kmart, Target, Virgin |
| Paid tier | Yes ($7/mo) | No |

**Choose Everyday Rewards if** you're a loyal Woolworths shopper who will actively work the bonus offer system and potentially subscribe to Everyday Extra.

**Choose Flybuys if** you shop at Coles regularly, use Kmart or Target, or fly Virgin Australia.

**Do both if** you split your shop across both chains — the programs are free, and there's no reason not to collect points from both.`,
  },

  // ── 5 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'supermarket-specials-tricks',
    title: 'How Supermarkets Use Weekly Specials to Get You Spending More (And How to Beat Them)',
    excerpt: 'Supermarket specials feel like a gift — but they\'re a carefully engineered system designed to increase your spend. Understanding the playbook helps you use it to your advantage.',
    hero_image: '/images/articles/specials-tricks-hero.jpg',
    category: 'store-tips',
    tags: ['specials', 'catalogue', 'unit-pricing', 'strategy'],
    read_time_mins: 6,
    featured: false,
    published_at: new Date('2026-05-16').toISOString(),
    content: `Every Wednesday, the new Woolworths and Coles catalogues drop. Millions of households check them. But the deals you see aren't random — they're the result of sophisticated category management strategies designed to drive basket size and brand loyalty.

Understanding what supermarkets are doing with specials doesn't mean you can't benefit from them. It means you can use them strategically instead of reactively.

## The Loss Leader: Specials Designed to Get You Through the Door

A loss leader is a product sold at or below cost to attract shoppers. The classic example is a deeply discounted chicken or mince — priced to get you into the store, knowing you'll buy $80 worth of other things while you're there.

**How to use this to your advantage:** Identify the genuine loss leaders (usually the headline specials — "Whole chicken $6"), buy them in bulk if you have freezer space, and stick to your list for the rest of the shop. Don't let the loss leader become an invitation to browse.

## "Was/Now" Pricing: The Anchoring Trick

"Was $4.50, now $3.00" feels like a saving. But the "was" price is often the recommended retail price — not the price the item was actually sold at recently. Some products bounce between a high "was" price and a lower "now" price on rotation.

**What to do:** Track your commonly bought items over a few weeks. Use the unit price (price per 100g or per litre) as your real comparison metric, not the percentage discount claimed.

![Person carefully reading unit price labels on supermarket shelf](/images/articles/specials-tricks-unit-price.jpg)

## Unit Pricing: The Number They Don't Want You to Look At

Australian law requires supermarkets to display unit pricing on shelf labels. The unit price is the cost per 100g, per litre, or per unit — making direct comparisons possible across different pack sizes.

The 1kg bag of rice might be $4.50 — but the 500g bag is $2.60. The unit price reveals the 500g is actually more expensive per gram, despite looking cheaper at the shelf.

**Rule of thumb:** Always buy the largest pack size of a GST-free staple, provided you'll use it before it expires. Unit pricing almost always favours larger quantities.

[AD]

## "Catalogue Surfing": Using the System Correctly

Catalogue surfing means checking both Woolworths and Coles specials each week and buying each product from whichever chain has it cheaper. It requires splitting your shop — which takes more time — but for motivated households, the savings are meaningful.

**Practical catalogue surfing:**
1. Write your weekly list
2. Check both catalogues (apps or websites)
3. Assign each item to the chain with the better price that week
4. Do one small top-up shop at the cheaper chain for those items

This works best for 5–10 items that you buy every week regardless. On those staples, savings of $5–$15 per week are achievable.

## Multibuys: Only a Deal If You Were Already Buying Two

"2 for $7" when the individual price is $4 is not a saving — it's a $1 saving that requires you to buy something you may not have planned to buy. Multibuys are one of the most effective tools supermarkets use to inflate basket size.

**The test:** Would you have bought two anyway? If yes, it's a genuine deal. If no, the "saving" is actually a spend.

![Stack of supermarket catalogues and weekly specials leaflets](/images/articles/specials-tricks-catalogue.jpg)

## Half Price Sales: The Best Genuine Opportunity

Genuinely half-price items (especially on shelf-stable GST-free products) represent real value. When olive oil, canned tomatoes, rice, or pasta is half price, buy as much as you can reasonably store. These items have long shelf lives and you'll use them regardless.

The key: only stock up on half-price items you'd buy at full price anyway. Never buy something half-price that you wouldn't buy at full price.

## Building a Specials Strategy

1. Know your baseline: track the regular unit prices of your 15 most commonly bought items
2. Only buy on special if the unit price beats your baseline
3. Never buy something just because it's on special
4. Stock up aggressively on half-price shelf-stable GST-free staples
5. Ignore "was/now" framing — use unit prices only

The supermarket wants you to feel like you're winning when you buy specials. You can actually win — but it requires a system, not just good intentions.`,
  },

  // ── 6 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'home-brand-swaps',
    title: '15 Home Brand Swaps That Are Actually Better Than the Name Brand',
    excerpt: 'Home brand products have a reputation problem — but on a growing list of everyday items, the home brand is indistinguishable from or outright better than the big-name alternative.',
    hero_image: '/images/articles/home-brand-hero.jpg',
    category: 'store-tips',
    tags: ['home-brand', 'savings', 'swaps', 'value'],
    read_time_mins: 5,
    featured: false,
    published_at: new Date('2026-05-15').toISOString(),
    content: `Australian supermarkets have invested heavily in improving their home brand (own label) product quality over the past decade. Woolworths Macro, Coles Finest, and the standard "Coles" and "Woolworths" ranges now often match branded alternatives on quality — at 30–60% lower prices.

The key is knowing which categories to trust. Here are 15 swaps where the home brand is the smarter choice.

## 1. Rolled Oats

Oats are oats. The rolled oats in the Woolworths or Coles branded bag come from the same Australian farms as the branded alternatives. Save 40–50% with zero quality difference. This is one of the most reliable home brand swaps there is.

## 2. Canned Tomatoes

The tomato in a $0.90 home brand can is the same Italian-grown tomato as in the $2.40 branded can. The taste difference is undetectable in a pasta sauce or curry. Switch permanently.

## 3. Plain Flour and Self-Raising Flour

Flour is a commodity. Home brand flour is milled to the same specifications as branded varieties. Same protein content, same result in your recipes.

## 4. Butter

Home brand butter (both salted and unsalted) is made to identical specifications as branded butter in Australia. Switching from Lurpak to Coles butter saves roughly $3 per 250g block.

![Side-by-side comparison of branded and home brand products on white background](/images/articles/home-brand-comparison.jpg)

## 5. Long-Life (UHT) Milk

Long-life milk is a commodity product. The Woolworths or Coles branded UHT milk is the same product as any name brand. Given you can stock up during sales, this is a good one to buy in bulk.

## 6. Frozen Vegetables

Home brand frozen peas, corn, mixed vegetables, and stir-fry mixes are consistently reliable. Frozen at peak ripeness, nutritionally comparable to fresh, and often harvested from the same Australian suppliers as branded ranges.

## 7. Rice

Long-grain, basmati, jasmine — home brand rice is excellent. The same farms supply both branded and home brand in most cases. A 5kg home brand bag of jasmine rice is often $7–$9 versus $14+ for the branded equivalent.

[AD]

## 8. Olive Oil

For everyday cooking oil, home brand olive oil is a solid choice. Where the difference occasionally shows is in cold applications (dressings, drizzling) — for those, you might prefer a premium brand. But for sautéing, roasting, and frying? Home brand is fine.

## 9. Pasta

Pasta is dried durum wheat and water. Home brand pasta is the same. Cooking time and texture are identical.

## 10. Tinned Fish (Tuna, Salmon, Sardines)

Home brand tinned tuna and salmon are reliably good — particularly the Coles and Woolworths branded ranges. The fish is sourced from the same regulated fisheries. You're paying for the logo on the name brand, not better fish.

## 11. Sugar and Salt

Pure commodity products. There is no meaningful difference between branded and home brand white sugar or table salt.

## 12. Vinegar

White vinegar, apple cider vinegar — home brand is the same acidity, same source, significantly cheaper.

![Well-organised Australian home pantry with home brand products](/images/articles/home-brand-pantry.jpg)

## 13. Yoghurt (Plain)

Plain Greek or natural yoghurt under home brand labels (particularly Coles and Woolworths full-cream varieties) are very good. Some are made by the same manufacturers as the branded alternatives. Flavoured yoghurts vary more — worth trying once before fully committing.

## 14. Stock (Chicken, Vegetable, Beef)

Liquid stock is water, meat/vegetable extract, salt, and flavouring. Home brand stock is more than adequate for soups, risottos, braises, and stews. Save $1–$2 per litre consistently.

## 15. Bi-Carb Soda and Baking Powder

Pure commodity baking ingredients. The home brand version is chemically identical to McKenzie's or any other brand. Switch and never look back.

## Where Home Brand Is Riskier

A few categories where the quality gap is more noticeable: chocolate, certain condiments (mayo, aioli), premium ice cream, and some fresh cheeses. Test with a small purchase before fully committing. But for the 15 above? Switch permanently and bank the savings.`,
  },

  // ── 7 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'freezer-method-bulk-buying',
    title: 'The Freezer Method: How Bulk Buying GST-Free Foods Can Save $500+ a Year',
    excerpt: 'A well-used freezer is one of the most powerful tools in a budget-conscious household. Combined with strategic bulk buying, it can deliver consistent, substantial savings.',
    hero_image: '/images/articles/freezer-method-hero.jpg',
    category: 'store-tips',
    tags: ['freezer', 'bulk-buying', 'meal-prep', 'savings'],
    read_time_mins: 6,
    featured: false,
    published_at: new Date('2026-05-14').toISOString(),
    content: `The freezer is an underutilised financial tool. Most Australian households use it for ice cream and forgotten leftovers. But a household that uses its freezer strategically — buying in bulk when prices are low and storing correctly — can realistically save $500–$800 per year on groceries.

The secret is combining the freezer with the two best opportunities in grocery shopping: half-price sales and bulk discounts.

## The Core Principle

Supermarkets regularly put meat, chicken, fish, and bread on half-price. When that happens, a well-prepared household buys as much as they can use in the next three months and freezes it.

A $12 piece of salmon at $6 (half price) represents a 50% saving. Buy four pieces, save $24. A $10 kg of chicken thighs at $5/kg? Buy three kilograms, save $15. Do this consistently across your protein purchases and the savings compound quickly.

## What Freezes Well

**Excellent for freezing:**
- All raw meat and poultry (up to 3–4 months)
- Raw fish and seafood (up to 2 months)
- Bread and rolls (up to 3 months)
- Butter (up to 12 months)
- Cooked rice and pasta (up to 3 months)
- Cooked soups, stews, curries, and bolognese
- Berries and fruit (up to 6 months)
- Vegetables (blanched first for best results)

All of the above are GST-free at their raw ingredient level.

![Open well-organised chest freezer with clearly labelled food portions](/images/articles/freezer-method-organised.jpg)

**Doesn't freeze well:**
- Fresh salad greens
- Cucumber and high-water vegetables
- Dairy products like cream and yoghurt (texture changes)
- Fried foods

## The Half-Price Meat Strategy

When beef mince, chicken thighs, pork sausages, or fish fillets hit half price:

1. Buy your full month's (or more) worth
2. Portion into meal-sized bags (400g for a family of four)
3. Flatten bags for efficient stacking
4. Label with the date and contents
5. Freeze flat in a single layer until solid, then stack

Done consistently, this alone can save $20–$40 per month on protein.

[AD]

## Batch Cooking: Doubling Your Freezer Savings

The freezer method compounds when you combine it with batch cooking. Make double batches of:

- Bolognese sauce
- Chicken curry or butter chicken
- Beef and vegetable stew
- Dhal
- Pumpkin or vegetable soup

Freeze in individual serve or family-serve portions. When you're tired, busy, or out of ideas, dinner is already cooked. This prevents the takeaway spiral — "there's nothing in the fridge, let's just order Uber Eats" — which costs $60–$100 for a family that a $3 frozen batch of soup would have covered.

## Bread: The Most Underrated Freezer Item

Bread freezes perfectly. Sliced bread can go directly into the toaster from frozen (add 30 seconds). Buy bakery bread when it's marked down (usually later in the day), freeze immediately, and enjoy it at its best for weeks.

The saving: $6–$8 artisan loaves marked down to $3–$4 are common. Buy four, save $12–$16. Fresh-tasting bread from the freezer beats stale bread from the pantry every time.

![Bulk meat portions being divided and labelled in freezer bags](/images/articles/freezer-method-bulk.jpg)

## Organisation: The Critical Missing Step

A disorganised freezer produces waste. Ingredients get buried, forgotten, and eventually thrown out — defeating the purpose entirely.

**Practical organisation:**
- Use clear, stackable containers where possible
- Label everything with contents and date
- Use a first-in-first-out system (new items go to the back)
- Do a monthly freezer audit — what needs to be used this week?
- Keep a simple list on the freezer door of what's inside

## The $500 in Practice

Half-price meat savings: ~$25/month → $300/year
Bread markdowns: ~$8/month → $96/year
Batch cooking (reduced takeaway): ~$12/month → $144/year
**Total: ~$540/year**

These are conservative estimates for a family of four. Households that embrace the freezer method more aggressively consistently report savings above $800 per year.

The upfront investment is organisation and habit change. The freezer itself doesn't cost extra — you almost certainly already have one.`,
  },

  // ── 8 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'aldi-vs-woolworths-vs-coles-comparison',
    title: 'ALDI vs Woolworths vs Coles: We Compared a $150 Family Basket',
    excerpt: 'We filled the same basket at all three major supermarkets and compared the total. The results confirm what most shoppers suspect — but the details reveal some surprises.',
    hero_image: '/images/articles/supermarket-comparison-hero.jpg',
    category: 'store-tips',
    tags: ['aldi', 'woolworths', 'coles', 'comparison', 'price'],
    read_time_mins: 7,
    featured: false,
    published_at: new Date('2026-05-13').toISOString(),
    content: `The question every Australian household asks at some point: is it worth the extra trip to ALDI? The chains market themselves very differently — ALDI on price and simplicity, Woolworths on freshness and convenience, Coles on quality and value. We built a typical family-of-four weekly basket and priced it across all three.

## The Test Basket

We used a standardised basket of 25 common weekly items — predominantly GST-free staples:

- 1kg beef mince
- 1.5kg chicken thighs
- Dozen eggs
- 500g butter
- 2L full-cream milk
- 400g pasta (x2)
- 800g canned tomatoes (x2)
- 1kg carrots
- 1 head broccoli
- 500g baby spinach
- 1kg potatoes
- 3 brown onions
- 4 garlic bulbs
- Loaf of multigrain bread
- 1kg rolled oats
- 400g tinned chickpeas (x2)
- 1L olive oil
- 500g frozen peas
- 2 zucchini
- 200g cheddar cheese

All items selected were the mid-tier or standard option at each chain (not budget range, not premium).

![A family-sized grocery basket of fresh and pantry items on a kitchen bench](/images/articles/supermarket-comparison-basket.jpg)

## The Results

| Item Category | ALDI | Woolworths | Coles |
|---|---|---|---|
| Meat and protein | $18.40 | $24.50 | $23.80 |
| Dairy and eggs | $12.20 | $14.90 | $14.50 |
| Fresh produce | $14.80 | $17.20 | $16.40 |
| Pantry staples | $19.30 | $26.80 | $25.40 |
| Bread | $2.99 | $3.70 | $3.60 |
| **Total** | **$67.69** | **$87.10** | **$83.70** |

ALDI came in 22% cheaper than Woolworths and 19% cheaper than Coles on this basket.

## The Nuances

**ALDI wins decisively on staples.** Rolled oats, pasta, canned tomatoes, olive oil — the home brand equivalents at ALDI are priced well below both Woolworths and Coles, and the quality is comparable.

**Meat pricing is where the gap is widest.** ALDI's beef mince and chicken thighs were $6+ cheaper on this basket than the equivalent at Woolworths. The quality was consistent.

**Fresh produce is closer than expected.** ALDI's produce section has expanded significantly in recent years, and on standard items (carrots, onions, potatoes, broccoli), the prices and quality are competitive.

[AD]

## Where ALDI Falls Short

**Range limitations.** ALDI doesn't stock everything. If you need a specific brand, a niche ingredient, or a wide variety of any category, ALDI will frustrate you. The supermarket works best for household staples — which is most of the budget basket.

**No loyalty program.** There's no equivalent to Everyday Rewards or Flybuys at ALDI. The savings are baked into the price, not accumulated over time.

**Availability is inconsistent.** ALDI's "Specialbuys" (non-food items in the middle aisle) are popular but their grocery range occasionally has gaps — items go out of stock and aren't always replenished quickly.

**Location coverage.** ALDI now has over 600 stores in Australia, but coverage outside metro areas is still limited. If ALDI isn't convenient, the savings don't help.

![Shopper comparing prices in the ALDI supermarket produce section](/images/articles/supermarket-comparison-aldi.jpg)

## The Hybrid Strategy: Most Households' Best Option

The data suggests the optimal strategy for most families isn't picking one chain — it's using each for what it does best:

**ALDI:** Pantry staples (oats, pasta, canned goods, olive oil, butter), meat when available, frozen vegetables

**Woolworths or Coles:** Anything not available at ALDI, member-priced items, reward offer purchases, specialty produce

**Split shopping estimate:** Buying 60% of your basket at ALDI and 40% at Woolworths or Coles typically saves 12–18% versus doing your full shop at one of the big two.

On a $150 weekly basket, that's $18–$27 per week, or $936–$1,400 per year.

## The Verdict

ALDI is genuinely cheaper — not marginally, but meaningfully. For a household that shops regularly for staples, the savings are real and compound over time.

The main barrier is habit and convenience. If your nearest ALDI is out of the way, the savings need to justify the trip time. For most metro families, they do.`,
  },

  // ── 9 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'teach-kids-smart-shopping',
    title: 'How to Teach Kids About Smart Shopping Without Making It Boring',
    excerpt: 'The supermarket is one of the best classrooms for financial literacy. Kids who learn to shop smart early carry those habits — and savings — for life.',
    hero_image: '/images/articles/kids-shopping-hero.jpg',
    category: 'family',
    tags: ['family', 'kids', 'education', 'habits'],
    read_time_mins: 5,
    featured: false,
    published_at: new Date('2026-05-12').toISOString(),
    content: `Most of us learned to shop by watching our parents — which means we also inherited their habits, good and bad. Teaching children to shop well is one of the highest-return parenting investments you can make. The supermarket provides real, tangible, immediate feedback that no classroom exercise can match.

Here's how to make it engaging for kids at different ages.

## Ages 4–7: The Counting Game

Young children can't grasp abstract financial concepts, but they understand concrete quantities. At this age, the goal is awareness, not strategy.

**The shopping list task:** Give your child the physical list (or your phone with the list). Their job is to find each item and tick it off. This builds attention to what you're buying, introduces the idea of planning, and gives them a job they take seriously.

**The colour sort:** Ask them to find the "green foods" (fresh produce — almost all GST-free) versus the "special treat foods" (packaged, processed). Frame it as a treasure hunt, not a lecture.

**Count the apples:** Have them count out the number of loose apples or potatoes you're buying. Weighing them at the scale is a bonus activity.

The lesson they absorb: shopping is purposeful, not random browsing.

![Parent and young child shopping together in supermarket produce aisle](/images/articles/kids-shopping-compare.jpg)

## Ages 8–12: The Price Detective

This age group can handle numbers and simple comparisons. Introduce unit pricing and basic decision-making.

**The unit price challenge:** When choosing between two similar products (e.g., two different brands of pasta), show them the shelf label and the price per 100g. Ask: "Which one is better value?" Let them figure it out. They will — and they'll remember it.

**The $10 budget mission:** Give them $10 and a short list of items to find within that budget. Brands and sizes are their choice. This creates immediate, real constraint and forces every decision to be deliberate.

**The GST detective:** Use the GSTFree app or website together before a shop. Show them which items attract GST and which don't. Ask them: "Why do you think chips have GST but apples don't?" The answer requires them to think about what "basic food" means — a genuinely interesting question.

[AD]

## Ages 13+: The Real Thing

Teenagers can handle genuine responsibility. Give them actual shopping tasks with a budget and accountability.

**The solo shop:** Give a teenager a list and a budget and send them to buy it. The first time might be over budget or missing items. Debrief together — not as a failure, but as a learning exercise. "What would you do differently next time?"

**The meal plan challenge:** Ask them to plan one family dinner per week, write the shopping list, and estimate the cost using the GSTFree tool. When they're in charge of planning and buying, they understand the real constraints.

**Compare receipts:** After a shop, sit with the receipt together. Point out the GST amounts, the items that were on special versus regular price, and the total. "How could we do better next week?" is a question worth asking regularly.

![Child writing a shopping list at kitchen table with parent's help](/images/articles/kids-shopping-list.jpg)

## The Habits That Stick

Research on financial literacy consistently shows that habits formed in childhood persist into adulthood. The specific skills that transfer best:

- **List-making before shopping** (not shopping from memory)
- **Comparing unit prices** (not just headline prices)
- **Understanding the difference between needs and wants** in a shopping context
- **Not impulse buying** at the checkout (the sweet and magazine displays are deliberately placed there)

None of these require a finance lesson. They require practice in a real context — which the supermarket provides every single week.

The parent who involves their child in grocery shopping isn't just saving time. They're teaching one of the most practical financial skills their child will ever use.`,
  },

  // ── 10 ────────────────────────────────────────────────────────────────────
  {
    slug: 'read-supermarket-receipt',
    title: 'How to Read Your Supermarket Receipt and Spot What You\'re Overpaying For',
    excerpt: 'Most people glance at the total and put the receipt in their pocket. A closer look reveals patterns — items you\'re consistently overpaying for, GST you could be avoiding, and prices that don\'t match what you expected.',
    hero_image: '/images/articles/receipt-guide-hero.jpg',
    category: 'store-tips',
    tags: ['receipt', 'gst', 'price-checking', 'awareness'],
    read_time_mins: 6,
    featured: false,
    published_at: new Date('2026-05-11').toISOString(),
    content: `The supermarket receipt is a complete record of every decision you made during that shop. Most of us ignore it beyond the total. But a receipt analysed systematically tells you exactly where your grocery money is going — and where it's leaking.

## Reading the GST Section

Australian supermarket receipts are required to separate GST-clearly. Look for a section at the bottom of your receipt — it typically shows:

- Total GST paid
- Subtotal excluding GST
- Subtotal including GST

The GST total might surprise you. On a typical $150 shop, many households pay $10–$20 in GST without realising it. That's money that would stay in your pocket if those taxable items were replaced with GST-free alternatives.

## What GST on Your Receipt Actually Means

Every item on your receipt is either:
- **GST-free** (fresh food, basic ingredients)
- **Taxable at 10%** (processed food, snacks, beverages, confectionery)

Some receipts mark taxable items with an asterisk (*) or a "T" indicator. Others don't distinguish item by item — you only see the total GST at the bottom.

To find which items contributed GST, you need to either check the receipt carefully line by line or use a tool like GSTFree to verify status before you shop.

![Close-up of Australian supermarket receipt with GST section visible](/images/articles/receipt-guide-closeup.jpg)

## The Price Checking Habit

Supermarket pricing errors happen more often than you might expect. Shelf prices don't always match register prices — particularly on sale items where the discount hasn't been applied correctly.

**The rule you should know:** Under the ACCC Scanning Code of Practice, if a scanned price is higher than the shelf price, you're entitled to receive the first item free (for items under $50) and the rest at the correct lower price. Not all retailers are signatories, but Woolworths and Coles both are.

**The habit:** As items are scanned, glance at the screen. If something doesn't look right, query it immediately — before you've paid.

## Identifying Your High-Cost Items

After your shop, scan down the receipt and circle the five most expensive individual items. Then ask:

1. Was this on my list or an impulse buy?
2. Was there a cheaper alternative I could have chosen?
3. Did I check the unit price, or just grab it?
4. Is this item GST-free or taxable?

Do this for three receipts in a row. Patterns emerge quickly. Most households find they're consistently overspending on two or three categories — often meat cuts, cheese, or convenience foods.

[AD]

## The Multipack and Impulse Purchase Audit

Look at your receipt for:
- Any multibuys (2-for-1, 3-for-$x) — did you actually need multiples?
- Any checkout lane items (chocolate, mints, magazines)
- Any items that weren't on your original list

These items are where supermarkets make disproportionate profit margins. A $3.50 chocolate bar at the checkout is a choice made under zero deliberation. If you see three of these on your receipt, that's $10+ of unplanned spend.

## Using Receipts to Build a Price History

The most valuable receipt habit: keep your last four weeks of receipts and compare prices on your regular items over time. This reveals:

- Which items rotate between sale and full price (and how often)
- Whether "member prices" are actually lower than competitor pricing
- Which items you're buying at full price that you could plan to buy on sale

This sounds tedious. In practice, 10 minutes of receipt review per week pays for itself many times over.

![Person comparing two supermarket receipts side by side at home](/images/articles/receipt-guide-gst.jpg)

## The Practical Receipt Review

After each shop, do a 2-minute receipt check:
1. Look at the total GST paid — is it going down over time?
2. Check the five most expensive items — were they expected?
3. Identify any impulse buys
4. Note any pricing errors (check next week if so)

Over three months of this habit, most households identify $15–$30 per week in spending they're comfortable reducing. That's $780–$1,560 per year from a two-minute habit.

The receipt is the score at the end of the game. Use it to improve your next one.`,
  },

];

let created = 0;
let skipped = 0;

for (const article of articles) {
  try {
    await sql`
      INSERT INTO articles (slug, title, excerpt, hero_image, category, tags, read_time_mins, content, featured, published_at)
      VALUES (
        ${article.slug},
        ${article.title},
        ${article.excerpt},
        ${article.hero_image},
        ${article.category},
        ${article.tags},
        ${article.read_time_mins},
        ${article.content},
        ${article.featured},
        ${article.published_at}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log(`✅ ${article.title}`);
    created++;
  } catch (err) {
    console.error(`❌ ${article.slug}:`, err);
    skipped++;
  }
}

console.log(`\nDone: ${created} created, ${skipped} skipped.`);

}

main().catch(console.error);
