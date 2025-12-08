# Foresight

A workspace for the Foresight MVP. The Next.js UI now lives in `packages/web` so Vercel has a real build target instead of falling back to a 404.

## Getting started

```bash
npm install -w packages/web
npm run dev
```

When deploying on Vercel, point the project at the repository root. A `vercel.json` is included so the CLI and dashboard both pick up the monorepo layout and use the Next.js build output from `packages/web` instead of expecting a `public/` folder. The default build command `npm run build` runs the Next.js build for `packages/web` via the workspace script, so no additional configuration is required.
