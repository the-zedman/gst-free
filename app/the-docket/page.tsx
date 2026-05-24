import { getArticles, getFeaturedArticle, ARTICLE_CATEGORIES } from '@/lib/articles';
import Link from 'next/link';
import Image from 'next/image';
import AdSlot from '@/components/AdSlot';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Docket — Smart Grocery Tips & Savings Guides | GSTFree',
  description: 'Practical money-saving guides for Australian shoppers. Loyalty rewards, GST traps, meal planning, supermarket tricks and more.',
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

const CATEGORY_COLORS: Record<string, string> = {
  'rewards':       'bg-purple-100 text-purple-700',
  'gst-guide':     'bg-green-100 text-green-700',
  'meal-planning': 'bg-orange-100 text-orange-700',
  'store-tips':    'bg-blue-100 text-blue-700',
  'family':        'bg-pink-100 text-pink-700',
};

export default async function DocketPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const [featured, articles] = await Promise.all([
    getFeaturedArticle(),
    getArticles(category),
  ]);

  const activeCategory = category ?? 'all';
  const displayArticles = featured && activeCategory === 'all'
    ? articles.filter(a => a.slug !== featured.slug)
    : articles;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">The Docket</h1>
        <p className="text-gray-500 text-sm">
          Practical guides for spending less at the supermarket — without sacrificing anything.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        <Link
          href="/the-docket"
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Articles
        </Link>
        {ARTICLE_CATEGORIES.map(cat => (
          <Link
            key={cat.value}
            href={`/the-docket?category=${cat.value}`}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.value ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Featured article hero */}
      {featured && activeCategory === 'all' && (
        <Link href={`/the-docket/${featured.slug}`} className="group block mb-10">
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[2/1]">
            {featured.hero_image && (
              <Image
                src={featured.hero_image}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[featured.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {ARTICLE_CATEGORIES.find(c => c.value === featured.category)?.label ?? featured.category}
                </span>
                <span className="text-white/70 text-xs">{featured.read_time_mins} min read</span>
              </div>
              <h2 className="text-2xl font-bold text-white leading-snug mb-2 group-hover:text-green-300 transition-colors">
                {featured.title}
              </h2>
              <p className="text-white/80 text-sm line-clamp-2">{featured.excerpt}</p>
            </div>
            <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Featured
            </div>
          </div>
        </Link>
      )}

      <AdSlot id="docket-top" className="mb-8" />

      {/* Article grid */}
      {displayArticles.length === 0 ? (
        <p className="text-gray-500 text-sm py-12 text-center">No articles in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArticles.map(article => (
            <Link
              key={article.slug}
              href={`/the-docket/${article.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[16/9] bg-gray-100">
                {article.hero_image ? (
                  <Image
                    src={article.hero_image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl text-gray-300">📰</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[article.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {ARTICLE_CATEGORIES.find(c => c.value === article.category)?.label ?? article.category}
                  </span>
                  <span className="text-xs text-gray-400">{article.read_time_mins} min</span>
                </div>
                <h2 className="font-semibold text-gray-900 leading-snug mb-1 group-hover:text-green-700 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{article.excerpt}</p>
                <p className="text-xs text-gray-400">{formatDate(article.published_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <AdSlot id="docket-bottom" className="mt-10" />
      <Footer />
    </div>
  );
}
