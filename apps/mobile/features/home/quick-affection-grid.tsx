import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { AFFECTIONS } from "@withu/constants";
import { useSendAffection } from "@/features/affection/hooks";

export function QuickAffectionGrid() {
  const sendAffection = useSendAffection();

  return (
    <View className="flex-row flex-wrap gap-2">
      {AFFECTIONS.map((a) => (
        <Pressable
          key={a.value}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
            sendAffection.mutate({ kind: a.value });
          }}
          className="items-center gap-1 rounded-2xl bg-secondary px-4 py-3"
          style={{ minWidth: "30%" }}
        >
          <Text className="text-xl">{a.emoji}</Text>
          <Text className="text-[11px] font-sans-medium text-secondary-foreground">{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
