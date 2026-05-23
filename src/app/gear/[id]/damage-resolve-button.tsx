"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DamageResolveButton({ reportId }: { reportId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleResolve() {
    setLoading(true);
    await fetch(`/api/damage/${reportId}`, { method: "PATCH" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleResolve}
      disabled={loading}
      className="font-mono text-[10px] tracking-widest uppercase text-[#B9CDBE] hover:text-[#141414] px-2 py-1 h-auto"
    >
      {loading ? "…" : "Mark resolved"}
    </Button>
  );
}
