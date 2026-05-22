import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookingId = parseInt(id);
  const { status } = await req.json();

  if (!["returned", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: { items: true },
  });

  // For each piece of gear, restore to "available" if no other active booking holds it
  for (const item of booking.items) {
    const otherActive = await prisma.bookingItem.count({
      where: {
        equipmentId: item.equipmentId,
        booking: { status: "active", id: { not: bookingId } },
      },
    });

    if (otherActive === 0) {
      const equipment = await prisma.equipment.findUnique({
        where: { id: item.equipmentId },
      });
      if (equipment?.status === "booked") {
        await prisma.equipment.update({
          where: { id: item.equipmentId },
          data: { status: "available" },
        });
      }
    }
  }

  return NextResponse.json(booking);
}
