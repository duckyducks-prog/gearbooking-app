# Gear Suggestions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a booking is open, show a "You might also need" panel listing accessories or companion gear that is missing from the booking, based on manually seeded equipment relationships.

**Architecture:** Three independent parts: (1) seed known relationships into the existing `EquipmentRelation` table, (2) a new API endpoint that queries those relations filtered against the current booking, (3) a suggestions panel component on the booking detail page that calls the existing `addGear()` function. No schema changes needed — `EquipmentRelation` with `relationType` and `bookFrequency` already exists.

**Tech Stack:** Next.js 16 App Router · Prisma 7 · SQLite · React 19 · TypeScript

---

## File map

| File | Action | Purpose |
|---|---|---|
| `prisma/seed.ts` | Modify | Add `EquipmentRelation` creates after equipment seeding |
| `src/app/api/bookings/[id]/suggestions/route.ts` | Create | GET — return missing accessories for a booking |
| `src/app/bookings/[id]/suggestions-panel.tsx` | Create | Client component rendering the suggestions UI |
| `src/app/bookings/[id]/booking-detail.tsx` | Modify | Import + render `SuggestionsPanel` between gear list and search |

---

## Task 1: Seed equipment relationships

**Files:**
- Modify: `prisma/seed.ts` (add relations block at the end, before the sample booking)

Relations to seed. All use `findFirst` by name, matching the existing seed pattern.

**Camera → Monitor (standard)**
- ARRI Alexa MINI Kit → Atomos Shogun Inferno 7" (`required`)
- ARRI Alexa MINI Kit → Hollyland Pyro 7 (`standard`)
- Sony FS7 → Atomos Ninja V 5" (`required`)
- Sony FS7 → SmallHD 5" Monitor (`standard`)
- Sony FS5 → Atomos Ninja V 5" (`required`)
- Sony a7C → Atomos Ninja V 5" (`standard`)
- Sony a7s → Atomos Ninja V 5" (`standard`)
- Blackmagic Pocket Cinema Camera 4K → Atomos Ninja V 5" (`standard`)

**Camera → Wireless video**
- ARRI Alexa MINI Kit → Hollyland Cosmo C1 Transmitter (`standard`)
- Sony FS7 → Hollyland Cosmo C1 Transmitter (`standard`)
- Sony FS5 → Hollyland Cosmo C1 Transmitter (`standard`)

**Wireless TX → RX (always need both)**
- Hollyland Cosmo C1 Transmitter → Hollyland Cosmo C1 Receiver (`required`)
- Hollyland Mars 300 Transmitter → Hollyland Mars 300 Receiver (`required`)

**Lens mount pairings**
- ARRI Alexa MINI Kit → DZOFilm Pictor 20-55 / 50-125mm T2.8 Bundle (`standard`)
- ARRI Alexa MINI Kit → DZOFilm Vespid2 T1.9 Prime Set (`standard`)
- Sony a7C → Sigma 24-70mm (`standard`)
- Sony a7s → Sigma 24-70mm (`standard`)
- Sony FS7 → Fujinon 50-135mm (`standard`)

**Lighting combos**
- Aputure 600x → Aputure MC (`standard`)
- Aputure 600x → Aputure InfiniBars (`standard`)
- Aputure 120d → Aputure MC (`standard`)
- ARRI SkyPanel S30 → Aputure MC (`standard`)

- [ ] **Step 1: Add the relations block to prisma/seed.ts**

Open `prisma/seed.ts`. Find the section after all `equipment.createMany` calls and before the sample booking creation (around line 565). Add the following block:

```ts
  // ── Equipment Relations ────────────────────────────────
  async function relate(parentName: string, childName: string, type: string) {
    const parent = await prisma.equipment.findFirst({ where: { name: parentName } });
    const child  = await prisma.equipment.findFirst({ where: { name: childName  } });
    if (!parent || !child) return;
    await prisma.equipmentRelation.upsert({
      where: { parentId_childId: { parentId: parent.id, childId: child.id } },
      update: { relationType: type },
      create: { parentId: parent.id, childId: child.id, relationType: type },
    });
  }

  // Camera → Monitor
  await relate("ARRI Alexa MINI Kit", `Atomos Shogun Inferno 7"`,  "required");
  await relate("ARRI Alexa MINI Kit", "Hollyland Pyro 7",           "standard");
  await relate("Sony FS7",            `Atomos Ninja V 5"`,          "required");
  await relate("Sony FS7",            `SmallHD 5" Monitor`,         "standard");
  await relate("Sony FS5",            `Atomos Ninja V 5"`,          "required");
  await relate("Sony a7C",            `Atomos Ninja V 5"`,          "standard");
  await relate("Sony a7s",            `Atomos Ninja V 5"`,          "standard");
  await relate("Blackmagic Pocket Cinema Camera 4K", `Atomos Ninja V 5"`, "standard");

  // Camera → Wireless TX
  await relate("ARRI Alexa MINI Kit", "Hollyland Cosmo C1 Transmitter", "standard");
  await relate("Sony FS7",            "Hollyland Cosmo C1 Transmitter", "standard");
  await relate("Sony FS5",            "Hollyland Cosmo C1 Transmitter", "standard");

  // Wireless TX → RX (always need both)
  await relate("Hollyland Cosmo C1 Transmitter", "Hollyland Cosmo C1 Receiver",   "required");
  await relate("Hollyland Mars 300 Transmitter", "Hollyland Mars 300 Receiver",   "required");

  // Lens mount pairings
  await relate("ARRI Alexa MINI Kit", "DZOFilm Pictor 20-55 / 50-125mm T2.8 Bundle", "standard");
  await relate("ARRI Alexa MINI Kit", "DZOFilm Vespid2 T1.9 Prime Set",              "standard");
  await relate("Sony a7C",            "Sigma 24-70mm",                               "standard");
  await relate("Sony a7s",            "Sigma 24-70mm",                               "standard");
  await relate("Sony FS7",            "Fujinon 50-135mm",                            "standard");

  // Lighting combos
  await relate("Aputure 600x",    "Aputure MC",          "standard");
  await relate("Aputure 600x",    "Aputure InfiniBars",  "standard");
  await relate("Aputure 120d",    "Aputure MC",          "standard");
  await relate("ARRI SkyPanel S30", "Aputure MC",        "standard");
```

- [ ] **Step 2: Re-seed the database**

```bash
cd /Users/ldebortolialves/CODING_PROJECTS/gear-booking
npm run db:seed
```

Expected output ends with `✓ Seed complete` and `Equipment: 52 items`. No errors.

- [ ] **Step 3: Verify relations were created**

```bash
sqlite3 /Users/ldebortolialves/CODING_PROJECTS/gear-booking/dev.db \
  "SELECT COUNT(*) FROM EquipmentRelation;"
```

Expected: a number greater than 0 (should be ~22).

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: seed equipment relations for gear suggestions"
```

---

## Task 2: Suggestions API endpoint

**Files:**
- Create: `src/app/api/bookings/[id]/suggestions/route.ts`

The endpoint:
1. Gets all equipment IDs in the booking
2. Queries `EquipmentRelation` where `parentId` is one of those IDs
3. Filters out children already in the booking
4. Deduplicates (multiple cameras may suggest the same monitor)
5. Returns sorted: `required` first, then by `bookFrequency` descending

- [ ] **Step 1: Create the route file**

Create `src/app/api/bookings/[id]/suggestions/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookingId = parseInt(id);
  if (isNaN(bookingId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  // Get equipment IDs already in this booking
  const items = await prisma.bookingItem.findMany({
    where: { bookingId },
    select: { equipmentId: true },
  });
  const bookedIds = items.map((i) => i.equipmentId);

  if (bookedIds.length === 0) return NextResponse.json([]);

  // Find relations where parent is in the booking and child is NOT
  const relations = await prisma.equipmentRelation.findMany({
    where: {
      parentId: { in: bookedIds },
      childId:  { notIn: bookedIds },
      child:    { status: { notIn: ["retired", "damaged"] } },
    },
    include: {
      child:  { select: { id: true, name: true, brand: true, category: true, status: true, photo: true } },
      parent: { select: { name: true } },
    },
    orderBy: [
      { relationType: "asc" },     // "required" < "standard" < "optional" alphabetically
      { bookFrequency: "desc" },
    ],
  });

  // Deduplicate by childId — keep the highest-priority mention
  const seen = new Set<number>();
  const suggestions = relations
    .filter((r) => {
      if (seen.has(r.childId)) return false;
      seen.add(r.childId);
      return true;
    })
    .map((r) => ({
      equipment:    r.child,
      relationType: r.relationType,
      reason:       r.parent.name,
      bookFrequency: r.bookFrequency,
    }));

  return NextResponse.json(suggestions);
}
```

- [ ] **Step 2: Verify the endpoint works**

With the dev server running and a booking that contains an ARRI Alexa MINI Kit, call:

```
curl http://localhost:3000/api/bookings/1/suggestions
```

Expected: JSON array with suggestions including `Atomos Shogun Inferno 7"` (required) and others.

If the booking has no gear with defined relations, the response will be `[]` — that's correct.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/bookings/\[id\]/suggestions/route.ts
git commit -m "feat: GET /api/bookings/[id]/suggestions endpoint"
```

---

## Task 3: Suggestions panel UI

**Files:**
- Create: `src/app/bookings/[id]/suggestions-panel.tsx`
- Modify: `src/app/bookings/[id]/booking-detail.tsx`

The panel fetches suggestions on mount (and re-fetches when `bookingItemIds` changes), shows required items with a pink accent, standard items in neutral style, and an "+ Add" button on each that calls the existing `addGear()` function passed down from `BookingDetail`.

- [ ] **Step 1: Create suggestions-panel.tsx**

Create `src/app/bookings/[id]/suggestions-panel.tsx`:

```tsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Lightbulb } from "lucide-react";

type Suggestion = {
  equipment: {
    id: number;
    name: string;
    brand: string;
    category: string;
    status: string;
    photo: string | null;
  };
  relationType: string;
  reason: string;
  bookFrequency: number;
};

type Props = {
  bookingId: number;
  bookingItemIds: number[];   // re-fetches when this changes
  onAdd: (equipmentId: number) => Promise<void>;
  adding: number | null;
};

export function SuggestionsPanel({ bookingId, bookingItemIds, onAdd, adding }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}/suggestions`)
      .then((r) => r.json())
      .then((data) => setSuggestions(Array.isArray(data) ? data : []))
      .catch(() => setSuggestions([]));
  }, [bookingId, bookingItemIds.join(",")]);

  if (suggestions.length === 0) return null;

  const required  = suggestions.filter((s) => s.relationType === "required");
  const suggested = suggestions.filter((s) => s.relationType !== "required");

  return (
    <div className="mt-4">
      <h2 className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A] mb-3">
        <Lightbulb size={11} />
        You might also need
      </h2>

      <div className="space-y-1.5">
        {required.length > 0 && (
          <div className="rounded-sm border border-[#FCC3DC]/60 bg-[#FCC3DC]/10 overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[#FCC3DC]/30 font-mono text-[9px] tracking-widest uppercase text-[#46062B]">
              Required
            </div>
            {required.map((s) => (
              <SuggestionRow key={s.equipment.id} suggestion={s} onAdd={onAdd} adding={adding} />
            ))}
          </div>
        )}

        {suggested.length > 0 && (
          <div className="rounded-sm border border-[#141414]/10 bg-white/30 overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[#141414]/8 font-mono text-[9px] tracking-widest uppercase text-[#8A8A8A]">
              Suggested
            </div>
            {suggested.map((s) => (
              <SuggestionRow key={s.equipment.id} suggestion={s} onAdd={onAdd} adding={adding} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionRow({
  suggestion, onAdd, adding,
}: {
  suggestion: Suggestion;
  onAdd: (id: number) => Promise<void>;
  adding: number | null;
}) {
  const { equipment, reason } = suggestion;
  const isAdding = adding === equipment.id;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-[#141414]/6 last:border-0">
      <div className="w-8 h-8 rounded-sm bg-[#F8F5EE] border border-[#141414]/8 overflow-hidden flex items-center justify-center shrink-0">
        {equipment.photo ? (
          <Image src={equipment.photo} alt={equipment.name} width={32} height={32} className="object-cover w-full h-full" />
        ) : (
          <Camera size={12} className="text-[#8A8A8A]/40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#141414] truncate">{equipment.name}</p>
        <p className="font-mono text-[9px] tracking-wide text-[#8A8A8A] truncate">
          for {reason}
        </p>
      </div>
      <button
        onClick={() => onAdd(equipment.id)}
        disabled={isAdding || equipment.status === "booked"}
        className="shrink-0 px-2.5 py-1 border border-[#141414]/15 rounded-sm text-[11px] font-mono tracking-wide text-[#3D3D3D] bg-white/50 hover:bg-white/80 hover:border-[#FF4800]/30 hover:text-[#FF4800] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isAdding ? "…" : equipment.status === "booked" ? "Taken" : "+ Add"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Wire SuggestionsPanel into booking-detail.tsx**

Open `src/app/bookings/[id]/booking-detail.tsx`.

Add the import at the top:

```ts
import { SuggestionsPanel } from "./suggestions-panel";
```

The `booking` state holds the current items. Find the JSX section between the current gear list and the search input (around the `{/* Add gear search */}` comment). Insert the panel between them:

```tsx
        {/* Gear suggestions */}
        <SuggestionsPanel
          bookingId={booking.id}
          bookingItemIds={booking.items.map((i) => i.equipment.id)}
          onAdd={addGear}
          adding={adding}
        />

        {/* Add gear search */}
```

The `bookingItemIds` prop re-fetches suggestions whenever the booking items change — when you add gear that was suggested, it disappears from the panel automatically.

- [ ] **Step 3: Verify — booking with ARRI camera shows suggestions**

Run `npm run dev`. Open a booking that contains "ARRI Alexa MINI Kit". The panel should appear below the gear list showing:

- **Required** section: Atomos Shogun Inferno 7" — "for ARRI Alexa MINI Kit"
- **Suggested** section: Hollyland Pyro 7, DZOFilm Pictor bundle, etc.

Click "+ Add" on any suggestion — it should add to the booking and disappear from the panel.

Open a booking with no gear — panel should not render at all.

- [ ] **Step 4: Commit**

```bash
git add \
  src/app/bookings/\[id\]/suggestions-panel.tsx \
  src/app/bookings/\[id\]/booking-detail.tsx
git commit -m "feat: gear suggestions panel on booking detail"
```

---

## Self-review

**Spec coverage:**

| Requirement | Task |
|---|---|
| Suggest missing accessories | Task 2 (API) + Task 3 (UI) |
| Required vs suggested distinction | Task 2 returns `relationType`; Task 3 shows separate sections |
| Seed known relationships | Task 1 |
| "+ Add" button adds gear directly | Task 3 — calls existing `addGear()` |
| Panel disappears when nothing to suggest | Task 3 — `if (suggestions.length === 0) return null` |
| Taken gear shows disabled | Task 3 — `equipment.status === "booked"` disables button |

**No placeholders:** All code is complete. No TBD.

**Type consistency:** `Suggestion.equipment.id` is used as the key and passed to `onAdd` consistently. `bookingItemIds` is `number[]` derived from `booking.items.map((i) => i.equipment.id)` which matches the `BookingItem` type in `booking-detail.tsx`.

**One note on the seed:** The `relate()` helper uses `upsert` so re-seeding is idempotent — running `npm run db:seed` multiple times won't create duplicate relations.

---

## Execution options

**1. Subagent-Driven (recommended)** — one agent per task, review between tasks

**2. Inline** — run tasks serially in this session via `dev-flow:executing-plans`

Tasks 1 and 2 are fully independent. Task 3 depends on Task 2 (the endpoint must exist before wiring the panel).
