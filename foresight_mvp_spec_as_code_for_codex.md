# Foresight MVP — Spec as Code
_A machine‑readable specification and test suite you can hand to Codex/Copilot to scaffold the whole app reliably._

## 0) Purpose & Non‑Goals
**Purpose.** Convert the product spec into executable, versioned artifacts (schemas, contracts, BDD features, prompts) so generators can scaffold code, and CI can verify behavior end‑to‑end.

**Non‑Goals (MVP).** Auth, real‑time crawling, heavy data viz; stick to cached signals, 5 artifacts, and minimal paywall placeholders.

---

## 1) Repository Layout
```
foresight-mvp/
├─ spec/
│  ├─ domain/            # JSON Schemas for artifacts & inputs
│  │  ├─ artifacts.schema.json
│  │  └─ generate-input.schema.json
│  ├─ api/               # OpenAPI 3.1 contract (server + mock)
│  │  └─ openapi.yaml
│  ├─ prompts/           # Prompt specs with IO schemas
│  │  └─ generate.yaml
│  ├─ bdd/               # Executable specs (Gherkin)
│  │  ├─ generate.feature
│  │  ├─ credibility_toggle.feature
│  │  ├─ progressive_disclosure.feature
│  │  └─ routing_and_loader.feature
│  └─ contracts/         # Pact consumer/provider contracts
│     └─ web-consumer-foresight-provider.pact.json
├─ packages/
│  ├─ web/               # Next.js app (UI)
│  └─ api/               # Node (Fastify) or Python (FastAPI) service
├─ tests/
│  ├─ unit/              # Zod/AJV validation tests
│  ├─ contract/          # Pact tests
│  └─ e2e/               # Playwright + Cucumber
├─ Makefile
├─ package.json (pnpm) / pyproject.toml (if Python API)
└─ .github/workflows/ci.yml
```

---

## 2) Domain Schemas (JSON Schema, v2020‑12)
### 2.1 `spec/domain/generate-input.schema.json`
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://futurekind.dev/schemas/generate-input.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["question"],
  "properties": {
    "question": { "type": "string", "minLength": 10 },
    "horizon": { "type": "integer", "enum": [6, 24, 60], "default": 24 },
    "location": { "type": ["string", "null"], "maxLength": 120 },
    "perspective": { "type": "string", "enum": ["me", "we", "community"], "default": "me" },
    "seed_bias": { "type": "string", "enum": ["conservative", "exploratory"], "default": "conservative" }
  }
}
```

### 2.2 `spec/domain/artifacts.schema.json`
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://futurekind.dev/schemas/artifacts.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["quick_take", "cones", "signals_drivers", "timeline", "moves"],
  "properties": {
    "quick_take": {
      "type": "object",
      "required": ["one_line", "bullets", "confidence", "assumptions"],
      "properties": {
        "one_line": { "type": "string", "minLength": 10 },
        "bullets": { "type": "array", "minItems": 6, "items": { "type": "string" } },
        "confidence": { "type": "string", "enum": ["low", "med", "high"] },
        "assumptions": { "type": "array", "minItems": 2, "items": { "type": "string" } }
      }
    },
    "cones": {
      "type": "array", "minItems": 2, "maxItems": 2,
      "items": {
        "type": "object",
        "required": ["name", "vignette", "drivers", "uncertainties", "early_signals"],
        "properties": {
          "name": { "type": "string", "enum": ["Upside", "Downside"] },
          "vignette": { "type": "string", "minLength": 50 },
          "drivers": { "type": "array", "minItems": 3, "items": { "type": "string" } },
          "uncertainties": { "type": "array", "minItems": 2, "items": { "type": "string" } },
          "early_signals": { "type": "array", "minItems": 1, "items": { "type": "string" } }
        }
      }
    },
    "signals_drivers": {
      "type": "object",
      "required": ["signals", "drivers"],
      "properties": {
        "signals": {
          "type": "array", "minItems": 6,
          "items": {
            "type": "object",
            "required": ["title", "summary"],
            "properties": {
              "title": { "type": "string" },
              "summary": { "type": "string" },
              "source_url": { "type": ["string", "null"], "format": "uri", "nullable": true }
            }
          }
        },
        "drivers": {
          "type": "array", "minItems": 4,
          "items": {
            "type": "object",
            "required": ["name", "why"],
            "properties": {
              "name": { "type": "string" },
              "why": { "type": "string" }
            }
          }
        }
      }
    },
    "timeline": {
      "type": "object",
      "required": ["milestones"],
      "properties": {
        "milestones": {
          "type": "array", "minItems": 3,
          "items": {
            "type": "object",
            "required": ["when", "what", "so_what"],
            "properties": {
              "when": { "type": "string" },
              "what": { "type": "string" },
              "so_what": { "type": "string" }
            }
          }
        },
        "inflections": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["when", "what"],
            "properties": { "when": { "type": "string" }, "what": { "type": "string" } }
          }
        }
      }
    },
    "moves": {
      "type": "object",
      "required": ["no_regrets", "options", "watch_outs"],
      "properties": {
        "no_regrets": { "type": "array", "minItems": 3, "items": { "type": "string" } },
        "options": { "type": "array", "minItems": 2, "items": { "type": "string" } },
        "watch_outs": { "type": "array", "minItems": 1, "items": { "type": "string" } },
        "tags": {
          "type": "array",
          "items": { "type": "object", "properties": { "effort": { "enum": ["L", "M", "H"] }, "impact": { "enum": ["L", "M", "H"] } } }
        }
      }
    }
  }
}
```

---

## 3) API Contract (OpenAPI 3.1)
`spec/api/openapi.yaml`
```yaml
openapi: 3.1.0
info:
  title: FutureKind Foresight API
  version: 0.1.0
servers:
  - url: http://localhost:8787
paths:
  /v1/generate:
    post:
      summary: Generate foresight artifacts
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '../domain/generate-input.schema.json'
      responses:
        '202':
          description: Accepted; run started
          content:
            application/json:
              schema:
                type: object
                required: [run_id]
                properties:
                  run_id: { type: string }
        '400': { description: Invalid input }
  /v1/runs/{id}:
    get:
      summary: Get generation result
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Artifacts are ready
          content:
            application/json:
              schema:
                $ref: '../domain/artifacts.schema.json'
        '202': { description: Still processing }
        '404': { description: Not found }
```
**Notes.** Use Prism/Stoplight to mock this spec locally and unblock UI, and `openapi-typescript` to generate client types.

---

## 4) Prompt Spec (LLM‑as‑Function)
`spec/prompts/generate.yaml`
```yaml
name: foresight_generate_v1
model: gpt-4.1-mini
io:
  input_schema: ../domain/generate-input.schema.json
  output_schema: ../domain/artifacts.schema.json
system: |
  You are a strategic‑foresight writer. Produce concise artifacts. Respect the output JSON schema strictly.
  Use progressive disclosure in copy (short bullets, vignettes). Add 2–3 assumptions and an uncertainty band.
user_template: |
  Topic: {{question}}
  Horizon: {{horizon}} months
  Location: {{location}}
  Perspective: {{perspective}}
  Seed Bias: {{seed_bias}}

  Produce JSON only.
validators:
  - type: jsonschema
    schema_path: ../domain/artifacts.schema.json
```

---

## 5) Executable Specs (BDD)
### 5.1 `spec/bdd/routing_and_loader.feature`
```gherkin
Feature: Loader and results routing
  As a user, I want a dedicated results screen with a loader so the transition feels fast but credible.

  Scenario: Click "What other people are wondering" triggers a run
    Given I am on "/"
    When I click the card titled "What other people are wondering"
    Then I should see a loader with text "exploring the future"
    And within 2 seconds I should be on the "/results" screen

  Scenario: Manual generate triggers loader and results
    Given I enter "How might AI change my job as a product manager by 2028?"
    And I click "Generate"
    Then I should see a loader with text "exploring the future"
    And the results screen shows the card titled "Quick Take"
```

### 5.2 `spec/bdd/credibility_toggle.feature`
```gherkin
Feature: Credibility toggle
  Scenario: Toggle on reveals assumptions & confidence
    Given I am on "/results"
    When I toggle "Credibility" on
    Then I see text starting with "Assumptions"
    And I see "Confidence:" on the Quick Take card
```

### 5.3 `spec/bdd/progressive_disclosure.feature`
```gherkin
Feature: Progressive disclosure
  Scenario: Cards collapse by default
    Given I am on "/results"
    Then the "Quick Take" card shows at most 3 bullets by default

  Scenario: Expand reveals remaining bullets
    When I click "Expand" on the "Quick Take" card
    Then I see at least 6 bullets total
```

### 5.4 `spec/bdd/generate.feature`
```gherkin
Feature: Artifact validity
  Scenario: Artifacts match schema
    Given I request generation with horizon 24
    Then the JSON output conforms to "artifacts.schema.json"
```

---

## 6) Consumer‑Driven Contracts (Pact)
`spec/contracts/web-consumer-foresight-provider.pact.json` (illustrative)
```json
{
  "consumer": {"name": "web"},
  "provider": {"name": "foresight-api"},
  "interactions": [
    {
      "description": "POST /v1/generate returns run id",
      "request": {"method": "POST", "path": "/v1/generate", "body": {"question": "What is the future..."}},
      "response": {"status": 202, "body": {"run_id": "RUN-123"}}
    },
    {
      "description": "GET /v1/runs/{id} returns artifacts",
      "request": {"method": "GET", "path": "/v1/runs/RUN-123"},
      "response": {"status": 200, "body": {"quick_take": {"one_line": "...", "bullets": ["a","b","c","d","e","f"], "confidence": "med", "assumptions": ["x","y"]}, "cones": [
        {"name":"Upside","vignette":"...","drivers":["a","b","c"],"uncertainties":["u1","u2"],"early_signals":["s1"]},
        {"name":"Downside","vignette":"...","drivers":["a","b","c"],"uncertainties":["u1","u2"],"early_signals":["s1"]}
      ], "signals_drivers": {"signals": [{"title":"t","summary":"s"},{"title":"t2","summary":"s2"},{"title":"t3","summary":"s3"},{"title":"t4","summary":"s4"},{"title":"t5","summary":"s5"},{"title":"t6","summary":"s6"}], "drivers": [{"name":"n","why":"w"},{"name":"n2","why":"w2"},{"name":"n3","why":"w3"},{"name":"n4","why":"w4"}]}, "timeline": {"milestones": [{"when":"2026","what":"w","so_what":"s"},{"when":"2027","what":"w","so_what":"s"},{"when":"2028","what":"w","so_what":"s"}], "inflections": []}, "moves": {"no_regrets":["x","y","z"], "options":["o1","o2"], "watch_outs":["w"]}}}
    }
  ]
}
```

---

## 7) E2E & Unit Test Scaffolds
### 7.1 Playwright + Cucumber glue (TypeScript)
`tests/e2e/steps/routing.steps.ts`
```ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on "/"', async function() { await this.page.goto('http://localhost:3000/'); });
When('I click the card titled {string}', async function(title: string) {
  await this.page.getByRole('button', { name: title }).click();
});
Then('I should see a loader with text {string}', async function(text: string) {
  await expect(this.page.getByText(text)).toBeVisible();
});
Then('within {int} seconds I should be on the {string} screen', async function(sec: number, path: string) {
  await this.page.waitForURL(`**${path}**`, { timeout: sec * 1000 });
});
```

### 7.2 Schema validation (AJV)
`tests/unit/schema.spec.ts`
```ts
import Ajv from 'ajv';
import inputSchema from '../../spec/domain/generate-input.schema.json';
import outputSchema from '../../spec/domain/artifacts.schema.json';

const ajv = new Ajv({ allErrors: true, strict: false });

test('valid input passes', () => {
  const validate = ajv.compile(inputSchema);
  expect(validate({ question: 'Future of EVs in NYC by 2030?', horizon: 24 })).toBe(true);
});

test('invalid output fails when bullets < 6', () => {
  const validate = ajv.compile(outputSchema);
  const bad = { quick_take: { one_line: 'ok', bullets: ['a','b'], confidence: 'med', assumptions: ['x','y'] }, cones: [], signals_drivers: { signals: [], drivers: [] }, timeline: { milestones: [] }, moves: { no_regrets: [], options: [], watch_outs: [] } };
  expect(validate(bad)).toBe(false);
});
```

---

## 8) CI Pipeline
`.github/workflows/ci.yml`
```yaml
name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm i
      - name: Lint & Typecheck
        run: pnpm -w run lint && pnpm -w run typecheck
      - name: Validate Schemas & OpenAPI
        run: pnpm run spec:validate
      - name: Contract Tests (Pact)
        run: pnpm run test:contract
      - name: Unit & E2E (headless)
        run: pnpm run test && pnpm run test:e2e
```

**Scripts (package.json)**
```json
{
  "scripts": {
    "spec:validate": "ajv validate -s spec/domain/artifacts.schema.json -d tests/fixtures/artifacts.ok.json && redocly lint spec/api/openapi.yaml",
    "codegen:types": "openapi-typescript spec/api/openapi.yaml -o packages/web/src/lib/api.types.ts",
    "mock:api": "prism mock spec/api/openapi.yaml",
    "test:contract": "pact-broker publish spec/contracts/*.json",
    "test:e2e": "playwright test",
    "test": "vitest run",
    "lint": "eslint .",
    "typecheck": "tsc -b"
  }
}
```

---

## 9) UI Contracts (Data‑Driven Rendering)
- **Route** `/` (compose) emits POST `/v1/generate` and navigates to `/results/:run_id`.
- **Route** `/results/:run_id` calls GET `/v1/runs/{id}` until 200; renders 5 cards strictly from `artifacts.schema.json`.
- **Credibility** toggle only reveals `assumptions` and `confidence` fields—no extra copy injection.

---

## 10) Codegen Kickoff Tasks (for Codex)
Place these as TODO blocks to prompt code generation:
```ts
// TODO[codegen]: Generate OpenAPI client from spec/api/openapi.yaml into packages/web/src/lib/api.ts
// TODO[codegen]: Implement POST /v1/generate & GET /v1/runs/:id server handlers in packages/api using Fastify.
// TODO[codegen]: Wire UI pages ("/" and "/results/:id") to the client; stream loader overlay.
// TODO[codegen]: Add AJV middleware on the API to validate request/response against the JSON Schemas.
// TODO[codegen]: Add Cucumber + Playwright runner to execute spec/bdd/*.feature.
```

---

## 11) References (spec‑as‑code & executable specs)
- **Specification by Example** (Martin Fowler overview). citeturn0search0  
- **Gojko Adzic — _Specification by Example_** (book). citeturn0search1turn0search6  
- **Cucumber/BDD — executable specs**. citeturn0search9turn0search4turn0search14  
- **API‑/Contract‑first with OpenAPI** (Swagger; API You Won’t Hate; Moesif). citeturn0search7turn0search17turn0search2  
- **Consumer‑driven contracts (Pact)**. citeturn0search3turn0search13turn0search18  

---

## 12) Open Questions for You (so we encode the right behavior)
1) Should `/v1/generate` return artifacts synchronously (200) for short prompts, or **always** return 202 with polling?  
2) Max length for bullets and vignettes? (impacts copy truncation on cards)  
3) Failure behavior: if the model can’t find 6 signals, do we return 422, or fill placeholders with `confidence:"low"`?  
4) Export format priority: PDF only, or PNG/SVG per card too?

