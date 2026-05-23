import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/gear/batch?ids=1,2,3 — fetch basic info for a list of equipment IDs
export async function GET(req: NextRequest) {
  const idsParam = new URL(req.url).searchParams.get("ids");
  if (!idsParam) return NextResponse.json([]);

  const ids = idsParam.split(",").map(Number).filter((n) => !isNaN(n));
  if (ids.length === 0) return NextResponse.json([]);

  const equipment = await prisma.equipment.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, category: true, brand: true, status: true, photo: true },
  });

  return NextResponse.json(equipment);
}
