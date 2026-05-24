import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createArticle, updateArticle, deleteArticle } from '@/lib/articles';

async function requireAdmin() {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const body = await request.json();
  if (!body.slug || !body.title || !body.content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await createArticle({
    slug: body.slug,
    title: body.title,
    excerpt: body.excerpt ?? '',
    hero_image: body.hero_image ?? null,
    category: body.category ?? 'store-tips',
    tags: body.tags ?? [],
    read_time_mins: body.read_time_mins ?? 5,
    content: body.content,
    featured: body.featured ?? false,
    published_at: body.published_at ?? new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await updateArticle(body.id, {
    slug: body.slug,
    title: body.title,
    excerpt: body.excerpt,
    hero_image: body.hero_image,
    category: body.category,
    tags: body.tags,
    read_time_mins: body.read_time_mins,
    content: body.content,
    featured: body.featured,
    published_at: body.published_at,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await deleteArticle(id);
  return NextResponse.json({ ok: true });
}
