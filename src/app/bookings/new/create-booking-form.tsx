"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { useBookingDraft } from "@/lib/booking-draft-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

type GearItem = {
  id: number;
  name: string;
  category: string;
  brand: string;
  status: string;
  photo: string | null;
};

export function CreateBookingForm() {
  const router       = useRouter();
  const { user }     = useUser();
  const {
    draftIds, projectName, startDate, endDate,
    hasDateDraft, clearDraft,
  } = useBookingDraft();

  const [gear,       setGear]       = useState<GearItem[]>([]);
  const [loadingGear, setLoadingGear] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");

  // Fetch gear details so we can show names, not just IDs
  useEffect(() => {
    if (draftIds.length === 0) { setGear([]); return; }
    setLoadingGear(true);
    fetch(`/api/gear/batch?ids=${draftIds.join(",")}`)
      .then((r) => r.json())
      .then((data: GearItem[]) => {
        setGear(data);
        // If some IDs returned no results, they're stale — surface to user
        if (data.length < draftIds.length) {
          setError(`${draftIds.length - data.length} item(s) could not be found and were removed.`);
        }
      })
      .catch(() => setError("Could not load gear details."))
      .finally(() => setLoadingGear(false));
  }, [draftIds]);

  async function handleConfirm() {
    if (!hasDateDraft || gear.length === 0) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId:       user.id,
        projectName:  projectName,
        projectType:  "other",
        startDate,
        endDate,
        equipmentIds: gear.map((g) => g.id), // use only validated IDs
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong — try again.");
      setSubmitting(false);
      return;
    }

    const booking = await res.json();
    clearDraft();
    router.push(`/bookings/${booking.id}`);
  }

  // Empty draft — send back to gear
  if (draftIds.length === 0 && !loadingGear) {
    return (
      <div className="max-w-sm">
        <Link href="/gear" className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase text-[#8A8A8A] hover:text-[#FF4800] transition-colors mb-8">
          <ArrowLeft size={12} /> Browse Gear
        </Link>
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#FF4800] mb-2 flex items-center gap-3">
          <span className="inline-block w-8 h-px bg-[#FF4800]" />
          New Booking
        </p>
        <h1 className="text-[32px] font-sans font-light tracking-tight text-[#141414] leading-none mb-4">
          No gear selected
        </h1>
        <p className="text-[13px] text-[#8A8A8A] mb-6">
          Browse the gear inventory and click "New Booking" on any item to start.
        </p>
        <Button asChild variant="primary" size="sm">
          <Link href="/gear">Browse gear →</Link>
        </Button>
      </div>
    );
  }

  // No dates — modal wasn't completed
  if (!hasDateDraft) {
    return (
      <div className="max-w-sm">
        <Link href="/gear" className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase text-[#8A8A8A] hover:text-[#FF4800] transition-colors mb-8">
          <ArrowLeft size={12} /> Browse Gear
        </Link>
        <p className="text-[13px] text-[#8A8A8A]">
          Missing booking dates. Go back and click "New Booking" on a piece of gear to set them.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Link href="/gear" className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase text-[#8A8A8A] hover:text-[#FF4800] transition-colors mb-8">
        <ArrowLeft size={12} /> Add more gear
      </Link>

      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#FF4800] mb-2 flex items-center gap-3">
        <span className="inline-block w-8 h-px bg-[#FF4800]" />
        Confirm Booking
      </p>
      <h1 className="text-[32px] font-sans font-light tracking-tight text-[#141414] leading-none mb-6">
        {projectName || "New Booking"}
      </h1>

      {/* Booking meta */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between text-[13px]">
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">Dates</p>
            <p className="font-medium text-[#141414]">
              {format(new Date(startDate), "MMM d")} → {format(new Date(endDate), "MMM d, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">Booked by</p>
            <p className="font-medium text-[#141414]">{user.name}</p>
          </div>
        </div>
      </Card>

      {/* Gear list */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A]">
            Gear — {loadingGear ? "loading…" : `${gear.length} item${gear.length !== 1 ? "s" : ""}`}
          </p>
          <Link
            href="/gear"
            className="font-mono text-[10px] tracking-widest uppercase text-[#FF4800] hover:underline"
          >
            + Add more
          </Link>
        </div>

        {loadingGear ? (
          <div className="space-y-2">
            {draftIds.map((id) => (
              <div key={id} className="h-16 rounded-sm bg-[#F8F5EE] border border-[#141414]/8 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {gear.map((item) => (
              <Card key={item.id} className="p-3 flex items-center gap-3">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-sm bg-[#F8F5EE] border border-[#141414]/8 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {item.photo ? (
                    <Image
                      src={item.photo}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Camera size={16} className="text-[#8A8A8A]/40" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[9px] tracking-widest uppercase text-[#8A8A8A]">{item.brand}</p>
                  <p className="text-[13px] font-medium text-[#141414] truncate">{item.name}</p>
                </div>
                <Badge>{item.category}</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-[#FCC3DC]/20 border border-[#FCC3DC] rounded-sm text-[12px] text-[#46062B]">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { clearDraft(); router.push("/gear"); }}
          className="flex items-center gap-1.5"
        >
          <Trash2 size={12} />
          Clear & start over
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleConfirm}
          disabled={submitting || loadingGear || gear.length === 0}
          className="flex-1"
        >
          {submitting ? "Booking…" : `Confirm booking — ${gear.length} item${gear.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
