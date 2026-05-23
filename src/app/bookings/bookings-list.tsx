"use client";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";

type User    = { id: number; name: string; email: string; role: string };
type Booking = {
  id: number;
  projectName: string;
  projectType: string;
  startDate: string;
  endDate: string;
  status: string;
  notes: string | null;
  userId: number;
  user: User;
  items: { equipment: { id: number; name: string; category: string } }[];
};

const STATUS_VARIANTS: Record<string, "available" | "booked" | "damaged" | "retired" | "default"> = {
  active:    "booked",
  returned:  "available",
  cancelled: "retired",
};

export function BookingsList({ bookings, users }: { bookings: Booking[]; users: User[] }) {
  const [filterUser,   setFilterUser]   = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string | "all">("all");

  const filtered = bookings.filter((b) => {
    const matchUser   = filterUser === "all" || b.userId === filterUser;
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchUser && matchStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#FF4800] mb-2 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-[#FF4800]" />
            Schedule
          </p>
          <h1 className="text-[40px] font-sans font-light tracking-tight text-[#141414] leading-none">
            Bookings
          </h1>
        </div>
        <Button asChild variant="primary" size="sm">
          <Link href="/bookings/new">
            <Plus size={14} />
            New Booking
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Select
          value={String(filterUser)}
          onChange={(v) => setFilterUser(v === "all" ? "all" : parseInt(v))}
          options={[
            { value: "all", label: "All members" },
            ...users.map((u) => ({ value: String(u.id), label: u.name })),
          ]}
        />
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: "all",       label: "All statuses" },
            { value: "active",    label: "Active" },
            { value: "returned",  label: "Returned" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
        <span className="font-mono text-[11px] text-[#8A8A8A] ml-auto">
          {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((b) => (
          <Link key={b.id} href={`/bookings/${b.id}`} className="block group/booking">
            <Card className="p-4 group-hover/booking:border-[#141414]/25 group-hover/booking:bg-white/70 transition-all">
              <div className="flex items-start gap-4">
                {/* Date column */}
                <div className="shrink-0 w-16 text-center border-r border-[#141414]/8 pr-4">
                  <div className="font-mono text-[11px] text-[#8A8A8A] uppercase tracking-wide">
                    {format(new Date(b.startDate), "MMM")}
                  </div>
                  <div className="text-[24px] font-light text-[#141414] leading-none">
                    {format(new Date(b.startDate), "d")}
                  </div>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <div className="font-medium text-[15px] text-[#141414] group-hover/booking:text-[#FF4800] transition-colors">
                        {b.projectName}
                      </div>
                      <div className="font-mono text-[11px] text-[#8A8A8A] tracking-wide mt-0.5">
                        {b.user.name} · {format(new Date(b.startDate), "MMM d")} → {format(new Date(b.endDate), "MMM d, yyyy")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge>{b.projectType}</Badge>
                      <Badge variant={STATUS_VARIANTS[b.status] ?? "default"}>{b.status}</Badge>
                    </div>
                  </div>

                  {b.items.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {b.items.map((item) => (
                        <span
                          key={item.equipment.id}
                          className="px-2 py-0.5 bg-white/60 border border-[#141414]/8 rounded-sm text-[11px] text-[#3D3D3D]"
                        >
                          {item.equipment.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-[#8A8A8A] text-sm border border-[#141414]/8 rounded-sm bg-white/20">
            No bookings found.
          </div>
        )}
      </div>
    </div>
  );
}

function Select({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-1.5 border border-[#141414]/10 rounded-sm bg-white/40 text-[12px] font-mono text-[#3D3D3D] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A8A8A] pointer-events-none" />
    </div>
  );
}
