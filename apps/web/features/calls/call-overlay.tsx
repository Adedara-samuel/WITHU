"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMyCouple } from "@/features/couple/hooks";
import { useAuthStore } from "@/stores/auth-store";
import { useCall } from "./call-context";

function VideoTile({ stream, muted, mirrored }: { stream: MediaStream | null; muted?: boolean; mirrored?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream;
    // The `autoPlay` attribute alone can silently fail once a stream is attached
    // asynchronously (well after the click that started the call) - browsers can
    // treat that as no longer tied to a user gesture and block playback.
    el.play().catch(() => undefined);
    return () => {
      el.srcObject = null;
    };
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={mirrored ? "h-full w-full scale-x-[-1] object-cover" : "h-full w-full object-cover"}
    />
  );
}

function RemoteAudio({ stream }: { stream: MediaStream | null }) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream;
    el.play().catch(() => undefined);
    return () => {
      el.srcObject = null;
    };
  }, [stream]);
  return <audio ref={ref} autoPlay />;
}

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
  return <span>{m}:{s.toString().padStart(2, "0")}</span>;
}

export function CallOverlay() {
  const { state, respondToCall, endCall, toggleMic, toggleCamera } = useCall();
  const { data: couple } = useMyCouple();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const partner = couple ? (couple.partnerOne.id === currentUserId ? couple.partnerTwo : couple.partnerOne) : null;

  if (state.phase === "idle") return null;

  const isVideo = state.kind === "video";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex flex-col bg-neutral-950 text-white"
      >
        {isVideo && state.phase === "active" ? (
          <div className="relative flex-1">
            {state.remoteStream ? (
              <VideoTile stream={state.remoteStream} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <PartnerAvatar partner={partner} />
              </div>
            )}
            {state.localStream && !state.cameraOff && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-4 top-4 h-32 w-24 overflow-hidden rounded-xl border border-white/20 shadow-lg sm:h-40 sm:w-32"
              >
                <VideoTile stream={state.localStream} muted mirrored />
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            {!isVideo && <RemoteAudio stream={state.remoteStream} />}
            <motion.div
              animate={state.phase === "outgoing" || state.phase === "incoming" ? { scale: [1, 1.06, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.6 }}
            >
              <PartnerAvatar partner={partner} size={112} />
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-medium">{state.partnerName}</p>
              <p className="text-sm text-white/60">
                {state.phase === "incoming" && `Incoming ${state.kind} call...`}
                {state.phase === "outgoing" && "Calling..."}
                {state.phase === "connecting" && "Connecting..."}
                {state.phase === "active" && <CallTimer startedAt={state.startedAt} />}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 bg-black/40 px-6 py-8">
          {state.phase === "incoming" ? (
            <>
              <ControlButton onClick={() => respondToCall(false)} tone="danger" label="Decline">
                <PhoneOff className="h-6 w-6" />
              </ControlButton>
              <ControlButton onClick={() => respondToCall(true)} tone="success" label="Accept">
                <Phone className="h-6 w-6" />
              </ControlButton>
            </>
          ) : (
            <>
              {state.localStream && (
                <ControlButton onClick={toggleMic} tone={state.micMuted ? "active" : "default"} label={state.micMuted ? "Unmute" : "Mute"}>
                  {state.micMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </ControlButton>
              )}
              {state.localStream && isVideo && (
                <ControlButton onClick={toggleCamera} tone={state.cameraOff ? "active" : "default"} label={state.cameraOff ? "Camera on" : "Camera off"}>
                  {state.cameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </ControlButton>
              )}
              <ControlButton onClick={endCall} tone="danger" label="End call">
                <PhoneOff className="h-6 w-6" />
              </ControlButton>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function PartnerAvatar({ partner, size = 80 }: { partner: { name: string; avatarUrl: string | null } | null | undefined; size?: number }) {
  return (
    <Avatar style={{ height: size, width: size }}>
      <AvatarImage src={partner?.avatarUrl ?? undefined} alt={partner?.name ?? "Partner"} />
      <AvatarFallback className="text-2xl">{partner?.name?.[0] ?? "?"}</AvatarFallback>
    </Avatar>
  );
}

function ControlButton({
  children,
  onClick,
  tone = "default",
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "default" | "danger" | "success" | "active";
  label: string;
}) {
  const toneClasses = {
    default: "bg-white/15 hover:bg-white/25",
    active: "bg-white text-neutral-900",
    danger: "bg-red-500 hover:bg-red-600",
    success: "bg-emerald-500 hover:bg-emerald-600",
  }[tone];
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={label}
      className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${toneClasses}`}
    >
      {children}
    </motion.button>
  );
}
