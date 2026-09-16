"use client";

import type { Memory } from "@withu/shared-types";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteMemory } from "@/features/memories/hooks";
import { useAuthStore } from "@/stores/auth-store";

const CATEGORY_LABEL: Record<Memory["category"], string> = {
  first_date: "❤️ First Date",
  trip: "🌍 Trip",
  birthday: "🎂 Birthday",
  funny: "😂 Funny Moment",
  favourite: "📸 Favourite",
  place_to_visit: "🌍 Want to visit",
  milestone: "💍 Milestone",
  general: "✨ Memory",
};

export function MemoryCard({ memory }: { memory: Memory }) {
  const user = useAuthStore((s) => s.user);
  const deleteMemory = useDeleteMemory();
  const mine = memory.authorId === user?.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      <Card className="group overflow-hidden">
        {memory.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={memory.photo.thumbnailUrl} alt={memory.title} className="h-40 w-full object-cover" loading="lazy" />
        )}
        <CardContent className="space-y-1.5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">{CATEGORY_LABEL[memory.category]}</p>
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-base font-medium">{memory.title}</p>
            {mine && (
              <button
                onClick={() => deleteMemory.mutate(memory.id)}
                className="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                aria-label="Delete memory"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </div>
          {memory.caption && <p className="text-sm text-muted-foreground">{memory.caption}</p>}
          {memory.location && <p className="text-xs text-muted-foreground">📍 {memory.location}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
