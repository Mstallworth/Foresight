import Fastify from 'fastify';
import cors from '@fastify/cors';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import metaSchema from 'ajv/dist/refs/json-schema-2020-12.json' assert { type: 'json' };
import { nanoid } from 'nanoid';

import inputSchema from '../../spec/domain/generate-input.schema.json' assert { type: 'json' };
import outputSchema from '../../spec/domain/artifacts.schema.json' assert { type: 'json' };

type GenerateInput = {
  question: string;
  horizon?: 6 | 24 | 60;
  location?: string | null;
  perspective?: 'me' | 'we' | 'community';
  seed_bias?: 'conservative' | 'exploratory';
};

type QuickTake = {
  one_line: string;
  bullets: string[];
  confidence: 'low' | 'med' | 'high';
  assumptions: string[];
};

type Cone = {
  name: 'Upside' | 'Downside';
  vignette: string;
  drivers: string[];
  uncertainties: string[];
  early_signals: string[];
};

type SignalsDrivers = {
  signals: { title: string; summary: string; source_url: string | null }[];
  drivers: { name: string; why: string }[];
};

type Timeline = {
  milestones: { when: string; what: string; so_what: string }[];
  inflections?: { when: string; what: string }[];
};

type Moves = {
  no_regrets: string[];
  options: string[];
  watch_outs: string[];
  tags?: { effort?: 'L' | 'M' | 'H'; impact?: 'L' | 'M' | 'H' }[];
};

type Artifacts = {
  quick_take: QuickTake;
  cones: Cone[];
  signals_drivers: SignalsDrivers;
  timeline: Timeline;
  moves: Moves;
};

type RunRecord =
  | { status: 'processing'; createdAt: number }
  | { status: 'ready'; createdAt: number; result: Artifacts };

const fastify = Fastify({ logger: true });
const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addMetaSchema(metaSchema);
addFormats(ajv);

const validateInput = ajv.compile<GenerateInput>(inputSchema as any);
const validateOutput = ajv.compile(outputSchema as any);
const runs = new Map<string, RunRecord>();

const loaderDelayMs = 400;

const buildQuickBullets = (input: GenerateInput) => [
  `Watch how ${input.seed_bias === 'exploratory' ? 'fast adopters' : 'incumbents'} frame this topic.`,
  'Track 6+ signals; retire stale ones monthly.',
  `Map upside/downside cones across ${input.horizon ?? 24} months.`,
  'Surface 2-3 no-regret moves now.',
  'Note critical uncertainties and pre-mortems.',
  'Calibrate confidence with explicit assumptions.'
];

const baseArtifacts = (input: GenerateInput) => {
  const q = input.question;
  const horizon = input.horizon ?? 24;
  const location = input.location ?? 'N/A';
  const perspective = input.perspective ?? 'me';

  return {
    quick_take: {
      one_line: `${q} — implications over the next ${horizon} months`,
      bullets: buildQuickBullets(input),
      confidence: 'med',
      assumptions: [
        'Data availability remains stable',
        `${location} macro conditions hold for 12 months`
      ]
    },
    cones: [
      {
        name: 'Upside',
        vignette: `If enablers align, ${q} accelerates and ${perspective} benefits compound.`,
        drivers: [
          'Capital flows into enablers',
          'Policy tailwinds emerge',
          'User adoption compounds quickly'
        ],
        uncertainties: ['Regulatory shifts', 'Talent pipeline quality'],
        early_signals: ['Pilot programs scaling beyond phase 1']
      },
      {
        name: 'Downside',
        vignette: `Adoption stalls; stakeholders resist change; ${q} drifts without ownership.`,
        drivers: ['Budget freezes', 'Visible failures create caution', 'Complex integrations'],
        uncertainties: ['Supply chain volatility', 'Trust erosion'],
        early_signals: ['Project cancellations in peers']
      }
    ],
    signals_drivers: {
      signals: [
        { title: 'New entrant gains traction', summary: 'Scrappy competitor tests the space', source_url: null },
        { title: 'Policy draft surfaces', summary: 'Regulators hint at guardrails', source_url: null },
        { title: 'Vendor consolidations', summary: 'M&A spikes as market heats', source_url: null },
        { title: 'Community-led standards', summary: 'Grassroots patterns emerge', source_url: null },
        { title: 'Hiring patterns shift', summary: 'Job postings reveal priorities', source_url: null },
        { title: 'Infra pricing trends', summary: 'Unit costs drop meaningfully', source_url: null }
      ],
      drivers: [
        { name: 'Capital intensity', why: 'Determines viable pace' },
        { name: 'Ecosystem readiness', why: 'Dependency risk governs speed' },
        { name: 'Talent depth', why: 'Execution hinges on skills' },
        { name: 'Customer urgency', why: 'Pull signals accelerate adoption' }
      ]
    },
    timeline: {
      milestones: [
        { when: '6 mo', what: 'Pilot validated', so_what: 'Scope next tranche' },
        { when: '12 mo', what: 'Scaled to early adopters', so_what: 'Harden reliability' },
        { when: '24 mo', what: 'Category norms emerge', so_what: 'Defend position' }
      ],
      inflections: [{ when: '18 mo', what: 'Key uncertainty resolves' }]
    },
    moves: {
      no_regrets: [
        'Stand up light-weight governance',
        'Track leading indicators monthly',
        'Fund quick experiments with clear exit criteria'
      ],
      options: ['Place small bets with partners', 'Create observability dashboard for signals'],
      watch_outs: ['Narrative over-promising'],
      tags: [
        { effort: 'M', impact: 'H' },
        { effort: 'L', impact: 'M' }
      ]
    }
  };
};

const scheduleRun = (input: GenerateInput) => {
  const runId = `RUN-${nanoid(6)}`;
  runs.set(runId, { status: 'processing', createdAt: Date.now() });

  setTimeout(() => {
    const artifacts = baseArtifacts(input);
    if (validateOutput(artifacts)) {
      runs.set(runId, { status: 'ready', createdAt: Date.now(), result: artifacts });
    } else {
      runs.set(runId, {
        status: 'ready',
        createdAt: Date.now(),
        result: artifacts
      });
    }
  }, loaderDelayMs);

  return runId;
};

fastify.register(cors, { origin: '*' });

fastify.post('/v1/generate', async (request, reply) => {
  const payload = request.body as GenerateInput;
  if (!validateInput(payload)) {
    return reply.status(400).send({ error: 'invalid_input', details: validateInput.errors });
  }

  const runId = scheduleRun(payload);
  return reply.status(202).send({ run_id: runId });
});

fastify.get('/v1/runs/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const record = runs.get(id);

  if (!record) {
    return reply.status(404).send({ error: 'not_found' });
  }

  if (record.status !== 'ready') {
    return reply.status(202).send({ status: 'processing' });
  }

  if (!validateOutput(record.result)) {
    return reply.status(500).send({ error: 'invalid_artifacts' });
  }

  return reply.status(200).send(record.result);
});

const start = async () => {
  try {
    await fastify.listen({ port: 8787, host: '0.0.0.0' });
    fastify.log.info('Foresight API ready on http://localhost:8787');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

void start();

// TODO[codegen]: Implement POST /v1/generate & GET /v1/runs/:id server handlers in packages/api using Fastify.
// TODO[codegen]: Add AJV middleware on the API to validate request/response against the JSON Schemas.
