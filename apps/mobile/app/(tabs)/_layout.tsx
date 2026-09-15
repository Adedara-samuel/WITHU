import { useEffect } from "react";
import { Redirect, router, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Gamepad2, Heart, Image as ImageIcon, MessageCircle, Sparkles } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { useMyCouple } from "@/features/couple/hooks";

export default function TabsLayout() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: couple, isLoading } = useMyCouple();

  useEffect(() => {
    if (!isLoading && accessToken && !couple?.partnerTwo) router.replace("/onboarding/couple");
  }, [isLoading, couple, accessToken]);

  if (!hasHydrated) return null;
  if (!accessToken) return <Redirect href="/login" />;

  if (isLoading || !couple?.partnerTwo) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#7A2C4C" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#7A2C4C",
        tabBarInactiveTintColor: "#6B5D63",
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Our Space", tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> }} />
      <Tabs.Screen name="chat" options={{ title: "Chat", tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }} />
      <Tabs.Screen name="together" options={{ title: "Together", tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} /> }} />
      <Tabs.Screen name="games" options={{ title: "Games", tabBarIcon: ({ color, size }) => <Gamepad2 color={color} size={size} /> }} />
      <Tabs.Screen name="memories" options={{ title: "Memories", tabBarIcon: ({ color, size }) => <ImageIcon color={color} size={size} /> }} />
    </Tabs>
  );
}
