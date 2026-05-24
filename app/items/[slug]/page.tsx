import { sql } from "@/lib/db";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function GstStatusBanner({ status }: { status: string }) {
  if (status === "GST-free") {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6">
        <span className="text-3xl">✅</span>
        <div>
          <p className="font-bold text-green-800 text-lg">GST-Free</p>
          <p className="text-green-700 text-sm">No GST applies to this item. You pay 0% tax on it.</p>
        </div>
      </div>
    );
  }
  if (status === "taxable") {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-xl px-5 py-4 mb-6">
        <span className="text-3xl">❌</span>
        <div>
          <p className="font-bold text-red-800 text-lg">TAXABLE — +10% GST applies</p>
          <p className="text-red-700 text-sm">This item attracts GST. The price you see includes 10% tax.</p>
        </div>
      </div>
    );
  }
  if (status === "mixed supply") {
    return (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-xl px-5 py-4 mb-6">
        <span className="text-3xl">⚠️</span>
        <div>
          <p className="font-bold text-amber-800 text-lg">Mixed Supply</p>
          <p className="text-amber-700 text-sm">This item contains both GST-free and taxable components. Check the ATO notes below.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-6">
      <span className="text-3xl">ℹ️</span>
      <div>
        <p className="font-bold text-gray-800 text-lg">See Notes</p>
        <p className="text-gray-600 text-sm">GST status depends on the specific circumstances. See the ATO notes below.</p>
      </div>
    </div>
  );
}

export default async function ItemPage({ params }: PageProps) {
  const { slug } = await params;

  const rows = await sql`
    SELECT id, ato_id, name, ato_notes, gst_status, category, slug
    FROM items WHERE slug = ${slug} LIMIT 1
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
        <h1 className="text-xl font-bold text-gray-900 leading-snug mb-4">
          {item.name as string}
        </h1>

        <GstStatusBanner status={item.gst_status as string} />

        <span className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full mb-6 ${colorClass}`}>
          {cat?.emoji} {cat?.label ?? item.category}
        </span>

        <div className="space-y-4 text-sm text-gray-600 mt-4">
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
      <Footer />
    </div>
  );
}
