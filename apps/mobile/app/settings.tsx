import { useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, LogOut } from "lucide-react-native";
import type { UseMutationResult } from "@tanstack/react-query";
import type { Couple } from "@withu/shared-types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PickerButton } from "@/components/ui/picker-modal";
import { useLogout } from "@/features/auth/hooks";
import { useCancelLeaveRequest, useMyCouple, useRequestLeaveCouple, useUpdateCouple } from "@/features/couple/hooks";
import { useUpdatePreferences, useUpdateProfile } from "@/features/profile/hooks";
import { useAuthStore } from "@/stores/auth-store";

function LeaveRelationshipControl({
  couple,
  userId,
  requestLeave,
  cancelLeave,
}: {
  couple: Couple;
  userId: string;
  requestLeave: UseMutationResult<{ dissolved: boolean; coupleId: string; partnerId: string | null }, unknown, void>;
  cancelLeave: UseMutationResult<{ cancelled: boolean }, unknown, void>;
}) {
  const iRequested = couple.pendingLeaveRequestedBy.includes(userId);
  const partnerRequested = couple.pendingLeaveRequestedBy.some((id) => id !== userId);

  const confirmAndLeave = () =>
    requestLeave.mutate(undefined, {
      onSuccess: (result) => {
        if (result.dissolved) router.replace("/onboarding/couple");
      },
    });

  if (partnerRequested) {
    const partnerName = couple.partnerOne.id !== userId ? couple.partnerOne.name : couple.partnerTwo?.name;
    return (
      <View className="gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
        <Text className="text-sm font-sans-medium text-foreground">
          {partnerName ?? "Your partner"} wants to end this relationship space.
        </Text>
        <Text className="text-xs text-muted-foreground">
          Nothing happens unless you also agree. Confirm to close the space for both of you, or stay together.
        </Text>
        <View className="flex-row gap-2">
          <Button variant="outline" onPress={() => cancelLeave.mutate()} loading={cancelLeave.isPending} className="flex-1">
            Stay together
          </Button>
          <Button variant="destructive" onPress={confirmAndLeave} loading={requestLeave.isPending} className="flex-1">
            Confirm & leave
          </Button>
        </View>
      </View>
    );
  }

  if (iRequested) {
    return (
      <View className="gap-2 rounded-xl border border-border bg-muted/30 p-3">
        <Text className="text-sm font-sans-medium text-foreground">You asked to leave this relationship space.</Text>
        <Text className="text-xs text-muted-foreground">Waiting for your partner to confirm - nothing has been deleted yet.</Text>
        <Button variant="outline" onPress={() => cancelLeave.mutate()} loading={cancelLeave.isPending}>
          Cancel my request
        </Button>
      </View>
    );
  }

  return (
    <Button
      variant="destructive"
      onPress={() =>
        Alert.alert(
          "Leave relationship space?",
          "Your partner will need to confirm too before anything is deleted.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Ask to leave", style: "destructive", onPress: confirmAndLeave },
          ]
        )
      }
      loading={requestLeave.isPending}
    >
      Leave relationship space
    </Button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3 rounded-2xl border border-border bg-card p-4">
      <Text className="text-xs font-sans-medium uppercase tracking-wide text-muted-foreground">{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-sm text-foreground">{label}</Text>
        {description && <Text className="text-xs text-muted-foreground">{description}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: "#7A2C4C" }} />
    </View>
  );
}

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: couple } = useMyCouple();
  const updateProfile = useUpdateProfile();
  const updateCouple = useUpdateCouple();
  const updatePreferences = useUpdatePreferences();
  const requestLeave = useRequestLeaveCouple();
  const cancelLeave = useCancelLeaveRequest();
  const logout = useLogout();

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  if (!user) return null;
  const prefs = user.preferences;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 border-b border-border px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={22} color="#221019" />
        </Pressable>
        <Text className="font-display text-lg text-foreground">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ gap: 16, padding: 16, paddingBottom: 40 }}>
        <Section title="Account">
          <View className="flex-row items-center gap-3">
            <Avatar uri={user.avatarUrl} name={user.name} size={56} />
            <View>
              <Text className="font-sans-medium text-foreground">@{user.username}</Text>
              <Text className="text-xs text-muted-foreground">{user.email}</Text>
            </View>
          </View>
          <Input placeholder="Name" value={name} onChangeText={setName} />
          <Input placeholder="Bio" value={bio} onChangeText={setBio} maxLength={280} />
          <Button onPress={() => updateProfile.mutate({ name, bio })} loading={updateProfile.isPending}>
            Save changes
          </Button>
        </Section>

        {couple && (
          <Section title="Relationship">
            <Row
              label="Share last seen"
              description="Let your partner see when you were last active"
              value={couple.settings.privacy.shareLastSeen}
              onChange={(checked) =>
                updateCouple.mutate({ settings: { privacy: { shareLastSeen: checked, shareMood: couple.settings.privacy.shareMood } } })
              }
            />
            <Row
              label="Share mood"
              description="Let your partner see your current mood"
              value={couple.settings.privacy.shareMood}
              onChange={(checked) =>
                updateCouple.mutate({ settings: { privacy: { shareLastSeen: couple.settings.privacy.shareLastSeen, shareMood: checked } } })
              }
            />
            <LeaveRelationshipControl
              couple={couple}
              userId={user.id}
              requestLeave={requestLeave}
              cancelLeave={cancelLeave}
            />
          </Section>
        )}

        <Section title="Notifications">
          {(
            [
              ["messages", "Messages"],
              ["loveDrops", "Love Drops & affection"],
              ["games", "Game invitations"],
              ["activities", "Watch, listen & memories"],
              ["reminders", "Daily reminders"],
            ] as const
          ).map(([key, label]) => (
            <Row key={key} label={label} value={prefs.notifications[key]} onChange={(checked) => updatePreferences.mutate({ notifications: { [key]: checked } })} />
          ))}
        </Section>

        <Section title="Appearance">
          <PickerButton
            title="Theme"
            placeholder="Theme"
            value={prefs.appearance.theme}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
            onChange={(theme) => updatePreferences.mutate({ appearance: { theme, reducedMotion: prefs.appearance.reducedMotion } })}
          />
          <Row
            label="Reduce motion"
            value={prefs.appearance.reducedMotion}
            onChange={(checked) => updatePreferences.mutate({ appearance: { theme: prefs.appearance.theme, reducedMotion: checked } })}
          />
        </Section>

        <Section title="Data Saver">
          <Row label="Data Saver" description="Reduce background data usage" value={prefs.dataSaver.enabled} onChange={(checked) => updatePreferences.mutate({ dataSaver: { enabled: checked } })} />
          {(
            [
              ["compressImages", "Compress images"],
              ["disableAutoplay", "Disable autoplay"],
              ["reduceAnimations", "Reduce animations"],
              ["loadMediaManually", "Load media manually"],
              ["restrictBackgroundSync", "Restrict background sync"],
            ] as const
          ).map(([key, label]) => (
            <Row key={key} label={label} value={prefs.dataSaver[key]} onChange={(checked) => updatePreferences.mutate({ dataSaver: { [key]: checked } })} />
          ))}
        </Section>

        <Button variant="outline" onPress={() => logout.mutate(undefined, { onSuccess: () => router.replace("/login") })}>
          <LogOut size={16} color="#221019" />
          <Text className="text-sm font-sans-medium text-foreground">Log out</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
