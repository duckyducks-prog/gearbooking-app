"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Check } from "lucide-react";
import { useBookingDraft } from "@/lib/booking-draft-context";

export function BookGearButton({ equipmentId }: { equipmentId: number }) {
  const router = useRouter();
  const { hasDraft, addItem } = useBookingDraft();
  const [added, setAdded] = useState(false);

  if (!hasDraft) {
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={() => {
          addItem(equipmentId);
          router.push("/bookings/new");
        }}
      >
        <Calendar size={13} />
        New Booking
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      disabled={added}
      onClick={() => {
        addItem(equipmentId);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? <Check size={13} /> : <Plus size={13} />}
      {added ? "Added" : "Add to Booking"}
    </Button>
  );
}
