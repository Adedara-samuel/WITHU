"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex min-w-[60px] flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="bottom-nav-pill"
                className="absolute top-1 h-8 w-12 rounded-full bg-primary/10"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <motion.div animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
              <Icon className={cn("h-5 w-5", active && "fill-primary/15")} />
            </motion.div>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
