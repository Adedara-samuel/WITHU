import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Mail, Send } from "lucide-react-native";
import { LOVE_DROP_PRESETS } from "@withu/constants";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
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
    <>
      <Button variant="ember" onPress={() => setOpen(true)}>
        <Mail size={16} color="#FDF4EF" />
        <Text className="text-sm font-sans-medium text-ember-foreground">Love Drop</Text>
      </Button>
      <Dialog visible={open} onClose={() => setOpen(false)} title="Send a Love Drop">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 -mx-1">
          {LOVE_DROP_PRESETS.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => setMessage(preset)}
              className="mx-1 rounded-full border border-border px-3 py-1.5"
            >
              <Text className="text-xs text-muted-foreground">{preset}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Textarea value={message} onChangeText={setMessage} placeholder="Write something sweet..." maxLength={500} />
        <View className="mt-4">
          <Button onPress={send} disabled={!message.trim()} loading={sendLoveDrop.isPending}>
            <Send size={16} color="#fff" />
            <Text className="text-sm font-sans-medium text-primary-foreground">Send</Text>
          </Button>
        </View>
      </Dialog>
    </>
  );
}
