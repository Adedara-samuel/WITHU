"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/features/auth/hooks";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/50 px-4 py-6 lg:flex">
      <Link href="/space" className="mb-8 flex items-center gap-2 px-2">
        <Image src="/logo.png" alt="WITHU" width={28} height={28} className="rounded-lg" />
        <span className="font-display text-xl">WITHU</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name} />
          <AvatarFallback>{user?.name?.[0] ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">@{user?.username}</p>
        </div>
        <Link href="/settings" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Link>
        <button
          onClick={() => logout.mutate(undefined, { onSuccess: () => router.replace("/login") })}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
