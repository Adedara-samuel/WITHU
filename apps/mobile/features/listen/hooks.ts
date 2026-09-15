import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListenSession } from "@withu/shared-types";
import type { CreateListenSessionInput } from "@withu/validation";
import { useAppSocket } from "@/providers/socket-provider";
import { listenApi } from "./api";

export function useListenSession(id: string | undefined) {
  return useQuery({ queryKey: ["listen-session", id], queryFn: () => listenApi.getSession(id!), enabled: !!id });
}

export function useCreateListenSession() {
  return useMutation({ mutationFn: (input: CreateListenSessionInput) => listenApi.createSession(input) });
}

export function useJoinListenSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listenApi.joinSession(id),
    onSuccess: (session) => queryClient.setQueryData(["listen-session", session.id], session),
  });
}

export function useEndListenSession() {
  return useMutation({ mutationFn: (id: string) => listenApi.endSession(id) });
}

export function useListenRealtime(sessionId: string | undefined) {
  const { socket } = useAppSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !sessionId) return;
    socket.emit("LISTEN_JOIN_ROOM", { sessionId });
    const onUpdated = ({ session }: { session: ListenSession }) => queryClient.setQueryData(["listen-session", session.id], session);
    socket.on("LISTEN_STATE_UPDATED", onUpdated);
    return () => {
      socket.off("LISTEN_STATE_UPDATED", onUpdated);
    };
  }, [socket, sessionId, queryClient]);

  const play = useCallback((positionSeconds: number) => sessionId && socket?.emit("LISTEN_PLAY", { sessionId, positionSeconds }), [socket, sessionId]);
  const pause = useCallback((positionSeconds: number) => sessionId && socket?.emit("LISTEN_PAUSE", { sessionId, positionSeconds }), [socket, sessionId]);
  const seek = useCallback((positionSeconds: number) => sessionId && socket?.emit("LISTEN_SEEK", { sessionId, positionSeconds }), [socket, sessionId]);

  return { play, pause, seek };
}
