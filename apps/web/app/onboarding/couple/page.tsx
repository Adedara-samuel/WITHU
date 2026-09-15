"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useAcceptInvitation, useCreateCouple, useCreateInvitation, useMyCouple } from "@/features/couple/hooks";
import { ApiError } from "@/lib/api-client";

function CoupleOnboarding() {
  const router = useRouter();
  const { data: couple, isLoading } = useMyCouple();
  const createCouple = useCreateCouple();
  const createInvitation = useCreateInvitation();
  const acceptInvitation = useAcceptInvitation();
  const { show } = useToast();

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (couple?.partnerTwo) router.replace("/space");
  }, [couple, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleCreate = async () => {
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
      show({ title: "You're together now", description: "Welcome to your shared space.", variant: "love" });
      router.replace("/space");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That code didn't work");
    }
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    show({ title: "Copied to clipboard", variant: "success" });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Image src="/logo.png" alt="WITHU" width={48} height={48} className="rounded-xl" priority />
          <h1 className="font-display text-2xl font-medium">Build your space together</h1>
          <p className="text-sm text-muted-foreground">
            Create a relationship space and invite your partner, or join theirs with a code.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="create">
              <TabsList className="mb-5 grid w-full grid-cols-2">
                <TabsTrigger value="create">Invite my partner</TabsTrigger>
                <TabsTrigger value="join">I have a code</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                {!inviteCode ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll generate a private code you can send your partner. Once they enter it, you&apos;ll both
                      land in the same space.
                    </p>
                    <Button className="w-full" onClick={handleCreate} disabled={createCouple.isPending || createInvitation.isPending}>
                      {(createCouple.isPending || createInvitation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Sparkles className="h-4 w-4" /> Generate invite code
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3 text-center">
                    <p className="text-sm text-muted-foreground">Share this code with your partner:</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-display text-3xl tracking-[0.3em] text-primary">{inviteCode}</span>
                      <Button variant="ghost" size="icon" onClick={copyCode} aria-label="Copy code">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This code expires in 7 days. We&apos;ll take you to your space as soon as they join.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="join" className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="code">Invitation code</Label>
                  <Input
                    id="code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    className="text-center font-display text-lg tracking-[0.3em]"
                  />
                </div>
                <Button className="w-full" onClick={handleJoin} disabled={!joinCode || acceptInvitation.isPending}>
                  {acceptInvitation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Join their space
                </Button>
              </TabsContent>
            </Tabs>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function CoupleOnboardingPage() {
  return (
    <AuthGuard>
      <CoupleOnboarding />
    </AuthGuard>
  );
}
