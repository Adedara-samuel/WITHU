import { useEffect, useRef } from "react";
import { Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Flame } from "lucide-react-native";

// A streak is the app's core "don't break the chain" hook - it deserves a badge
// that pops (scale bounce + success haptic) the moment it ticks up, not a quiet
// line of text buried in a card.
export function StreakBadge({ days }: { days: number }) {
  const scale = useSharedValue(1);
  const prevDays = useRef(days);

  useEffect(() => {
    if (days > prevDays.current) {
      scale.value = withSequence(
        withSpring(1.35, { stiffness: 600, damping: 7 }),
        withSpring(1, { stiffness: 300, damping: 10 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
    prevDays.current = days;
  }, [days, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={style}
      className="flex-row items-center gap-1.5 self-start rounded-full bg-ember/15 px-3 py-1.5"
    >
      <Flame size={15} color="#C26447" />
      <Text className="text-sm font-sans-medium text-ember">
        {days} day{days === 1 ? "" : "s"} strong
      </Text>
    </Animated.View>
  );
}
