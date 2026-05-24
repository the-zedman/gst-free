import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://gstfree.com.au';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: 'daily' },
    { url: `${base}/recipes`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${base}/the-docket`, priority: 0.8, changeFrequency: 'daily' },
    { url: `${base}/hidden-grocery-tax`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${base}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${base}/terms`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${base}/contact`, priority: 0.4, changeFrequency: 'yearly' },
    { url: `${base}/support`, priority: 0.4, changeFrequency: 'yearly' },
  ];

  // Items
  const items = await sql`SELECT slug, updated_at FROM items LIMIT 2000`;
  const itemPages: MetadataRoute.Sitemap = (items as { slug: string; updated_at?: string }[]).map(item => ({
    url: `${base}/items/${item.slug}`,
    lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  }));

  // Recipes
  const recipes = await sql`SELECT slug, updated_at FROM recipes WHERE published = true`;
  const recipePages: MetadataRoute.Sitemap = (recipes as { slug: string; updated_at?: string }[]).map(r => ({
    url: `${base}/recipes/${r.slug}`,
    lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  }));

  // Articles
  const articles = await sql`SELECT slug, updated_at FROM articles WHERE published_at <= NOW()`;
  const articlePages: MetadataRoute.Sitemap = (articles as { slug: string; updated_at?: string }[]).map(a => ({
    url: `${base}/the-docket/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }));

  return [...staticPages, ...articlePages, ...recipePages, ...itemPages];
}
