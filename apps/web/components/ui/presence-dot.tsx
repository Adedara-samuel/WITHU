import type { PresenceState } from "@withu/shared-types";
import { cn } from "@/lib/utils";

const COLORS: Record<PresenceState, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-muted-foreground/40",
};

export function PresenceDot({ presence, className }: { presence: PresenceState; className?: string }) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      {presence === "online" && (
        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", COLORS.online)} />
      )}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-card", COLORS[presence])} />
    </span>
  );
}
