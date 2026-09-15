"use client";

import { useState } from "react";
import { LOVE_DROP_PRESETS } from "@withu/constants";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useSendLoveDrop } from "@/features/affection/hooks";

export function LoveDropDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const sendLoveDrop = useSendLoveDrop();
  const { show } = useToast();

  const send = async () => {
    if (!message.trim()) return;
    await sendLoveDrop.mutateAsync({ kind: "text", message: message.trim() });
    show({ title: "Love Drop sent 💌", description: "It just landed in their space.", variant: "love" });
    setMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ember" size="lg" className="w-full sm:w-auto">
          <Mail className="h-4 w-4" /> Love Drop
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a Love Drop</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {LOVE_DROP_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setMessage(preset)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {preset}
            </button>
          ))}
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write something sweet..."
          className="mt-3 min-h-[100px]"
          maxLength={500}
        />

        <DialogFooter>
          <Button onClick={send} disabled={!message.trim() || sendLoveDrop.isPending}>
            <Send className="h-4 w-4" /> Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
