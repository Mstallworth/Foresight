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
    profile: ['National policy lead for digital resilience', 'Infrastructure platform owner at a utilities cloud provider', 'Representative for skilled trades and displaced workers', 'Community trust builder for civic participation'][i],
    goals: ['Increase safe innovation capacity', 'Reduce outage and compliance risk', 'Protect wages while improving mobility', 'Keep governance transparent and inclusive'][i],
    fears: ['Regulatory lag triggering public backlash', 'Single points of failure from vendor concentration', 'Automation shocks without retraining pathways', 'Communities excluded from high-impact decisions'][i],
    leverage: ['Policy design + coalition building', 'Operational telemetry + procurement influence', 'Collective bargaining + public campaigns', 'Local convening + narrative framing'][i],
    preferredChannels: ['Cabinet briefings, policy memos', 'Incident dashboards, architecture reviews', 'Town halls, labor press', 'Community workshops, social channels'][i],
    quote: 'If we move too slow, the future gets decided for us.',
  })), 'locked');
  await sleep(450, signal);
  yield { type: 'artifact', artifact: personas };

  await sleep(450, signal);
  yield { type: 'artifact', artifact: makeArtifact('collection_plan', {
    objectives: [
      'Detect policy and infrastructure shifts 6–18 months before mainstream adoption.',
      'Validate which weak signals are likely to impact resilience and trust metrics.',
    ],
    dataObjects: [
      { name: 'SignalCard', fields: ['id', 'title', 'source', 'date', 'region', 'domain', 'confidence', 'impactVector'], purpose: 'Atomic record for each observed weak signal' },
      { name: 'EvidenceSnippet', fields: ['signalId', 'excerpt', 'url', 'publisher', 'stance'], purpose: 'Source traceability and interpretation context' },
      { name: 'CollectionSprint', fields: ['owner', 'window', 'focusDomains', 'qualityChecks'], purpose: 'Weekly collection operations and QA workflow' },
    ],
    workflow: [
      { stage: 'Collect', description: 'Pull candidate signals from policy trackers, earnings calls, incident feeds, and research digests.' },
      { stage: 'Triage', description: 'Score novelty, credibility, and propagation potential; archive low-value noise.' },
      { stage: 'Synthesize', description: 'Cluster validated signals into themes and map affected stakeholders/personas.' },
      { stage: 'Decide', description: 'Recommend experiments or policy moves with owner and review date.' },
    ],
    qualityBar: 'Each theme must include at least 3 independent sources and one contradictory view.',
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
    lenses: [
      { horizon: 'H1 (0-12 months)', headline: 'Execution friction', summary: 'Procurement delays, standards debates, and patchwork governance dominate outcomes.', metrics: [{ name: 'Pilot launches', value: '12-20 / quarter' }, { name: 'Policy reversals', value: '1-2 / quarter' }] },
      { horizon: 'H2 (1-3 years)', headline: 'Coordination race', summary: 'Capabilities compound where regulators and operators align on interoperable safeguards.', metrics: [{ name: 'Cross-sector accords', value: '6-10 active' }, { name: 'Incident severity index', value: 'Down 15-25%' }] },
      { horizon: 'H3 (3-5 years)', headline: 'Governance divergence', summary: 'Regions split between open coalitions and tightly controlled sovereign stacks.', metrics: [{ name: 'Bloc interoperability', value: '40-65%' }, { name: 'Public trust spread', value: '35-80 / 100' }] },
    ],
    drivingForces: ['Energy affordability', 'Compute concentration', 'Workforce transition capacity', 'Public trust in oversight'],
    implications: [
      'Build dual-track strategies: one for high-coordination regions and one for fragmented markets.',
      'Expand resilience telemetry now to avoid blind spots during H2 acceleration.',
    ],
  }, 'locked') };

  await sleep(500, signal);
  yield { type: 'artifact', artifact: makeArtifact('scenarios', Array.from({ length: 3 }).map((_, i) => ({
    id: uid(),
    title: ['Coordinated Acceleration', 'Fragmented Leapfrogging', 'Guardrailed Slow Burn'][i],
    logline: 'A plausible future shaped by policy timing, capital flow, and trust.',
    image: [
      'https://images.unsplash.com/photo-1470790376778-a9fbc86d70e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1463620910506-d0458143143e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    ][i],
    chain: ['Trigger event', 'Feedback loop', 'Institutional response'],
    outcomes: 'GDP impact +1.2% to +3.8%; trust 40–78/100',
    indicators: ['Treaty cadence', 'Compute concentration', 'Public sentiment delta'],
  })), 'locked') };

  await sleep(400, signal);
  yield { type: 'artifact', artifact: makeArtifact('simulation', {
    distribution: 'Median uplift 2.3%; P10 -0.8%; P90 +5.1%',
    decisionSummary: [
      { action: 'Launch regional resilience sandbox', expectedImpact: 'High', confidence: '0.72', leadTime: '1-2 quarters' },
      { action: 'Negotiate shared safety standard with top 3 operators', expectedImpact: 'Medium-High', confidence: '0.66', leadTime: '2-3 quarters' },
      { action: 'Create workforce transition fund trigger', expectedImpact: 'Medium', confidence: '0.61', leadTime: '1 quarter' },
    ],
    scenarioPerformance: [
      { scenario: 'Coordinated Acceleration', resilience: 78, growth: 81, equity: 64 },
      { scenario: 'Fragmented Leapfrogging', resilience: 49, growth: 74, equity: 38 },
      { scenario: 'Guardrailed Slow Burn', resilience: 72, growth: 55, equity: 70 },
    ],
    sensitivity: ['Policy response lag', 'Energy constraints', 'Talent concentration'],
    assumptions: ['Mock Monte Carlo with synthetic priors', 'No exogenous shocks modeled'],
  }, 'locked') };

  yield { type: 'done' };
}
