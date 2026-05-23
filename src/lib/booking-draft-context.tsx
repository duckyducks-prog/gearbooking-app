"use client";
import { createContext, useContext, useState, useEffect } from "react";

type BookingDraftCtx = {
  draftIds:     number[];
  projectName:  string;
  startDate:    string;
  endDate:      string;
  hasDraft:     boolean;
  hasDateDraft: boolean;
  addItem:      (id: number) => void;
  setDates:     (projectName: string, start: string, end: string) => void;
  // Atomic: sets dates + adds first item in one persist call, avoiding stale closure
  startBooking: (projectName: string, start: string, end: string, equipmentId: number) => void;
  clearDraft:   () => void;
};

const Ctx = createContext<BookingDraftCtx>({
  draftIds: [], projectName: "", startDate: "", endDate: "",
  hasDraft: false, hasDateDraft: false,
  addItem: () => {}, setDates: () => {}, startBooking: () => {}, clearDraft: () => {},
});

const KEY = "studio-booking-draft";

export function BookingDraftProvider({ children }: { children: React.ReactNode }) {
  const [draftIds,    setDraftIds]    = useState<number[]>([]);
  const [projectName, setProjectName] = useState("");
  const [startDate,   setStartDate]   = useState("");
  const [endDate,     setEndDate]     = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Legacy: old format was just an array of IDs
          setDraftIds(parsed);
        } else {
          setDraftIds(parsed.ids ?? []);
          setProjectName(parsed.projectName ?? "");
          setStartDate(parsed.startDate ?? "");
          setEndDate(parsed.endDate ?? "");
        }
      }
    } catch {}
  }, []);

  function persist(ids: number[], name: string, start: string, end: string) {
    localStorage.setItem(KEY, JSON.stringify({ ids, projectName: name, startDate: start, endDate: end }));
  }

  function addItem(id: number) {
    setDraftIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      persist(next, projectName, startDate, endDate);
      return next;
    });
  }

  function setDates(name: string, start: string, end: string) {
    setProjectName(name);
    setStartDate(start);
    setEndDate(end);
    persist(draftIds, name, start, end);
  }

  // Atomic version used by the modal: sets dates AND adds the first item
  // in a single setDraftIds callback so persist sees the correct values.
  function startBooking(name: string, start: string, end: string, equipmentId: number) {
    setProjectName(name);
    setStartDate(start);
    setEndDate(end);
    setDraftIds((prev) => {
      const next = prev.includes(equipmentId) ? prev : [...prev, equipmentId];
      persist(next, name, start, end);
      return next;
    });
  }

  function clearDraft() {
    setDraftIds([]);
    setProjectName("");
    setStartDate("");
    setEndDate("");
    localStorage.removeItem(KEY);
  }

  return (
    <Ctx.Provider value={{
      draftIds, projectName, startDate, endDate,
      hasDraft:     draftIds.length > 0,
      hasDateDraft: !!(startDate && endDate),
      addItem, setDates, startBooking, clearDraft,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBookingDraft() {
  return useContext(Ctx);
}
