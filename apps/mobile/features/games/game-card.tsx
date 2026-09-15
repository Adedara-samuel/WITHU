import { Text, View } from "react-native";
import {
  Brain,
  Flame,
  Gamepad2,
  HeartHandshake,
  LayoutGrid,
  Circle,
  Shuffle,
  Split,
  Grid3x3,
  type LucideIcon,
} from "lucide-react-native";
import type { GameDefinition } from "@withu/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ICONS: Record<string, LucideIcon> = {
  "grid-3x3": Grid3x3,
  "circle-dot": Circle,
  "layout-grid": LayoutGrid,
  "heart-handshake": HeartHandshake,
  split: Split,
  shuffle: Shuffle,
  flame: Flame,
  brain: Brain,
};

export function GameCard({ game, onPlay, pending }: { game: GameDefinition; onPlay: () => void; pending: boolean }) {
  const Icon = ICONS[game.icon] ?? Gamepad2;
  return (
    <Card className="flex-1" style={{ minWidth: "46%" }}>
      <CardContent className="gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Icon size={18} color="#7A2C4C" />
        </View>
        <View>
          <Text className="font-display text-base text-foreground">{game.name}</Text>
          <Text className="text-xs text-muted-foreground">{game.description}</Text>
        </View>
        <Button size="sm" variant="secondary" onPress={onPlay} loading={pending}>
          Invite to play
        </Button>
      </CardContent>
    </Card>
  );
}
