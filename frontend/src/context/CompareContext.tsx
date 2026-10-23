import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'compare_plot_ids';
const MAX_COMPARE = 3;

interface CompareContextValue {
  ids: number[];
  isComparing: (id: number) => boolean;
  toggleCompare: (id: number) => void;
  clearCompare: () => void;
  removeFromCompare: (id: number) => void;
  maxReached: boolean;
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

function readStored(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(() => readStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids]);

  function toggleCompare(id: number) {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  function removeFromCompare(id: number) {
    setIds((prev) => prev.filter((x) => x !== id));
  }

  function clearCompare() {
    setIds([]);
  }

  return (
    <CompareContext.Provider
      value={{
        ids,
        isComparing: (id: number) => ids.includes(id),
        toggleCompare,
        clearCompare,
        removeFromCompare,
        maxReached: ids.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
