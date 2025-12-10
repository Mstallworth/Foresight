# Foresight MVP

Spec-as-code scaffold for the FutureKind foresight generator. Quick commands:

- `pnpm install` — install workspace deps
- `pnpm --filter @foresight/api dev` — start Fastify API on :8787
- `pnpm --filter @foresight/web dev` — start Next.js UI on :3000
- `pnpm run spec:validate` — validate schemas & OpenAPI
- `pnpm run test` / `pnpm run test:e2e` — Vitest unit + Cucumber/Playwright features
