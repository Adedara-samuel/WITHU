"use client";

export function canUseBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!canUseBrowserNotifications()) return "unsupported";
  return Notification.permission;
}

/** Must be called from a real user gesture (a click) - browsers increasingly ignore
 * or auto-deny permission prompts fired without one. */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!canUseBrowserNotifications()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

/** Shows a real OS-level notification, but only when the tab isn't the one thing the
 * person is actively looking at - otherwise the in-app toast already covers it, and a
 * duplicate popup over the exact content on screen is just noise. */
export function showBrowserNotification(title: string, body: string, onClick?: () => void) {
  if (!canUseBrowserNotifications() || Notification.permission !== "granted") return;
  if (document.visibilityState === "visible" && document.hasFocus()) return;

  const notification = new Notification(title, { body, icon: "/logo.png", tag: "withu" });
  notification.onclick = () => {
    window.focus();
    onClick?.();
    notification.close();
  };
}
