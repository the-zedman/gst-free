"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, type CategoryValue } from "@/lib/items";

interface CategoryFilterProps {
  active: string;
}

export default function CategoryFilter({ active }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.value || (cat.value === "all" && active === "all");
        return (
          <button
            key={cat.value}
            onClick={() => handleClick(cat.value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap snap-start shrink-0 transition-all ${
              isActive
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
