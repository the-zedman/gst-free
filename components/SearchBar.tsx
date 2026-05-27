"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";

const BARCODE_RE = /^\d{8,14}$/;

interface SearchBarProps {
  defaultValue?: string;
}

export default function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

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
    setValue(e.target.value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate(value);
  }

  function handleClear() {
    setValue("");
    navigate("");
  }

  function openScanner() {
    setScanError("");
    setScanning(true);
  }

  function closeScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
    setScanError("");
  }

  // Start camera + ZXing when modal opens
  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;

    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const { DecodeHintType, BarcodeFormat } = await import("@zxing/library");

        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);

        const reader = new BrowserMultiFormatReader(hints);

        if (!videoRef.current || cancelled) return;

        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } },
          videoRef.current,
          (result) => {
            if (result && !cancelled) {
              cancelled = true;
              const barcode = result.getText();
              controls.stop();
              setScanning(false);
              navigate(barcode);
            }
          }
        );

        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      } catch {
        if (!cancelled) {
          setScanError("Camera access denied. Check your browser permissions and try again.");
          setScanning(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [scanning, navigate]);

  return (
    <>
      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <span className="absolute left-4 text-gray-400 pointer-events-none text-lg select-none">
              {isBarcode ? "▌▌▌" : "🔍"}
            </span>
            <input
              type="search"
              value={value}
              onChange={handleChange}
              placeholder="Search foods or scan"
              autoComplete="off"
              inputMode="text"
              className={`w-full pl-12 py-3.5 text-base rounded-2xl border-2 focus:outline-none shadow-sm bg-white placeholder:text-gray-400 transition-colors font-${isBarcode ? "mono" : "sans"} ${
                isBarcode
                  ? "border-blue-300 focus:border-blue-500"
                  : "border-green-200 focus:border-green-500"
              } ${value ? "pr-10" : "pr-4"}`}
            />

            {/* Clear button */}
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Search button — always visible */}
          <button
            type="submit"
            aria-label="Search"
            className="shrink-0 flex items-center justify-center h-14 px-5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors shadow-sm hidden sm:flex"
          >
            Search
          </button>

          {/* Scan button — mobile only */}
          <button
            type="button"
            onClick={openScanner}
            aria-label="Scan barcode"
            className="sm:hidden shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
              <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
              <line x1="8" y1="12" x2="8" y2="12.01"/><line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="16" y1="12" x2="16" y2="12.01"/>
            </svg>
          </button>
        </div>
        {isBarcode && (
          <p className="text-xs text-center text-blue-500 mt-1.5 font-medium">
            Barcode detected — press Enter to look up
          </p>
        )}
        {scanError && (
          <p className="text-xs text-center text-red-500 mt-1.5">{scanError}</p>
        )}
      </form>

      {/* Scanner modal */}
      {scanning && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-10 pb-4">
            <p className="text-white text-sm font-medium">Point camera at a barcode</p>
            <button
              onClick={closeScanner}
              aria-label="Close scanner"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Camera feed */}
          <div className="flex-1 relative overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Scanning reticle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-40">
                {/* Corner markers */}
                {[
                  "top-0 left-0 border-t-4 border-l-4 rounded-tl-lg",
                  "top-0 right-0 border-t-4 border-r-4 rounded-tr-lg",
                  "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg",
                  "bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg",
                ].map((cls) => (
                  <div key={cls} className={`absolute w-8 h-8 border-green-400 ${cls}`} />
                ))}
                {/* Scanning line animation */}
                <div className="absolute inset-x-2 top-1/2 h-0.5 bg-green-400/70 animate-pulse" />
              </div>
            </div>

            {/* Dim overlay outside reticle */}
            <div className="absolute inset-0 bg-black/40 [mask-image:radial-gradient(ellipse_280px_180px_at_50%_50%,transparent_95%,black_100%)]" />
          </div>

          {/* Footer hint */}
          <div className="px-4 pb-10 pt-4 text-center">
            <p className="text-white/60 text-sm">Hold steady — scanning automatically</p>
          </div>
        </div>
      )}
    </>
  );
}
