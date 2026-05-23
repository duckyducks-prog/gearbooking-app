"use client";
import { createContext, useContext, useState, useEffect } from "react";

type BookingDraftCtx = {
  draftIds:        number[];
  draftQuantities: Record<number, number>; // equipmentId → qty
  projectName:     string;
  startDate:       string;
  endDate:         string;
  hasDraft:        boolean;
  hasDateDraft:    boolean;
  addItem:         (id: number, qty?: number) => void;
  setQuantity:     (id: number, qty: number) => void; // 0 = remove
  setDates:        (projectName: string, start: string, end: string) => void;
  startBooking:    (projectName: string, start: string, end: string, equipmentId: number, qty?: number) => void;
  clearDraft:      () => void;
};

const Ctx = createContext<BookingDraftCtx>({
  draftIds: [], draftQuantities: {}, projectName: "", startDate: "", endDate: "",
  hasDraft: false, hasDateDraft: false,
  addItem: () => {}, setQuantity: () => {}, setDates: () => {}, startBooking: () => {}, clearDraft: () => {},
});

const KEY = "studio-booking-draft";

export function BookingDraftProvider({ children }: { children: React.ReactNode }) {
  const [draftIds,        setDraftIds]        = useState<number[]>([]);
  const [draftQuantities, setDraftQuantities] = useState<Record<number, number>>({});
  const [projectName,     setProjectName]     = useState("");
  const [startDate,       setStartDate]       = useState("");
  const [endDate,         setEndDate]         = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDraftIds(parsed);
          const qtys: Record<number, number> = {};
          parsed.forEach((id: number) => { qtys[id] = 1; });
          setDraftQuantities(qtys);
        } else {
          setDraftIds(parsed.ids ?? []);
          setDraftQuantities(parsed.quantities ?? {});
          setProjectName(parsed.projectName ?? "");
          setStartDate(parsed.startDate ?? "");
          setEndDate(parsed.endDate ?? "");
        }
      }
    } catch {}
  }, []);

  function persist(
    ids: number[],
    quantities: Record<number, number>,
    name: string,
    start: string,
    end: string,
  ) {
    localStorage.setItem(KEY, JSON.stringify({ ids, quantities, projectName: name, startDate: start, endDate: end }));
  }

  function addItem(id: number, qty = 1) {
    setDraftIds((prevIds) => {
      const newIds = prevIds.includes(id) ? prevIds : [...prevIds, id];
      setDraftQuantities((prevQtys) => {
        const newQtys = { ...prevQtys, [id]: prevQtys[id] ?? qty };
        persist(newIds, newQtys, projectName, startDate, endDate);
        return newQtys;
      });
      return newIds;
    });
  }

  function setQuantity(id: number, qty: number) {
    if (qty <= 0) {
      // Remove item from draft
      setDraftIds((prevIds) => {
        const newIds = prevIds.filter((i) => i !== id);
        setDraftQuantities((prevQtys) => {
          const newQtys = { ...prevQtys };
          delete newQtys[id];
          persist(newIds, newQtys, projectName, startDate, endDate);
          return newQtys;
        });
        return newIds;
      });
    } else {
      setDraftQuantities((prevQtys) => {
        const newQtys = { ...prevQtys, [id]: qty };
        persist(draftIds, newQtys, projectName, startDate, endDate);
        return newQtys;
      });
    }
  }

  function setDates(name: string, start: string, end: string) {
    setProjectName(name);
    setStartDate(start);
    setEndDate(end);
    persist(draftIds, draftQuantities, name, start, end);
  }

  function startBooking(name: string, start: string, end: string, equipmentId: number, qty = 1) {
    setProjectName(name);
    setStartDate(start);
    setEndDate(end);
    setDraftIds((prevIds) => {
      const newIds = prevIds.includes(equipmentId) ? prevIds : [...prevIds, equipmentId];
      setDraftQuantities((prevQtys) => {
        const newQtys = { ...prevQtys, [equipmentId]: prevQtys[equipmentId] ?? qty };
        persist(newIds, newQtys, name, start, end);
        return newQtys;
      });
      return newIds;
    });
  }

  function clearDraft() {
    setDraftIds([]);
    setDraftQuantities({});
    setProjectName("");
    setStartDate("");
    setEndDate("");
    localStorage.removeItem(KEY);
  }

  return (
    <Ctx.Provider value={{
      draftIds, draftQuantities, projectName, startDate, endDate,
      hasDraft:     draftIds.length > 0,
      hasDateDraft: !!(startDate && endDate),
      addItem, setQuantity, setDates, startBooking, clearDraft,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBookingDraft() {
  return useContext(Ctx);
}
