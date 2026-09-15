"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useHasHydrated } from "@/lib/use-has-hydrated";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrated = useHasHydrated();

  useEffect(() => {
    if (hydrated && !accessToken) router.replace("/login");
  }, [hydrated, accessToken, router]);

  if (!hydrated || !accessToken) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Heart className="h-6 w-6 animate-pulse-soft fill-primary text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
