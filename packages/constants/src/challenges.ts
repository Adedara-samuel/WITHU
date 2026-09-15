export interface ChallengeTemplate {
  title: string;
  description: string;
}

export const DAILY_CHALLENGES: ChallengeTemplate[] = [
  { title: "Gratitude Drop", description: "Send each other one thing you're grateful for today." },
  { title: "Voice Note Morning", description: "Start the day with a 10-second voice note for each other." },
  { title: "Memory Lane", description: "Share your favourite memory of the two of you this week." },
  { title: "Compliment Chain", description: "Send three genuine compliments, one every hour." },
  { title: "Future Talk", description: "Talk about one place you both want to visit together." },
  { title: "Song of the Day", description: "Send a song that reminds you of your partner right now." },
  { title: "Slow Down", description: "Take 5 minutes today just to talk with no distractions." },
];

export const dailyChallengeForDate = (date: Date): ChallengeTemplate => {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  const list = DAILY_CHALLENGES;
  return list[dayIndex % list.length]!;
};
