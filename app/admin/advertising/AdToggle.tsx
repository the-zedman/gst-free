"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdToggle({ id, active }: { id: number; active: boolean }) {
  const [on, setOn] = useState(active);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const next = !on;
    setOn(next);
    await fetch(`/api/admin/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={on ? "Deactivate ad" : "Activate ad"}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${on ? "bg-green-500" : "bg-gray-200"} ${loading ? "opacity-50" : ""}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}
