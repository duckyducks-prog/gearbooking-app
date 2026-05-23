"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, X, Camera } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ShareButton } from "./share-button";

type Equipment = {
  id: number;
  name: string;
  brand: string;
  category: string;
  status: string;
  photo: string | null;
};

type BookingItem = {
  id: number;
  quantity: number;
  equipment: Equipment;
};

type Booking = {
  id: number;
  projectName: string;
  startDate: string;
  endDate: string;
  status: string;
  user: { name: string };
  items: BookingItem[];
};

const STATUS_VARIANTS: Record<string, "available" | "booked" | "damaged" | "retired"> = {
  active: "booked",
  returned: "available",
  cancelled: "retired",
};

export function BookingDetail({
  booking: initial,
  allEquipment,
}: {
  booking: Booking;
  allEquipment: Equipment[];
}) {
  const router = useRouter();
  const [booking, setBooking]   = useState(initial);
  const [search, setSearch]     = useState("");
  const [adding, setAdding]     = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  const bookedIds = new Set(booking.items.map((i) => i.equipment.id));

  const searchResults = search.length > 1
    ? allEquipment.filter(
        (e) =>
          !bookedIds.has(e.id) &&
          (e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.brand.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 10)
    : [];

  async function addGear(equipmentId: number) {
    setAdding(equipmentId);
    const res = await fetch(`/api/bookings/${booking.id}/gear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipmentId }),
    });
    if (res.ok) {
      const item = await res.json();
      setBooking((b) => ({ ...b, items: [...b.items, item] }));
      setSearch("");
    }
    setAdding(null);
  }

  async function removeGear(itemId: number) {
    setRemoving(itemId);
    await fetch(`/api/bookings/${booking.id}/gear?itemId=${itemId}`, { method: "DELETE" });
    setBooking((b) => ({ ...b, items: b.items.filter((i) => i.id !== itemId) }));
    setRemoving(null);
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/bookings"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase text-[#8A8A8A] hover:text-[#FF4800] transition-colors mb-8"
      >
        <ArrowLeft size={12} />
        Bookings
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#8A8A8A] mb-1">
            {booking.user.name}
          </p>
          <h1 className="text-[36px] font-sans font-light tracking-tight text-[#141414] leading-tight">
            {booking.projectName}
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-2 shrink-0">
          <Badge variant={STATUS_VARIANTS[booking.status] ?? "default"}>
            {booking.status}
          </Badge>
          <ShareButton booking={booking} />
        </div>
      </div>

      {/* Gear section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A]">
            Gear ({booking.items.length})
          </h2>
        </div>

        {/* Current gear */}
        {booking.items.length > 0 && (
          <div className="space-y-1.5">
            {booking.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2.5 bg-white/50 border border-[#141414]/8 rounded-sm"
              >
                <div className="w-9 h-9 rounded-sm bg-[#F8F5EE] border border-[#141414]/8 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.equipment.photo ? (
                    <Image
                      src={item.equipment.photo}
                      alt={item.equipment.name}
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Camera size={14} className="text-[#8A8A8A]/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#141414] truncate">{item.equipment.name}</p>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-[#8A8A8A]">
                    {item.equipment.brand} · {item.equipment.category}
                    {item.quantity > 1 && (
                      <span className="text-[#3D3D3D]"> · ×{item.quantity}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => removeGear(item.id)}
                  disabled={removing === item.id}
                  className="text-[#8A8A8A] hover:text-[#FF4800] transition-colors p-1 disabled:opacity-40"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add gear search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Add gear…"
            className="w-full pl-8 pr-3 py-2.5 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] text-[#141414] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#F8F5EE] border border-[#141414]/10 rounded-sm shadow-md z-10 divide-y divide-[#141414]/6 max-h-64 overflow-y-auto">
              {searchResults.map((e) => (
                <button
                  key={e.id}
                  onClick={() => addGear(e.id)}
                  disabled={adding === e.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                    adding === e.id ? "opacity-50" : "hover:bg-white/60"
                  )}
                >
                  <div className="w-7 h-7 rounded-sm bg-[#F8F5EE] border border-[#141414]/8 overflow-hidden shrink-0 flex items-center justify-center">
                    {e.photo ? (
                      <Image src={e.photo} alt={e.name} width={28} height={28} className="object-cover w-full h-full" />
                    ) : (
                      <Camera size={11} className="text-[#8A8A8A]/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#141414] truncate">{e.name}</p>
                    <p className="font-mono text-[9px] tracking-widest uppercase text-[#8A8A8A]">{e.brand}</p>
                  </div>
                  <Badge variant={(e.status as "available" | "booked" | "damaged" | "retired") ?? "default"}>
                    {e.status}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {booking.items.length === 0 && !search && (
          <p className="text-[#8A8A8A] text-[13px] py-4 text-center border border-dashed border-[#141414]/10 rounded-sm">
            No gear added yet — search above to add items.
          </p>
        )}
      </div>

      {/* Actions */}
      {booking.status === "active" && (
        <div className="mt-8 pt-6 border-t border-[#141414]/8">
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await fetch(`/api/bookings/${booking.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "returned" }),
              });
              router.refresh();
            }}
          >
            Mark as returned
          </Button>
        </div>
      )}
    </div>
  );
}
