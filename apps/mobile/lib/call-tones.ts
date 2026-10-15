import { createAudioPlayer, type AudioPlayer } from "expo-audio";

export type CallTone = "ringback" | "ringtone";

let players: { ringback: AudioPlayer | null; ringtone: AudioPlayer | null } = { ringback: null, ringtone: null };

function getPlayer(tone: CallTone): AudioPlayer {
  if (!players[tone]) {
    const source = tone === "ringback" ? require("../assets/sounds/ringback.wav") : require("../assets/sounds/ringtone.wav");
    const player = createAudioPlayer(source);
    player.loop = true;
    players[tone] = player;
  }
  return players[tone]!;
}

/** Loops the given tone (dial-out ringback or incoming ringtone) until `stopCallTone`
 * is called - mirrors the web implementation in apps/web/lib/call-tones.ts. */
export function playCallTone(tone: CallTone) {
  stopCallTone();
  const player = getPlayer(tone);
  player.seekTo(0);
  player.play();
}

export function stopCallTone() {
  for (const player of Object.values(players)) {
    if (player?.playing) player.pause();
  }
}
