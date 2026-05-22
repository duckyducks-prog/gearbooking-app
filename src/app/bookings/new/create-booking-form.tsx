"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { useBookingDraft } from "@/lib/booking-draft-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function CreateBookingForm() {
  const router = useRouter();
  const { user } = useUser();
  const { draftIds, clearDraft } = useBookingDraft();

  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate]     = useState("");
  const [endDate, setEndDate]         = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!projectName.trim() || !startDate || !endDate) {
      setError("Project name and dates are required.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        projectName: projectName.trim(),
        projectType: "other",
        startDate,
        endDate,
        equipmentIds: draftIds,
      }),
    });

    if (!res.ok) {
      setError("Something went wrong.");
      setSubmitting(false);
      return;
    }

    const booking = await res.json();
    clearDraft();
    router.push(`/bookings/${booking.id}`);
  }

  return (
    <div className="max-w-sm">
      <Link
        href="/bookings"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase text-[#8A8A8A] hover:text-[#FF4800] transition-colors mb-8"
      >
        <ArrowLeft size={12} />
        Bookings
      </Link>

      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#FF4800] mb-2 flex items-center gap-3">
        <span className="inline-block w-8 h-px bg-[#FF4800]" />
        New Booking
      </p>
      <h1 className="text-[40px] font-sans font-light tracking-tight text-[#141414] leading-none mb-8">
        Create Booking
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-2">
            Project Name
          </label>
          <input
            autoFocus
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Think Big Offsite — B-roll"
            className="w-full px-3 py-2.5 border border-[#141414]/10 rounded-sm bg-white/40 text-[15px] text-[#141414] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-2">
              Start Date
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
              End Date
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

        {draftIds.length > 0 && (
          <p className="font-mono text-[10px] text-[#8A8A8A] tracking-wide">
            {draftIds.length} item{draftIds.length !== 1 ? "s" : ""} from your draft will be added.
          </p>
        )}

        {error && <p className="text-[12px] text-[#46062B]">{error}</p>}

        <Button type="submit" variant="primary" disabled={submitting} className="w-full">
          {submitting ? "Creating…" : "Create Booking"}
        </Button>
      </form>
    </div>
  );
}
