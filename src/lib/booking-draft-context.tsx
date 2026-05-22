"use client";
import { createContext, useContext, useState, useEffect } from "react";

type BookingDraftCtx = {
  draftIds: number[];
  addItem: (id: number) => void;
  clearDraft: () => void;
  hasDraft: boolean;
};

const Ctx = createContext<BookingDraftCtx>({
  draftIds: [],
  addItem: () => {},
  clearDraft: () => {},
  hasDraft: false,
});

const KEY = "studio-booking-draft";

export function BookingDraftProvider({ children }: { children: React.ReactNode }) {
  const [draftIds, setDraftIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setDraftIds(JSON.parse(stored));
    } catch {}
  }, []);

  function addItem(id: number) {
    setDraftIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }

  function clearDraft() {
    setDraftIds([]);
    localStorage.removeItem(KEY);
  }

  return (
    <Ctx.Provider value={{ draftIds, addItem, clearDraft, hasDraft: draftIds.length > 0 }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBookingDraft() {
  return useContext(Ctx);
}
