"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GST_STATUS_FILTERS } from "@/lib/constants";

interface GstStatusFilterProps {
  active: string;
}

export default function GstStatusFilter({ active }: GstStatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      {GST_STATUS_FILTERS.map((f) => {
        const isActive = active === f.value || (f.value === "all" && !active);
        const isGstFree = f.value === "gst-free";
        const isTaxable = f.value === "taxable";

        return (
          <button
            key={f.value}
            onClick={() => handleClick(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
              isActive
                ? isGstFree
                  ? "bg-green-600 text-white border-green-600"
                  : isTaxable
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-gray-800 text-white border-gray-800"
                : isGstFree
                ? "border-green-300 text-green-700 hover:bg-green-50"
                : isTaxable
                ? "border-red-300 text-red-700 hover:bg-red-50"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
