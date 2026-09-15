"use client";

import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WatchSession } from "@withu/shared-types";
import type { CreateWatchSessionInput } from "@withu/validation";
import { useAppSocket } from "@/providers/socket-provider";
import { watchApi } from "./api";

export function useWatchSessions() {
  return useQuery({ queryKey: ["watch-sessions"], queryFn: watchApi.listSessions });
}

export function useWatchSession(id: string | undefined) {
  return useQuery({
    queryKey: ["watch-session", id],
    queryFn: () => watchApi.getSession(id!),
    enabled: !!id,
  });
}

export function useCreateWatchSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWatchSessionInput) => watchApi.createSession(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watch-sessions"] }),
  });
}

export function useJoinWatchSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => watchApi.joinSession(id),
    onSuccess: (session) => queryClient.setQueryData(["watch-session", session.id], session),
  });
}

export function useEndWatchSession() {
  return useMutation({ mutationFn: (id: string) => watchApi.endSession(id) });
}

/** Joins the watch room, keeps the session query in sync, and exposes low-data playback controls. */
export function useWatchRealtime(sessionId: string | undefined) {
  const { socket } = useAppSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !sessionId) return;
    socket.emit("WATCH_JOIN_ROOM", { sessionId });

    const onUpdated = ({ session }: { session: WatchSession }) => {
      queryClient.setQueryData(["watch-session", session.id], session);
    };
    const onEnded = () => {
      queryClient.setQueryData(["watch-session", sessionId], (prev: WatchSession | undefined) =>
        prev ? { ...prev, status: "ended", playing: false } : prev
      );
    };

    socket.on("WATCH_STATE_UPDATED", onUpdated);
    socket.on("WATCH_ENDED", onEnded);
    return () => {
      socket.off("WATCH_STATE_UPDATED", onUpdated);
      socket.off("WATCH_ENDED", onEnded);
    };
  }, [socket, sessionId, queryClient]);

  const play = useCallback((positionSeconds: number) => sessionId && socket?.emit("WATCH_PLAY", { sessionId, positionSeconds }), [socket, sessionId]);
  const pause = useCallback((positionSeconds: number) => sessionId && socket?.emit("WATCH_PAUSE", { sessionId, positionSeconds }), [socket, sessionId]);
  const seek = useCallback((positionSeconds: number) => sessionId && socket?.emit("WATCH_SEEK", { sessionId, positionSeconds }), [socket, sessionId]);
  const requestSync = useCallback(() => sessionId && socket?.emit("WATCH_SYNC_REQUEST", { sessionId }), [socket, sessionId]);

  return { play, pause, seek, requestSync };
}
