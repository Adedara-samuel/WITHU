import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TogetherActivity } from "@withu/shared-types";
import { useAppSocket } from "@/providers/socket-provider";
import { togetherApi } from "./api";

export const togetherKey = ["together-active"] as const;

export function useActiveTogether() {
  return useQuery({ queryKey: togetherKey, queryFn: togetherApi.getActive, refetchInterval: 60_000 });
}

export function useStartTogether() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activity, activityRefId }: { activity?: TogetherActivity; activityRefId?: string | null }) =>
      togetherApi.start(activity, activityRefId),
    onSuccess: (session) => queryClient.setQueryData(togetherKey, session),
  });
}

export function useEndTogether() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => togetherApi.end(),
    onSuccess: () => queryClient.setQueryData(togetherKey, null),
  });
}

export function useTogetherRealtime() {
  const { socket } = useAppSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    const onStarted = () => queryClient.invalidateQueries({ queryKey: togetherKey });
    const onEnded = () => queryClient.setQueryData(togetherKey, null);
    socket.on("TOGETHER_SESSION_STARTED", onStarted);
    socket.on("TOGETHER_SESSION_ENDED", onEnded);
    return () => {
      socket.off("TOGETHER_SESSION_STARTED", onStarted);
      socket.off("TOGETHER_SESSION_ENDED", onEnded);
    };
  }, [socket, queryClient]);
}
