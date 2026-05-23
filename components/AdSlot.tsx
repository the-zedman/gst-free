export default function AdSlot({ id, className }: { id: string; className?: string }) {
  return (
    <div className={`w-full ${className ?? ""}`.trim()}>
      <div
        id={id}
        data-ad-slot={id}
        className="w-full min-h-[90px] rounded-xl border border-dashed border-gray-200 bg-gray-50/40 flex items-center justify-center"
      >
        <span className="text-xs text-gray-300 font-medium tracking-widest uppercase select-none">
          Advertisement
        </span>
      </div>
    </div>
  );
}
