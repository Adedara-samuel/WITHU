import { Modal, Pressable, Text, useWindowDimensions, View } from "react-native";
import { X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";

export function Dialog({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  // useWindowDimensions (not Dimensions.get, which only reads once) so the sheet
  // re-measures itself if the device rotates or is a tablet/foldable.
  const { height } = useWindowDimensions();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View entering={FadeIn.duration(180)} className="absolute inset-0 bg-black/40">
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>
        <SafeAreaView edges={["bottom"]} className="rounded-t-3xl bg-card">
          <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
            <Text className="font-display text-lg text-foreground">{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} className="h-9 w-9 items-center justify-center rounded-full">
              <X size={20} color="#63746E" />
            </Pressable>
          </View>
          <View className="p-5" style={{ maxHeight: height * 0.75 }}>
            {children}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
