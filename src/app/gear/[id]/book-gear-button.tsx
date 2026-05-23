"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Check } from "lucide-react";
import { useBookingDraft } from "@/lib/booking-draft-context";
import { StartBookingModal } from "./start-booking-modal";

export function BookGearButton({ equipmentId }: { equipmentId: number }) {
  const { hasDraft, addItem } = useBookingDraft();
  const [showModal, setShowModal] = useState(false);
  const [added,     setAdded]     = useState(false);

  // No booking in progress — open modal to collect project + dates first
  if (!hasDraft) {
    return (
      <>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          <Calendar size={13} />
          New Booking
        </Button>
        <StartBookingModal
          equipmentId={equipmentId}
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  // Booking already in progress — add gear directly
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
