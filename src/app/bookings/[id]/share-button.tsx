"use client";
import { useState } from "react";
import { Share2, Copy, FileSpreadsheet, Check } from "lucide-react";

type Equipment = {
  name: string;
  brand: string;
  category: string;
};

type BookingItem = {
  equipment: Equipment;
  quantity?: number;
};

type Booking = {
  id: number;
  projectName: string;
  startDate: string;
  endDate: string;
  user: { name: string };
  items: BookingItem[];
};

export function ShareButton({ booking }: { booking: Booking }) {
  const [open,       setOpen]       = useState(false);
  const [copied,     setCopied]     = useState<"text" | "link" | null>(null);
  const [loadingLink, setLoadingLink] = useState(false);

  // Format gear list as plain text grouped by category
  function buildTextList() {
    const byCategory: Record<string, BookingItem[]> = {};
    for (const item of booking.items) {
      const cat = item.equipment.category;
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    }

    const dateStr = `${new Date(booking.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} → ${new Date(booking.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    const lines: string[] = [
      booking.projectName,
      `${dateStr} · Booked by ${booking.user.name}`,
      "",
    ];

    for (const [cat, items] of Object.entries(byCategory)) {
      lines.push(`── ${cat.toUpperCase()} ${"─".repeat(Math.max(0, 28 - cat.length))}`);
      for (const item of items) {
        const qty = item.quantity ?? 1;
        const qtyStr = qty > 1 ? `  ×${qty}` : "";
        lines.push(`  ${item.equipment.name}${qtyStr}`);
      }
      lines.push("");
    }

    return lines.join("\n").trim();
  }

  async function copyText() {
    await navigator.clipboard.writeText(buildTextList());
    setCopied("text");
    setTimeout(() => setCopied(null), 2000);
  }

  async function copyLink() {
    setLoadingLink(true);
    const res = await fetch(`/api/bookings/${booking.id}/share-token`, { method: "POST" });
    const data = await res.json();
    setLoadingLink(false);
    if (data.token) {
      const url = `${window.location.origin}/share/${data.token}`;
      await navigator.clipboard.writeText(url);
      setCopied("link");
      setTimeout(() => setCopied(null), 2000);
    }
  }

  function downloadCsv() {
    window.open(`/api/bookings/${booking.id}/export/csv`, "_blank");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-2 border border-[#141414]/10 rounded-sm bg-white/40 hover:bg-white/70 hover:border-[#141414]/25 text-[12px] text-[#3D3D3D] transition-all font-mono tracking-wide"
      >
        <Share2 size={13} />
        Share gear list
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-[#F8F5EE] border border-[#141414]/10 rounded-sm shadow-lg w-52 overflow-hidden">
            <div className="px-3 py-2 border-b border-[#141414]/8">
              <p className="font-mono text-[9px] tracking-widest uppercase text-[#8A8A8A]">Share options</p>
            </div>

            {/* Copy text list */}
            <button
              onClick={copyText}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/60 transition-colors"
            >
              {copied === "text" ? <Check size={13} className="text-[#B9CDBE]" /> : <Copy size={13} className="text-[#8A8A8A]" />}
              <div>
                <p className="text-[13px] text-[#141414]">
                  {copied === "text" ? "Copied!" : "Copy list"}
                </p>
                <p className="font-mono text-[9px] text-[#8A8A8A]">Paste anywhere</p>
              </div>
            </button>

            {/* Copy share link */}
            <button
              onClick={copyLink}
              disabled={loadingLink}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/60 transition-colors disabled:opacity-50"
            >
              {copied === "link" ? <Check size={13} className="text-[#B9CDBE]" /> : <Share2 size={13} className="text-[#8A8A8A]" />}
              <div>
                <p className="text-[13px] text-[#141414]">
                  {copied === "link" ? "Link copied!" : loadingLink ? "Generating…" : "Share link"}
                </p>
                <p className="font-mono text-[9px] text-[#8A8A8A]">Public read-only page</p>
              </div>
            </button>

            {/* Download CSV */}
            <button
              onClick={downloadCsv}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/60 transition-colors border-t border-[#141414]/8"
            >
              <FileSpreadsheet size={13} className="text-[#8A8A8A]" />
              <div>
                <p className="text-[13px] text-[#141414]">Download CSV</p>
                <p className="font-mono text-[9px] text-[#8A8A8A]">Opens in Google Sheets</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
