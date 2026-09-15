import type { QuestionCard } from "@withu/shared-types";

let seq = 0;
const q = (category: QuestionCard["category"], text: string): QuestionCard => ({
  id: `q_${category}_${seq++}`,
  category,
  text,
});

export const COUPLE_QUESTIONS: QuestionCard[] = [
  q("romantic", "What is something I do that always makes you smile?"),
  q("romantic", "When did you know you were falling for me?"),
  q("deep", "What does 'home' mean to you?"),
  q("deep", "What is a fear you've never told me about?"),
  q("funny", "What's the weirdest habit of mine you secretly love?"),
  q("funny", "If I were a kitchen appliance, which one would I be and why?"),
  q("future", "Where would you love for us to travel together?"),
  q("future", "What does our life look like in ten years?"),
  q("memories", "What was your first impression of me?"),
  q("memories", "What's your favourite memory of us so far?"),
  q("random", "If we swapped lives for a day, what would you do first?"),
  q("random", "What song reminds you of us?"),
  q("flirty", "What's your favourite thing about my smile?"),
  q("flirty", "Describe our perfect date night."),
  q("serious", "What's one thing you need more of from me?"),
  q("serious", "How do you like to be comforted when you're stressed?"),
  q("personal", "What's something you're proud of that you haven't told me enough about?"),
  q("personal", "What's one thing you want us to experience together?"),
];

export const WOULD_YOU_RATHER: QuestionCard[] = [
  q("random", "Would you rather go on a spontaneous road trip or a planned dream vacation?"),
  q("random", "Would you rather always be 10 minutes late or 20 minutes early?"),
  q("flirty", "Would you rather get a surprise kiss or a surprise love letter?"),
  q("funny", "Would you rather fight one horse-sized duck or 100 duck-sized horses, together?"),
  q("future", "Would you rather live by the beach or in the mountains, together?"),
];

export const THIS_OR_THAT: QuestionCard[] = [
  q("random", "Movie night or game night?"),
  q("random", "Morning cuddles or late-night talks?"),
  q("random", "Home-cooked meal or fancy restaurant?"),
  q("random", "Beach vacation or city trip?"),
];

export const TRUTH_OR_DARE: QuestionCard[] = [
  q("flirty", "Truth: what's the most attracted to me you've ever been?"),
  q("funny", "Dare: send a voice note singing our song."),
  q("deep", "Truth: what's something you wish I understood better about you?"),
  q("romantic", "Dare: write one sentence describing why you love me and send it now."),
];

export const HOW_WELL_DO_YOU_KNOW_ME: QuestionCard[] = [
  q("personal", "What is my favourite food?"),
  q("personal", "What's my biggest dream right now?"),
  q("personal", "What's my go-to comfort activity after a hard day?"),
  q("personal", "What's a place I've always wanted to visit?"),
  q("personal", "What's my love language?"),
];
