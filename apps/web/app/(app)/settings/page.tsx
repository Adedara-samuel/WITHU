"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useLogout } from "@/features/auth/hooks";
import { useCancelLeaveRequest, useMyCouple, useRequestLeaveCouple, useUpdateCouple } from "@/features/couple/hooks";
import { useUpdatePreferences, useUpdateProfile } from "@/features/profile/hooks";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: couple } = useMyCouple();
  const updateProfile = useUpdateProfile();
  const updateCouple = useUpdateCouple();
  const updatePreferences = useUpdatePreferences();
  const requestLeave = useRequestLeaveCouple();
  const cancelLeave = useCancelLeaveRequest();
  const logout = useLogout();
  const router = useRouter();
  const { show } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [relationshipName, setRelationshipName] = useState(couple?.relationshipName ?? "");

  if (!user) return null;
  const prefs = user.preferences;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-10">
      <h1 className="font-display text-2xl font-medium">Settings</h1>

      <Tabs defaultValue="account">
        <TabsList className="flex-wrap">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="relationship">Relationship</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="data">Data Saver</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                  <AvatarFallback className="text-lg">{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">@{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} />
              </div>
              <Button
                onClick={() => {
                  updateProfile.mutate({ name, bio });
                  show({ title: "Profile updated", variant: "success" });
                }}
                disabled={updateProfile.isPending}
              >
                Save changes
              </Button>

              <div className="border-t border-border pt-4">
                <Button
                  variant="outline"
                  onClick={() => logout.mutate(undefined, { onSuccess: () => router.replace("/login") })}
                >
                  <LogOut className="h-4 w-4" /> Log out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationship">
          <Card>
            <CardContent className="space-y-4 p-5">
              {couple && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="rel-name">Relationship name</Label>
                    <Input id="rel-name" value={relationshipName} onChange={(e) => setRelationshipName(e.target.value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Share last seen</p>
                      <p className="text-xs text-muted-foreground">Let your partner see when you were last active</p>
                    </div>
                    <Switch
                      checked={couple.settings.privacy.shareLastSeen}
                      onCheckedChange={(checked) =>
                        updateCouple.mutate({ settings: { privacy: { shareLastSeen: checked, shareMood: couple.settings.privacy.shareMood } } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Share mood</p>
                      <p className="text-xs text-muted-foreground">Let your partner see your current mood</p>
                    </div>
                    <Switch
                      checked={couple.settings.privacy.shareMood}
                      onCheckedChange={(checked) =>
                        updateCouple.mutate({ settings: { privacy: { shareLastSeen: couple.settings.privacy.shareLastSeen, shareMood: checked } } })
                      }
                    />
                  </div>
                  <Button onClick={() => updateCouple.mutate({ relationshipName })} disabled={updateCouple.isPending}>
                    Save
                  </Button>

                  <div className="border-t border-border pt-4">
                    {(() => {
                      const iRequested = user ? couple.pendingLeaveRequestedBy.includes(user.id) : false;
                      const partnerRequested = couple.pendingLeaveRequestedBy.some((id) => id !== user?.id);

                      if (partnerRequested) {
                        const partnerName =
                          couple.partnerOne.id !== user?.id ? couple.partnerOne.name : couple.partnerTwo?.name;
                        return (
                          <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                            <p className="text-sm font-medium">
                              {partnerName ?? "Your partner"} wants to end this relationship space.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Nothing happens unless you also agree. You can confirm to close the space for both of
                              you, or dismiss to stay together.
                            </p>
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => cancelLeave.mutate()} disabled={cancelLeave.isPending}>
                                Stay together
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  requestLeave.mutate(undefined, {
                                    onSuccess: (result) => {
                                      if (result.dissolved) router.replace("/onboarding/couple");
                                    },
                                  })
                                }
                                disabled={requestLeave.isPending}
                              >
                                Confirm & leave
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      if (iRequested) {
                        return (
                          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                            <p className="text-sm font-medium">You asked to leave this relationship space.</p>
                            <p className="text-xs text-muted-foreground">
                              Waiting for your partner to confirm - nothing has been deleted yet.
                            </p>
                            <Button variant="outline" onClick={() => cancelLeave.mutate()} disabled={cancelLeave.isPending}>
                              Cancel my request
                            </Button>
                          </div>
                        );
                      }

                      return (
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Ask your partner to end your shared space? They'll need to confirm too before anything is deleted.")) {
                              requestLeave.mutate(undefined, {
                                onSuccess: (result) => {
                                  if (result.dissolved) router.replace("/onboarding/couple");
                                },
                              });
                            }
                          }}
                          disabled={requestLeave.isPending}
                        >
                          Leave relationship space
                        </Button>
                      );
                    })()}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="space-y-4 p-5">
              {(
                [
                  ["messages", "Messages"],
                  ["loveDrops", "Love Drops & affection"],
                  ["games", "Game invitations"],
                  ["activities", "Watch, listen & memories"],
                  ["reminders", "Daily reminders"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{label}</p>
                  <Switch
                    checked={prefs.notifications[key]}
                    onCheckedChange={(checked) => updatePreferences.mutate({ notifications: { [key]: checked } })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-1.5">
                <Label>Theme</Label>
                <Select
                  value={prefs.appearance.theme}
                  onValueChange={(value) =>
                    updatePreferences.mutate({ appearance: { theme: value as "light" | "dark" | "system", reducedMotion: prefs.appearance.reducedMotion } })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Reduce motion</p>
                  <p className="text-xs text-muted-foreground">Minimize animations across the app</p>
                </div>
                <Switch
                  checked={prefs.appearance.reducedMotion}
                  onCheckedChange={(checked) =>
                    updatePreferences.mutate({ appearance: { theme: prefs.appearance.theme, reducedMotion: checked } })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Data Saver</p>
                  <p className="text-xs text-muted-foreground">Reduce background data usage across WITHU</p>
                </div>
                <Switch
                  checked={prefs.dataSaver.enabled}
                  onCheckedChange={(checked) => updatePreferences.mutate({ dataSaver: { enabled: checked } })}
                />
              </div>
              {(
                [
                  ["compressImages", "Compress images"],
                  ["disableAutoplay", "Disable autoplay"],
                  ["reduceAnimations", "Reduce animations"],
                  ["loadMediaManually", "Load media manually"],
                  ["restrictBackgroundSync", "Restrict background sync"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between pl-4">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <Switch
                    checked={prefs.dataSaver[key]}
                    onCheckedChange={(checked) => updatePreferences.mutate({ dataSaver: { [key]: checked } })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
