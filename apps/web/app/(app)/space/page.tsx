"use client";

import Link from "next/link";
import { Gamepad2, Image as ImageIcon, MessageCircle, Music, Video } from "lucide-react";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useAffectionRealtime } from "@/features/affection/hooks";
import { DailyChallengeCard } from "@/features/home/components/daily-challenge-card";
import { LoveDropDialog } from "@/features/home/components/love-drop-dialog";
import { MoodStatusPicker } from "@/features/home/components/mood-status-picker";
import { PartnerPresenceCard } from "@/features/home/components/partner-presence-card";
import { StreakBadge } from "@/features/home/components/streak-badge";
import { QuickAffectionGrid } from "@/features/home/components/quick-affection-grid";
import { useMyCouple } from "@/features/couple/hooks";
import { useAuthStore } from "@/stores/auth-store";

const ACTIVITIES = [
  { href: "/games", label: "Play", icon: Gamepad2 },
  { href: "/together?activity=watching", label: "Watch", icon: Video },
  { href: "/together?activity=listening", label: "Listen", icon: Music },
  { href: "/chat", label: "Talk", icon: MessageCircle },
  { href: "/memories", label: "Memories", icon: ImageIcon },
];

export default function OurSpacePage() {
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
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Our Space</p>
          <h1 className="font-display text-2xl font-medium">
            {couple.partnerOne.name} <span className="text-primary">&amp;</span> {couple.partnerTwo?.name}
          </h1>
          <StreakBadge days={couple.streakDays} />
        </div>
        <NotificationBell />
      </div>

      <PartnerPresenceCard couple={couple} meId={user.id} />

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-medium text-muted-foreground">How are you feeling?</p>
          <MoodStatusPicker />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-medium text-muted-foreground">Send something sweet</p>
          <QuickAffectionGrid />
          <LoveDropDialog />
        </CardContent>
      </Card>

      <DailyChallengeCard />

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">What should we do together?</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {ACTIVITIES.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="glass flex flex-col items-center gap-2 rounded-xl py-5 text-center transition-transform hover:-translate-y-0.5"
            >
              <a.icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
