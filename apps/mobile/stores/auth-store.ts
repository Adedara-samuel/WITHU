import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthenticatedUser } from "@withu/shared-types";

interface AuthState {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  /** When false, tokens are kept in memory only (not persisted), so killing and
   * reopening the app always lands back on the login screen. */
  stayLoggedIn: boolean;
  /** Require Face ID / fingerprint / face unlock to reveal the app each time it's
   * opened or resumed from the background, on top of the session itself. */
  biometricLockEnabled: boolean;
  setAuth: (payload: { user: AuthenticatedUser; accessToken: string; refreshToken: string }) => void;
  setUser: (user: AuthenticatedUser) => void;
  setTokens: (payload: { accessToken: string; refreshToken: string }) => void;
  setStayLoggedIn: (stayLoggedIn: boolean) => void;
  setBiometricLockEnabled: (biometricLockEnabled: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      stayLoggedIn: true,
      biometricLockEnabled: false,
      setAuth: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      setStayLoggedIn: (stayLoggedIn) => set({ stayLoggedIn }),
      setBiometricLockEnabled: (biometricLockEnabled) => set({ biometricLockEnabled }),
      clear: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: "withu-auth",
      storage: createJSONStorage(() => AsyncStorage),
      // Tokens only get written to disk when the user has opted to stay signed in -
      // otherwise the session lives in memory for this run of the app only.
      partialize: (state) => ({
        user: state.user,
        stayLoggedIn: state.stayLoggedIn,
        biometricLockEnabled: state.biometricLockEnabled,
        accessToken: state.stayLoggedIn ? state.accessToken : null,
        refreshToken: state.stayLoggedIn ? state.refreshToken : null,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    }
  )
);
