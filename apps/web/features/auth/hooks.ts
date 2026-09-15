"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginInput, RegisterInput } from "@withu/validation";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "./api";

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: ({ user, tokens }) => setAuth({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: ({ user, tokens }) => setAuth({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clear();
      queryClient.clear();
    },
  });
}

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}
