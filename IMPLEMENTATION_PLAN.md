# FutureYouPaths — Decision-Complete Implementation Plan

## Goal
Ship a runnable monorepo for **FutureYouPaths** where:
- A deterministic simulator is the single source of truth for outcomes.
- AI is constrained to narration/explanation/illustration of simulator facts.
- The app runs offline with synthetic fallback data.

## Assumptions Locked In
1. **Backend stack:** Python 3.12 + FastAPI + Pydantic v2.
2. **Data stack:** Polars + DuckDB + YAML config.
3. **Frontend stack:** React 18 + TypeScript + Vite SPA.
4. **Persistence:** in-memory run store only (thread-safe), no DB for MVP.
5. **AI:** optional OpenAI layer with graceful non-AI fallback.
6. **Quality gates:** two offline-passing pytest suites (`api flow`, `data pipeline`).

## Build Order (Strict Sequence)

### Phase 0 — Monorepo Bootstrap (Day 0)
**Deliverable:** repo skeleton builds locally with placeholders.

- Create folders:
  - `apps/api/`
  - `apps/web/`
  - `packages/simulator/`
  - `packages/contracts/`
  - `data/`, `editions/`, `.agents/skills/`
  - `tests/`
- Add root tooling:
  - `Makefile` with `make api`, `make web`, `make test`, `make edition-freeze`
  - `.editorconfig`, lint configs, `pre-commit` hooks (optional)
- Add `README.md` with one-command dev startup instructions.

**Exit criteria:** `make api` and `make web` both start with stub outputs.

---

### Phase 1 — Contracts First (Day 1)
**Deliverable:** stable typed contracts used by backend + frontend.

- Define shared models in `packages/contracts`:
  - Run request, run state, chapter event, decision payload, death summary, branch graph node/edge, edition manifest.
- Define API routes and payload contracts:
  - `POST /v1/runs`
  - `GET /v1/runs/{id}`
  - `POST /v1/runs/{id}/decisions`
  - `GET /v1/runs/{id}/summary`
  - `GET /v1/runs/{id}/branches`
- Generate TS types for frontend consumption.

**Exit criteria:** contract schema validation passes locally and is imported by both apps.

---

### Phase 2 — Simulator Core (Day 2–3)
**Deliverable:** deterministic life-path engine independent of API/UI.

- Implement `packages/simulator` with pure functions:
  - seed initialization
  - chapter progression
  - event probability application
  - decision impact transforms
  - death/terminal state evaluation
- Guarantee deterministic replay:
  - same `run_id + edition_id + seed + decisions` => identical output.
- Add trace output for explainability:
  - probability inputs, selected event, score deltas.

**Exit criteria:** deterministic unit tests prove repeatability and branch divergence correctness.

---

### Phase 3 — Data Pipeline + Edition System (Day 3–4)
**Deliverable:** frozen edition artifacts consumed by simulator.

- Implement data jobs in `apps/api/pipeline`:
  - ingest raw source files
  - normalize with Polars
  - compute probability tables in DuckDB
  - export frozen edition bundle
- Define edition manifest:
  - checksums, source provenance, model/prompt pins, skill versions, created timestamp.
- Add CLI commands:
  - `build-edition`
  - `audit-edition`
  - `freeze-edition`

**Exit criteria:** edition build works offline using synthetic fallback tables.

---

### Phase 4 — FastAPI Orchestration Layer (Day 4–5)
**Deliverable:** complete backend API wired to simulator + run store.

- Implement thread-safe in-memory run store:
  - keyed by `run_id`
  - supports branch lineage and rewind markers
- Implement required endpoints and validation.
- Add optional OpenAI narrator adapter:
  - strict input = simulator facts only
  - fallback templated narration if AI unavailable
- Add admin endpoints/jobs:
  - edition build/audit/freeze
  - prompt regression
  - skill sync

**Exit criteria:** API flow tests pass offline and online (when AI key exists).

---

### Phase 5 — Frontend Experience (Day 5–7)
**Deliverable:** complete user flow SPA.

Screens in order:
1. Landing
2. Framing input
3. Persona reveal
4. Chapter-by-chapter decisions
5. Death summary
6. Branch/rewind map

Implementation requirements:
- React Query (or equivalent) for API state.
- Strongly typed API client from contracts.
- Explicit loading/error/empty states.
- Branch rewind UX with deterministic replay callouts.

**Exit criteria:** user can run full journey start-to-summary and fork branches.

---

### Phase 6 — Skills + Prompt Governance (Day 7)
**Deliverable:** reproducible AI behavior and local agent workflows.

- Add `.agents/skills/...` packages for:
  - simulator-narration constraints
  - edition operations
  - regression checks
- Version prompts and attach to edition manifest.
- Add prompt regression snapshots over fixed simulator traces.

**Exit criteria:** prompt changes require snapshot update and pass regression checks.

---

### Phase 7 — Test, Docs, Hardening (Day 8)
**Deliverable:** MVP acceptance-ready.

- Required tests:
  - `tests/test_api_flow.py`
  - `tests/test_data_pipeline.py`
- Additional checks:
  - schema/contract consistency
  - deterministic replay smoke tests
  - offline mode smoke test (no network + no OpenAI key)
- Docs:
  - architecture decision record (simulator trust boundary)
  - local/dev/prod config matrix
  - operations runbook for edition lifecycle

**Exit criteria:** all tests pass in offline CI.

---

## Parallelization Plan
- Team A: contracts + simulator core
- Team B: pipeline + edition tooling
- Team C: frontend screens + typed client
- Integrate at Phase 4 once contracts and simulator are stable.

## Risk Register + Mitigations
1. **AI leakage into simulation logic**
   - Mitigation: simulator package has zero AI dependencies; enforce by import lint rule.
2. **Non-deterministic branching**
   - Mitigation: deterministic seed management + snapshot tests on branch traces.
3. **Pipeline fragility with sparse data**
   - Mitigation: synthetic fallback tables and schema-level null handling.
4. **Contract drift between API and UI**
   - Mitigation: generated types in CI; fail build on mismatch.

## Definition of Done (MVP)
- `uvicorn apps.api.main:app --reload` works.
- `npm run dev --prefix apps/web` works.
- Full user journey runs with and without OpenAI key.
- Two mandated pytest files pass offline.
- Edition freeze produces manifest with provenance/checksums.
- Branch/rewind produces deterministic replay.

## Immediate Next 10 Tasks
1. Create monorepo folders and root `Makefile`.
2. Add shared contracts package with initial schemas.
3. Scaffold FastAPI app + health route.
4. Scaffold Vite React app + route shells for six screens.
5. Implement in-memory run store.
6. Implement simulator seed + chapter progression functions.
7. Add `POST /v1/runs` and `POST /v1/runs/{id}/decisions`.
8. Add synthetic edition fixture + loader.
9. Add first offline `test_api_flow.py`.
10. Add first offline `test_data_pipeline.py`.
