import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Plus } from "lucide-react-native";
import type { MemoryCategory } from "@withu/shared-types";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { useCreateMemory } from "@/features/memories/hooks";
import { cn } from "@/lib/cn";

const CATEGORIES: { value: MemoryCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "first_date", label: "First Date" },
  { value: "trip", label: "Trip" },
  { value: "birthday", label: "Birthday" },
  { value: "funny", label: "Funny" },
  { value: "favourite", label: "Favourite" },
  { value: "place_to_visit", label: "Want to visit" },
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
    <>
      <Button onPress={() => setOpen(true)}>
        <Plus size={16} color="#fff" />
        <Text className="text-sm font-sans-medium text-primary-foreground">Add Memory</Text>
      </Button>
      <Dialog visible={open} onClose={() => setOpen(false)} title="Add a memory">
        <ScrollView className="gap-4">
          <Input placeholder="Title" value={title} onChangeText={setTitle} className="mb-4" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled className="mb-4">
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.value}
                onPress={() => setCategory(c.value)}
                className={cn("mr-2 rounded-full border border-border px-3 py-1.5", category === c.value && "bg-primary")}
              >
                <Text className={cn("text-xs", category === c.value ? "text-primary-foreground" : "text-foreground")}>{c.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Textarea placeholder="Tell the story..." value={caption} onChangeText={setCaption} className="mb-4" />
          <Input placeholder="Photo URL (optional)" value={photoUrl} onChangeText={setPhotoUrl} className="mb-4" />
          <Button onPress={submit} disabled={!title.trim()} loading={createMemory.isPending}>
            Save memory
          </Button>
        </ScrollView>
      </Dialog>
    </>
  );
}
