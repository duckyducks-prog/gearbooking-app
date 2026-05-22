"use client";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const VARIANTS = {
  primary:   "bg-[#FF4800] text-white border-[#FF4800] hover:bg-[#e04000] hover:border-[#e04000]",
  secondary: "bg-white/60 text-[#141414] border-[#141414]/15 hover:bg-white hover:border-[#141414]/30",
  ghost:     "bg-transparent text-[#3D3D3D] border-transparent hover:bg-white/50",
  danger:    "bg-[#FCC3DC]/30 text-[#46062B] border-[#FCC3DC] hover:bg-[#FCC3DC]/60",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  asChild,
  className,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 border rounded-sm font-sans font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
