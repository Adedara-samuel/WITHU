"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useAppSocket } from "@/providers/socket-provider";

export function ConnectionBanner() {
  const { connectionState } = useAppSocket();

  return (
    <AnimatePresence>
      {connectionState !== "connected" && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex items-center justify-center gap-2 overflow-hidden bg-accent/20 py-1.5 text-xs font-medium text-accent-foreground"
        >
          <WifiOff className="h-3.5 w-3.5" />
          {connectionState === "connecting" ? "Reconnecting..." : "You're offline — we'll reconnect automatically"}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
