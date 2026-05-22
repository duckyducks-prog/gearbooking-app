import { prisma } from "@/lib/prisma";
import { GearGrid } from "./gear-grid";

export const dynamic = "force-dynamic";

export default async function GearPage() {
  const equipment = await prisma.equipment.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      damageReports: { where: { resolved: false }, take: 1 },
      _count: { select: { bookingItems: true } },
    },
  });

  return <GearGrid equipment={JSON.parse(JSON.stringify(equipment))} />;
}
