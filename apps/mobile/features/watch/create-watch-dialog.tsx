import { useState } from "react";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Video } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateWatchSession } from "@/features/watch/hooks";
import { cn } from "@/lib/cn";

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

  const submit = async () => {
    if (!title.trim() || !source.trim()) return;
    const mediaId = provider === "youtube" ? extractYouTubeId(source.trim()) : source.trim();
    const session = await createSession.mutateAsync({ media: { providerId: provider, mediaId, title: title.trim() } });
    setOpen(false);
    router.push(`/watch/${session.id}`);
  };

  return (
    <>
      <Button variant="secondary" onPress={() => setOpen(true)}>
        <Video size={16} color="#214539" />
        <Text className="text-sm font-sans-medium text-secondary-foreground">Watch Together</Text>
      </Button>
      <Dialog visible={open} onClose={() => setOpen(false)} title="Start a watch session">
        <View className="gap-4">
          <View className="flex-row rounded-full bg-muted p-1">
            {(["youtube", "generic_url"] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setProvider(p)}
                className={cn("flex-1 items-center rounded-full py-2", provider === p && "bg-card")}
              >
                <Text className="text-xs font-sans-medium text-foreground">{p === "youtube" ? "YouTube" : "Direct URL"}</Text>
              </Pressable>
            ))}
          </View>
          <Input placeholder="Title (e.g. Our movie night)" value={title} onChangeText={setTitle} />
          <Input
            placeholder={provider === "youtube" ? "https://youtube.com/watch?v=..." : "https://.../movie.mp4"}
            autoCapitalize="none"
            value={source}
            onChangeText={setSource}
          />
          <Text className="text-xs text-muted-foreground">
            We only coordinate play, pause and seek — the video streams straight from its source.
          </Text>
          <Button onPress={submit} disabled={!title.trim() || !source.trim()} loading={createSession.isPending}>
            Start session
          </Button>
        </View>
      </Dialog>
    </>
  );
}
