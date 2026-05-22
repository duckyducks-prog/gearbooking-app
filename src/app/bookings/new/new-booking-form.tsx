"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { useBookingDraft } from "@/lib/booking-draft-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PROJECT_TYPES } from "@/lib/types";
import type { ProjectType } from "@/lib/types";
import { Camera, X, Plus, AlertCircle, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Equipment = {
  id: number;
  name: string;
  category: string;
  brand: string;
  model: string;
  status: string;
  photo: string | null;
  relationsAsParent: {
    id: number;
    relationType: string;
    notes: string | null;
    child: { id: number; name: string; category: string; status: string };
  }[];
};

type ProjectTypeKit = {
  id: number;
  projectType: string;
  equipmentId: number;
  priority: string;
  equipment: { id: number; name: string; category: string; status: string };
};

type Suggestion = {
  equipmentId: number;
  name: string;
  category: string;
  status: string;
  notes: string | null;
  available: boolean;
  section: "required" | "standard" | "for-shoot";
  priority?: string;
};

export function NewBookingForm({
  equipment,
  projectTypeKits,
  preselectedGearId,
}: {
  equipment: Equipment[];
  projectTypeKits: ProjectTypeKit[];
  preselectedGearId: number | null;
}) {
  const router = useRouter();
  const { user } = useUser();
  const { draftIds, clearDraft } = useBookingDraft();

  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("other");
  const [startDate,   setStartDate]   = useState("");
  const [endDate,     setEndDate]     = useState("");
  const [notes,       setNotes]       = useState("");
  const [cart,        setCart]        = useState<number[]>(() => {
    const seed = draftIds.length > 0 ? draftIds : preselectedGearId ? [preselectedGearId] : [];
    return seed;
  });
  const [gearSearch,  setGearSearch]  = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");

  const cartItems = cart.map((id) => equipment.find((e) => e.id === id)).filter(Boolean) as Equipment[];

  // Build suggestions based on cart + projectType
  const suggestions = useCallback((): Suggestion[] => {
    const inCart = new Set(cart);
    const seen   = new Set<number>();
    const result: Suggestion[] = [];

    // Required + standard from equipment relations
    for (const item of cartItems) {
      for (const rel of item.relationsAsParent) {
        if (inCart.has(rel.child.id) || seen.has(rel.child.id)) continue;
        if (rel.relationType === "required" || rel.relationType === "standard") {
          seen.add(rel.child.id);
          result.push({
            equipmentId: rel.child.id,
            name: rel.child.name,
            category: rel.child.category,
            status: rel.child.status,
            notes: rel.notes,
            available: rel.child.status === "available",
            section: rel.relationType === "required" ? "required" : "standard",
          });
        }
      }
    }

    // For-shoot kit based on projectType
    if (projectType !== "other") {
      const kits = projectTypeKits.filter((k) => k.projectType === projectType);
      for (const kit of kits.sort((a, b) =>
        a.priority === "must-have" ? -1 : b.priority === "must-have" ? 1 : 0
      )) {
        if (inCart.has(kit.equipmentId) || seen.has(kit.equipmentId)) continue;
        seen.add(kit.equipmentId);
        result.push({
          equipmentId: kit.equipmentId,
          name: kit.equipment.name,
          category: kit.equipment.category,
          status: kit.equipment.status,
          notes: null,
          available: kit.equipment.status === "available",
          section: "for-shoot",
          priority: kit.priority,
        });
      }
    }

    return result;
  }, [cart, cartItems, projectType, projectTypeKits]);

  const suggs = suggestions();
  const requiredMissing = suggs.filter((s) => s.section === "required");
  const standardSuggs   = suggs.filter((s) => s.section === "standard");
  const forShootSuggs   = suggs.filter((s) => s.section === "for-shoot");

  function addToCart(id: number) {
    if (!cart.includes(id)) setCart((c) => [...c, id]);
  }

  function removeFromCart(id: number) {
    setCart((c) => c.filter((i) => i !== id));
  }

  function addAllStandard() {
    const ids = standardSuggs.filter((s) => s.available).map((s) => s.equipmentId);
    setCart((c) => [...c, ...ids.filter((id) => !c.includes(id))]);
  }

  const filteredGear = equipment.filter((e) => {
    if (cart.includes(e.id)) return false;
    const q = gearSearch.toLowerCase();
    return !q || e.name.toLowerCase().includes(q) || e.brand.toLowerCase().includes(q);
  });

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!projectName || !startDate || !endDate || cart.length === 0) {
      setError("Fill in all required fields and add at least one item.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          projectName,
          projectType,
          startDate,
          endDate,
          notes,
          equipmentIds: cart,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      clearDraft();
      router.push("/bookings");
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        href="/bookings"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase text-[#8A8A8A] hover:text-[#FF4800] transition-colors mb-8"
      >
        <ArrowLeft size={12} />
        Bookings
      </Link>

      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#FF4800] mb-2 flex items-center gap-3">
          <span className="inline-block w-8 h-px bg-[#FF4800]" />
          New Booking
        </p>
        <h1 className="text-[40px] font-sans font-light tracking-tight text-[#141414] leading-none">
          Create Booking
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* Left — form */}
          <div className="space-y-6">

            {/* Project details */}
            <Card className="p-5 space-y-4">
              <h2 className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A]">Project</h2>

              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1.5">
                  Project / Shoot Name *
                </label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Think Big Offsite — B-roll"
                  className="w-full px-3 py-2 border border-[#141414]/10 rounded-sm bg-white/40 text-[14px] text-[#141414] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1.5">
                  Project Type
                </label>
                <div className="relative">
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as ProjectType)}
                    className="w-full appearance-none pl-3 pr-8 py-2 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] font-mono text-[#3D3D3D] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all cursor-pointer"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] font-mono text-[#3D3D3D] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1.5">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] font-mono text-[#3D3D3D] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1.5">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Shoot details, special requirements…"
                  className="w-full px-3 py-2 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] text-[#3D3D3D] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all resize-none"
                />
              </div>
            </Card>

            {/* Gear cart */}
            <Card className="p-5 space-y-4">
              <h2 className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A]">
                Gear ({cart.length})
              </h2>

              {/* Cart items */}
              {cartItems.length > 0 && (
                <div className="space-y-1.5">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 bg-white/50 border border-[#141414]/8 rounded-sm"
                    >
                      <div className="w-6 h-6 rounded-sm bg-[#FF4800]/8 flex items-center justify-center shrink-0">
                        <Camera size={12} className="text-[#FF4800]" />
                      </div>
                      <span className="flex-1 text-[13px] font-medium text-[#141414] truncate">
                        {item.name}
                      </span>
                      <Badge>{item.category}</Badge>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#8A8A8A] hover:text-[#FF4800] transition-colors p-0.5"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Gear picker */}
              <div>
                <input
                  value={gearSearch}
                  onChange={(e) => setGearSearch(e.target.value)}
                  placeholder="Add gear…"
                  className="w-full px-3 py-2 border border-[#141414]/10 rounded-sm bg-white/40 text-[13px] text-[#141414] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF4800]/40 focus:bg-white/70 transition-all"
                />
                {gearSearch && (
                  <div className="mt-1 border border-[#141414]/10 rounded-sm bg-[#F8F5EE] max-h-52 overflow-y-auto divide-y divide-[#141414]/6 shadow-sm">
                    {filteredGear.slice(0, 20).map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => { addToCart(e.id); setGearSearch(""); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/60 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-[#141414] truncate">{e.name}</div>
                          <div className="font-mono text-[10px] text-[#8A8A8A] tracking-wide">{e.brand} · {e.category}</div>
                        </div>
                        <Badge variant={e.status as "available" | "booked" | "damaged" | "retired" | "default"}>
                          {e.status}
                        </Badge>
                      </button>
                    ))}
                    {filteredGear.length === 0 && (
                      <p className="px-3 py-3 text-[12px] text-[#8A8A8A]">No gear found.</p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Booking as */}
            <div className="flex items-center gap-2 text-[13px] text-[#8A8A8A]">
              <span className="font-mono text-[10px] tracking-widest uppercase">Booking as:</span>
              <span className="font-medium text-[#141414]">{user.name}</span>
              <span className="font-mono text-[10px] text-[#FF4800]">{user.role}</span>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#FCC3DC]/20 border border-[#FCC3DC] rounded-sm text-[#46062B] text-[13px]">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? "Creating…" : "Create Booking"}
              </Button>
              <Button asChild variant="ghost">
                <Link href="/bookings">Cancel</Link>
              </Button>
            </div>
          </div>

          {/* Right — suggestions panel */}
          <div className="space-y-3 sticky top-20">
            <h2 className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A]">
              Suggestions
            </h2>

            {suggs.length === 0 && (
              <div className="p-4 border border-[#141414]/8 rounded-sm bg-white/20 text-[12px] text-[#8A8A8A] text-center">
                {cart.length === 0
                  ? "Add gear to see suggestions."
                  : "No suggestions for this kit."}
              </div>
            )}

            {/* Required */}
            {requiredMissing.length > 0 && (
              <SuggestionSection
                label="Required"
                headerClass="bg-[#FCC3DC]/30 text-[#46062B] border-[#FCC3DC]"
                items={requiredMissing}
                onAdd={addToCart}
                warning="All required items must be included."
              />
            )}

            {/* Standard kit */}
            {standardSuggs.length > 0 && (
              <SuggestionSection
                label="Standard Kit"
                headerClass="bg-white/50 text-[#3D3D3D] border-[#141414]/10"
                items={standardSuggs}
                onAdd={addToCart}
                action={
                  <button
                    type="button"
                    onClick={addAllStandard}
                    className="font-mono text-[9px] tracking-widest uppercase text-[#FF4800] hover:underline"
                  >
                    Add all
                  </button>
                }
              />
            )}

            {/* For this shoot */}
            {forShootSuggs.length > 0 && (
              <SuggestionSection
                label={`For ${projectType} shoot`}
                headerClass="bg-[#D6C2D9]/20 text-[#3D3D3D] border-[#D6C2D9]/40"
                items={forShootSuggs}
                onAdd={addToCart}
              />
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function SuggestionSection({
  label, headerClass, items, onAdd, warning, action,
}: {
  label: string;
  headerClass: string;
  items: Suggestion[];
  onAdd: (id: number) => void;
  warning?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`rounded-sm border overflow-hidden ${headerClass}`}>
      <div className={`px-3 py-2 flex items-center justify-between border-b ${headerClass}`}>
        <span className="font-mono text-[9px] tracking-widest uppercase">{label}</span>
        {action}
      </div>
      {warning && (
        <div className="px-3 py-1.5 bg-[#FCC3DC]/10 border-b border-[#FCC3DC]/30 flex items-center gap-1.5">
          <AlertCircle size={11} className="text-[#46062B]" />
          <span className="text-[11px] text-[#46062B]">{warning}</span>
        </div>
      )}
      <div className="divide-y divide-[#141414]/6 bg-white/20">
        {items.map((s) => (
          <div key={s.equipmentId} className="flex items-center gap-2 px-3 py-2">
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-[#141414] truncate">{s.name}</div>
              {s.notes && (
                <div className="text-[10px] text-[#8A8A8A] truncate">{s.notes}</div>
              )}
              {s.priority && (
                <div className={`font-mono text-[9px] tracking-wide uppercase ${s.priority === "must-have" ? "text-[#FF4800]" : "text-[#8A8A8A]"}`}>
                  {s.priority}
                </div>
              )}
            </div>
            {!s.available && (
              <span className="font-mono text-[9px] text-[#8A8A8A]">unavail.</span>
            )}
            <button
              type="button"
              onClick={() => onAdd(s.equipmentId)}
              disabled={!s.available}
              className="w-6 h-6 rounded-sm border border-[#141414]/15 bg-white/60 flex items-center justify-center text-[#3D3D3D] hover:border-[#FF4800] hover:text-[#FF4800] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Plus size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
