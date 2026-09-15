"use client";

import { AFFECTIONS } from "@withu/constants";
import { Button } from "@/components/ui/button";
import { useAffectionBurst } from "@/components/effects/affection-burst";
import { useSendAffection } from "@/features/affection/hooks";

export function QuickAffectionGrid() {
  const sendAffection = useSendAffection();
  const burst = useAffectionBurst();

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {AFFECTIONS.map((a) => (
        <Button
          key={a.value}
          variant="secondary"
          className="h-auto flex-col gap-1 py-3"
          disabled={sendAffection.isPending}
          onClick={() => {
            burst(a.emoji);
            sendAffection.mutate({ kind: a.value });
          }}
        >
          <span className="text-xl">{a.emoji}</span>
          <span className="text-[11px] font-medium">{a.label}</span>
        </Button>
      ))}
    </div>
  );
}
