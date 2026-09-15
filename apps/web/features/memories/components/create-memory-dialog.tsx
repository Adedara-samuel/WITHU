"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMemory } from "@/features/memories/hooks";
import type { MemoryCategory } from "@withu/shared-types";

const CATEGORIES: { value: MemoryCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "first_date", label: "First Date" },
  { value: "trip", label: "Trip" },
  { value: "birthday", label: "Birthday" },
  { value: "funny", label: "Funny Moment" },
  { value: "favourite", label: "Favourite" },
  { value: "place_to_visit", label: "Place to visit" },
  { value: "milestone", label: "Milestone" },
];

export function CreateMemoryDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<MemoryCategory>("general");
  const [photoUrl, setPhotoUrl] = useState("");
  const createMemory = useCreateMemory();

  const submit = async () => {
    if (!title.trim()) return;
    await createMemory.mutateAsync({
      title: title.trim(),
      caption: caption.trim() || null,
      category,
      photo: photoUrl.trim() ? { url: photoUrl.trim(), thumbnailUrl: photoUrl.trim(), width: 800, height: 600 } : null,
    });
    setTitle("");
    setCaption("");
    setPhotoUrl("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Add Memory
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a memory</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="memory-title">Title</Label>
            <Input id="memory-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Our first trip" />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MemoryCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="memory-caption">Caption</Label>
            <Textarea id="memory-caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Tell the story..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="memory-photo">Photo URL (optional)</Label>
            <Input id="memory-photo" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!title.trim() || createMemory.isPending}>
            Save memory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
