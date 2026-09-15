# WITHU

*Always with you.*

A private digital space for two people who are apart — chat, send affection in realtime, play games together, watch and listen together, and keep a shared memory book. Built as a full-stack monorepo: one Node/Express/Socket.IO/MongoDB backend, a Next.js web app, and an Expo/React Native mobile app, sharing types, validation and game logic.

## Monorepo layout

```
withu/
├── apps/
│   ├── api/      Node + Express + Socket.IO + MongoDB backend
│   ├── web/      Next.js (App Router) web app
│   └── mobile/   Expo Router React Native app (iOS/Android)
├── packages/
│   ├── shared-types/   Cross-app TypeScript types (models, socket events, API envelopes)
│   ├── validation/     Zod schemas shared by API + web + mobile
│   ├── constants/      Moods, affections, question banks, game catalog, daily challenges
│   ├── game-engine/    Pluggable game state machine (tic-tac-toe, connect four, memory match,
│   │                   couple questions, would-you-rather, truth-or-dare, ...)
│   └── shared-utils/   Time/pagination/misc helpers used across apps
```

## Prerequisites

- Node.js 18.18+
- pnpm 9+ (`corepack enable` or `npm i -g pnpm`)
- A MongoDB instance (local `mongod`, Docker, or Atlas). For quick local testing without installing
  MongoDB, `apps/api` already depends on `mongodb-memory-server` for its test suite.
- For mobile: Expo Go on your phone, or an Android/iOS simulator.

## Setup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env       # fill in MONGODB_URI, JWT secrets, etc.
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

> **If your clone lives inside a OneDrive-synced folder on Windows**, pnpm's default
> symlink-based `node_modules` can intermittently fail with `EPERM` errors while OneDrive's
> sync filter driver holds file locks during a large install (the Expo/React Native tree alone
> creates thousands of symlinks). The included `.npmrc` (`node-linker=hoisted`,
> `shamefully-hoist=true`) switches to a flat, npm-style layout that sidesteps this entirely and
> is what this project was verified against. If you hit `EPERM` anyway, delete `node_modules`
> everywhere and re-run `pnpm install`.

## Running everything

```bash
# 1. Backend (Express + Socket.IO), on http://localhost:4000
pnpm dev:api

# 2. Seed demo data for Samuel & Eniobanke (safe to re-run; it resets demo collections)
pnpm seed

# 3. Web app, on http://localhost:3000
pnpm dev:web

# 4. Mobile app (Expo)
pnpm dev:mobile
```

Demo accounts after seeding: `samuel@withu.app` / `eniobanke@withu.app`, password `password123`.

## What's implemented

- **Auth**: register/login/refresh/logout with JWT access + refresh tokens, bcrypt password hashing,
  password reset scaffolding, session invalidation via token versioning.
- **Couples**: create a relationship space, generate/share an invite code, accept/reject, privacy
  settings (share mood / last seen), leave a space. Every resource is scoped server-side to the
  authenticated user's own couple — no client-supplied couple/user IDs are ever trusted for access
  control.
- **Realtime** (Socket.IO, typed client/server event contracts in `@withu/shared-types`): presence
  (online/away/offline with multi-device-aware heartbeats), typing indicators, chat delivery/read
  receipts/reactions, affection bursts, Love Drops, game invitations/moves, watch/listen sync
  commands, mood/status changes, together-session lifecycle, notifications.
- **Chat**: text messages, edit/delete, emoji reactions, cursor-based pagination, optimistic sending,
  typing indicators, read receipts, full-text search.
- **Affection system**: one-tap Hug/Kiss/Love/Miss You/Cuddle/Thinking-of-You, all realtime, with a
  lightweight history log.
- **Love Drops**: text/animated/scheduled/surprise messages delivered as realtime notifications.
- **Games**: a pluggable game engine (`@withu/game-engine`) — the socket/REST layer never knows a
  game's internal state shape, only `createInitialState`/`applyMove`. Ships with Tic-Tac-Toe, Connect
  Four, Memory Match (all fully rule-checked with win/draw detection), and a romantic question-based
  family (Couple Questions, Truth or Dare, How Well Do You Know Me, Would You Rather, This or That)
  built from two reusable factories. Adding a new game means writing one module and registering it —
  no changes to sessions, sockets, or UI plumbing.
- **Together Mode**: a live shared "session" with duration tracking and one-tap launch into chat,
  games, watch or listen.
- **Watch/Listen Together**: a synchronization layer, not a streaming server — the backend only ever
  relays tiny `PLAY`/`PAUSE`/`SEEK` commands plus a position/timestamp; the media itself streams
  directly from its source (YouTube's own iframe, or a direct video/audio URL) straight to each
  device. Includes drift correction on both web (HTML5 `<video>` + a YouTube IFrame API player) and
  mobile (`expo-av` + a WebView-hosted YouTube player).
- **Memories & Our Story**: photo/caption memories by category, plus a milestone timeline.
- **Notifications & daily challenges**: per-category notification preferences, a daily
  challenge/question rotation.
- **Data-saver-minded architecture**: cursor pagination everywhere, tiny socket payloads (ids + deltas,
  never full documents on hot paths), a `dataSaver` preference block wired into user preferences.
- **Security**: helmet, CORS allowlist, rate limiting on auth routes, Zod validation on every mutating
  route, ownership checks on every resource, couple-membership checks before any socket action.

## Testing

```bash
pnpm --filter @withu/api test        # auth, couple invitations, messages (incl. cross-couple
                                      # authorization), Love Drops, watch-session authorization/drift,
                                      # and pure game-engine unit tests — all against a real in-memory
                                      # MongoDB via mongodb-memory-server
pnpm --filter @withu/web typecheck
pnpm --filter @withu/web build
pnpm --filter @withu/mobile typecheck
```

All three apps type-check cleanly, the web app builds to static/server output with a reasonable
bundle size per route, and the mobile app has been verified to actually bundle end-to-end through
Metro for both `ios` and `android` targets (`expo-router/entry.js`, ~3,200 modules, no errors) —
not just type-checked.

## Honest scope notes

This is a from-scratch build of a very large spec. Everything listed above is real, working,
end-to-end functionality (backend routes + sockets + web UI + mobile UI, verified by running the
API/web together and by the automated test suite) — not mockups. A few things were deliberately kept
simple rather than gold-plated, and are natural next steps:

- Chess, Checkers, Sudoku, Riddles and Number Puzzles are not implemented as games yet; the game
  engine architecture supports adding them without touching sessions/sockets/UI shells.
- Image uploads use a pasted URL rather than direct file upload/Cloudinary processing (no media
  provider credentials were available to wire up); the `Memory`/`Message` models already have the
  right shape (`thumbnailUrl`, dimensions) for a real upload pipeline to slot into.
- Native push notifications (Expo push tokens / web push) are not wired up; in-app notifications,
  preferences, and the `Notification` model are in place for that to be added.
- Web push and true offline message queuing are not implemented; Socket.IO reconnection and
  TanStack Query caching cover the "flaky network" case, but there's no offline write queue yet.
