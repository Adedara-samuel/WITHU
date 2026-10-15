export type CallKind = "audio" | "video";

export type CallEndReason = "ended" | "declined" | "missed" | "busy" | "failed";

/** Minimal, platform-agnostic ICE candidate shape (avoids depending on the DOM lib's RTCIceCandidateInit). */
export interface PlainIceCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

export type CallSignal =
  | { type: "offer"; sdp: string }
  | { type: "answer"; sdp: string }
  | { type: "ice-candidate"; candidate: PlainIceCandidate };

/** Platform-agnostic mirror of RTCIceServer, so the API can hand out TURN/STUN
 * credentials without either client needing the DOM lib. */
export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}
