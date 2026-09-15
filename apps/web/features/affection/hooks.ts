"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AffectionEvent, LoveDrop } from "@withu/shared-types";
import type { SendAffectionInput, SendLoveDropInput } from "@withu/validation";
import { useAppSocket } from "@/providers/socket-provider";
import { affectionApi } from "./api";

export function useSendAffection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendAffectionInput) => affectionApi.send(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["affection-history"] }),
  });
}

export function useAffectionHistory() {
  return useQuery({ queryKey: ["affection-history"], queryFn: affectionApi.history });
}

export function useSendLoveDrop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendLoveDropInput) => affectionApi.sendLoveDrop(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["love-drops"] }),
  });
}

export function useLoveDrops() {
  return useQuery({ queryKey: ["love-drops"], queryFn: () => affectionApi.listLoveDrops() });
}

export function useOpenLoveDrop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => affectionApi.openLoveDrop(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["love-drops"] }),
  });
}

/** Subscribes to realtime affection + Love Drop events for the couple and forwards them to a callback. */
export function useAffectionRealtime(handlers: {
  onAffection?: (event: AffectionEvent) => void;
  onLoveDrop?: (drop: LoveDrop) => void;
}) {
  const { socket } = useAppSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const onAffection = (event: AffectionEvent) => {
      queryClient.invalidateQueries({ queryKey: ["affection-history"] });
      handlers.onAffection?.(event);
    };
    const onLoveDrop = ({ loveDrop }: { loveDrop: LoveDrop }) => {
      queryClient.invalidateQueries({ queryKey: ["love-drops"] });
      handlers.onLoveDrop?.(loveDrop);
    };

    socket.on("AFFECTION_SENT", onAffection);
    socket.on("LOVE_DROP_SENT", onLoveDrop);
    return () => {
      socket.off("AFFECTION_SENT", onAffection);
      socket.off("LOVE_DROP_SENT", onLoveDrop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);
}
