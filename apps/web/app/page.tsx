"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useHasHydrated } from "@/lib/use-has-hydrated";

export default function RootPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrated = useHasHydrated();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(accessToken ? "/space" : "/login");
  }, [hydrated, accessToken, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
      <Image src="/logo.png" alt="WITHU" width={56} height={56} className="animate-pulse-soft rounded-xl" priority />
      <p className="text-sm text-muted-foreground">Opening your space...</p>
    </div>
  );
}
