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
  clearDraft:   () => void;
};

const Ctx = createContext<BookingDraftCtx>({
  draftIds: [], projectName: "", startDate: "", endDate: "",
  hasDraft: false, hasDateDraft: false,
  addItem: () => {}, setDates: () => {}, clearDraft: () => {},
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
      addItem, setDates, clearDraft,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBookingDraft() {
  return useContext(Ctx);
}
