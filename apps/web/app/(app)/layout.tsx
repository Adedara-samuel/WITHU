"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { useMyCouple } from "@/features/couple/hooks";
import { CallProvider } from "@/features/calls/call-context";
import { CallOverlay } from "@/features/calls/call-overlay";

function CoupleGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: couple, isLoading } = useMyCouple();

  useEffect(() => {
    if (!isLoading && !couple?.partnerTwo) router.replace("/onboarding/couple");
  }, [isLoading, couple, router]);

  if (isLoading || !couple?.partnerTwo) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <CoupleGate>
        <CallProvider>
          <AppShell>{children}</AppShell>
          <CallOverlay />
        </CallProvider>
      </CoupleGate>
    </AuthGuard>
  );
}
