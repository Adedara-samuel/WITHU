"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function ThemeEffect() {
  const theme = useAuthStore((s) => s.user?.preferences.appearance.theme ?? "system");

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const isDark = theme === "dark" || (theme === "system" && media.matches);
      root.classList.toggle("dark", isDark);
    };

    apply();
    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme]);

  return null;
}
