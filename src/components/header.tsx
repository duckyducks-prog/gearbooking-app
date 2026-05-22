"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, USERS } from "@/lib/user-context";
import { useBookingDraft } from "@/lib/booking-draft-context";
import { cn } from "@/lib/utils";
import { Camera, Calendar, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/gear",      label: "Gear",      icon: Camera },
  { href: "/bookings",  label: "Bookings",  icon: Calendar },
];

export function Header() {
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const { hasDraft, draftIds } = useBookingDraft();
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-[#141414]/10 bg-[#F8F5EE]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#FF4800] shadow-[0_0_0_3px_#FF480014]" />
          <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#141414]">
            Studio Gear
          </span>
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[13px] transition-all",
                  active
                    ? "text-[#141414] bg-white/60 border border-[#141414]/10"
                    : "text-[#8A8A8A] hover:text-[#141414] hover:bg-white/40"
                )}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Draft pill */}
        {hasDraft && (
          <Link
            href="/bookings/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#FF4800] text-white text-[11px] font-mono tracking-wide hover:bg-[#e04000] transition-colors"
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
              {draftIds.length}
            </span>
            Booking in progress
          </Link>
        )}

        {/* User picker */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#141414]/10 bg-white/40 hover:bg-white/70 text-[13px] text-[#3D3D3D] transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-[#FF4800]/10 flex items-center justify-center text-[10px] font-mono text-[#FF4800]">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <span className="font-mono text-[11px] tracking-wide max-w-[120px] truncate">
              {user.name.split(" ")[0]}
            </span>
            {user.role === "admin" && (
              <span className="text-[9px] font-mono tracking-widest uppercase text-[#FF4800]">admin</span>
            )}
            <ChevronDown size={12} className="text-[#8A8A8A]" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-1 w-52 bg-[#F8F5EE] border border-[#141414]/10 rounded-sm shadow-lg z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-[#141414]/8">
                  <p className="font-mono text-[9px] tracking-widest uppercase text-[#8A8A8A]">
                    Log in as
                  </p>
                </div>
                {USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { setUser(u); setOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left text-[13px] transition-colors",
                      u.id === user.id
                        ? "bg-white/60 text-[#141414]"
                        : "text-[#3D3D3D] hover:bg-white/40"
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FF4800]/10 flex items-center justify-center text-[10px] font-mono text-[#FF4800] shrink-0">
                      {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-[13px]">{u.name}</div>
                      <div className="font-mono text-[10px] text-[#8A8A8A] tracking-wide">{u.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
