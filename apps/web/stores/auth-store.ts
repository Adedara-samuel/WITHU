"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthenticatedUser } from "@withu/shared-types";

interface AuthState {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (payload: { user: AuthenticatedUser; accessToken: string; refreshToken: string }) => void;
  setUser: (user: AuthenticatedUser) => void;
  setTokens: (payload: { accessToken: string; refreshToken: string }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      clear: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "withu-auth" }
  )
);
