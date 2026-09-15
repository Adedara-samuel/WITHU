import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { Message, MessagePage, MessageReaction } from "@withu/shared-types";
import type { SendMessageInput } from "@withu/validation";
import { useAppSocket } from "@/providers/socket-provider";
import { useAuthStore } from "@/stores/auth-store";
import { messagesApi } from "./api";

export const messagesKey = ["messages"] as const;
type MessagesData = InfiniteData<MessagePage>;

function mapPages(data: MessagesData | undefined, fn: (m: Message) => Message): MessagesData | undefined {
  if (!data) return data;
  return { ...data, pages: data.pages.map((page) => ({ ...page, messages: page.messages.map(fn) })) };
}

function removeFromPages(data: MessagesData | undefined, predicate: (m: Message) => boolean): MessagesData | undefined {
  if (!data) return data;
  return { ...data, pages: data.pages.map((page) => ({ ...page, messages: page.messages.filter((m) => !predicate(m)) })) };
}

export function useMessages() {
  const query = useInfiniteQuery({
    queryKey: messagesKey,
    queryFn: ({ pageParam }: { pageParam?: string }) => messagesApi.list(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const messages = [...(query.data?.pages ?? [])].reverse().flatMap((p) => p.messages);
  return { ...query, messages };
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (input: SendMessageInput) => messagesApi.send(input),
    onMutate: async (input) => {
      if (!user) return;
      const optimistic: Message = {
        id: `temp-${input.clientTempId}`,
        coupleId: "",
        senderId: user.id,
        type: input.type ?? "text",
        text: input.text ?? null,
        attachment: null,
        replyToId: input.replyToId ?? null,
        reactions: [],
        status: "sending",
        editedAt: null,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        clientTempId: input.clientTempId,
      };

      queryClient.setQueryData<MessagesData>(messagesKey, (data) => {
        if (!data) return data;
        const [first, ...rest] = data.pages;
        return { ...data, pages: [{ ...first, messages: [...first.messages, optimistic] }, ...rest] };
      });
    },
    onSuccess: (message, input) => {
      queryClient.setQueryData<MessagesData>(messagesKey, (data) => {
        const withoutTemp = removeFromPages(data, (m) => m.clientTempId === input.clientTempId);
        if (!withoutTemp) return withoutTemp;
        const alreadyPresent = withoutTemp.pages.some((p) => p.messages.some((m) => m.id === message.id));
        if (alreadyPresent) return withoutTemp;
        const [first, ...rest] = withoutTemp.pages;
        return { ...withoutTemp, pages: [{ ...first, messages: [...first.messages, message] }, ...rest] };
      });
    },
  });
}

export function useEditMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => messagesApi.edit(id, { text }),
    onSuccess: (message) => {
      queryClient.setQueryData<MessagesData>(messagesKey, (data) => mapPages(data, (m) => (m.id === message.id ? message : m)));
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => messagesApi.remove(id),
    onSuccess: (_res, id) => {
      queryClient.setQueryData<MessagesData>(messagesKey, (data) =>
        mapPages(data, (m) => (m.id === id ? { ...m, text: null, attachment: null, deletedAt: new Date().toISOString() } : m))
      );
    },
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ messageId, emoji, hasMine }: { messageId: string; emoji: string; hasMine: boolean }) =>
      hasMine ? messagesApi.removeReaction(messageId, emoji) : messagesApi.react(messageId, emoji),
    onSuccess: (message) => {
      if (!user) return;
      queryClient.setQueryData<MessagesData>(messagesKey, (data) => mapPages(data, (m) => (m.id === message.id ? message : m)));
    },
  });
}

export function useMessagesRealtime(coupleId: string | undefined) {
  const { socket } = useAppSocket();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;

    const upsert = (message: Message) => {
      queryClient.setQueryData<MessagesData>(messagesKey, (data) => {
        if (!data) return data;
        const exists = data.pages.some((p) => p.messages.some((m) => m.id === message.id));
        if (exists) return mapPages(data, (m) => (m.id === message.id ? message : m));
        const [first, ...rest] = data.pages;
        return { ...data, pages: [{ ...first, messages: [...first.messages, message] }, ...rest] };
      });
    };

    const onSent = ({ message }: { message: Message }) => upsert(message);
    const onUpdated = ({ message }: { message: Message }) => upsert(message);
    const onDeleted = ({ messageId }: { messageId: string }) =>
      queryClient.setQueryData<MessagesData>(messagesKey, (data) =>
        mapPages(data, (m) => (m.id === messageId ? { ...m, text: null, attachment: null, deletedAt: new Date().toISOString() } : m))
      );
    const onReaction = ({ messageId, reaction }: { messageId: string; reaction: MessageReaction }) =>
      queryClient.setQueryData<MessagesData>(messagesKey, (data) =>
        mapPages(data, (m) =>
          m.id === messageId ? { ...m, reactions: [...m.reactions.filter((r) => r.userId !== reaction.userId), reaction] } : m
        )
      );
    const onReactionRemoved = ({ messageId, userId }: { messageId: string; userId: string }) =>
      queryClient.setQueryData<MessagesData>(messagesKey, (data) =>
        mapPages(data, (m) => (m.id === messageId ? { ...m, reactions: m.reactions.filter((r) => r.userId !== userId) } : m))
      );
    const onTypingStarted = ({ userId }: { userId: string }) => {
      if (userId === user?.id) return;
      setPartnerTyping(true);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setPartnerTyping(false), 4000);
    };
    const onTypingStopped = ({ userId }: { userId: string }) => {
      if (userId === user?.id) return;
      setPartnerTyping(false);
    };

    socket.on("MESSAGE_SENT", onSent);
    socket.on("MESSAGE_UPDATED", onUpdated);
    socket.on("MESSAGE_DELETED", onDeleted);
    socket.on("REACTION_SENT", onReaction);
    socket.on("REACTION_REMOVED", onReactionRemoved);
    socket.on("TYPING_STARTED", onTypingStarted);
    socket.on("TYPING_STOPPED", onTypingStopped);

    return () => {
      socket.off("MESSAGE_SENT", onSent);
      socket.off("MESSAGE_UPDATED", onUpdated);
      socket.off("MESSAGE_DELETED", onDeleted);
      socket.off("REACTION_SENT", onReaction);
      socket.off("REACTION_REMOVED", onReactionRemoved);
      socket.off("TYPING_STARTED", onTypingStarted);
      socket.off("TYPING_STOPPED", onTypingStopped);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, coupleId]);

  return { partnerTyping };
}

export function useTypingEmitter(coupleId: string | undefined) {
  const { socket } = useAppSocket();
  const stopTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(() => {
    if (!socket || !coupleId) return;
    socket.emit("TYPING_START", { coupleId });
    if (stopTimeout.current) clearTimeout(stopTimeout.current);
    stopTimeout.current = setTimeout(() => socket.emit("TYPING_STOP", { coupleId }), 2500);
  }, [socket, coupleId]);
}
