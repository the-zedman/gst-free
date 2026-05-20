import Link from "next/link";
import { PAGE_SIZE } from "@/lib/constants";

interface PaginationProps {
  total: number;
  page: number;
  q: string;
  category: string;
  status: string;
}

export default function Pagination({ total, page, q, category, status }: PaginationProps) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;

  function href(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category !== "all") params.set("category", category);
    if (status !== "all") params.set("status", status);
    if (p > 1) params.set("page", String(p));
    return `/?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ← Prev
        </Link>
      )}
      <span className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={href(page + 1)}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Next →
        </Link>
      )}
    </div>
  );
}
