import { useEffect, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, Image, Pressable, Share, Text, View } from "react-native";
import { Share2, Sparkles } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAcceptInvitation, useCreateCouple, useCreateInvitation, useMyCouple } from "@/features/couple/hooks";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";

export default function CoupleOnboardingScreen() {
  const { data: couple, isLoading } = useMyCouple();
  const createCouple = useCreateCouple();
  const createInvitation = useCreateInvitation();
  const acceptInvitation = useAcceptInvitation();

  const [tab, setTab] = useState<"create" | "join">("create");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (couple?.partnerTwo) router.replace("/");
  }, [couple]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#276852" />
      </View>
    );
  }

  const handleCreate = async () => {
    setError(null);
    try {
      if (!couple) await createCouple.mutateAsync({});
      const invitation = await createInvitation.mutateAsync(undefined);
      setInviteCode(invitation.code);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  };

  const handleJoin = async () => {
    setError(null);
    try {
      await acceptInvitation.mutateAsync(joinCode.trim());
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That code didn't work");
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="mb-8 items-center gap-2">
        <Image source={require("../../assets/icon.png")} style={{ width: 48, height: 48, borderRadius: 12 }} />
        <Text className="text-center font-display text-2xl text-foreground">Build your space together</Text>
        <Text className="text-center text-sm text-muted-foreground">
          Create a relationship space and invite your partner, or join theirs with a code.
        </Text>
      </View>

      <View className="w-full rounded-2xl border border-border bg-card p-5">
        <View className="mb-5 flex-row rounded-full bg-muted p-1">
          <Pressable
            onPress={() => setTab("create")}
            className={cn("flex-1 items-center rounded-full py-2", tab === "create" && "bg-card")}
          >
            <Text className={cn("text-sm font-sans-medium", tab === "create" ? "text-foreground" : "text-muted-foreground")}>
              Invite my partner
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("join")}
            className={cn("flex-1 items-center rounded-full py-2", tab === "join" && "bg-card")}
          >
            <Text className={cn("text-sm font-sans-medium", tab === "join" ? "text-foreground" : "text-muted-foreground")}>
              I have a code
            </Text>
          </Pressable>
        </View>

        {tab === "create" ? (
          !inviteCode ? (
            <View className="gap-4">
              <Text className="text-sm text-muted-foreground">
                We&apos;ll generate a private code you can send your partner.
              </Text>
              <Button onPress={handleCreate} loading={createCouple.isPending || createInvitation.isPending}>
                <Sparkles size={16} color="#fff" />
                <Text className="text-sm font-sans-medium text-primary-foreground">Generate invite code</Text>
              </Button>
            </View>
          ) : (
            <View className="items-center gap-3">
              <Text className="text-sm text-muted-foreground">Share this code with your partner:</Text>
              <Text className="font-display text-4xl tracking-[8px] text-primary">{inviteCode}</Text>
              <Button
                variant="secondary"
                size="sm"
                onPress={() => Share.share({ message: `Join me on WITHU! Use code: ${inviteCode}` })}
              >
                <Share2 size={14} color="#214539" />
                <Text className="text-sm font-sans-medium text-secondary-foreground">Share</Text>
              </Button>
            </View>
          )
        ) : (
          <View className="gap-4">
            <Input
              placeholder="ABC123"
              autoCapitalize="characters"
              value={joinCode}
              onChangeText={(t) => setJoinCode(t.toUpperCase())}
              className="text-center font-display text-lg tracking-[6px]"
            />
            <Button onPress={handleJoin} disabled={!joinCode} loading={acceptInvitation.isPending}>
              Join their space
            </Button>
          </View>
        )}

        {error && <Text className="mt-4 text-sm text-destructive">{error}</Text>}
      </View>
    </View>
  );
}
