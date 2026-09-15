import type { Mood, UserStatus } from "@withu/shared-types";

export const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "missing_you", label: "Missing You", emoji: "🥺" },
  { value: "sleepy", label: "Sleepy", emoji: "😴" },
  { value: "loved", label: "Loved", emoji: "😍" },
  { value: "playful", label: "Playful", emoji: "😂" },
  { value: "sad", label: "Sad", emoji: "😔" },
  { value: "flirty", label: "Flirty", emoji: "🔥" },
  { value: "busy", label: "Busy", emoji: "🧠" },
];

export const STATUSES: { value: UserStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "working", label: "Working" },
  { value: "studying", label: "Studying" },
  { value: "eating", label: "Eating" },
  { value: "sleeping", label: "Sleeping" },
  { value: "outside", label: "Outside" },
  { value: "do_not_disturb", label: "Do Not Disturb" },
];

export const moodEmoji = (mood: Mood | null | undefined): string =>
  MOODS.find((m) => m.value === mood)?.emoji ?? "💭";
