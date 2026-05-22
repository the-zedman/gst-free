'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors print:hidden"
    >
      🖨️ Print recipe
    </button>
  );
}
