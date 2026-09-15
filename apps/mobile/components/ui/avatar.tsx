import { Image, Text, View } from "react-native";
import { cn } from "@/lib/cn";

export function Avatar({
  uri,
  name,
  size = 40,
  className,
}: {
  uri?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return <Image source={{ uri }} style={dimension} className={cn("bg-muted", className)} />;
  }
  return (
    <View style={dimension} className={cn("items-center justify-center bg-secondary", className)}>
      <Text className="font-display text-secondary-foreground" style={{ fontSize: size * 0.4 }}>
        {name[0]?.toUpperCase()}
      </Text>
    </View>
  );
}
