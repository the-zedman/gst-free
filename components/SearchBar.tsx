"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const BARCODE_RE = /^\d{8,14}$/;

interface SearchBarProps {
  defaultValue?: string;
}

export default function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isBarcode = BARCODE_RE.test(value.trim());

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const navigate = useCallback(
    (raw: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = raw.trim();

      if (BARCODE_RE.test(trimmed)) {
        params.delete("q");
        params.delete("category");
        params.delete("status");
        params.delete("page");
        params.set("barcode", trimmed);
      } else {
        params.delete("barcode");
        params.delete("page");
        if (trimmed) {
          params.set("q", trimmed);
        } else {
          params.delete("q");
        }
      }

      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setValue(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigate(q), 350);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate(value);
  }

  function handleClear() {
    setValue("");
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate("");
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <span className="absolute left-4 text-gray-400 pointer-events-none text-lg select-none">
          {isBarcode ? "▌▌▌" : "🔍"}
        </span>
        <input
          type="search"
          value={value}
          onChange={handleChange}
          placeholder="Search foods — or type/paste a barcode number"
          autoComplete="off"
          inputMode="text"
          className={`w-full pl-12 pr-12 py-3.5 text-base rounded-2xl border-2 focus:outline-none shadow-sm bg-white placeholder:text-gray-400 transition-colors font-${isBarcode ? "mono" : "sans"} ${
            isBarcode
              ? "border-blue-300 focus:border-blue-500"
              : "border-green-200 focus:border-green-500"
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      {isBarcode && (
        <p className="text-xs text-center text-blue-500 mt-1.5 font-medium">
          Barcode detected — press Enter or wait to look up
        </p>
      )}
    </form>
  );
}
