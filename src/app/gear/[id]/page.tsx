import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Camera, ArrowLeft, Calendar, Link2, AlertTriangle } from "lucide-react";
import { VideoWalkthrough } from "./video-walkthrough";
import { ReportDamageDialog } from "./report-damage-dialog";
import { BookGearButton } from "./book-gear-button";

export const dynamic = "force-dynamic";

const STATUS_VARIANTS: Record<string, "available" | "booked" | "damaged" | "retired"> = {
  available: "available", booked: "booked", damaged: "damaged", retired: "retired",
};

export default async function GearDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const equipment = await prisma.equipment.findUnique({
    where: { id: parseInt(id) },
    include: {
      damageReports: {
        include: { reportedBy: true },
        orderBy: { date: "desc" },
      },
      bookingItems: {
        include: { booking: { include: { user: true } } },
        orderBy: { booking: { startDate: "desc" } },
        take: 10,
      },
      relationsAsParent: {
        include: { child: true },
        orderBy: { relationType: "asc" },
      },
    },
  });

  if (!equipment) notFound();

  const required  = equipment.relationsAsParent.filter((r) => r.relationType === "required");
  const standard  = equipment.relationsAsParent.filter((r) => r.relationType === "standard");
  const optional  = equipment.relationsAsParent.filter((r) => r.relationType === "optional");

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/gear"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase text-[#8A8A8A] hover:text-[#FF4800] transition-colors mb-8"
      >
        <ArrowLeft size={12} />
        All Gear
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        {/* Left — photo + specs */}
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-white/40 border border-[#141414]/10 rounded-sm flex items-center justify-center relative overflow-hidden">
            {equipment.photo ? (
              <Image src={equipment.photo} alt={equipment.name} fill className="object-cover" />
            ) : (
              <Camera size={40} className="text-[#8A8A8A]/30" />
            )}
          </div>

          <Card className="p-4 space-y-3">
            <Row label="Brand"    value={equipment.brand} />
            <Row label="Model"    value={equipment.model} />
            {equipment.serialNumber && <Row label="Serial"  value={equipment.serialNumber} />}
            <Row label="Category" value={equipment.category} />
            {equipment.value && (
              <Row label="Value" value={`$${equipment.value.toLocaleString()}`} />
            )}
            <div className="pt-1">
              <Badge variant={STATUS_VARIANTS[equipment.status] ?? "default"}>
                {equipment.status}
              </Badge>
            </div>
          </Card>

          {equipment.notes && (
            <Card className="p-4">
              <p className="font-mono text-[9px] tracking-widest uppercase text-[#8A8A8A] mb-2">Notes</p>
              <p className="text-[13px] text-[#3D3D3D] leading-relaxed">{equipment.notes}</p>
            </Card>
          )}
        </div>

        {/* Right — detail */}
        <div className="space-y-6">
          <div>
            <p className="font-mono text-[9px] tracking-widest uppercase text-[#8A8A8A] mb-1">
              {equipment.brand} · {equipment.category}
            </p>
            <h1 className="text-[32px] font-sans font-light tracking-tight text-[#141414] leading-tight">
              {equipment.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <BookGearButton equipmentId={equipment.id} />
            <ReportDamageDialog
              equipmentId={equipment.id}
              equipmentName={equipment.name}
            />
          </div>

          {/* Suggested accessories */}
          {equipment.relationsAsParent.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A] mb-3">
                <Link2 size={11} />
                Suggested Accessories
              </h2>
              <div className="space-y-3">
                {required.length > 0 && (
                  <RelationGroup label="Required" color="text-[#46062B]" bg="bg-[#FCC3DC]/20" items={required} />
                )}
                {standard.length > 0 && (
                  <RelationGroup label="Standard Kit" color="text-[#3D3D3D]" bg="bg-white/40" items={standard} />
                )}
                {optional.length > 0 && (
                  <RelationGroup label="Optional" color="text-[#8A8A8A]" bg="bg-[#F8F5EE]/60" items={optional} />
                )}
              </div>
            </div>
          )}

          {/* YouTube walkthrough */}
          <VideoWalkthrough
            name={equipment.name}
            brand={equipment.brand}
            model={equipment.model}
            category={equipment.category}
          />

          {/* Booking history */}
          <div>
            <h2 className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A] mb-3">
              <Calendar size={11} />
              Booking History
            </h2>
            {equipment.bookingItems.length === 0 ? (
              <p className="text-[#8A8A8A] text-sm">Never booked.</p>
            ) : (
              <div className="space-y-2">
                {equipment.bookingItems.map((bi) => (
                  <Card key={bi.id} className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#141414] truncate">
                        {bi.booking.projectName}
                      </div>
                      <div className="font-mono text-[10px] text-[#8A8A8A] tracking-wide">
                        {format(new Date(bi.booking.startDate), "MMM d")} →{" "}
                        {format(new Date(bi.booking.endDate), "MMM d, yyyy")}
                        {" · "}
                        {bi.booking.user.name}
                      </div>
                    </div>
                    <Badge variant={bi.booking.status as "available" | "booked" | "damaged" | "retired" | "default"}>
                      {bi.booking.status}
                    </Badge>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Damage reports */}
          {equipment.damageReports.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A] mb-3">
                <AlertTriangle size={11} />
                Damage History
              </h2>
              <div className="space-y-2">
                {equipment.damageReports.map((r) => (
                  <Card key={r.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] text-[#3D3D3D]">{r.description}</p>
                        <p className="font-mono text-[10px] text-[#8A8A8A] mt-1 tracking-wide">
                          {format(new Date(r.date), "MMM d, yyyy")} · {r.reportedBy.name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant={r.severity as "minor" | "major" | "unusable"}>{r.severity}</Badge>
                        {r.resolved && (
                          <span className="font-mono text-[9px] text-[#B9CDBE] tracking-wide">resolved</span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#141414]/6 pb-2 last:border-0 last:pb-0">
      <span className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A]">{label}</span>
      <span className="text-[12px] text-[#141414] text-right">{value}</span>
    </div>
  );
}

function RelationGroup({
  label, color, bg, items,
}: {
  label: string;
  color: string;
  bg: string;
  items: { id: number; child: { id: number; name: string; category: string }; relationType: string; notes: string | null }[];
}) {
  return (
    <div className={`rounded-sm border border-[#141414]/8 overflow-hidden ${bg}`}>
      <div className={`px-3 py-1.5 border-b border-[#141414]/8 font-mono text-[9px] tracking-widest uppercase ${color}`}>
        {label}
      </div>
      <div className="divide-y divide-[#141414]/6">
        {items.map((rel) => (
          <div key={rel.id} className="px-3 py-2 flex items-center gap-3">
            <Link
              href={`/gear/${rel.child.id}`}
              className="text-[13px] font-medium text-[#141414] hover:text-[#FF4800] transition-colors flex-1 truncate"
            >
              {rel.child.name}
            </Link>
            <Badge>{rel.child.category}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
