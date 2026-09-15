"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface BurstItem {
  id: string;
  emoji: string;
  x: number;
}

const BurstContext = createContext<((emoji: string) => void) | null>(null);

export function useAffectionBurst() {
  const ctx = useContext(BurstContext);
  if (!ctx) throw new Error("useAffectionBurst must be used within AffectionBurstProvider");
  return ctx;
}

export function AffectionBurstProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BurstItem[]>([]);

  const burst = useCallback((emoji: string) => {
    const id = Math.random().toString(36).slice(2);
    const x = 40 + Math.random() * 20;
    setItems((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 1500);
  }, []);

  return (
    <BurstContext.Provider value={burst}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex justify-center lg:bottom-10">
        <div className="relative h-1 w-1">
          <AnimatePresence>
            {items.map((item) => (
              <motion.span
                key={item.id}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: 1, y: -80, scale: 1.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, ease: "easeOut" }}
                className="absolute text-3xl"
                style={{ left: `${item.x - 40}px` }}
              >
                {item.emoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </BurstContext.Provider>
  );
}
