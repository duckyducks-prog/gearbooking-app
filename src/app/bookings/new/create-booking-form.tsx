"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { useBookingDraft } from "@/lib/booking-draft-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera } from "lucide-react";
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
  const router   = useRouter();
  const { user } = useUser();
  const {
    draftIds,
    projectName: ctxProject,
    startDate:   ctxStart,
    endDate:     ctxEnd,
    setDates,
    clearDraft,
  } = useBookingDraft();

  // Local editable copies — pre-filled from context
  const [project,   setProject]   = useState(ctxProject || "");
  const [startDate, setStartDate] = useState(ctxStart   || "");
  const [endDate,   setEndDate]   = useState(ctxEnd     || "");

  const [gear,        setGear]        = useState<GearItem[]>([]);
  const [loadingGear, setLoadingGear] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");

  // Sync context → local if context loads after mount
  useEffect(() => {
    if (ctxProject && !project) setProject(ctxProject);
    if (ctxStart   && !startDate) setStartDate(ctxStart);
    if (ctxEnd     && !endDate)   setEndDate(ctxEnd);
  }, [ctxProject, ctxStart, ctxEnd]);

  // Fetch gear details for the cart
  useEffect(() => {
    if (draftIds.length === 0) { setGear([]); return; }
    setLoadingGear(true);
    fetch(`/api/gear/batch?ids=${draftIds.join(",")}`)
      .then((r) => r.json())
      .then((data: GearItem[]) => {
        setGear(data);
        if (data.length < draftIds.length) {
          setError(`${draftIds.length - data.length} item(s) were no longer available and were removed.`);
        }
      })
      .catch(() => setError("Could not load gear details — try refreshing."))
      .finally(() => setLoadingGear(false));
  }, [draftIds]);

  const canSubmit = project.trim() && startDate && endDate && gear.length > 0 && !loadingGear;

  async function handleConfirm() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    // Persist any edits back to context
    setDates(project.trim(), startDate, endDate);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId:      user.id,
        projectName: project.trim(),
        projectType: "other",
        startDate,
        endDate,
        equipmentIds: gear.map((g) => g.id),
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

  // Empty cart
  if (draftIds.length === 0 && !loadingGear) {
    return (
      <div className="max-w-sm">
        <Link href="/gear" className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase text-[#8A8A8A] hover:text-[#FF4800] transition-colors mb-8">
          <ArrowLeft size={12} /> Browse gear
        </Link>
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#FF4800] mb-2 flex items-center gap-3">
          <span className="inline-block w-8 h-px bg-[#FF4800]" />
          New Booking
        </p>
        <h1 className="text-[32px] font-sans font-light tracking-tight text-[#141414] leading-none mb-4">
          No gear selected yet.
        </h1>
        <p className="text-[13px] text-[#8A8A8A] mb-6">
          Browse the gear inventory. Click "New Booking" on any item to start.
        </p>
        <Button asChild variant="primary" size="sm">
          <Link href="/gear">Browse gear →</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <Link href="/gear" className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase text-[#8A8A8A] hover:text-[#FF4800] transition-colors mb-8">
        <ArrowLeft size={12} /> Add more gear
      </Link>

      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#FF4800] mb-2 flex items-center gap-3">
        <span className="inline-block w-8 h-px bg-[#FF4800]" />
        Confirm Booking
      </p>
      <h1 className="text-[32px] font-sans font-light tracking-tight text-[#141414] leading-none mb-8">
        Review your booking.
      </h1>

      {/* Project + dates — always editable on this page */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-2">
            Project name
          </label>
          <input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="e.g. Nike Campaign — B-roll"
            className="w-full px-3 py-2.5 border border-[#141414]/10 rounded-sm bg-white/40 text-[15px] text-[#141414] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-2">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] font-mono text-[#3D3D3D] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-2">
              End date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] font-mono text-[#3D3D3D] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all"
            />
          </div>
        </div>
        <p className="font-mono text-[10px] text-[#8A8A8A] tracking-wide">
          Booked by {user.name}
        </p>
      </div>

      {/* Gear list */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A]">
            {loadingGear
              ? "Loading gear…"
              : `${gear.length} item${gear.length !== 1 ? "s" : ""} selected`}
          </p>
          <Link href="/gear" className="font-mono text-[10px] tracking-widest uppercase text-[#FF4800] hover:underline">
            + Add more
          </Link>
        </div>

        <div className="space-y-2">
          {loadingGear
            ? draftIds.map((id) => (
                <div key={id} className="h-16 rounded-sm bg-[#F8F5EE] border border-[#141414]/8 animate-pulse" />
              ))
            : gear.map((item) => (
                <Card key={item.id} className="p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-sm bg-[#F8F5EE] border border-[#141414]/8 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {item.photo ? (
                      <Image src={item.photo} alt={item.name} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <Camera size={16} className="text-[#8A8A8A]/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[9px] tracking-widest uppercase text-[#8A8A8A]">{item.brand}</p>
                    <p className="text-[13px] font-medium text-[#141414] truncate">{item.name}</p>
                  </div>
                  <Badge>{item.category}</Badge>
                </Card>
              ))}
        </div>
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
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleConfirm}
          disabled={!canSubmit || submitting}
          className="flex-1"
        >
          {submitting
            ? "Booking…"
            : !project.trim() || !startDate || !endDate
            ? "Fill in project name and dates above"
            : `Confirm — ${gear.length} item${gear.length !== 1 ? "s" : ""}`}
        </Button>
      </div>

      {/* Date preview when set */}
      {startDate && endDate && (
        <p className="font-mono text-[10px] text-[#8A8A8A] tracking-wide mt-3 text-center">
          {format(new Date(startDate), "MMM d")} → {format(new Date(endDate), "MMM d, yyyy")}
        </p>
      )}
    </div>
  );
}
