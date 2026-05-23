import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const equipmentId = parseInt(id);
  if (isNaN(equipmentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const body = await req.json();

  const allowed = ["youtubeVideoId", "youtubeTitle", "youtubeChannel"] as const;
  const data: Partial<Record<typeof allowed[number], string | null>> = {};
  for (const key of allowed) {
    if (key in body) {
      const val = body[key];
      // Only accept string or null — reject numbers, booleans, objects
      if (typeof val !== "string" && val !== null) continue;
      data[key] = val;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const equipment = await prisma.equipment.update({
    where: { id: equipmentId },
    data,
  });

  return NextResponse.json(equipment);
}
