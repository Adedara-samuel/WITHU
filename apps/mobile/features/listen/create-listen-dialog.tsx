import { useState } from "react";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { Music } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateListenSession } from "@/features/listen/hooks";

export function CreateListenDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const createSession = useCreateListenSession();

  const submit = async () => {
    if (!title.trim() || !url.trim()) return;
    const session = await createSession.mutateAsync({
      track: { providerId: "generic_url", trackId: url.trim(), title: title.trim(), artist: artist.trim() || null },
    });
    setOpen(false);
    router.push(`/listen/${session.id}`);
  };

  return (
    <>
      <Button variant="secondary" onPress={() => setOpen(true)}>
        <Music size={16} color="#5C2138" />
        <Text className="text-sm font-sans-medium text-secondary-foreground">Listen Together</Text>
      </Button>
      <Dialog visible={open} onClose={() => setOpen(false)} title="Start a listening session">
        <View className="gap-4">
          <Input placeholder="Track title" value={title} onChangeText={setTitle} />
          <Input placeholder="Artist (optional)" value={artist} onChangeText={setArtist} />
          <Input placeholder="Audio URL" autoCapitalize="none" value={url} onChangeText={setUrl} />
          <Button onPress={submit} disabled={!title.trim() || !url.trim()} loading={createSession.isPending}>
            Start session
          </Button>
        </View>
      </Dialog>
    </>
  );
}
