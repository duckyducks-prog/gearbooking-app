import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, projectName, projectType, startDate, endDate, notes, equipmentIds, equipmentItems } = body;
    // equipmentItems: [{ id, qty }] — preferred. equipmentIds: number[] — legacy fallback.

    if (!userId || !projectName || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Normalise to [{id, qty}] regardless of which format was sent
    const items: { id: number; qty: number }[] = equipmentItems?.length
      ? equipmentItems
      : (equipmentIds ?? []).map((id: number) => ({ id, qty: 1 }));

    const booking = await prisma.booking.create({
      data: {
        userId: parseInt(userId),
        projectName,
        projectType: projectType ?? "other",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes: notes || null,
        status: "active",
        items: items.length
          ? { create: items.map(({ id, qty }) => ({ equipmentId: id, quantity: qty })) }
          : undefined,
      },
      include: { items: true },
    });

    // Increment bookFrequency for every pair booked together
    const ids: number[] = items.map(({ id }) => id);
    const pairs: [number, number][] = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        pairs.push([ids[i], ids[j]]);
      }
    }

    for (const [a, b] of pairs) {
      const [parentId, childId] = a < b ? [a, b] : [b, a];
      await prisma.equipmentRelation.updateMany({
        where: { parentId, childId },
        data: { bookFrequency: { increment: 1 } },
      }).catch(() => {}); // Ignore if relation doesn't exist
    }

    // Mark booked equipment as "booked" (only if currently available)
    if (equipmentIds?.length) {
      await prisma.equipment.updateMany({
        where: {
          id: { in: equipmentIds as number[] },
          status: "available",
        },
        data: { status: "booked" },
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
