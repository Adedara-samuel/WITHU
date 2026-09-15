import { View } from "react-native";
import { MOODS, STATUSES } from "@withu/constants";
import type { Mood, UserStatus } from "@withu/shared-types";
import { PickerButton } from "@/components/ui/picker-modal";
import { useSetMood, useSetStatus } from "@/features/profile/hooks";
import { useAuthStore } from "@/stores/auth-store";

export function MoodStatusPicker() {
  const user = useAuthStore((s) => s.user);
  const setMood = useSetMood();
  const setStatus = useSetStatus();

  return (
    <View className="flex-row flex-wrap gap-2">
      <PickerButton<Mood>
        title="Set your mood"
        placeholder="Set your mood"
        value={user?.mood}
        options={MOODS.map((m) => ({ value: m.value, label: `${m.emoji} ${m.label}` }))}
        onChange={(mood) => setMood.mutate({ mood, moodMessage: user?.moodMessage ?? null })}
      />
      <PickerButton<UserStatus>
        title="Set your status"
        placeholder="Set your status"
        value={user?.status}
        options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        onChange={(status) => setStatus.mutate({ status })}
      />
    </View>
  );
}
