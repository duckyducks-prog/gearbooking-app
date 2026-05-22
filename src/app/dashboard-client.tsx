"use client";
import { useUser } from "@/lib/user-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Camera, CalendarDays } from "lucide-react";

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

  const myBookings = bookings.filter((b) => b.userId === user.id);
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
            {myBookings.map((b) => (
              <Card key={b.id} className="p-4">
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
                  <Badge variant="booked">{b.status}</Badge>
                </div>
              </Card>
            ))}
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
    </div>
  );
}
