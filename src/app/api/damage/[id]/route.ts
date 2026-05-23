import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reportId = parseInt(id);

  const report = await prisma.damageReport.update({
    where: { id: reportId },
    data: { resolved: true },
  });

  // If no unresolved reports remain, restore equipment to "available"
  const remaining = await prisma.damageReport.count({
    where: { equipmentId: report.equipmentId, resolved: false },
  });

  if (remaining === 0) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: report.equipmentId },
    });
    if (equipment?.status === "damaged") {
      // Check if the equipment is in an active booking — restore to "booked" not "available"
      const activeBooking = await prisma.bookingItem.count({
        where: {
          equipmentId: report.equipmentId,
          booking: { status: "active" },
        },
      });
      await prisma.equipment.update({
        where: { id: report.equipmentId },
        data: { status: activeBooking > 0 ? "booked" : "available" },
      });
    }
  }

  return NextResponse.json(report);
}
