import 'server-only';
import { sql } from '@/lib/db';

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  hero_image: string | null;
  category: string;
  tags: string[];
  read_time_mins: number;
  content: string;
  featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export { ARTICLE_CATEGORIES } from './article-constants';

export async function getArticles(category?: string): Promise<Article[]> {
  const rows = category && category !== 'all'
    ? await sql`SELECT * FROM articles WHERE published_at <= NOW() AND category = ${category} ORDER BY published_at DESC`
    : await sql`SELECT * FROM articles WHERE published_at <= NOW() ORDER BY published_at DESC`;
  return rows as unknown as Article[];
}

export async function getAllArticles(): Promise<Article[]> {
  const rows = await sql`SELECT * FROM articles ORDER BY published_at DESC`;
  return rows as unknown as Article[];
}

export async function getArticle(slug: string): Promise<Article | null> {
  const rows = await sql`SELECT * FROM articles WHERE slug = ${slug} AND published_at <= NOW() LIMIT 1`;
  return rows.length ? rows[0] as unknown as Article : null;
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const rows = await sql`SELECT * FROM articles WHERE featured = true AND published_at <= NOW() ORDER BY published_at DESC LIMIT 1`;
  return rows.length ? rows[0] as unknown as Article : null;
}

export async function getRelatedArticles(slug: string, category: string, limit = 3): Promise<Article[]> {
  const rows = await sql`
    SELECT * FROM articles
    WHERE slug != ${slug} AND published_at <= NOW()
    ORDER BY (category = ${category}) DESC, published_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as Article[];
}

export async function createArticle(data: Omit<Article, 'id' | 'created_at' | 'updated_at'>) {
  await sql`
    INSERT INTO articles (slug, title, excerpt, hero_image, category, tags, read_time_mins, content, featured, published_at)
    VALUES (${data.slug}, ${data.title}, ${data.excerpt}, ${data.hero_image}, ${data.category},
            ${data.tags}, ${data.read_time_mins}, ${data.content}, ${data.featured}, ${data.published_at})
  `;
}

export async function updateArticle(id: number, data: Partial<Omit<Article, 'id' | 'created_at' | 'updated_at'>>) {
  await sql`
    UPDATE articles SET
      slug = COALESCE(${data.slug ?? null}, slug),
      title = COALESCE(${data.title ?? null}, title),
      excerpt = COALESCE(${data.excerpt ?? null}, excerpt),
      hero_image = ${data.hero_image ?? null},
      category = COALESCE(${data.category ?? null}, category),
      tags = COALESCE(${data.tags ?? null}, tags),
      read_time_mins = COALESCE(${data.read_time_mins ?? null}, read_time_mins),
      content = COALESCE(${data.content ?? null}, content),
      featured = COALESCE(${data.featured ?? null}, featured),
      published_at = COALESCE(${data.published_at ?? null}, published_at),
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteArticle(id: number) {
  await sql`DELETE FROM articles WHERE id = ${id}`;
}

export async function toggleFeatured(id: number, featured: boolean) {
  await sql`UPDATE articles SET featured = ${featured}, updated_at = NOW() WHERE id = ${id}`;
}
