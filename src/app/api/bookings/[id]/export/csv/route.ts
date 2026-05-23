import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookingId = parseInt(id);
  if (isNaN(bookingId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true } },
      items: {
        include: { equipment: { select: { name: true, brand: true, category: true, status: true, serialNumber: true, notes: true } } },
        orderBy: [{ equipment: { category: "asc" } }, { equipment: { name: "asc" } }],
      },
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rows: string[] = [
    // Header
    ["#", "Category", "Name", "Brand", "Quantity", "Status", "Serial Number", "Notes"].join(","),
  ];

  booking.items.forEach((item, i) => {
    const e = item.equipment;
    const qty = (item as { quantity?: number }).quantity ?? 1;
    rows.push(
      [
        i + 1,
        e.category,
        `"${e.name.replace(/"/g, '""')}"`,
        `"${e.brand.replace(/"/g, '""')}"`,
        qty,
        e.status,
        e.serialNumber ? `"${e.serialNumber}"` : "",
        e.notes ? `"${e.notes.replace(/"/g, '""')}"` : "",
      ].join(",")
    );
  });

  const csv = rows.join("\n");
  const filename = `${booking.projectName.replace(/[^a-z0-9]/gi, "-")}-gear-list.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
