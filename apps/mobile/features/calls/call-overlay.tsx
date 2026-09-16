import { useEffect, useState } from "react";
import { Modal, Pressable, View, Text } from "react-native";
import { RTCView } from "react-native-webrtc";
import * as Haptics from "expo-haptics";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { useMyCouple } from "@/features/couple/hooks";
import { useAuthStore } from "@/stores/auth-store";
import { useCall } from "./call-context";

function CallTimer({ startedAt }: { startedAt: number | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  if (!startedAt) return null;
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return (
    <Text className="text-sm text-white/60">
      {m}:{s.toString().padStart(2, "0")}
    </Text>
  );
}

function ControlButton({
  children,
  onPress,
  tone = "default",
}: {
  children: React.ReactNode;
  onPress: () => void;
  tone?: "default" | "danger" | "success" | "active";
}) {
  const bg = {
    default: "bg-white/20",
    active: "bg-white",
    danger: "bg-red-500",
    success: "bg-emerald-500",
  }[tone];
  const onPressWithHaptic = () => {
    if (tone === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    else if (tone === "danger") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress();
  };
  return (
    <Pressable onPress={onPressWithHaptic} className={`h-16 w-16 items-center justify-center rounded-full ${bg}`}>
      {children}
    </Pressable>
  );
}

export function CallOverlay() {
  const { state, respondToCall, endCall, toggleMic, toggleCamera } = useCall();
  const { data: couple } = useMyCouple();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const partner = couple ? (couple.partnerOne.id === currentUserId ? couple.partnerTwo : couple.partnerOne) : null;

  const visible = state.phase !== "idle";
  const isVideo = state.kind === "video";

  useEffect(() => {
    if (state.phase !== "incoming") return;
    const buzz = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
    buzz();
    const id = setInterval(buzz, 1400);
    return () => clearInterval(id);
  }, [state.phase]);

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={endCall}>
      <View className="flex-1 bg-black">
        {isVideo && state.phase === "active" ? (
          <View className="flex-1">
            {state.remoteStream ? (
              <RTCView streamURL={state.remoteStream.toURL()} style={{ flex: 1 }} objectFit="cover" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Avatar uri={partner?.avatarUrl} name={partner?.name ?? state.partnerName ?? "?"} size={96} />
              </View>
            )}
            {state.localStream && !state.cameraOff && (
              <View className="absolute right-4 top-12 h-40 w-28 overflow-hidden rounded-2xl border border-white/20">
                <RTCView streamURL={state.localStream.toURL()} style={{ flex: 1 }} objectFit="cover" mirror zOrder={1} />
              </View>
            )}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center gap-4">
            <Avatar uri={partner?.avatarUrl} name={partner?.name ?? state.partnerName ?? "?"} size={112} />
            <View className="items-center">
              <Text className="font-display text-lg text-white">{state.partnerName}</Text>
              <View className="mt-1">
                {state.phase === "incoming" && <Text className="text-sm text-white/60">Incoming {state.kind} call...</Text>}
                {state.phase === "outgoing" && <Text className="text-sm text-white/60">Calling...</Text>}
                {state.phase === "connecting" && <Text className="text-sm text-white/60">Connecting...</Text>}
                {state.phase === "active" && <CallTimer startedAt={state.startedAt} />}
              </View>
            </View>
          </View>
        )}

        <View className="flex-row items-center justify-center gap-6 bg-black/40 px-6 py-10">
          {state.phase === "incoming" ? (
            <>
              <ControlButton tone="danger" onPress={() => respondToCall(false)}>
                <PhoneOff size={26} color="#fff" />
              </ControlButton>
              <ControlButton tone="success" onPress={() => respondToCall(true)}>
                <Phone size={26} color="#fff" />
              </ControlButton>
            </>
          ) : (
            <>
              {state.localStream && (
                <ControlButton tone={state.micMuted ? "active" : "default"} onPress={toggleMic}>
                  {state.micMuted ? <MicOff size={22} color="#111" /> : <Mic size={22} color="#fff" />}
                </ControlButton>
              )}
              {state.localStream && isVideo && (
                <ControlButton tone={state.cameraOff ? "active" : "default"} onPress={toggleCamera}>
                  {state.cameraOff ? <VideoOff size={22} color="#111" /> : <Video size={22} color="#fff" />}
                </ControlButton>
              )}
              <ControlButton tone="danger" onPress={endCall}>
                <PhoneOff size={26} color="#fff" />
              </ControlButton>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
