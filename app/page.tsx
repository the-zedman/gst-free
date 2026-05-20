import { Suspense } from "react";
import { searchItems, CATEGORIES, PAGE_SIZE } from "@/lib/items";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import GstStatusFilter from "@/components/GstStatusFilter";
import ItemCard from "@/components/ItemCard";
import Pagination from "@/components/Pagination";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const {
    q = "",
    category = "all",
    status = "all",
    page = "1",
  } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);

  const { items, total } = await searchItems(q, category, status, currentPage);

  const catLabel =
    CATEGORIES.find((c) => c.value === category)?.label ?? "All Items";
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-green-50 to-white px-4 pt-10 pb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Find GST‑Free Foods
          </h1>
          <p className="text-gray-500 mb-6 text-base sm:text-lg">
            Save up to 10% on your grocery bill — 1,400+ items from the ATO
          </p>
          <Suspense>
            <SearchBar defaultValue={q} />
          </Suspense>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="flex-1 max-w-6xl mx-auto w-full px-4 pb-12">
        {/* GST status filter */}
        <div className="pt-4 pb-2">
          <Suspense>
            <GstStatusFilter active={status} />
          </Suspense>
        </div>

        {/* Category filter */}
        <div className="pb-4">
          <Suspense>
            <CategoryFilter active={category} />
          </Suspense>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {total === 0 ? (
              "No items found"
            ) : (
              <>
                <span className="font-semibold text-gray-800">
                  {total.toLocaleString()}
                </span>{" "}
                {q ? (
                  <>
                    results for{" "}
                    <span className="font-semibold text-green-700">"{q}"</span>
                  </>
                ) : (
                  <>{catLabel}</>
                )}
                {total > PAGE_SIZE && (
                  <span className="text-gray-400">
                    {" "}
                    · showing {start}–{end}
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 text-lg font-medium">No items found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try a different search term or adjust the filters
            </p>
          </div>
        )}

        {/* Results grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <Pagination
          total={total}
          page={currentPage}
          q={q}
          category={category}
          status={status}
        />
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 px-4">
        GST status sourced from the{" "}
        <span className="font-medium">ATO Detailed Food List</span>. Always
        verify with your supermarket receipt. Not financial or legal advice.
      </footer>
    </div>
  );
}
