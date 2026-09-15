"use client";

import { useState } from "react";
import type { Milestone, MilestoneKind } from "@withu/shared-types";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMilestone, useMilestones } from "@/features/memories/hooks";

const KIND_OPTIONS: { value: MilestoneKind; label: string; icon: string }[] = [
  { value: "met", label: "We met", icon: "✨" },
  { value: "first_conversation", label: "First conversation", icon: "💬" },
  { value: "first_date", label: "First date", icon: "🥰" },
  { value: "first_i_love_you", label: "First 'I love you'", icon: "❤️" },
  { value: "first_trip", label: "First trip", icon: "📸" },
  { value: "anniversary", label: "Anniversary", icon: "💍" },
  { value: "birthday", label: "Birthday", icon: "🎂" },
  { value: "custom", label: "Custom milestone", icon: "🌟" },
];

function AddMilestoneDialog() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<MilestoneKind>("custom");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const createMilestone = useCreateMilestone();

  const submit = async () => {
    if (!title.trim() || !date) return;
    await createMilestone.mutateAsync({
      kind,
      title: title.trim(),
      date: new Date(date).toISOString(),
      icon: KIND_OPTIONS.find((k) => k.value === kind)?.icon ?? "heart",
    });
    setTitle("");
    setDate("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Plus className="h-4 w-4" /> Add milestone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a milestone</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as MilestoneKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.icon} {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="milestone-title">Title</Label>
            <Input id="milestone-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="milestone-date">Date</Label>
            <Input id="milestone-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!title.trim() || !date || createMilestone.isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StoryTimeline() {
  const { data: milestones = [] } = useMilestones();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Our Story</p>
        <AddMilestoneDialog />
      </div>

      {milestones.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No milestones yet. Add your first one ❤️</p>
      ) : (
        <ol className="relative space-y-6 border-l border-border pl-6">
          {milestones.map((m: Milestone) => (
            <li key={m.id} className="relative">
              <span className="absolute -left-[27px] flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
                •
              </span>
              <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
              <p className="font-display text-base font-medium">
                {m.icon === "sparkles" ? "✨" : m.icon === "heart" ? "❤️" : m.icon === "cake" ? "🎂" : "🌟"} {m.title}
              </p>
              {m.description && <p className="text-sm text-muted-foreground">{m.description}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
