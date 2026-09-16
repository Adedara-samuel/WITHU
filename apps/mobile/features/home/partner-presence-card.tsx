import { Text, View } from "react-native";
import { Flame, Heart } from "lucide-react-native";
import { moodEmoji } from "@withu/constants";
import type { Couple, PublicUser } from "@withu/shared-types";
import { formatRelativeTime } from "@withu/shared-utils";
import { Avatar } from "@/components/ui/avatar";
import { PresenceDot } from "@/components/ui/presence-dot";
import { Card, CardContent } from "@/components/ui/card";

function PartnerBlock({ partner }: { partner: PublicUser }) {
  return (
    <View className="flex-1 items-center gap-2">
      <View>
        <Avatar uri={partner.avatarUrl} name={partner.name} size={64} />
        <PresenceDot presence={partner.presence} className="absolute bottom-0 right-0" />
      </View>
      <Text className="font-display text-base text-foreground">{partner.name}</Text>
      <Text className="text-center text-xs text-muted-foreground">
        {partner.presence === "online" ? "Online now" : `Last seen ${formatRelativeTime(partner.lastSeen)}`}
      </Text>
      {partner.moodMessage && (
        <Text className="text-center text-xs italic text-muted-foreground">
          {moodEmoji(partner.mood)} "{partner.moodMessage}"
        </Text>
      )}
    </View>
  );
}

export function PartnerPresenceCard({ couple, meId }: { couple: Couple; meId: string }) {
  const me = couple.partnerOne.id === meId ? couple.partnerOne : couple.partnerTwo!;
  const partner = couple.partnerOne.id === meId ? couple.partnerTwo! : couple.partnerOne;

  return (
    <Card>
      <CardContent className="gap-4">
        <View className="flex-row items-start">
          <PartnerBlock partner={me} />
          <View className="items-center justify-center pt-6">
            <Heart size={20} color="#276852" fill="#27685222" />
          </View>
          <PartnerBlock partner={partner} />
        </View>

        <View className="flex-row items-center justify-center gap-1.5 border-t border-border pt-3">
          <Flame size={14} color="#C26447" />
          <Text className="text-sm text-foreground">
            <Text className="font-sans-medium">{couple.streakDays}</Text> day{couple.streakDays === 1 ? "" : "s"} together
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
