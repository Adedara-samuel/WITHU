"use client";

import { moodEmoji } from "@withu/constants";
import type { Couple, PublicUser } from "@withu/shared-types";
import { formatRelativeTime } from "@withu/shared-utils";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PresenceDot } from "@/components/ui/presence-dot";
import { Card, CardContent } from "@/components/ui/card";

function PartnerBlock({ partner, align }: { partner: PublicUser; align: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div className="relative">
        <Avatar className="h-14 w-14 border-2 border-card shadow">
          <AvatarImage src={partner.avatarUrl ?? undefined} alt={partner.name} />
          <AvatarFallback className="text-lg">{partner.name[0]}</AvatarFallback>
        </Avatar>
        <PresenceDot presence={partner.presence} className="absolute bottom-0 right-0" />
      </div>
      <div>
        <p className="font-display text-lg font-medium">{partner.name}</p>
        <p className="text-xs text-muted-foreground">
          {partner.presence === "online" ? "Online now" : `Last seen ${formatRelativeTime(partner.lastSeen)}`}
        </p>
        {partner.moodMessage && (
          <p className="mt-0.5 text-xs italic text-muted-foreground">
            {moodEmoji(partner.mood)} “{partner.moodMessage}”
          </p>
        )}
      </div>
    </div>
  );
}

export function PartnerPresenceCard({ couple, meId }: { couple: Couple; meId: string }) {
  const me = couple.partnerOne.id === meId ? couple.partnerOne : couple.partnerTwo!;
  const partner = couple.partnerOne.id === meId ? couple.partnerTwo! : couple.partnerOne;

  return (
    <Card className="glass overflow-hidden">
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <PartnerBlock partner={me} align="left" />
          <Heart className="h-6 w-6 shrink-0 fill-primary/20 text-primary" />
          <PartnerBlock partner={partner} align="right" />
        </div>

        {couple.relationshipName && (
          <div className="flex justify-center border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">{couple.relationshipName}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
