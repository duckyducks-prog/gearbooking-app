import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookingDetail } from "./booking-detail";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [booking, allEquipment] = await Promise.all([
    prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        items: {
          include: { equipment: true },
          orderBy: { id: "asc" },
        },
      },
    }),
    prisma.equipment.findMany({
      where: { status: { not: "retired" } },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: { id: true, name: true, brand: true, category: true, status: true, photo: true },
    }),
  ]);

  if (!booking) notFound();

  return (
    <BookingDetail
      booking={JSON.parse(JSON.stringify(booking))}
      allEquipment={JSON.parse(JSON.stringify(allEquipment))}
    />
  );
}
