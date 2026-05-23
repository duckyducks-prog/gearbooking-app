import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate   = searchParams.get("endDate");
  const idsParam  = searchParams.get("equipmentIds");

  if (!startDate || !endDate || !idsParam) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const equipmentIds = idsParam.split(",").map(Number).filter(Boolean);
  const start = new Date(startDate);
  const end   = new Date(endDate);

  const conflicts = await prisma.bookingItem.findMany({
    where: {
      equipmentId: { in: equipmentIds },
      booking: {
        status:    "active",
        startDate: { lte: end },
        endDate:   { gte: start },
      },
    },
    select: { equipmentId: true },
  });

  const unavailableIds = [...new Set(conflicts.map((c: { equipmentId: number }) => c.equipmentId))];
  return NextResponse.json({ unavailableIds });
}
