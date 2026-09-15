"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameKey, GameSession } from "@withu/shared-types";
import { useAppSocket } from "@/providers/socket-provider";
import { gamesApi } from "./api";

export function useGameCatalog() {
  return useQuery({ queryKey: ["game-catalog"], queryFn: gamesApi.catalog, staleTime: Infinity });
}

export function useGameSessions() {
  return useQuery({ queryKey: ["game-sessions"], queryFn: gamesApi.listSessions, refetchInterval: 30_000 });
}

export function useGameSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["game-session", sessionId],
    queryFn: () => gamesApi.getSession(sessionId!),
    enabled: !!sessionId,
  });
}

export function useCreateGameSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gameKey: GameKey) => gamesApi.createSession(gameKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["game-sessions"] }),
  });
}

export function useRespondGameInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) => gamesApi.respondInvite(id, accept),
    onSuccess: (session) => {
      queryClient.setQueryData(["game-session", session.id], session);
      queryClient.invalidateQueries({ queryKey: ["game-sessions"] });
    },
  });
}

export function useSubmitGameMove(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => gamesApi.submitMove(sessionId, payload),
    onSuccess: (session) => queryClient.setQueryData(["game-session", sessionId], session),
  });
}

export function useGameRealtime(sessionId: string | undefined) {
  const { socket } = useAppSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    if (sessionId) socket.emit("GAME_JOIN_ROOM", { sessionId });

    const onInvite = () => queryClient.invalidateQueries({ queryKey: ["game-sessions"] });
    const onUpdated = ({ session }: { session: GameSession }) => {
      queryClient.setQueryData(["game-session", session.id], session);
      queryClient.invalidateQueries({ queryKey: ["game-sessions"] });
    };

    socket.on("GAME_INVITE", onInvite);
    socket.on("GAME_STATE_UPDATED", onUpdated);
    socket.on("GAME_FINISHED", onUpdated);

    return () => {
      socket.off("GAME_INVITE", onInvite);
      socket.off("GAME_STATE_UPDATED", onUpdated);
      socket.off("GAME_FINISHED", onUpdated);
    };
  }, [socket, sessionId, queryClient]);
}
