import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import { UserModel } from "../users/user.model";

const expo = new Expo();

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Delivers a real OS-level push through Expo's push service, so the recipient is
 * notified even when the app is closed or backgrounded (sockets only reach an open app).
 * Never throws - a push failure should never break the caller's main flow.
 */
export async function sendPushToUser(userId: string, tokens: string[], payload: PushPayload) {
  const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));
  if (validTokens.length === 0) return;

  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    sound: "default",
  }));

  const staleTokens: string[] = [];

  for (const chunk of expo.chunkPushNotifications(messages)) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.forEach((ticket, i) => {
        if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
          const to = chunk[i]?.to;
          if (typeof to === "string") staleTokens.push(to);
        }
      });
    } catch {
      // Expo's push service being unreachable shouldn't fail whatever triggered the notification.
    }
  }

  if (staleTokens.length > 0) {
    await UserModel.findByIdAndUpdate(userId, { $pullAll: { pushTokens: staleTokens } });
  }
}
