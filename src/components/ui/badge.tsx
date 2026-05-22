"use client";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "available" | "booked" | "damaged" | "retired" | "minor" | "major" | "unusable" | "default";
  className?: string;
}

const VARIANTS: Record<string, string> = {
  available: "bg-[#B9CDBE]/30 text-[#042729] border-[#B9CDBE]/60",
  booked:    "bg-[#FF4800]/10 text-[#FF4800] border-[#FF4800]/20",
  damaged:   "bg-[#FCC3DC]/40 text-[#46062B] border-[#FCC3DC]",
  retired:   "bg-[#141414]/6 text-[#8A8A8A] border-[#141414]/10",
  minor:     "bg-[#FCD34D]/20 text-[#92400E] border-[#FCD34D]/40",
  major:     "bg-[#FF4800]/10 text-[#FF4800] border-[#FF4800]/20",
  unusable:  "bg-[#FCC3DC]/40 text-[#46062B] border-[#FCC3DC]",
  default:   "bg-[#141414]/6 text-[#141414] border-[#141414]/10",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase border rounded-sm",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
