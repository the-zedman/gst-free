'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ARTICLE_CATEGORIES } from '@/lib/article-constants';

const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>}
      {children}
    </div>
  );
}

function toDateTimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    hero_image: '',
    category: 'store-tips',
    tags: '',
    read_time_mins: '5',
    content: '',
    featured: false,
    published_at: '',
  });

  useEffect(() => {
    fetch(`/api/admin/the-docket/article?id=${id}`)
      .then(r => r.json())
      .then(article => {
        setForm({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          hero_image: article.hero_image ?? '',
          category: article.category,
          tags: (article.tags ?? []).join(', '),
          read_time_mins: String(article.read_time_mins),
          content: article.content,
          featured: article.featured,
          published_at: toDateTimeLocal(article.published_at),
        });
        setLoading(false);
      });
  }, [id]);

  const set = (key: string, value: string | boolean) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/the-docket', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Number(id),
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          read_time_mins: Number(form.read_time_mins),
          published_at: new Date(form.published_at).toISOString(),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push('/admin/the-docket');
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 text-gray-400">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Article</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title">
          <input className={input} value={form.title} onChange={e => set('title', e.target.value)} required />
        </Field>
        <Field label="Slug (URL)">
          <input className={input} value={form.slug} onChange={e => set('slug', e.target.value)} required />
        </Field>
        <Field label="Excerpt">
          <textarea className={`${input} h-20`} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select className={input} value={form.category} onChange={e => set('category', e.target.value)}>
              {ARTICLE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Read time (mins)">
            <input className={input} type="number" min={1} max={60} value={form.read_time_mins} onChange={e => set('read_time_mins', e.target.value)} />
          </Field>
        </div>
        <Field label="Tags (comma-separated)">
          <input className={input} value={form.tags} onChange={e => set('tags', e.target.value)} />
        </Field>
        <Field label="Hero image path">
          <input className={input} value={form.hero_image} onChange={e => set('hero_image', e.target.value)} />
        </Field>
        <Field label="Published at">
          <input className={input} type="datetime-local" value={form.published_at} onChange={e => set('published_at', e.target.value)} />
        </Field>
        <Field label="">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="rounded" />
            Featured article
          </label>
        </Field>
        <Field label="Content (Markdown — use [AD] on its own line to place an ad)">
          <textarea className={`${input} h-96 font-mono text-xs`} value={form.content} onChange={e => set('content', e.target.value)} required />
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
