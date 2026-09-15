export type MemoryCategory =
  | "first_date"
  | "trip"
  | "birthday"
  | "funny"
  | "favourite"
  | "place_to_visit"
  | "milestone"
  | "general";

export interface MemoryPhoto {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

export interface Memory {
  id: string;
  coupleId: string;
  authorId: string;
  title: string;
  caption: string | null;
  category: MemoryCategory;
  photo: MemoryPhoto | null;
  location: string | null;
  occurredOn: string | null;
  createdAt: string;
}

export type MilestoneKind =
  | "met"
  | "first_conversation"
  | "first_date"
  | "first_i_love_you"
  | "first_trip"
  | "anniversary"
  | "birthday"
  | "custom";

export interface Milestone {
  id: string;
  coupleId: string;
  kind: MilestoneKind;
  title: string;
  description: string | null;
  date: string;
  icon: string;
  createdAt: string;
}
