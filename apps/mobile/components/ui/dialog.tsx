import { Dimensions, Modal, Pressable, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_HEIGHT = Dimensions.get("window").height * 0.75;

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
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <SafeAreaView edges={["bottom"]} className="rounded-t-3xl bg-card">
          <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
            <Text className="font-display text-lg text-foreground">{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color="#6B5D63" />
            </Pressable>
          </View>
          <View className="p-5" style={{ maxHeight: MAX_HEIGHT }}>
            {children}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
