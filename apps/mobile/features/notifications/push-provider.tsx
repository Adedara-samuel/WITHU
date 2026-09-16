import { useEffect, useRef } from "react";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "@/stores/auth-store";
import { profileApi } from "@/features/profile/api";
import { registerForPushNotificationsAsync } from "@/lib/push-notifications";

function routeForNotification(data: Record<string, unknown>): string | null {
  const type = data.type;
  const sessionId = typeof data.sessionId === "string" ? data.sessionId : null;

  switch (type) {
    case "message":
      return "/chat";
    case "game_invite":
    case "game_move":
      return sessionId ? `/games/${sessionId}` : "/games";
    case "watch_invite":
      return sessionId ? `/watch/${sessionId}` : "/together";
    case "listen_invite":
      return sessionId ? `/listen/${sessionId}` : "/together";
    case "together_invite":
      return "/together";
    case "memory":
    case "milestone":
      return "/memories";
    case "love_drop":
    case "affection":
    case "daily_challenge":
      return "/";
    case "couple_invite":
    case "couple_leave_request":
      return "/settings";
    case "missed_call":
    case "incoming_call":
      return "/chat";
    default:
      return null;
  }
}

// Registers this device for push notifications while logged in, keeps the token
// in sync with the backend, and routes a tapped notification to the right screen -
// so notifications work (and lead somewhere) whether or not the app was open.
export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      if (tokenRef.current) {
        profileApi.removePushToken(tokenRef.current).catch(() => undefined);
        tokenRef.current = null;
      }
      return;
    }

    registerForPushNotificationsAsync().then((token) => {
      if (!token) return;
      tokenRef.current = token;
      profileApi.registerPushToken(token).catch(() => undefined);
    });

    const tokenSub = Notifications.addPushTokenListener(({ data }) => {
      tokenRef.current = data;
      profileApi.registerPushToken(data).catch(() => undefined);
    });

    return () => tokenSub.remove();
  }, [accessToken]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      const route = routeForNotification(data);
      if (route) router.push(route as never);
    });
    return () => sub.remove();
  }, []);

  return <>{children}</>;
}
