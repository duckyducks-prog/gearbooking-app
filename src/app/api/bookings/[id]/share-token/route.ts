import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookingId = parseInt(id);
  if (isNaN(bookingId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  // Return existing token or create one
  const existing = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { shareToken: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const token = existing.shareToken ?? randomUUID();

  if (!existing.shareToken) {
    await prisma.booking.update({ where: { id: bookingId }, data: { shareToken: token } });
  }

  return NextResponse.json({ token });
}
