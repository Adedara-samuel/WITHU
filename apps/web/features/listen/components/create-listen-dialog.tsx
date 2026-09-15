"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateListenSession } from "@/features/listen/hooks";

export function CreateListenDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const createSession = useCreateListenSession();
  const router = useRouter();

  const submit = async () => {
    if (!title.trim() || !url.trim()) return;
    const session = await createSession.mutateAsync({
      track: { providerId: "generic_url", trackId: url.trim(), title: title.trim(), artist: artist.trim() || null },
    });
    setOpen(false);
    router.push(`/listen/${session.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Music className="h-4 w-4" /> Listen Together
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a listening session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="track-title">Track title</Label>
            <Input id="track-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Our song" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="track-artist">Artist (optional)</Label>
            <Input id="track-artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="track-url">Audio URL</Label>
            <Input id="track-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://.../song.mp3" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!title.trim() || !url.trim() || createSession.isPending}>
            Start session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
