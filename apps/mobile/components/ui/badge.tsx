import { Text, View } from "react-native";
import { cn } from "@/lib/cn";

type Variant = "default" | "secondary" | "success";

const CLASSES: Record<Variant, { bg: string; text: string }> = {
  default: { bg: "bg-primary/10", text: "text-primary" },
  secondary: { bg: "bg-secondary", text: "text-secondary-foreground" },
  success: { bg: "bg-green-100", text: "text-green-700" },
};

export function Badge({ children, variant = "default", className }: { children: React.ReactNode; variant?: Variant; className?: string }) {
  const c = CLASSES[variant];
  return (
    <View className={cn("self-start rounded-full px-2.5 py-1", c.bg, className)}>
      <Text className={cn("text-xs font-sans-medium", c.text)}>{children}</Text>
    </View>
  );
}
