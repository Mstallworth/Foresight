# Foresight Demo Frontend

A Next.js + TypeScript + Tailwind demo frontend that mirrors ChatGPT interaction patterns for futures exploration.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Demo mode behavior

- `/` is a two-panel auth/landing screen with rotating future prompts.
- `/app` provides ChatGPT-style sidebar + composer + artifact feed.
- Submitting a prompt runs a deterministic demo pipeline (Clarify → Frame → Stakeholders → Personas → Collection plan → Signals streaming → Horizon scan → Scenarios → Simulation).
- Signals stream over time and support Save/Dismiss actions.
- Scenario cards support **Save as preferable future**.
- Reports/Visualizations/Preferable futures tabs are included as stubs for future backend integration.
- Local persistence is handled via `localStorage`.

## Backend integration points

- `lib/types.ts` defines backend-ready entities.
- `lib/demo-engine.ts` is the demo pipeline orchestrator; replace with real API streaming.
- `components/chat/demo-chat-surface.tsx` renders artifact cards from typed artifacts.
- `components/chat/chatkit-surface.tsx` is a feature-flagged adapter for future OpenAI ChatKit integration.
- `chatkit/options.ts` contains a ChatKitOptions object for theme/composer/start-screen config.

## Feature flag

Set `NEXT_PUBLIC_USE_CHATKIT=1` to render `ChatKitSurface` adapter.

## Vercel deployment note

If Vercel reports `No Output Directory named "public" found`, do **not** change the project to emit a `public` build folder.
This repository is a Next.js app, so Vercel should use the **Next.js framework preset** and the default `.next` build output automatically.

This repo includes `vercel.json` with `"framework": "nextjs"` to avoid static-site output directory misconfiguration.

