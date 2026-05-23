"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useBookingDraft } from "@/lib/booking-draft-context";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = {
  equipmentId: number;
  open: boolean;
  onClose: () => void;
};

export function StartBookingModal({ equipmentId, open, onClose }: Props) {
  const { startBooking } = useBookingDraft();
  const [project, setProject] = useState("");
  const [start,   setStart]   = useState("");
  const [end,     setEnd]     = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!project.trim() || !start || !end) return;
    // Single atomic call — avoids stale closure when setDates + addItem run sequentially
    startBooking(project.trim(), start, end, equipmentId);
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#141414]/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-[#F8F5EE] border border-[#141414]/10 rounded-sm shadow-xl p-6">

          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#FF4800] mb-1">
                Start a booking
              </p>
              <Dialog.Title className="text-[18px] font-light tracking-tight text-[#141414]">
                Enter your shoot details
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-[#8A8A8A] hover:text-[#141414] transition-colors mt-0.5">
                <X size={15} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-[12px] text-[#8A8A8A] mb-5 leading-relaxed">
            Once you set dates, the gear grid will show what is already taken.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] block mb-1.5">
                Project name
              </label>
              <input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g. Nike Campaign"
                required
                autoFocus
                className="w-full px-3 py-2.5 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] text-[#141414] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] block mb-1.5">
                  Start
                </label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] text-[#141414] focus:outline-none focus:border-[#FF4800]/40 transition-all"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] block mb-1.5">
                  End
                </label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                  min={start}
                  className="w-full px-3 py-2 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] text-[#141414] focus:outline-none focus:border-[#FF4800]/40 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Add to booking →
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
