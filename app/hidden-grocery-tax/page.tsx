import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Australia's Hidden Grocery Tax | GST Free",
  description:
    "The average Australian family pays over $1,500 a year in GST on groceries without realising it. Learn which foods are taxed, who's hit hardest, and how to shop smarter.",
};

// ── Charts ───────────────────────────────────────────────────────────────────

function BasketBarChart() {
  return (
    <div className="w-full">
      <div className="flex rounded-xl overflow-hidden h-10 text-white text-sm font-bold shadow-sm">
        <div className="bg-green-600 flex items-center justify-center gap-1.5" style={{ width: "62%" }}>
          <span className="text-base">✓</span> 62% GST-Free
        </div>
        <div className="bg-red-600 flex items-center justify-center gap-1.5" style={{ width: "38%" }}>
          38% Taxed
        </div>
      </div>
      <div className="flex justify-between mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-600 inline-block shrink-0" />
          Fresh staples — fruit, veg, meat, bread, milk
        </span>
        <span className="flex items-center gap-1.5 text-right">
          Snacks, drinks, ready meals, household items
          <span className="w-3 h-3 rounded-sm bg-red-600 inline-block shrink-0" />
        </span>
      </div>
    </div>
  );
}

function BurdenBarChart() {
  const groups = [
    { label: "Family of four", weekly: 28, annual: 1456, color: "#dc2626" },
    { label: "Couple", weekly: 18, annual: 936, color: "#f97316" },
    { label: "Single parent", weekly: 16, annual: 832, color: "#eab308" },
    { label: "Retiree couple", weekly: 14, annual: 728, color: "#3b82f6" },
    { label: "Single person", weekly: 10, annual: 520, color: "#8b5cf6" },
  ];
  const maxAnnual = 1456;
  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <div key={g.label}>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span className="font-medium">{g.label}</span>
            <span className="font-bold" style={{ color: g.color }}>${g.annual.toLocaleString()}/yr (${g.weekly}/wk)</span>
          </div>
          <div className="bg-gray-100 rounded-full h-3">
            <div className="h-3 rounded-full" style={{ width: `${(g.annual / maxAnnual) * 100}%`, backgroundColor: g.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function InflationChart() {
  const data = [
    { year: "2022", cpi: 3.8 },
    { year: "2023", cpi: 7.8 },
    { year: "2024", cpi: 5.4 },
    { year: "2025", cpi: 4.1 },
    { year: "2026", cpi: 3.8 },
  ];
  const max = 10;
  const chartH = 100;
  const chartW = 280;
  const pad = 30;
  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (chartW - pad * 2),
    y: chartH - (d.cpi / max) * chartH,
    ...d,
  }));
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full">
      <rect x={pad} y={chartH - (3 / max) * chartH} width={chartW - pad * 2} height={(1 / max) * chartH} fill="#bbf7d0" opacity="0.6" />
      <text x={chartW - pad + 2} y={chartH - (3 / max) * chartH + 4} fill="#16a34a" fontSize="7">RBA target</text>
      {[2, 4, 6, 8].map((v) => (
        <line key={v} x1={pad} y1={chartH - (v / max) * chartH} x2={chartW - pad} y2={chartH - (v / max) * chartH} stroke="#e5e7eb" strokeWidth="1" />
      ))}
      <polyline points={polyline} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinejoin="round" />
      {points.map((p) => (
        <g key={p.year}>
          <circle cx={p.x} cy={p.y} r="4" fill="#dc2626" />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#374151" fontSize="8" fontWeight="bold">{p.cpi}%</text>
          <text x={p.x} y={chartH + 14} textAnchor="middle" fill="#6b7280" fontSize="8">{p.year}</text>
        </g>
      ))}
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <text key={v} x={pad - 4} y={chartH - (v / max) * chartH + 3} textAnchor="end" fill="#9ca3af" fontSize="7">{v}%</text>
      ))}
    </svg>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ value, label, sub, color = "green" }: { value: string; label: string; sub?: string; color?: "green" | "red" | "amber" | "blue" }) {
  const colors = {
    green: "bg-green-700",
    red: "bg-red-700",
    amber: "bg-amber-600",
    blue: "bg-blue-700",
  };
  return (
    <div className={`${colors[color]} text-white rounded-2xl p-6 text-center`}>
      <p className="text-4xl font-extrabold leading-none mb-2">{value}</p>
      <p className="text-sm font-semibold text-white/95">{label}</p>
      {sub && <p className="text-xs text-white/80 mt-1">{sub}</p>}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HiddenGroceryTaxPage() {
  return (
    <main className="min-h-screen">

      {/* Hero */}
      <section className="relative bg-gray-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image src="/images/gst-family-shopping.jpg" alt="Australian family grocery shopping" fill className="object-cover" priority />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/80 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            🇦🇺 Australian Cost-of-Living Crisis
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
            Australia&apos;s Hidden<br />Grocery Tax
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
            The average Australian family quietly pays over <strong className="text-white">$1,500 every year</strong> in GST on their grocery bill — on top of record inflation, rising rents, and soaring energy bills. Most don&apos;t even know which items are taxed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl text-base transition-colors"
          >
            Check if your food is GST-free →
          </Link>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">

        {/* Key stats */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">The numbers that don&apos;t lie</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard value="$28" label="GST paid per week" sub="typical family of four" color="red" />
            <StatCard value="$1,500" label="GST per year" sub="on groceries alone" color="red" />
            <StatCard value="38%" label="of a typical basket" sub="is GST-taxable" color="amber" />
            <StatCard value="3.8%" label="Food CPI in 2026" sub="above RBA target" color="blue" />
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">Sources: Finder Consumer Sentiment Tracker Mar 2026 · Canstar Blue Jul 2025 · ABS Living Cost Indexes 2025–26</p>
        </section>

        {/* What's GST-free and what's not */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What&apos;s taxed — and what&apos;s not</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Under Australian law, basic unprocessed foods are GST-free. But the line between &ldquo;basic&rdquo; and &ldquo;processed&rdquo; isn&apos;t always obvious — and it can catch shoppers off guard. Very similar products are often treated completely differently by the tax rules.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-bold text-green-800 mb-2">✓ GST-Free</p>
                  <ul className="space-y-1 text-green-700">
                    <li>Fresh fruit &amp; vegetables</li>
                    <li>Fresh meat &amp; seafood</li>
                    <li>Bread &amp; bread rolls</li>
                    <li>Milk &amp; plain dairy</li>
                    <li>Eggs</li>
                    <li>Rice &amp; pasta</li>
                    <li>Tea &amp; coffee</li>
                    <li>Cooking oils</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-bold text-red-800 mb-2">✗ Taxed (10% GST)</p>
                  <ul className="space-y-1 text-red-700">
                    <li>Biscuits &amp; snacks</li>
                    <li>Soft drinks &amp; juice</li>
                    <li>Flavoured milk drinks</li>
                    <li>Ice cream &amp; confectionery</li>
                    <li>Ready meals</li>
                    <li>Chips &amp; crisps</li>
                    <li>Sauces &amp; condiments</li>
                    <li>Cleaning &amp; toiletries</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Source: <a href="https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/in-detail/your-industry/food/gst-and-food" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">ATO GST and Food Guidelines</a></p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-5">Typical weekly basket breakdown</h3>
              <BasketBarChart />
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                Around <strong>38%</strong> of a typical family&apos;s weekly shop attracts GST — processed foods, snacks, drinks, and household products. That&apos;s the portion costing you an extra 10% every single week.
              </p>
            </div>
          </div>
        </section>

        {/* The GST burden is not equal */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not everyone pays the same</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            A flat 10% GST hits families on lower incomes harder. Families with children, single parents, and retirees on fixed incomes spend a bigger slice of their earnings on food — so they feel the impact of grocery GST more than anyone. Put simply: the less you earn, the bigger a share of your income disappears in GST.
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5">Estimated annual GST paid on groceries, by household type</h3>
            <BurdenBarChart />
            <p className="text-xs text-gray-400 mt-4">Estimates based on household grocery spend data from Finder Mar 2026, Canstar Blue Jul 2025, and ABS Household Expenditure Survey. GST calculated at 38% taxable basket share × 10%.</p>
          </div>
        </section>

        {/* Image — pensioner */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image src="/images/gst-pensioner-checkout.jpg" alt="Elderly Australian reviewing her supermarket receipt" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Retirees and pensioners hit hardest</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Australia&apos;s pensioners and benefit recipients have seen <strong>some of the biggest rises in living costs of any group</strong> — up to 4.2% in a single year — according to ABS figures. When your income stays fixed but prices keep climbing, every extra dollar at the checkout hurts.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              A retired couple spending $280 per week on groceries could be paying <strong>up to $14 a week</strong> — over $728 a year — purely in GST. That&apos;s money that could cover a power bill, a doctor&apos;s gap payment, or just a little breathing room.
            </p>
            <blockquote className="border-l-4 border-red-400 pl-4 text-gray-500 italic text-sm">
              &ldquo;Pensioner and beneficiary households recorded the largest annual living cost increases among all household types.&rdquo;
              <footer className="mt-1 text-xs not-italic"><a href="https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/selected-living-cost-indexes-australia/latest-release" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">ABS Selected Living Cost Indexes, 2025–26</a></footer>
            </blockquote>
          </div>
        </section>

        {/* Inflation context */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rising prices make it even harder</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Australia&apos;s food prices surged <strong>7.8% in 2023</strong> — the sharpest rise in a generation — and while the pace has slowed, prices are still going up faster than the Reserve Bank&apos;s target. When grocery bills are already high and climbing, paying an extra 10% in tax on top pushes budgets to the edge.
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Food price increases (CPI), Australia 2022–2026</h3>
            <InflationChart />
            <p className="text-xs text-gray-400 mt-3">Source: <a href="https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/latest-release" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">ABS Consumer Price Index, Australia</a> · RBA target band: 2–3%</p>
          </div>
        </section>

        {/* Single parent image */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Single parents: the tightest squeeze</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Single parents face one of the hardest grocery challenges: one income, one or more children to feed, and very little room for unexpected costs. Weekly grocery spending for a single-parent household often sits at $150–$200, with GST quietly adding <strong>$8–$12 a week</strong> — more than $500 a year — on top of that.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Research confirms that single parents are among the groups who feel cost-of-living pressures most sharply — and who have the least ability to absorb price rises.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Knowing which everyday foods are GST-free — and making some simple swaps — can make a real difference to the weekly shop without changing what you eat.
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden order-1 md:order-2">
            <Image src="/images/gst-single-parent.jpg" alt="Single mother grocery shopping with her child" fill className="object-cover" />
          </div>
        </section>

        {/* Subtle swaps section */}
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">The GST trap: items that look the same but aren&apos;t</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            One of the most frustrating things about Australia&apos;s GST food rules is that very similar products can be taxed or tax-free depending on small differences in how they&apos;re made. Most shoppers would never pick this up without a guide — which is exactly why this site exists.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { free: "Plain rolled oats", taxed: "Flavoured instant oats", why: "Processing & added flavouring" },
              { free: "Whole milk", taxed: "Flavoured milk drink", why: "Added flavouring" },
              { free: "Plain yoghurt", taxed: "Flavoured fruit yoghurt", why: "Added sugar & flavour" },
              { free: "Unsalted nuts", taxed: "Roasted salted nuts", why: "Extra processing" },
              { free: "Fresh bread", taxed: "Flavoured croutons", why: "Further processing" },
              { free: "Plain water", taxed: "Flavoured mineral water", why: "Added flavouring" },
            ].map(({ free, taxed, why }) => (
              <div key={free} className="bg-white rounded-xl border border-amber-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">GST-Free</span>
                  <span className="text-gray-800 font-medium">{free}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">Taxed</span>
                  <span className="text-gray-800 font-medium">{taxed}</span>
                </div>
                <p className="text-xs text-gray-400">Why: {why}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">Source: <a href="https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/in-detail/your-industry/food/gst-and-food" target="_blank" rel="noopener noreferrer" className="underline">ATO GST and Food guidelines</a></p>
        </section>

        {/* Family shopping image + how GSTFree helps */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image src="/images/gst-family-shopping.jpg" alt="Family comparing products at a supermarket" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How GST Free puts money back in your pocket</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The real problem isn&apos;t just the tax itself — it&apos;s that most families have no easy way to know which items are taxed and which aren&apos;t. Without that knowledge, you end up paying more than you need to, every single week.
            </p>
            <ul className="space-y-3">
              {[
                { icon: "🔍", text: "Search 1,400+ ATO-confirmed GST-free foods instantly" },
                { icon: "📱", text: "Scan barcodes in-store for an instant GST result" },
                { icon: "🛒", text: "Build your shop around GST-free staples and watch your bill drop" },
                { icon: "💡", text: "Learn the easy swaps that save real money every week" },
                { icon: "🆓", text: "Completely free — no account, no app, no catch" },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="text-xl shrink-0">{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-green-600 text-white rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Stop paying more than you have to</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Every dollar of GST you avoid paying is a dollar back in your pocket. Start shopping smarter today — it takes seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-3 rounded-xl text-base transition-colors">
              Search GST-Free Foods
            </Link>
            <Link href="/recipes" className="border-2 border-white/60 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl text-base transition-colors">
              Browse GST-Free Recipes
            </Link>
          </div>
        </section>

        {/* Citations */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sources &amp; citations</h2>
          <ol className="space-y-2 text-sm text-gray-600">
            {[
              { text: "Finder Consumer Sentiment Tracker — Grocery Spending by Household Type (March 2026)", href: "https://www.finder.com.au/finder-consumer-sentiment-tracker" },
              { text: "Canstar Blue — How Much Do Australians Spend on Groceries? (July 2025)", href: "https://www.canstarblue.com.au/groceries/average-grocery-bill/" },
              { text: "Australian Bureau of Statistics — Selected Living Cost Indexes, Australia (2025–26)", href: "https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/selected-living-cost-indexes-australia/latest-release" },
              { text: "Australian Bureau of Statistics — Consumer Price Index, Australia (2025–26)", href: "https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/latest-release" },
              { text: "Australian Taxation Office — GST and Food: Which foods are GST-free?", href: "https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/in-detail/your-industry/food/gst-and-food" },
              { text: "A New Tax System (Goods and Services Tax) Act 1999 — Schedule 2 (GST-free food)", href: "https://www.legislation.gov.au/Series/C2004A00446" },
              { text: "Reserve Bank of Australia — Statement on Monetary Policy: Inflation and Outlook (2026)", href: "https://www.rba.gov.au/publications/smp/" },
              { text: "Grattan Institute — Faces of Poverty: Living Standards in Australia (2025)", href: "https://grattan.edu.au/" },
              { text: "SBS News — Cost of Living: Australian Families Struggle as Inflation Stays Elevated (2026)", href: "https://www.sbs.com.au/news/topic/cost-of-living" },
              { text: "The Guardian Australia — Grocery Bills and the Cost-of-Living Crisis (2025–26)", href: "https://www.theguardian.com/australia-news/cost-of-living" },
            ].map(({ text, href }, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gray-400 shrink-0">{i + 1}.</span>
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">{text}</a>
              </li>
            ))}
          </ol>
          <p className="text-xs text-gray-400 mt-4">
            Data is based on 2025–early 2026 surveys and ABS indexes. Actual household spending varies by state, family size, and dietary preferences. GST estimates assume ~38% of a typical basket is taxable at 10%.
          </p>
        </section>

      </div>
    </main>
  );
}
