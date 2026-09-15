import { useMutation } from "@tanstack/react-query";
import type { SetMoodInput, SetStatusInput, UpdatePreferencesInput, UpdateProfileInput } from "@withu/validation";
import { useAuthStore } from "@/stores/auth-store";
import { profileApi } from "./api";

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({ mutationFn: (input: UpdateProfileInput) => profileApi.update(input), onSuccess: setUser });
}

export function useSetMood() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({ mutationFn: (input: SetMoodInput) => profileApi.setMood(input), onSuccess: setUser });
}

export function useSetStatus() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({ mutationFn: (input: SetStatusInput) => profileApi.setStatus(input), onSuccess: setUser });
}

export function useUpdatePreferences() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({ mutationFn: (input: UpdatePreferencesInput) => profileApi.updatePreferences(input), onSuccess: setUser });
}
