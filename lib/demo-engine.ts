import { Artifact, ArtifactType, Exploration, FrameData, Mode } from './types';
import { sleep, uid } from './utils';

type EngineEvent =
  | { type: 'artifact'; artifact: Artifact }
  | { type: 'artifact-update'; artifactId: string; patch: Partial<Artifact> }
  | { type: 'done' };

const seeded = (input: string) => {
  let h = 0;
  for (const c of input) h = (h * 31 + c.charCodeAt(0)) % 2147483647;
  return () => (h = (h * 48271) % 2147483647) / 2147483647;
};

export function createExploration(query: string, mode: Mode): Exploration {
  const now = new Date().toISOString();
  const frame: FrameData = {
    timeHorizon: '5y',
    scope: { Geographic: 'Global', Political: 'Mixed governance', Industry: 'Technology', Technology: 'AI + Quantum', Social: 'Labor + Education', Entity: 'Public-private coalitions' },
    metrics: [
      { name: 'Adoption', value: '18', unit: '%', note: 'baseline mock estimate' },
      { name: 'Policy latency', value: '14', unit: 'months', note: 'avg policy update cadence' },
      { name: 'Public trust', value: '62', unit: '/100', note: 'sentiment trend proxy' },
    ],
  };
  return {
    id: uid(),
    title: query.slice(0, 56),
    query,
    goal: `Explore plausible futures related to: ${query}`,
    createdAt: now,
    updatedAt: now,
    mode,
    status: 'running',
    frame,
    artifacts: [],
  };
}

const makeArtifact = (type: ArtifactType, data: unknown, status: Artifact['status'] = 'streaming', version = 1): Artifact => ({
  id: uid(),
  type,
  version,
  status,
  data,
  createdAt: new Date().toISOString(),
});

export async function* runDemoPipeline(exploration: Exploration, signal: AbortSignal): AsyncGenerator<EngineEvent> {
  const rand = seeded(exploration.query);
  const clarify = makeArtifact('clarify', {
    summary: `I understand your goal as evaluating strategic consequences and decision points for “${exploration.query}”.`,
    bullets: ['Define strategic uncertainties', 'Map second-order effects across institutions', 'Identify early indicators and intervention points'],
  }, 'locked');
  yield { type: 'artifact', artifact: clarify };
  await sleep(500, signal);

  const frame = makeArtifact('frame', exploration.frame, exploration.mode === 'manual' ? 'draft' : 'streaming');
  yield { type: 'artifact', artifact: frame };
  await sleep(700, signal);
  yield { type: 'artifact-update', artifactId: frame.id, patch: { status: 'locked' } };

  const stakeholders = makeArtifact('stakeholders', {
    primary: [{ name: 'National regulators', influence: 'high', interest: 'high' }, { name: 'Critical infrastructure operators', influence: 'high', interest: 'medium' }],
    secondary: [{ name: 'Labor groups', influence: 'medium', interest: 'high' }, { name: 'Regional startups', influence: 'low', interest: 'medium' }],
  }, 'locked');
  await sleep(500, signal);
  yield { type: 'artifact', artifact: stakeholders };

  const personas = makeArtifact('personas', Array.from({ length: 4 }).map((_, i) => ({
    name: `Persona ${i + 1}`,
    role: ['Minister', 'CTO', 'Union Lead', 'Civic Organizer'][i],
    goals: 'Maintain resilience while increasing upside',
    fears: 'Asymmetric disruption and legitimacy loss',
    leverage: 'Policy design + coalition building',
    quote: 'If we move too slow, the future gets decided for us.',
  })), 'locked');
  await sleep(450, signal);
  yield { type: 'artifact', artifact: personas };

  await sleep(450, signal);
  yield { type: 'artifact', artifact: makeArtifact('collection_plan', {
    domains: ['Political', 'Economic', 'Social', 'Technological', 'Legal', 'Environmental'],
    criteria: 'Signals with novelty, reliability, and plausible propagation pathways',
    note: 'Bias watch: over-indexing on anglophone policy discourse',
  }, 'locked') };

  const signals = makeArtifact('signals', { items: [] as any[] }, 'streaming');
  yield { type: 'artifact', artifact: signals };

  for (let i = 0; i < 8; i++) {
    await sleep(500 + Math.floor(rand() * 400), signal);
    const item = {
      id: uid(),
      title: `Signal ${i + 1}: ${['Regulatory sandbox expands', 'Breakthrough battery chain', 'Cross-border AI treaty draft', 'Labor automation pact', 'Compute subsidy shift', 'Cyber resilience standard', 'Satellite internet bloc', 'Civic AI oversight pilots'][i]}`,
      source: ['Policy Desk', 'Market Wire', 'Academic Brief'][i % 3],
      date: `202${i % 5}-0${(i % 8) + 1}-1${i}`,
      tags: ['policy', 'technology', 'society'].slice(0, (i % 3) + 1),
      why: 'Could alter adoption velocity, trust, and strategic coordination.',
    };
    yield { type: 'artifact-update', artifactId: signals.id, patch: { data: { items: [...(signals.data as any).items, item] } } };
    (signals.data as any).items.push(item);
  }
  yield { type: 'artifact-update', artifactId: signals.id, patch: { status: 'locked' } };

  await sleep(450, signal);
  yield { type: 'artifact', artifact: makeArtifact('horizon_scan', {
    past: 'Infrastructure bottlenecks + policy lag dominated.',
    present: 'Coordination races and uneven capability spread.',
    emerging: 'Coalition governance and capability safeguards converge.',
    actors: ['States', 'Cloud providers', 'Civil networks'],
    metrics: [{ name: 'Diffusion', range: '20–45%' }, { name: 'Risk incidents', range: '3–7/qtr' }],
  }, 'locked') };

  await sleep(500, signal);
  yield { type: 'artifact', artifact: makeArtifact('scenarios', Array.from({ length: 3 }).map((_, i) => ({
    id: uid(),
    title: ['Coordinated Acceleration', 'Fragmented Leapfrogging', 'Guardrailed Slow Burn'][i],
    logline: 'A plausible future shaped by policy timing, capital flow, and trust.',
    chain: ['Trigger event', 'Feedback loop', 'Institutional response'],
    outcomes: 'GDP impact +1.2% to +3.8%; trust 40–78/100',
    indicators: ['Treaty cadence', 'Compute concentration', 'Public sentiment delta'],
  })), 'locked') };

  await sleep(400, signal);
  yield { type: 'artifact', artifact: makeArtifact('simulation', {
    distribution: 'Median uplift 2.3%; P10 -0.8%; P90 +5.1%',
    sensitivity: ['Policy response lag', 'Energy constraints', 'Talent concentration'],
    assumptions: ['Mock Monte Carlo with synthetic priors', 'No exogenous shocks modeled'],
  }, 'locked') };

  yield { type: 'done' };
}
