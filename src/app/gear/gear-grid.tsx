"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/types";
import type { Category } from "@/lib/types";
import { Search, Camera, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookingDraft } from "@/lib/booking-draft-context";

type GearItem = {
  id: number;
  name: string;
  category: string;
  brand: string;
  model: string;
  status: string;
  quantity: number;
  photo: string | null;
  value: number | null;
  notes: string | null;
  damageReports: { id: number }[];
  _count: { bookingItems: number };
};

const STATUS_VARIANTS: Record<string, "available" | "booked" | "damaged" | "retired"> = {
  available: "available",
  booked:    "booked",
  damaged:   "damaged",
  retired:   "retired",
};

export function GearGrid({ equipment }: { equipment: GearItem[] }) {
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState<Category | "all">("all");
  const { hasDraft, draftIds }    = useBookingDraft();

  const filtered = equipment.filter((e) => {
    const matchCat  = category === "all" || e.category === category;
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.brand.toLowerCase().includes(search.toLowerCase()) ||
      e.model.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#FF4800] mb-2 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-[#FF4800]" />
            Inventory
          </p>
          <h1 className="text-[40px] font-sans font-light tracking-tight text-[#141414] leading-none">
            All Gear
          </h1>
        </div>
        <Button asChild variant="primary" size="sm">
          <Link href="/bookings/new">
            <Plus size={14} />
            {hasDraft ? `Continue Booking (${draftIds.length})` : "New Booking"}
          </Link>
        </Button>
      </div>

      {/* Draft banner */}
      {hasDraft && (
        <div className="mb-6 flex items-center justify-between px-4 py-2.5 bg-[#FF4800]/6 border border-[#FF4800]/20 rounded-sm">
          <p className="text-[12px] text-[#FF4800]">
            <span className="font-medium">{draftIds.length} item{draftIds.length !== 1 ? "s" : ""}</span>
            <span className="text-[#FF4800]/70"> in your current booking — tap any item to add more.</span>
          </p>
          <Link href="/bookings/new" className="font-mono text-[10px] tracking-widest uppercase text-[#FF4800] hover:underline shrink-0">
            Review →
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gear…"
            className="w-full pl-8 pr-3 py-2 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] text-[#141414] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-sm text-[11px] font-mono tracking-wide uppercase transition-all border",
              category === "all"
                ? "bg-[#141414] text-white border-[#141414]"
                : "text-[#8A8A8A] border-[#141414]/10 hover:border-[#141414]/25 hover:text-[#141414]"
            )}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-3 py-1.5 rounded-sm text-[11px] font-mono tracking-wide uppercase transition-all border",
                category === c
                  ? "bg-[#141414] text-white border-[#141414]"
                  : "text-[#8A8A8A] border-[#141414]/10 hover:border-[#141414]/25 hover:text-[#141414]"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map((item) => (
          <Link key={item.id} href={`/gear/${item.id}`}>
            <Card className="overflow-hidden group cursor-pointer h-full flex flex-col">
              {/* Photo */}
              <div className="aspect-[4/3] bg-[#F8F5EE] border-b border-[#141414]/8 flex items-center justify-center relative overflow-hidden">
                {item.photo ? (
                  <Image
                    src={item.photo}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                ) : (
                  <Camera size={28} className="text-[#8A8A8A]/40" />
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={STATUS_VARIANTS[item.status] ?? "default"}>
                    {item.status}
                  </Badge>
                </div>
                {item.damageReports.length > 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="px-1.5 py-0.5 bg-[#FCC3DC]/80 text-[#46062B] rounded-sm text-[9px] font-mono">
                      ⚠ dmg
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col gap-1">
                <p className="font-mono text-[9px] tracking-widest uppercase text-[#8A8A8A]">
                  {item.brand}
                </p>
                <p className="text-[13px] font-medium text-[#141414] leading-tight line-clamp-2">
                  {item.name}
                </p>
                <div className="flex items-center justify-between mt-auto pt-2">
                  {item.quantity > 1 && (
                    <span className="font-mono text-[10px] text-[#8A8A8A]">×{item.quantity}</span>
                  )}
                  {item.value && (
                    <p className="font-mono text-[10px] text-[#8A8A8A] ml-auto">
                      ${item.value.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-[#8A8A8A] text-sm">
            No gear matches your search.
          </div>
        )}
      </div>
    </div>
  );
}
