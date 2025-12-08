# Foresight

A workspace for the Foresight MVP. The Next.js UI now lives in `packages/web` so Vercel has a real build target instead of falling back to a 404.

## Getting started

```bash
npm install -w packages/web
npm run dev
```

When deploying on Vercel, point the project at the repository root. The default build command `npm run build` runs the Next.js build for `packages/web` via the workspace script, so no additional configuration is required.
