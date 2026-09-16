import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-client";
import { SocketProvider } from "./socket-provider";
import { ToastProvider } from "@/components/ui/toast";
import { CallProvider } from "@/features/calls/call-context";
import { CallOverlay } from "@/features/calls/call-overlay";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SocketProvider>
          <CallProvider>
            {children}
            <CallOverlay />
          </CallProvider>
        </SocketProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
