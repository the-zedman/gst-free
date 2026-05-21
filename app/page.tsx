import { Suspense } from "react";
import { searchItems, CATEGORIES, PAGE_SIZE } from "@/lib/items";
import { lookupBarcode, isBarcode } from "@/lib/barcodes";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import GstStatusFilter from "@/components/GstStatusFilter";
import ItemCard from "@/components/ItemCard";
import Pagination from "@/components/Pagination";
import BarcodeResult from "@/components/BarcodeResult";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    barcode?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const {
    q = "",
    barcode = "",
    category = "all",
    status = "all",
    page = "1",
  } = await searchParams;

  const inBarcodeMode = isBarcode(barcode);
  const barcodeProduct = inBarcodeMode ? await lookupBarcode(barcode) : null;

  const currentPage = Math.max(1, parseInt(page) || 1);
  const { items, total } = inBarcodeMode
    ? { items: [], total: 0 }
    : await searchItems(q, category, status, currentPage);

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
            Search 1,400+ ATO items by name — or enter a product barcode
          </p>
          <Suspense>
            <SearchBar defaultValue={inBarcodeMode ? barcode : q} />
          </Suspense>
        </div>
      </section>

      {/* Barcode mode */}
      {inBarcodeMode ? (
        <section className="flex-1 max-w-6xl mx-auto w-full px-4 pb-12">
          <BarcodeResult product={barcodeProduct} barcode={barcode} />
        </section>
      ) : (
        /* Search/filter mode */
        <section className="flex-1 max-w-6xl mx-auto w-full px-4 pb-12">
          <div className="pt-4 pb-2">
            <Suspense>
              <GstStatusFilter active={status} />
            </Suspense>
          </div>

          <div className="pb-4">
            <Suspense>
              <CategoryFilter active={category} />
            </Suspense>
          </div>

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
                      <span className="font-semibold text-green-700">
                        &ldquo;{q}&rdquo;
                      </span>
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

          {items.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 text-lg font-medium">No items found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try a different search term or adjust the filters
              </p>
            </div>
          )}

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
      )}

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 px-4">
        GST status sourced from the{" "}
        <span className="font-medium">ATO Detailed Food List</span>. Always
        verify with your supermarket receipt. Not financial or legal advice.
      </footer>
    </div>
  );
}
