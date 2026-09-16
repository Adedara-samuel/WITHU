import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gamepad2, Image as ImageIcon, MessageCircle, Music, Settings, Video } from "lucide-react-native";
import { useMyCouple } from "@/features/couple/hooks";
import { useAffectionRealtime } from "@/features/affection/hooks";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { PartnerPresenceCard } from "@/features/home/partner-presence-card";
import { MoodStatusPicker } from "@/features/home/mood-status-picker";
import { QuickAffectionGrid } from "@/features/home/quick-affection-grid";
import { LoveDropDialog } from "@/features/home/love-drop-dialog";
import { useAuthStore } from "@/stores/auth-store";

const ACTIVITIES = [
  { href: "/games", label: "Play", Icon: Gamepad2 },
  { href: "/together", label: "Watch", Icon: Video },
  { href: "/together", label: "Listen", Icon: Music },
  { href: "/chat", label: "Talk", Icon: MessageCircle },
  { href: "/memories", label: "Memories", Icon: ImageIcon },
] as const;

export default function OurSpaceScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: couple } = useMyCouple();
  const { show } = useToast();

  useAffectionRealtime({
    onAffection: (event) => {
      if (event.senderId === user?.id) return;
      show({ title: "You've been thought of", description: `${event.kind.replace(/_/g, " ")} received`, variant: "love" });
    },
    onLoveDrop: (drop) => {
      if (drop.senderId === user?.id) return;
      show({ title: "A Love Drop just arrived 💌", description: drop.message, variant: "love" });
    },
  });

  if (!couple || !user) return null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ gap: 20, padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-sans-medium uppercase tracking-widest text-muted-foreground">Our Space</Text>
            <Text className="font-display text-2xl text-foreground">
              {couple.partnerOne.name} & {couple.partnerTwo?.name}
            </Text>
          </View>
          <Pressable onPress={() => router.push("/settings")} hitSlop={10}>
            <Settings size={22} color="#63746E" />
          </Pressable>
        </View>

        <PartnerPresenceCard couple={couple} meId={user.id} />

        <Card>
          <CardContent className="gap-3">
            <Text className="text-sm font-sans-medium text-muted-foreground">How are you feeling?</Text>
            <MoodStatusPicker />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="gap-3">
            <Text className="text-sm font-sans-medium text-muted-foreground">Send something sweet</Text>
            <QuickAffectionGrid />
            <LoveDropDialog />
          </CardContent>
        </Card>

        <View>
          <Text className="mb-3 text-sm font-sans-medium text-muted-foreground">What should we do together?</Text>
          <View className="flex-row flex-wrap gap-3">
            {ACTIVITIES.map((a) => (
              <Pressable
                key={a.label}
                onPress={() => router.push(a.href)}
                className="items-center gap-2 rounded-2xl border border-border bg-card px-5 py-4"
                style={{ minWidth: "28%" }}
              >
                <a.Icon size={20} color="#276852" />
                <Text className="text-xs font-sans-medium text-foreground">{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
