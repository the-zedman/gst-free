import { getAllArticles, deleteArticle, toggleFeatured } from '@/lib/articles';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isPublished(publishedAt: string) {
  return new Date(publishedAt) <= new Date();
}

async function deleteAction(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  await deleteArticle(id);
  revalidatePath('/admin/the-docket');
  revalidatePath('/the-docket');
}

async function toggleFeaturedAction(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  const current = formData.get('featured') === 'true';
  await toggleFeatured(id, !current);
  revalidatePath('/admin/the-docket');
  revalidatePath('/the-docket');
}

export default async function AdminDocketPage() {
  const articles = await getAllArticles();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">The Docket</h1>
          <p className="text-gray-500 text-sm mt-1">{articles.length} articles</p>
        </div>
        <Link
          href="/admin/the-docket/new"
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
        >
          + New article
        </Link>
      </div>

      <div className="space-y-3">
        {articles.map(article => {
          const published = isPublished(article.published_at);
          return (
            <div key={article.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {published ? 'LIVE' : 'SCHEDULED'}
                  </span>
                  {article.featured && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">FEATURED</span>
                  )}
                  <span className="text-xs text-gray-400">{article.category}</span>
                  <span className="text-xs text-gray-400">{article.read_time_mins} min</span>
                  <span className="text-xs text-gray-400">{formatDate(article.published_at)}</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm leading-snug">{article.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{article.excerpt}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/the-docket/${article.slug}`}
                  target="_blank"
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                >
                  View ↗
                </Link>
                <Link
                  href={`/admin/the-docket/${article.id}/edit`}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </Link>
                <form action={toggleFeaturedAction}>
                  <input type="hidden" name="id" value={article.id} />
                  <input type="hidden" name="featured" value={String(article.featured)} />
                  <button type="submit" className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg transition-colors">
                    {article.featured ? 'Unfeature' : 'Feature'}
                  </button>
                </form>
                <form action={deleteAction} onSubmit={(e) => { if (!confirm('Delete this article?')) e.preventDefault(); }}>
                  <input type="hidden" name="id" value={article.id} />
                  <button type="submit" className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
