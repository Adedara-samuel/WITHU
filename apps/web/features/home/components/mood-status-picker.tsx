"use client";

import { MOODS, STATUSES } from "@withu/constants";
import type { Mood, UserStatus } from "@withu/shared-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSetMood, useSetStatus } from "@/features/profile/hooks";
import { useAuthStore } from "@/stores/auth-store";

export function MoodStatusPicker() {
  const user = useAuthStore((s) => s.user);
  const setMood = useSetMood();
  const setStatus = useSetStatus();

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={user?.mood ?? undefined}
        onValueChange={(value) => setMood.mutate({ mood: value as Mood, moodMessage: user?.moodMessage ?? null })}
      >
        <SelectTrigger className="w-auto min-w-[140px]">
          <SelectValue placeholder="Set your mood" />
        </SelectTrigger>
        <SelectContent>
          {MOODS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.emoji} {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={user?.status ?? undefined} onValueChange={(value) => setStatus.mutate({ status: value as UserStatus })}>
        <SelectTrigger className="w-auto min-w-[140px]">
          <SelectValue placeholder="Set your status" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
