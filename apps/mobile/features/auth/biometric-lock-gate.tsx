import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus, Modal, Text, View } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { ShieldCheck } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

// Sits above the whole app (mounted once in the root layout) and blocks the screen
// with a native biometric prompt whenever there's a live session to protect - both
// on cold start and whenever the app returns from the background.
export function BiometricLockGate() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const biometricLockEnabled = useAuthStore((s) => s.biometricLockEnabled);
  const shouldLock = hasHydrated && !!accessToken && biometricLockEnabled;

  const [locked, setLocked] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (shouldLock) setLocked(true);
  }, [shouldLock]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === "active" && shouldLock) {
        setLocked(true);
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [shouldLock]);

  const tryUnlock = async () => {
    if (authenticating) return;
    setAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock WITHU",
        cancelLabel: "Cancel",
      });
      if (result.success) setLocked(false);
    } finally {
      setAuthenticating(false);
    }
  };

  useEffect(() => {
    if (shouldLock && locked) tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLock, locked]);

  if (!shouldLock || !locked) return null;

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
      <View className="flex-1 items-center justify-center gap-4 bg-background px-10">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck size={30} color="#276852" />
        </View>
        <Text className="text-center font-display text-lg text-foreground">WITHU is locked</Text>
        <Text className="text-center text-sm text-muted-foreground">
          Unlock with Face ID or your fingerprint to get back to your space.
        </Text>
        <Button onPress={tryUnlock} loading={authenticating}>
          Unlock
        </Button>
      </View>
    </Modal>
  );
}
