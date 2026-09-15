import type { AffectionKind } from "@withu/shared-types";

export const AFFECTIONS: { value: AffectionKind; label: string; emoji: string; verb: string }[] = [
  { value: "hug", label: "Hug", emoji: "🫂", verb: "hugged" },
  { value: "kiss", label: "Kiss", emoji: "💋", verb: "kissed" },
  { value: "love", label: "Love", emoji: "❤️", verb: "sent love to" },
  { value: "miss_you", label: "Miss You", emoji: "🥺", verb: "misses" },
  { value: "cuddle", label: "Cuddle", emoji: "🤗", verb: "wants to cuddle with" },
  { value: "thinking_of_you", label: "Thinking of You", emoji: "✨", verb: "is thinking of" },
];

export const LOVE_DROP_PRESETS: string[] = [
  "I miss you.",
  "I'm thinking about you.",
  "You make me happy.",
  "I'm proud of you.",
  "Come here 🫂",
  "You're my favourite person.",
  "Can't stop smiling because of you.",
  "Just wanted to remind you that you're loved.",
];
