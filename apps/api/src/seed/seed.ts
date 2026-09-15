import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../database/connect";
import { env } from "../config/env";
import { UserModel } from "../modules/users/user.model";
import { CoupleModel } from "../modules/couples/couple.model";
import { MessageModel } from "../modules/messages/message.model";
import { LoveDropModel } from "../modules/love-drops/love-drop.model";
import { AffectionEventModel } from "../modules/love-drops/affection-event.model";
import { MemoryModel } from "../modules/memories/memory.model";
import { MilestoneModel } from "../modules/memories/milestone.model";
import { GameSessionModel } from "../modules/games/game-session.model";
import { NotificationModel } from "../modules/notifications/notification.model";
import { DailyChallengeModel } from "../modules/notifications/daily-challenge.model";

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000);

async function seed() {
  if (env.isProduction) {
    throw new Error("Refusing to run the demo seed against a production database.");
  }

  await connectDatabase();

  console.log("[seed] clearing existing demo collections...");
  await Promise.all([
    UserModel.deleteMany({}),
    CoupleModel.deleteMany({}),
    MessageModel.deleteMany({}),
    LoveDropModel.deleteMany({}),
    AffectionEventModel.deleteMany({}),
    MemoryModel.deleteMany({}),
    MilestoneModel.deleteMany({}),
    GameSessionModel.deleteMany({}),
    NotificationModel.deleteMany({}),
    DailyChallengeModel.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("password123", 12);

  const samuel = await UserModel.create({
    name: "Samuel",
    username: "samuel",
    email: "samuel@withu.app",
    passwordHash,
    bio: "Building WITHU, one line of code at a time. Always thinking of you.",
    mood: "loved",
    moodMessage: "Thinking about you ❤️",
    status: "working",
    lastSeen: new Date(),
    socketPresence: "offline",
  });

  const eniobanke = await UserModel.create({
    name: "Eniobanke",
    username: "eniobanke",
    email: "eniobanke@withu.app",
    passwordHash,
    bio: "Also known as Tolulope. Coffee, sunsets, and you.",
    mood: "playful",
    moodMessage: "Counting down to our next call 😊",
    status: "studying",
    lastSeen: hoursAgo(1),
    socketPresence: "offline",
  });

  const couple = await CoupleModel.create({
    partnerOneId: samuel._id,
    partnerTwoId: eniobanke._id,
    relationshipName: "Samuel & Eniobanke",
    anniversaryDate: new Date("2024-02-14"),
    togetherSince: new Date("2024-02-14"),
    settings: { privacy: { shareLastSeen: true, shareMood: true } },
  });

  samuel.coupleId = couple._id;
  eniobanke.coupleId = couple._id;
  await Promise.all([samuel.save(), eniobanke.save()]);

  console.log("[seed] seeding conversation...");
  const conversation: { senderId: typeof samuel._id; text: string; hoursAgoValue: number }[] = [
    { senderId: samuel._id, text: "Good morning beautiful ❤️", hoursAgoValue: 30 },
    { senderId: eniobanke._id, text: "Good morning! I miss you already", hoursAgoValue: 29.8 },
    { senderId: samuel._id, text: "Only a few more weeks until I see you", hoursAgoValue: 29.5 },
    { senderId: eniobanke._id, text: "I can't wait. What are you up to today?", hoursAgoValue: 20 },
    { senderId: samuel._id, text: "Working on something special for us actually 👀", hoursAgoValue: 19.8 },
    { senderId: eniobanke._id, text: "Ooh a surprise? Tell me!", hoursAgoValue: 19.5 },
    { senderId: samuel._id, text: "Nope, you'll see soon 😏", hoursAgoValue: 19.3 },
    { senderId: eniobanke._id, text: "Fine, keep your secrets. I love you.", hoursAgoValue: 5 },
    { senderId: samuel._id, text: "I love you more. Talk tonight?", hoursAgoValue: 4.5 },
    { senderId: eniobanke._id, text: "Always ❤️", hoursAgoValue: 1 },
  ];
  for (const m of conversation) {
    await MessageModel.create({
      coupleId: couple._id,
      senderId: m.senderId,
      type: "text",
      text: m.text,
      status: "read",
      createdAt: hoursAgo(m.hoursAgoValue),
    });
  }

  console.log("[seed] seeding love drops and affection...");
  await LoveDropModel.create([
    {
      coupleId: couple._id,
      senderId: samuel._id,
      recipientId: eniobanke._id,
      kind: "text",
      message: "You make every day better, even from a distance.",
      deliverAt: hoursAgo(10),
      deliveredAt: hoursAgo(10),
      openedAt: hoursAgo(9),
    },
    {
      coupleId: couple._id,
      senderId: eniobanke._id,
      recipientId: samuel._id,
      kind: "surprise",
      message: "Come here 🫂 I just need a hug today.",
      deliverAt: hoursAgo(3),
      deliveredAt: hoursAgo(3),
      openedAt: null,
    },
  ]);

  await AffectionEventModel.create([
    { coupleId: couple._id, senderId: samuel._id, kind: "hug", createdAt: hoursAgo(6) },
    { coupleId: couple._id, senderId: eniobanke._id, kind: "kiss", createdAt: hoursAgo(5) },
    { coupleId: couple._id, senderId: samuel._id, kind: "miss_you", createdAt: hoursAgo(2) },
  ]);

  console.log("[seed] seeding memories and milestones...");
  await MemoryModel.create([
    {
      coupleId: couple._id,
      authorId: samuel._id,
      title: "The day we met",
      caption: "Neither of us expected this conversation to change everything.",
      category: "first_date",
      occurredOn: new Date("2023-11-02"),
      createdAt: daysAgo(120),
    },
    {
      coupleId: couple._id,
      authorId: eniobanke._id,
      title: "That video call that lasted 6 hours",
      caption: "We just kept talking. Neither of us wanted to hang up.",
      category: "funny",
      occurredOn: new Date("2024-01-10"),
      createdAt: daysAgo(90),
    },
    {
      coupleId: couple._id,
      authorId: samuel._id,
      title: "Places we want to visit together",
      caption: "Zanzibar, Santorini, and Osun-Osogbo. In that order.",
      category: "place_to_visit",
      createdAt: daysAgo(30),
    },
  ]);

  await MilestoneModel.create([
    { coupleId: couple._id, kind: "met", title: "We met", date: new Date("2023-11-02"), icon: "sparkles" },
    {
      coupleId: couple._id,
      kind: "first_conversation",
      title: "First real conversation",
      date: new Date("2023-11-05"),
      icon: "message-circle",
    },
    {
      coupleId: couple._id,
      kind: "first_i_love_you",
      title: "First 'I love you'",
      date: new Date("2024-01-20"),
      icon: "heart",
    },
    { coupleId: couple._id, kind: "anniversary", title: "Our anniversary", date: new Date("2024-02-14"), icon: "cake" },
  ]);

  console.log("[seed] seeding a finished game session...");
  await GameSessionModel.create({
    gameKey: "tic_tac_toe",
    coupleId: couple._id,
    players: [
      { userId: samuel._id, name: samuel.name, avatarUrl: null },
      { userId: eniobanke._id, name: eniobanke.name, avatarUrl: null },
    ],
    hostId: samuel._id,
    currentTurnUserId: null,
    state: {
      board: [
        samuel._id, samuel._id, samuel._id,
        eniobanke._id, eniobanke._id, null,
        null, null, null,
      ],
      marks: { [samuel._id.toString()]: "X", [eniobanke._id.toString()]: "O" },
    },
    status: "completed",
    winnerId: samuel._id,
    isDraw: false,
    finishedAt: hoursAgo(24),
    createdAt: hoursAgo(25),
  });

  console.log("[seed] seeding notifications + daily challenge...");
  await NotificationModel.create([
    {
      userId: eniobanke._id,
      coupleId: couple._id,
      type: "love_drop",
      title: "A Love Drop just arrived 💌",
      body: "You make every day better, even from a distance.",
      data: {},
      readAt: hoursAgo(9),
      createdAt: hoursAgo(10),
    },
    {
      userId: samuel._id,
      coupleId: couple._id,
      type: "affection",
      title: "Someone is thinking of you",
      body: "kiss received",
      data: {},
      readAt: null,
      createdAt: hoursAgo(5),
    },
  ]);

  await DailyChallengeModel.create({
    coupleId: couple._id,
    type: "challenge",
    title: "Gratitude Drop",
    description: "Send each other one thing you're grateful for today.",
    date: new Date().toISOString().slice(0, 10),
    completedByIds: [],
  });

  console.log("\n[seed] Done! Demo accounts:");
  console.log("  Samuel     -> samuel@withu.app / password123");
  console.log("  Eniobanke  -> eniobanke@withu.app / password123");

  await disconnectDatabase();
}

seed().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
