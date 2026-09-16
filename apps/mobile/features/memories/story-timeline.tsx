import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Plus } from "lucide-react-native";
import type { Milestone, MilestoneKind } from "@withu/shared-types";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateMilestone, useMilestones } from "@/features/memories/hooks";
import { cn } from "@/lib/cn";

const KIND_OPTIONS: { value: MilestoneKind; label: string; icon: string }[] = [
  { value: "met", label: "We met", icon: "✨" },
  { value: "first_conversation", label: "First conversation", icon: "💬" },
  { value: "first_date", label: "First date", icon: "🥰" },
  { value: "first_i_love_you", label: "First 'I love you'", icon: "❤️" },
  { value: "first_trip", label: "First trip", icon: "📸" },
  { value: "anniversary", label: "Anniversary", icon: "💍" },
  { value: "birthday", label: "Birthday", icon: "🎂" },
  { value: "custom", label: "Custom", icon: "🌟" },
];

function AddMilestoneDialog() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<MilestoneKind>("custom");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const createMilestone = useCreateMilestone();

  const submit = async () => {
    if (!title.trim() || !date) return;
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return;
    await createMilestone.mutateAsync({
      kind,
      title: title.trim(),
      date: parsed.toISOString(),
      icon: KIND_OPTIONS.find((k) => k.value === kind)?.icon ?? "heart",
    });
    setTitle("");
    setDate("");
    setOpen(false);
  };

  return (
    <>
      <Button size="sm" variant="secondary" onPress={() => setOpen(true)}>
        <Plus size={14} color="#214539" />
        <Text className="text-xs font-sans-medium text-secondary-foreground">Add milestone</Text>
      </Button>
      <Dialog visible={open} onClose={() => setOpen(false)} title="Add a milestone">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {KIND_OPTIONS.map((k) => (
            <Pressable
              key={k.value}
              onPress={() => setKind(k.value)}
              className={cn("mr-2 rounded-full border border-border px-3 py-1.5", kind === k.value && "bg-primary")}
            >
              <Text className={cn("text-xs", kind === k.value ? "text-primary-foreground" : "text-foreground")}>
                {k.icon} {k.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Input placeholder="Title" value={title} onChangeText={setTitle} className="mb-4" />
        <Input placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} className="mb-4" />
        <Button onPress={submit} disabled={!title.trim() || !date} loading={createMilestone.isPending}>
          Save
        </Button>
      </Dialog>
    </>
  );
}

export function StoryTimeline() {
  const { data: milestones = [] } = useMilestones();

  return (
    <View>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm font-sans-medium text-muted-foreground">Our Story</Text>
        <AddMilestoneDialog />
      </View>

      {milestones.length === 0 ? (
        <Text className="py-10 text-center text-sm text-muted-foreground">No milestones yet. Add your first one ❤️</Text>
      ) : (
        <View className="gap-5 border-l border-border pl-4">
          {milestones.map((m: Milestone) => (
            <View key={m.id}>
              <Text className="text-xs text-muted-foreground">
                {new Date(m.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </Text>
              <Text className="font-display text-base text-foreground">
                {m.icon === "sparkles" ? "✨" : m.icon === "heart" ? "❤️" : m.icon === "cake" ? "🎂" : "🌟"} {m.title}
              </Text>
              {m.description && <Text className="text-sm text-muted-foreground">{m.description}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
