"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateWatchSession } from "@/features/watch/hooks";

function extractYouTubeId(input: string): string {
  const match = input.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/);
  return match?.[1] ?? input;
}

export function CreateWatchDialog() {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<"youtube" | "generic_url">("youtube");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const createSession = useCreateWatchSession();
  const router = useRouter();

  const submit = async () => {
    if (!title.trim() || !source.trim()) return;
    const mediaId = provider === "youtube" ? extractYouTubeId(source.trim()) : source.trim();
    const session = await createSession.mutateAsync({
      media: { providerId: provider, mediaId, title: title.trim() },
    });
    setOpen(false);
    router.push(`/watch/${session.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Video className="h-4 w-4" /> Watch Together
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a watch session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as typeof provider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube link</SelectItem>
                <SelectItem value="generic_url">Direct video URL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="watch-title">Title</Label>
            <Input id="watch-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Our movie night" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="watch-source">{provider === "youtube" ? "YouTube URL" : "Video URL"}</Label>
            <Input
              id="watch-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={provider === "youtube" ? "https://youtube.com/watch?v=..." : "https://.../movie.mp4"}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We only coordinate play, pause and seek between your devices — the video itself streams straight from its
            source, never through our servers.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={!title.trim() || !source.trim() || createSession.isPending}>
            Start session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
