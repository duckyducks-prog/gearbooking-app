import { prisma } from "@/lib/prisma";
import { BookingsList } from "./bookings-list";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const [bookings, users] = await Promise.all([
    prisma.booking.findMany({
      include: {
        user: true,
        items: { include: { equipment: true } },
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <BookingsList
      bookings={JSON.parse(JSON.stringify(bookings))}
      users={JSON.parse(JSON.stringify(users))}
    />
  );
}
