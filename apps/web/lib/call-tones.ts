"use client";

export type CallTone = "ringback" | "ringtone";

let el: HTMLAudioElement | null = null;
let pendingRetry: (() => void) | null = null;

function getElement(): HTMLAudioElement {
  if (!el) {
    el = new Audio();
    el.loop = true;
  }
  return el;
}

function retryOnNextInteraction(play: () => void) {
  if (pendingRetry) document.removeEventListener("click", pendingRetry);
  pendingRetry = () => {
    pendingRetry = null;
    play();
  };
  document.addEventListener("click", pendingRetry, { once: true });
}

/** Loops the given tone (dial-out ringback or incoming ringtone) until `stopCallTone`
 * is called. If the browser blocks autoplay (no user gesture yet on this page), it
 * retries on the next click instead of just staying silently broken. */
export function playCallTone(tone: CallTone) {
  const audio = getElement();
  const src = `/sounds/${tone === "ringback" ? "ringback" : "ringtone"}.wav`;
  if (!audio.src.endsWith(src)) audio.src = src;
  audio.currentTime = 0;
  audio.play().catch(() => retryOnNextInteraction(() => playCallTone(tone)));
}

export function stopCallTone() {
  if (pendingRetry) {
    document.removeEventListener("click", pendingRetry);
    pendingRetry = null;
  }
  if (!el) return;
  el.pause();
  el.currentTime = 0;
}
