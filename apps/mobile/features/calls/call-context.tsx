import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";
import type { CallEndReason, CallKind, PlainIceCandidate } from "@withu/shared-types";
import { useAppSocket } from "@/providers/socket-provider";
import { useMyCouple } from "@/features/couple/hooks";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/ui/toast";

// Public STUN only - there's no TURN relay in this deployment, so calls between
// two phones behind restrictive/symmetric NATs may fail to connect peer-to-peer.
const ICE_SERVERS = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];

export type CallPhase = "idle" | "outgoing" | "incoming" | "connecting" | "active";

interface CallUiState {
  phase: CallPhase;
  callId: string | null;
  kind: CallKind | null;
  partnerName: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  micMuted: boolean;
  cameraOff: boolean;
  startedAt: number | null;
}

interface CallContextValue {
  state: CallUiState;
  startCall: (kind: CallKind) => Promise<void>;
  respondToCall: (accept: boolean) => Promise<void>;
  endCall: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
}

const IDLE_STATE: CallUiState = {
  phase: "idle",
  callId: null,
  kind: null,
  partnerName: null,
  localStream: null,
  remoteStream: null,
  micMuted: false,
  cameraOff: false,
  startedAt: null,
};

const CallContext = createContext<CallContextValue | null>(null);

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
}

interface CallSession {
  callId: string;
  kind: CallKind;
  role: "caller" | "callee";
  pc: RTCPeerConnection;
  localStream: MediaStream;
  pendingCandidates: PlainIceCandidate[];
  remoteDescriptionSet: boolean;
}

function newCallId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { socket } = useAppSocket();
  const { data: couple } = useMyCouple();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { show } = useToast();
  const [state, setState] = useState<CallUiState>(IDLE_STATE);

  const sessionRef = useRef<CallSession | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const partner = couple ? (couple.partnerOne.id === currentUserId ? couple.partnerTwo : couple.partnerOne) : null;
  const partnerRef = useRef(partner);
  partnerRef.current = partner;

  const cleanup = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    // However teardown goes, the UI must always return to idle - an exception here
    // (e.g. closing an already-errored peer connection) used to leave the call stuck
    // open with no way to end it.
    try {
      session?.pc.close();
      session?.localStream.getTracks().forEach((t) => t.stop());
      InCallManager.stop();
    } catch (err) {
      console.error("Error tearing down call", err);
    } finally {
      setState(IDLE_STATE);
    }
  }, []);

  const createPeerConnection = useCallback(
    (callId: string) => {
      if (!socket) throw new Error("Not connected");
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // @ts-expect-error - react-native-webrtc's event typings lag behind the spec slightly
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("CALL_SIGNAL", {
            callId,
            signal: {
              type: "ice-candidate",
              candidate: {
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex,
              },
            },
          });
        }
      };
      // @ts-expect-error - same as above
      pc.ontrack = (event) => {
        setState((prev) =>
          prev.callId === callId ? { ...prev, phase: "active", remoteStream: event.streams[0] ?? null, startedAt: prev.startedAt ?? Date.now() } : prev
        );
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          if (sessionRef.current?.callId === callId) cleanup();
        }
      };

      return pc;
    },
    [socket, cleanup]
  );

  const startCall = useCallback(
    async (kind: CallKind) => {
      if (!socket || !partnerRef.current) {
        show({ title: "Can't start call", description: "Your partner isn't connected yet.", variant: "error" });
        return;
      }
      if (sessionRef.current) return;

      const callId = newCallId();
      try {
        const localStream = (await mediaDevices.getUserMedia({ audio: true, video: kind === "video" })) as MediaStream;
        // Without this, react-native-webrtc audio can end up routed to the earpiece at
        // near-silent volume instead of the speaker, which just looks like "no audio".
        InCallManager.start({ media: kind });
        InCallManager.setForceSpeakerphoneOn(kind === "video");
        const pc = createPeerConnection(callId);
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

        sessionRef.current = { callId, kind, role: "caller", pc, localStream, pendingCandidates: [], remoteDescriptionSet: false };
        setState({ ...IDLE_STATE, phase: "outgoing", callId, kind, partnerName: partnerRef.current.name, localStream });
        socket.emit("CALL_START", { callId, kind });
      } catch {
        show({ title: "Camera/microphone unavailable", description: "Check your device permissions and try again.", variant: "error" });
      }
    },
    [socket, createPeerConnection, show]
  );

  const respondToCall = useCallback(
    async (accept: boolean) => {
      const session = sessionRef.current;
      if (!socket || !session || session.role !== "callee") return;

      if (!accept) {
        socket.emit("CALL_RESPOND", { callId: session.callId, accept: false });
        cleanup();
        return;
      }

      try {
        const localStream = (await mediaDevices.getUserMedia({ audio: true, video: session.kind === "video" })) as MediaStream;
        InCallManager.start({ media: session.kind });
        InCallManager.setForceSpeakerphoneOn(session.kind === "video");
        localStream.getTracks().forEach((track) => session.pc.addTrack(track, localStream));
        session.localStream = localStream;
        setState((prev) => ({ ...prev, phase: "connecting", localStream }));
        socket.emit("CALL_RESPOND", { callId: session.callId, accept: true });
      } catch {
        show({ title: "Camera/microphone unavailable", description: "Check your device permissions and try again.", variant: "error" });
        socket.emit("CALL_RESPOND", { callId: session.callId, accept: false });
        cleanup();
      }
    },
    [socket, cleanup, show]
  );

  const endCall = useCallback(() => {
    const session = sessionRef.current;
    try {
      if (socket && session) socket.emit("CALL_END", { callId: session.callId });
    } finally {
      cleanup();
    }
  }, [socket, cleanup]);

  const toggleMic = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    const next = !stateRef.current.micMuted;
    session.localStream.getAudioTracks().forEach((t) => (t.enabled = !next));
    setState((prev) => ({ ...prev, micMuted: next }));
  }, []);

  const toggleCamera = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    const next = !stateRef.current.cameraOff;
    session.localStream.getVideoTracks().forEach((t) => (t.enabled = !next));
    setState((prev) => ({ ...prev, cameraOff: next }));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onIncoming = ({ callId, kind }: { callId: string; callerId: string; callerName: string; kind: CallKind }) => {
      if (sessionRef.current) {
        socket.emit("CALL_RESPOND", { callId, accept: false });
        return;
      }
      const pc = createPeerConnection(callId);
      sessionRef.current = {
        callId,
        kind,
        role: "callee",
        pc,
        localStream: new MediaStream(),
        pendingCandidates: [],
        remoteDescriptionSet: false,
      };
      setState({ ...IDLE_STATE, phase: "incoming", callId, kind, partnerName: partnerRef.current?.name ?? "Your partner" });
    };

    const onAccepted = async ({ callId }: { callId: string }) => {
      const session = sessionRef.current;
      if (!session || session.callId !== callId || session.role !== "caller") return;
      setState((prev) => (prev.callId === callId ? { ...prev, phase: "connecting" } : prev));
      const offer = await session.pc.createOffer({});
      await session.pc.setLocalDescription(offer);
      socket.emit("CALL_SIGNAL", { callId, signal: { type: "offer", sdp: offer.sdp ?? "" } });
    };

    const onDeclined = ({ callId }: { callId: string }) => {
      if (sessionRef.current?.callId === callId) {
        show({ title: "Call declined", variant: "default" });
        cleanup();
      }
    };

    const onSignal = async ({ callId, signal }: { callId: string; signal: { type: string; sdp?: string; candidate?: PlainIceCandidate } }) => {
      const session = sessionRef.current;
      if (!session || session.callId !== callId) return;

      if (signal.type === "offer" && signal.sdp) {
        await session.pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: signal.sdp }));
        session.remoteDescriptionSet = true;
        for (const candidate of session.pendingCandidates.splice(0)) {
          await session.pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        const answer = await session.pc.createAnswer();
        await session.pc.setLocalDescription(answer);
        socket.emit("CALL_SIGNAL", { callId, signal: { type: "answer", sdp: answer.sdp ?? "" } });
      } else if (signal.type === "answer" && signal.sdp) {
        await session.pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: signal.sdp }));
        session.remoteDescriptionSet = true;
        for (const candidate of session.pendingCandidates.splice(0)) {
          await session.pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } else if (signal.type === "ice-candidate" && signal.candidate) {
        if (session.remoteDescriptionSet) {
          await session.pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } else {
          session.pendingCandidates.push(signal.candidate);
        }
      }
    };

    const onEnded = ({ callId, reason }: { callId: string; reason: CallEndReason }) => {
      if (sessionRef.current?.callId !== callId) return;
      const labels: Record<CallEndReason, string> = {
        ended: "Call ended",
        declined: "Call declined",
        missed: "No answer",
        busy: "Your partner is on another call",
        failed: "Call failed",
      };
      if (reason !== "ended") show({ title: labels[reason], variant: "default" });
      cleanup();
    };

    socket.on("CALL_INCOMING", onIncoming);
    socket.on("CALL_ACCEPTED", onAccepted);
    socket.on("CALL_DECLINED", onDeclined);
    socket.on("CALL_SIGNAL", onSignal);
    socket.on("CALL_ENDED", onEnded);

    return () => {
      socket.off("CALL_INCOMING", onIncoming);
      socket.off("CALL_ACCEPTED", onAccepted);
      socket.off("CALL_DECLINED", onDeclined);
      socket.off("CALL_SIGNAL", onSignal);
      socket.off("CALL_ENDED", onEnded);
    };
  }, [socket, createPeerConnection, cleanup, show]);

  return (
    <CallContext.Provider value={{ state, startCall, respondToCall, endCall, toggleMic, toggleCamera }}>
      {children}
    </CallContext.Provider>
  );
}
