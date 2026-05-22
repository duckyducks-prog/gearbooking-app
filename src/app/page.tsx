import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { AlertTriangle, Plus } from "lucide-react";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [bookings, damageReports] = await Promise.all([
    prisma.booking.findMany({
      where: { status: "active" },
      include: { user: true, items: { include: { equipment: true } } },
      orderBy: { startDate: "asc" },
    }),
    prisma.damageReport.findMany({
      where: { resolved: false },
      include: { equipment: true, reportedBy: true },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#FF4800] mb-2 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-[#FF4800]" />
            Dashboard
          </p>
          <h1 className="text-[40px] font-sans font-light tracking-tight text-[#141414] leading-none">
            Studio Gear
          </h1>
        </div>
        <Button asChild variant="primary" size="sm">
          <Link href="/bookings/new">
            <Plus size={14} />
            New Booking
          </Link>
        </Button>
      </div>

      {/* User-specific panels (need client context) */}
      <DashboardClient bookings={JSON.parse(JSON.stringify(bookings))} />

      {/* Damage reports */}
      <section>
        <h2 className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A] mb-4">
          <AlertTriangle size={11} />
          Open Damage Reports
          {damageReports.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-[#FCC3DC]/40 text-[#46062B] rounded-sm text-[9px]">
              {damageReports.length}
            </span>
          )}
        </h2>
        {damageReports.length === 0 ? (
          <p className="text-[#8A8A8A] text-sm">No open damage reports.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {damageReports.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/gear/${r.equipmentId}`}
                      className="font-medium text-[14px] text-[#141414] hover:text-[#FF4800] transition-colors"
                    >
                      {r.equipment.name}
                    </Link>
                    <p className="text-[12px] text-[#8A8A8A] mt-0.5 line-clamp-2">{r.description}</p>
                    <p className="font-mono text-[10px] text-[#8A8A8A] mt-2">
                      {format(new Date(r.date), "MMM d")} · {r.reportedBy.name}
                    </p>
                  </div>
                  <Badge variant={r.severity as "minor" | "major" | "unusable"}>
                    {r.severity}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
