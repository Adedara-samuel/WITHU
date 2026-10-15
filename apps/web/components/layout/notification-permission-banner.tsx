"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { canUseBrowserNotifications, notificationPermission, requestNotificationPermission } from "@/lib/browser-notifications";

const DISMISS_KEY = "withu-notif-banner-dismissed";

export function NotificationPermissionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!canUseBrowserNotifications()) return;
    if (notificationPermission() !== "default") return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const enable = async () => {
    await requestNotificationPermission();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 border-b border-border bg-primary/5 px-4 py-2.5 text-sm">
            <Bell className="h-4 w-4 shrink-0 text-primary" />
            <p className="flex-1 text-foreground">
              Turn on browser notifications so you never miss a message or call while WITHU is open in another tab.
            </p>
            <button onClick={enable} className="shrink-0 font-medium text-primary hover:underline">
              Enable
            </button>
            <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
