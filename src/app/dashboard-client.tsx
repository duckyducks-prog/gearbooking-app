"use client";
import { useState } from "react";
import { useUser } from "@/lib/user-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Camera, CalendarDays, RefreshCw } from "lucide-react";

type Booking = {
  id: number;
  projectName: string;
  projectType: string;
  startDate: string;
  endDate: string;
  status: string;
  userId: number;
  user: { id: number; name: string };
  items: { equipment: { id: number; name: string; category: string; status: string } }[];
};

export function DashboardClient({ bookings }: { bookings: Booking[] }) {
  const { user } = useUser();
  const [syncing, setSyncing]   = useState(false);
  const [syncMsg, setSyncMsg]   = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res  = await fetch("/api/admin/sync-gear", { method: "POST" });
      const data = await res.json();
      setSyncMsg(res.ok ? data.message : (data.error ?? "Sync failed"));
    } catch {
      setSyncMsg("Network error — sync failed");
    } finally {
      setSyncing(false);
    }
  }

  const now = new Date();
  const myBookings = bookings
    .filter((b) => b.userId === user.id)
    .sort((a, b) => {
      // Overdue bookings (past endDate) float to the top
      const aOverdue = new Date(a.endDate) < now;
      const bOverdue = new Date(b.endDate) < now;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  const myGear = myBookings.flatMap((b) =>
    b.items.map((i) => ({ ...i.equipment, bookingId: b.id, projectName: b.projectName }))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* My upcoming bookings */}
      <section>
        <h2 className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A] mb-4">
          <CalendarDays size={11} />
          My Active Bookings
        </h2>
        {myBookings.length === 0 ? (
          <div className="border border-[#141414]/10 rounded-sm p-6 text-center bg-white/20">
            <p className="text-[#8A8A8A] text-sm mb-3">No active bookings</p>
            <Button asChild variant="primary" size="sm">
              <Link href="/bookings/new">Book gear</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {myBookings.map((b) => {
              const overdue = new Date(b.endDate) < now;
              return (
              <Card key={b.id} className={`p-4 ${overdue ? "border-[#FF4800]/30 bg-[#FF4800]/3" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-[14px] text-[#141414]">{b.projectName}</div>
                    <p className="font-mono text-[11px] text-[#8A8A8A] mt-0.5 tracking-wide">
                      {format(new Date(b.startDate), "MMM d")} → {format(new Date(b.endDate), "MMM d")}
                    </p>
                    <p className="text-[12px] text-[#8A8A8A] mt-1">
                      {b.items.length} item{b.items.length !== 1 ? "s" : ""}
                      {" · "}
                      <span className="font-mono text-[11px] tracking-wide">{b.projectType}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {overdue && (
                      <span className="px-1.5 py-0.5 bg-[#FF4800]/10 text-[#FF4800] border border-[#FF4800]/20 rounded-sm text-[9px] font-mono tracking-widest uppercase">
                        Overdue
                      </span>
                    )}
                    <Badge variant="booked">{b.status}</Badge>
                  </div>
                </div>
              </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* My checked-out gear */}
      <section>
        <h2 className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A] mb-4">
          <Camera size={11} />
          Gear Checked Out to Me
        </h2>
        {myGear.length === 0 ? (
          <div className="border border-[#141414]/10 rounded-sm p-6 bg-white/20">
            <p className="text-[#8A8A8A] text-sm">No gear currently checked out.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myGear.map((g) => (
              <Card key={`${g.id}-${g.bookingId}`} className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-[#FF4800]/8 flex items-center justify-center shrink-0">
                  <Camera size={14} className="text-[#FF4800]" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/gear/${g.id}`}
                    className="font-medium text-[13px] text-[#141414] hover:text-[#FF4800] transition-colors truncate block"
                  >
                    {g.name}
                  </Link>
                  <p className="font-mono text-[10px] text-[#8A8A8A] tracking-wide truncate">
                    {g.projectName}
                  </p>
                </div>
                <Badge>{g.category}</Badge>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Admin: sync gear from Google Sheets */}
      {user.role === "admin" && (
        <section className="lg:col-span-2">
          <div className="flex items-center gap-4 px-4 py-3 border border-[#141414]/10 rounded-sm bg-white/20">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#8A8A8A]">
                Gear inventory
              </p>
              <p className="text-[13px] text-[#3D3D3D] mt-0.5">
                {syncMsg ?? "Sync the gear list from Google Sheets — your team's source of truth."}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="shrink-0"
            >
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing…" : "Sync from Sheet"}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
