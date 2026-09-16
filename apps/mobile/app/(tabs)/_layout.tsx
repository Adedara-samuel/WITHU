import { useEffect } from "react";
import { Redirect, router, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Gamepad2, Heart, Image as ImageIcon, MessageCircle, Sparkles } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { useMyCouple } from "@/features/couple/hooks";
import { AnimatedTabIcon } from "@/components/ui/animated-tab-icon";

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
        <ActivityIndicator color="#276852" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#276852",
        tabBarInactiveTintColor: "#63746E",
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Our Space", tabBarIcon: ({ color, size, focused }) => <AnimatedTabIcon focused={focused}><Heart color={color} size={size} /></AnimatedTabIcon> }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: "Chat", tabBarIcon: ({ color, size, focused }) => <AnimatedTabIcon focused={focused}><MessageCircle color={color} size={size} /></AnimatedTabIcon> }}
      />
      <Tabs.Screen
        name="together"
        options={{ title: "Together", tabBarIcon: ({ color, size, focused }) => <AnimatedTabIcon focused={focused}><Sparkles color={color} size={size} /></AnimatedTabIcon> }}
      />
      <Tabs.Screen
        name="games"
        options={{ title: "Games", tabBarIcon: ({ color, size, focused }) => <AnimatedTabIcon focused={focused}><Gamepad2 color={color} size={size} /></AnimatedTabIcon> }}
      />
      <Tabs.Screen
        name="memories"
        options={{ title: "Memories", tabBarIcon: ({ color, size, focused }) => <AnimatedTabIcon focused={focused}><ImageIcon color={color} size={size} /></AnimatedTabIcon> }}
      />
    </Tabs>
  );
}
