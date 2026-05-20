import { sql } from "@/lib/db";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ItemPage({ params }: PageProps) {
  const { slug } = await params;

  const rows = await sql`
    SELECT id, ato_id, name, ato_notes, category, slug
    FROM items
    WHERE slug = ${slug}
    LIMIT 1
  `;

  if (rows.length === 0) notFound();

  const item = rows[0];
  const cat = CATEGORIES.find((c) => c.value === item.category);
  const colorClass = CATEGORY_COLORS[item.category as string] ?? CATEGORY_COLORS.other;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-green-600 hover:underline mb-6 inline-block">
        ← Back to search
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-gray-900 leading-snug">{item.name as string}</h1>
          <span className="shrink-0 text-green-600 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full border border-green-100">
            GST‑Free ✓
          </span>
        </div>

        <span className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full mb-6 ${colorClass}`}>
          {cat?.emoji} {cat?.label ?? item.category}
        </span>

        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              ATO Reference
            </p>
            <p className="font-mono text-gray-700">#{item.ato_id as string}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              ATO Notes
            </p>
            <p className="text-gray-600 leading-relaxed">{item.ato_notes as string}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
