import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "./api";

export function useNotifications() {
  return useQuery({ queryKey: ["notifications"], queryFn: notificationsApi.list, refetchInterval: 45_000 });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDailyChallenge() {
  return useQuery({ queryKey: ["daily-challenge"], queryFn: notificationsApi.getDailyChallenge });
}

export function useCompleteDailyChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.completeDailyChallenge(),
    onSuccess: (challenge) => queryClient.setQueryData(["daily-challenge"], challenge),
  });
}
