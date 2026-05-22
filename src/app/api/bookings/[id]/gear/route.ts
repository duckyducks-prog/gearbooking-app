import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { equipmentId } = await req.json();

  try {
    const item = await prisma.bookingItem.create({
      data: { bookingId: parseInt(id), equipmentId },
      include: { equipment: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  await prisma.bookingItem.delete({ where: { id: parseInt(itemId) } });
  return new NextResponse(null, { status: 204 });
}
