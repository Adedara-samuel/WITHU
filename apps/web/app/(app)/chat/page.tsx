"use client";

import { useEffect, useRef, useState } from "react";
import { moodEmoji } from "@withu/constants";
import { Loader2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PresenceDot } from "@/components/ui/presence-dot";
import { Button } from "@/components/ui/button";
import { useMyCouple } from "@/features/couple/hooks";
import { ChatBubble } from "@/features/messages/components/chat-bubble";
import { useMessages, useMessagesRealtime, useSendMessage, useTypingEmitter } from "@/features/messages/hooks";
import { useAppSocket } from "@/providers/socket-provider";
import { useAuthStore } from "@/stores/auth-store";

export default function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const { data: couple } = useMyCouple();
  const { messages, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages();
  const sendMessage = useSendMessage();
  const { socket } = useAppSocket();
  const { partnerTyping } = useMessagesRealtime(couple?.id);
  const emitTyping = useTypingEmitter(couple?.id);

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const partner = couple ? (couple.partnerOne.id === user?.id ? couple.partnerTwo : couple.partnerOne) : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && couple && socket) {
      socket.emit("MESSAGE_READ_UP_TO", { coupleId: couple.id, messageId: last.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, couple?.id]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    sendMessage.mutate({ type: "text", text, clientTempId: `${Date.now()}-${Math.random().toString(36).slice(2)}` });
    setDraft("");
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-5rem)] max-w-2xl flex-col lg:h-dvh">
      <div className="flex items-center gap-3 border-b border-border p-4">
        {partner && (
          <>
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarImage src={partner.avatarUrl ?? undefined} alt={partner.name} />
                <AvatarFallback>{partner.name[0]}</AvatarFallback>
              </Avatar>
              <PresenceDot presence={partner.presence} className="absolute bottom-0 right-0" />
            </div>
            <div>
              <p className="font-medium">{partner.name}</p>
              <p className="text-xs text-muted-foreground">
                {partnerTyping ? "typing..." : partner.presence === "online" ? "Online" : moodEmoji(partner.mood) + " " + (partner.moodMessage ?? "")}
              </p>
            </div>
          </>
        )}
      </div>

      <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
        {hasNextPage && (
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Load earlier messages"}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-muted-foreground">
            <p className="font-display text-lg">Say hello ❤️</p>
            <p className="text-sm">Your conversation starts here.</p>
          </div>
        ) : (
          messages.map((m) => <ChatBubble key={m.id} message={m} />)
        )}

        {partnerTyping && (
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground w-fit">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            emitTyping();
          }}
          placeholder="Type a message..."
          className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
