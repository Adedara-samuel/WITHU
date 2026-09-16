"use client";

import { useState } from "react";
import type { Message } from "@withu/shared-types";
import { Check, CheckCheck, Clock, Pencil, SmilePlus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDeleteMessage, useEditMessage, useToggleReaction } from "@/features/messages/hooks";
import { useAuthStore } from "@/stores/auth-store";
import { Textarea } from "@/components/ui/input";

const QUICK_REACTIONS = ["❤️", "😂", "😮", "🥺", "🔥"];

export function ChatBubble({ message }: { message: Message }) {
  const user = useAuthStore((s) => s.user);
  const isMine = message.senderId === user?.id;
  const [showReactions, setShowReactions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text ?? "");
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const toggleReaction = useToggleReaction();

  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const groupedReactions = message.reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn("group flex w-full flex-col", isMine ? "items-end" : "items-start")}
    >
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[65%]",
          isMine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted text-foreground"
        )}
      >
        {message.deletedAt ? (
          <p className="italic text-muted-foreground">Message deleted</p>
        ) : editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[60px] bg-background text-foreground"
            />
            <div className="flex gap-2 text-xs">
              <button
                className="font-medium underline"
                onClick={async () => {
                  if (draft.trim()) await editMessage.mutateAsync({ id: message.id, text: draft.trim() });
                  setEditing(false);
                }}
              >
                Save
              </button>
              <button className="text-muted-foreground" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        )}

        {!editing && !message.deletedAt && (
          <div className={cn("mt-1 flex items-center gap-1 text-[10px] opacity-70", isMine ? "justify-end" : "justify-start")}>
            <span>{time}</span>
            {message.editedAt && <span>· edited</span>}
            {isMine && message.status === "sending" && <Clock className="h-3 w-3" />}
            {isMine && message.status === "sent" && <Check className="h-3 w-3" />}
            {isMine && message.status === "read" && <CheckCheck className="h-3 w-3" />}
          </div>
        )}
      </div>

      {Object.keys(groupedReactions).length > 0 && (
        <div className="mt-1 flex gap-1">
          {Object.entries(groupedReactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() =>
                toggleReaction.mutate({
                  messageId: message.id,
                  emoji,
                  hasMine: message.reactions.some((r) => r.emoji === emoji && r.userId === user?.id),
                })
              }
              className="rounded-full border border-border bg-card px-1.5 py-0.5 text-xs"
            >
              {emoji} {count > 1 && count}
            </button>
          ))}
        </div>
      )}

      {!message.deletedAt && (
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground md:hidden md:group-hover:flex">
          <div className="relative">
            <button onClick={() => setShowReactions((v) => !v)} aria-label="React">
              <SmilePlus className="h-3.5 w-3.5" />
            </button>
            {showReactions && (
              <div className="glass absolute bottom-6 left-0 z-10 flex gap-1 rounded-full px-2 py-1 shadow-lg">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    className="text-base transition-transform hover:scale-125"
                    onClick={() => {
                      toggleReaction.mutate({ messageId: message.id, emoji, hasMine: false });
                      setShowReactions(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isMine && (
            <>
              <button onClick={() => setEditing(true)} aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => deleteMessage.mutate(message.id)} aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
