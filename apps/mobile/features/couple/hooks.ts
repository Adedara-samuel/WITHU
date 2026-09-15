import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateCoupleInput, UpdateCoupleInput } from "@withu/validation";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/lib/api-client";
import { coupleApi } from "./api";

export const coupleKey = ["couple"] as const;

export function useMyCouple() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: coupleKey,
    queryFn: async () => {
      try {
        return await coupleApi.getMine();
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled: !!accessToken,
    staleTime: 15_000,
  });
}

export function useCreateCouple() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCoupleInput) => coupleApi.create(input),
    onSuccess: (couple) => queryClient.setQueryData(coupleKey, couple),
  });
}

export function useUpdateCouple() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCoupleInput) => coupleApi.update(input),
    onSuccess: (couple) => queryClient.setQueryData(coupleKey, couple),
  });
}

export function useCreateInvitation() {
  return useMutation({ mutationFn: (inviteeEmail?: string) => coupleApi.invite(inviteeEmail) });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => coupleApi.accept({ code }),
    onSuccess: (couple) => queryClient.setQueryData(coupleKey, couple),
  });
}

export function useLeaveCouple() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => coupleApi.leave(),
    onSuccess: () => queryClient.setQueryData(coupleKey, null),
  });
}
