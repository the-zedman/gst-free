import { getArticle, getRelatedArticles, ARTICLE_CATEGORIES } from '@/lib/articles';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AdSlot from '@/components/AdSlot';
import Footer from '@/components/Footer';
import ShareButtons from './ShareButtons';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} | The Docket — GSTFree`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.hero_image ? [article.hero_image] : [],
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  'rewards':       'bg-purple-100 text-purple-700',
  'gst-guide':     'bg-green-100 text-green-700',
  'meal-planning': 'bg-orange-100 text-orange-700',
  'store-tips':    'bg-blue-100 text-blue-700',
  'family':        'bg-pink-100 text-pink-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function splitOnAd(content: string): string[] {
  return content.split('\n[AD]\n');
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [article, related] = await Promise.all([
    getArticle(slug),
    getArticle(slug).then(a => a ? getRelatedArticles(slug, a.category) : []),
  ]);

  if (!article) notFound();

  const catLabel = ARTICLE_CATEGORIES.find(c => c.value === article.category)?.label ?? article.category;
  const sections = splitOnAd(article.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    image: article.hero_image ? `https://gstfree.com.au${article.hero_image}` : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'GSTFree',
      url: 'https://gstfree.com.au',
    },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/the-docket" className="text-sm text-green-600 hover:underline mb-6 inline-block">
        ← The Docket
      </Link>

      {/* Hero image */}
      {article.hero_image && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-6">
          <Image
            src={article.hero_image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 672px) 100vw, 672px"
            priority
          />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[article.category] ?? 'bg-gray-100 text-gray-600'}`}>
          {catLabel}
        </span>
        <span className="text-xs text-gray-400">{article.read_time_mins} min read</span>
        <span className="text-xs text-gray-400">{formatDate(article.published_at)}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-4">{article.title}</h1>
      <p className="text-gray-500 leading-relaxed mb-8 text-sm">{article.excerpt}</p>

      {/* Article content with ads injected between sections */}
      <div className="prose prose-sm prose-gray max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
        prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
        prose-ul:text-gray-600 prose-li:mb-1
        prose-ol:text-gray-600
        prose-strong:text-gray-800
        prose-a:text-green-700 prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-green-400 prose-blockquote:bg-green-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1
        prose-img:rounded-xl prose-img:shadow-sm
        prose-table:text-sm prose-th:bg-gray-50 prose-td:border-gray-200 prose-th:border-gray-200">
        {sections.map((section, i) => (
          <div key={i}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ src, alt }) => typeof src === 'string' ? (
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden my-6 not-prose">
                    <Image src={src} alt={alt ?? ''} fill className="object-cover" sizes="(max-width: 672px) 100vw, 672px" />
                  </div>
                ) : null,
              }}
            >
              {section}
            </ReactMarkdown>
            {i < sections.length - 1 && (
              <div className="not-prose my-8">
                <AdSlot id={i === 0 ? 'docket-article-mid' : 'docket-article-bottom'} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Newsletter CTA */}
      <div className="my-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <p className="text-lg font-bold text-green-800 mb-1">Get more tips like this</p>
        <p className="text-sm text-green-700 mb-4">Join thousands of Australians saving money at the supermarket every week.</p>
        <div className="flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-2 rounded-full border border-green-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 transition-colors">
            Subscribe
          </button>
        </div>
        <p className="text-xs text-green-600 mt-2">Free. No spam. Unsubscribe anytime.</p>
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      <ShareButtons title={article.title} slug={article.slug} />

      {/* Related articles */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">More from The Docket</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(rel => (
              <Link
                key={rel.slug}
                href={`/the-docket/${rel.slug}`}
                className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {rel.hero_image && (
                  <div className="relative aspect-[16/9] bg-gray-100">
                    <Image
                      src={rel.hero_image}
                      alt={rel.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 672px) 100vw, 224px"
                    />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-1">{rel.read_time_mins} min read</p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                    {rel.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
