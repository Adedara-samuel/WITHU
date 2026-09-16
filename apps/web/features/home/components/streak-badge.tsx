"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

// A streak is the app's core "don't break the chain" hook - it deserves a badge
// that pops the moment it ticks up, not a quiet line of text buried in a card.
export function StreakBadge({ days }: { days: number }) {
  const prevDays = useRef(days);
  const [justIncreased, setJustIncreased] = useState(false);

  useEffect(() => {
    if (days > prevDays.current) {
      setJustIncreased(true);
      const t = setTimeout(() => setJustIncreased(false), 700);
      return () => clearTimeout(t);
    }
    prevDays.current = days;
  }, [days]);

  return (
    <motion.div
      animate={justIncreased ? { scale: [1, 1.35, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex w-fit items-center gap-1.5 rounded-full bg-ember/15 px-3 py-1.5 text-sm"
    >
      <Flame className="h-4 w-4 text-ember" />
      <span className="font-semibold text-ember">
        {days} day{days === 1 ? "" : "s"} strong
      </span>
    </motion.div>
  );
}
