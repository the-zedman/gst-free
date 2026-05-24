import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { searchItems, CATEGORIES, PAGE_SIZE } from "@/lib/items";
import { lookupBarcode, isBarcode } from "@/lib/barcodes";
import { getRecipes } from "@/lib/recipes";
import type { Recipe } from "@/lib/recipe-types";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import GstStatusFilter from "@/components/GstStatusFilter";
import ItemCard from "@/components/ItemCard";
import Pagination from "@/components/Pagination";
import BarcodeResult from "@/components/BarcodeResult";
import AdSlot from "@/components/AdSlot";
import Footer from "@/components/Footer";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    barcode?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}


const COMING_SOON = [
  {
    icon: "📖",
    title: "Budget Shopping Guide",
    desc: "Practical strategies for building a weekly shop around GST-free staples — without sacrificing nutrition or variety.",
    image: "/images/coming-soon-budget-guide.jpg",
  },
  {
    icon: "🤝",
    title: "Food Support Directory",
    desc: "Find food banks, community pantries, and emergency food relief services near you across Australia.",
    image: "/images/coming-soon-food-support.jpg",
  },
  {
    icon: "🏷️",
    title: "Weekly Specials Tracker",
    desc: "Track which GST-free items are on special at Coles, Woolworths, and Aldi this week.",
    image: "/images/coming-soon-specials.jpg",
  },
];

function pickFeatured(recipes: Recipe[]): Recipe[] {
  const byMeal = (type: Recipe["meal_type"]) => recipes.find((r) => r.meal_type === type);
  return [byMeal("breakfast"), byMeal("lunch"), byMeal("dinner")].filter(
    Boolean
  ) as Recipe[];
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const {
    q = "",
    barcode = "",
    category = "all",
    status = "all",
    page = "1",
  } = await searchParams;

  const isSearching =
    q !== "" || barcode !== "" || category !== "all" || status !== "all";

  // ── Landing page ──────────────────────────────────────────────────────────
  if (!isSearching) {
    const featured = pickFeatured(await getRecipes());

    return (
      <div className="min-h-screen flex flex-col">

        {/* Hero */}
        <section className="relative flex items-center min-h-[580px] sm:min-h-[640px]">
          {/* Full-width background image */}
          <Image
            src="/images/hero-groceries.jpg"
            alt="Fresh Australian groceries"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Very subtle vignette only — let the image pop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Content — frosted glass card so image stays visible */}
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-16">
            <div className="max-w-xl bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full mb-5">
                🇦🇺 For Australian Shoppers
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Save money on every grocery shop
              </h1>
              <p className="text-gray-600 text-lg mb-7 leading-relaxed">
                Search 1,400+ ATO-confirmed GST-free foods and start keeping more
                money in your pocket every week.
              </p>
              <Suspense>
                <SearchBar defaultValue="" />
              </Suspense>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-sm text-gray-500">
                {["ATO-confirmed", "1,400+ items", "Free to use", "Barcode scanner"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="text-green-500 font-bold">✓</span> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ad slot 1 — hero */}
        <div className="max-w-4xl mx-auto w-full px-4 py-4">
          <AdSlot id="ad-hero" />
        </div>

        {/* How it works */}
        <section className="w-full bg-gradient-to-b from-white via-green-50/40 to-white py-16 px-4">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
              <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple · Free · Instant</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Stop overpaying on groceries.<br className="hidden sm:block" /> Here&apos;s how.
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto text-base leading-relaxed">
                Most Australians don&apos;t realise which everyday foods are GST-free — and quietly pay 10% more than they need to. This site fixes that.
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Step 1 */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-base shrink-0">1</div>
                  <h3 className="text-lg font-bold text-gray-900">Search or scan</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Type any food name — or scan a barcode in-store. Works on any phone, no app needed.
                </p>
                {/* Mockup */}
                <div className="bg-gray-50 rounded-xl p-3 mt-auto space-y-2">
                  <div className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 flex items-center gap-2 shadow-sm text-sm">
                    <span className="text-gray-400">🔍</span>
                    <span className="text-gray-700 font-medium">wholemilk</span>
                    <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">or scan barcode</span>
                  </div>
                  <p className="text-[11px] text-gray-400 text-center">1,400+ ATO-confirmed items in our database</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-base shrink-0">2</div>
                  <h3 className="text-lg font-bold text-gray-900">Get an instant verdict</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  A clear result — green means GST-free, red means taxed. No tax law knowledge required.
                </p>
                {/* Mockup */}
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Whole milk</p>
                      <p className="text-[11px] text-gray-400">Fresh dairy</p>
                    </div>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">GST-FREE ✓</span>
                  </div>
                  <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Flavoured milk</p>
                      <p className="text-[11px] text-gray-400">Dairy drinks</p>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">TAXED ✗</span>
                  </div>
                  <p className="text-[11px] text-gray-400 text-center">Subtle differences, big cost over time</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-base shrink-0">3</div>
                  <h3 className="text-lg font-bold text-gray-900">Save every shop</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  GST is 10% on every taxable item. Shift your basket toward GST-free staples and the savings stack up fast.
                </p>
                {/* Savings mockup */}
                <div className="mt-auto space-y-2">
                  <div className="bg-green-600 text-white rounded-xl px-4 py-4 text-center">
                    <p className="text-3xl font-extrabold">$20–$35</p>
                    <p className="text-green-100 text-xs mt-1">saved on a typical $260 weekly shop</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-gray-50 rounded-xl py-3">
                      <p className="text-lg font-bold text-gray-900">$1,500+</p>
                      <p className="text-[11px] text-gray-400">per year, per family</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl py-3">
                      <p className="text-lg font-bold text-gray-900">10%</p>
                      <p className="text-[11px] text-gray-400">GST you avoid paying</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Did you know callout */}
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start">
              <span className="text-2xl shrink-0">💡</span>
              <div>
                <p className="font-semibold text-amber-900 mb-1">Did you know?</p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Basic foods like fresh meat, fruit, vegetables, bread, milk, eggs and most seafood are <strong>completely GST-free</strong> under Australian law — but many shoppers unknowingly buy the taxed version of the same food (e.g. flavoured yoghurt vs plain, or mixed nuts vs unsalted). Small swaps, repeated weekly, add up to hundreds of dollars a year.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Featured Recipes */}
        <section className="bg-green-50 px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  GST-Free Recipes
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Meals made mostly from tax-free ingredients
                </p>
              </div>
              <Link
                href="/recipes"
                className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors whitespace-nowrap"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {featured.map((recipe) => (
                <Link
                  key={recipe.slug}
                  href={`/recipes/${recipe.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-green-100 min-w-0"
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {recipe.image_path ? (
                      <Image
                        src={recipe.image_path}
                        alt={recipe.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1 capitalize">
                      {recipe.meal_type}
                    </p>
                    <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors leading-snug">
                      {recipe.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Ad slot 2 — mid */}
        <div className="max-w-4xl mx-auto w-full px-4 py-4">
          <AdSlot id="ad-mid" />
        </div>

        {/* Coming soon */}
        <section className="max-w-5xl mx-auto w-full px-4 py-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              More ways to save
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              New tools and guides coming soon
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {COMING_SOON.map(({ icon, title, desc, image }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm min-w-0"
              >
                <div className="relative aspect-[16/9] bg-gray-100">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-5 relative">
                  <span className="absolute top-4 right-4 text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                  <div className="text-2xl mb-2">{icon}</div>
                  <h3 className="font-semibold text-gray-700 mb-1 pr-20">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ad slot 3 — pre-footer */}
        <div className="max-w-4xl mx-auto w-full px-4 py-4">
          <AdSlot id="ad-prefooter" />
        </div>

        <Footer />
      </div>
    );
  }

  // ── Search / barcode mode ─────────────────────────────────────────────────
  const inBarcodeMode = isBarcode(barcode);
  const barcodeProduct = inBarcodeMode ? await lookupBarcode(barcode) : null;
  const currentPage = Math.max(1, parseInt(page) || 1);
  const { items, total } = inBarcodeMode
    ? { items: [], total: 0 }
    : await searchItems(q, category, status, currentPage);

  const catLabel =
    CATEGORIES.find((c) => c.value === category)?.label ?? "All Items";
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="min-h-screen flex flex-col">

      {/* Compact search header */}
      <section className="bg-gradient-to-b from-green-50 to-white px-4 pt-6 pb-6">
        <div className="max-w-3xl mx-auto">
          <Suspense>
            <SearchBar defaultValue={inBarcodeMode ? barcode : q} />
          </Suspense>
        </div>
      </section>

      {inBarcodeMode ? (
        <section className="flex-1 max-w-6xl mx-auto w-full px-4 pb-12">
          <BarcodeResult product={barcodeProduct} barcode={barcode} />
        </section>
      ) : (
        <section className="flex-1 max-w-6xl mx-auto w-full px-4 pb-12">
          <div className="pt-4 pb-2">
            <Suspense>
              <GstStatusFilter active={status} />
            </Suspense>
          </div>
          <div className="pb-4">
            <Suspense>
              <CategoryFilter active={category} />
            </Suspense>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {total === 0 ? (
                "No items found"
              ) : (
                <>
                  <span className="font-semibold text-gray-800">
                    {total.toLocaleString()}
                  </span>{" "}
                  {q ? (
                    <>
                      results for{" "}
                      <span className="font-semibold text-green-700">
                        &ldquo;{q}&rdquo;
                      </span>
                    </>
                  ) : (
                    <>{catLabel}</>
                  )}
                  {total > PAGE_SIZE && (
                    <span className="text-gray-400">
                      {" "}
                      · showing {start}–{end}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {items.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 text-lg font-medium">No items found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try a different search term or adjust the filters
              </p>
            </div>
          )}

          {items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <Pagination
            total={total}
            page={currentPage}
            q={q}
            category={category}
            status={status}
          />
        </section>
      )}

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 px-4">
        GST status sourced from the{" "}
        <span className="font-medium">ATO Detailed Food List</span>. Always
        verify with your supermarket receipt. Not financial or legal advice.
      </footer>
    </div>
  );
}
