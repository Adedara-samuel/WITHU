import { View } from "react-native";
import type { PresenceState } from "@withu/shared-types";
import { cn } from "@/lib/cn";

const COLOR_CLASS: Record<PresenceState, string> = {
  online: "bg-green-500",
  away: "bg-amber-500",
  offline: "bg-muted-foreground",
};

export function PresenceDot({ presence, className }: { presence: PresenceState; className?: string }) {
  return <View className={cn("h-3 w-3 rounded-full border-2 border-card", COLOR_CLASS[presence], className)} />;
}
