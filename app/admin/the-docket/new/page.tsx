'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ARTICLE_CATEGORIES } from '@/lib/article-constants';

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function NewArticlePage() {
  const router = useRouter();
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
    published_at: new Date().toISOString().slice(0, 16),
  });

  const set = (key: string, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: f.slug || slugify(title) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/the-docket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">New Article</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title">
          <input className={input} value={form.title} onChange={e => handleTitleChange(e.target.value)} required />
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
          <input className={input} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="gst, savings, woolworths" />
        </Field>
        <Field label="Hero image path">
          <input className={input} value={form.hero_image} onChange={e => set('hero_image', e.target.value)} placeholder="/images/articles/my-article-hero.jpg" />
        </Field>
        <Field label="Published at">
          <input className={input} type="datetime-local" value={form.published_at} onChange={e => set('published_at', e.target.value)} />
        </Field>
        <Field label="">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="rounded" />
            Featured article (shown as hero on listing page)
          </label>
        </Field>
        <Field label="Content (Markdown — use [AD] on its own line to place an ad)">
          <textarea className={`${input} h-96 font-mono text-xs`} value={form.content} onChange={e => set('content', e.target.value)} required />
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Publish article'}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>}
      {children}
    </div>
  );
}

const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400';
