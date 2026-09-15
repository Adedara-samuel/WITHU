"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-client";
import { SocketProvider } from "./socket-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AffectionBurstProvider } from "@/components/effects/affection-burst";
import { ThemeEffect } from "@/components/theme-effect";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeEffect />
      <ToastProvider>
        <AffectionBurstProvider>
          <SocketProvider>{children}</SocketProvider>
        </AffectionBurstProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
