'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Artifact, DemoState, Exploration, Mode, PreferableFuture } from '@/lib/types';
import { Composer } from './composer';
import { ArtifactCard } from '../cards/artifact-card';
import { Pause, Download } from 'lucide-react';

type Tab = 'explorations' | 'reports' | 'visualizations' | 'preferable';

export function DemoChatSurface({
  exploration,
  all,
  tab,
  onSubmit,
  onStop,
  onSaveFuture,
  onSignalAction,
  onOpenSidebar,
  onAddReport,
}: {
  exploration: Exploration | null;
  all: DemoState;
  tab: Tab;
  onSubmit: (q: string, mode: Mode) => void;
  onStop: () => void;
  onSaveFuture: (f: Omit<PreferableFuture, 'id' | 'createdAt'>) => void;
  onSignalAction: (signalId: string, action: 'saved' | 'dismissed') => void;
  onOpenSidebar: () => void;
  onAddReport: () => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const pinned = !!exploration?.artifacts.length;
  const generating = exploration?.status === 'running';

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [exploration?.artifacts.length]);

  const reports = useMemo(() => exploration?.artifacts.filter((a) => a.type === 'report') ?? [], [exploration]);

  return (
    <main className="flex-1 flex flex-col bg-white">
      {pinned && exploration && tab === 'explorations' && (
        <header className="sticky top-0 z-10 border-b bg-white/95 px-6 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-sm"><button className="md:hidden underline" onClick={onOpenSidebar}>Browse</button><strong>{exploration.title}</strong><span>{exploration.goal}</span><span className="rounded-full bg-zinc-100 px-2">{exploration.frame.timeHorizon}</span>{Object.keys(exploration.frame.scope).slice(0, 4).map((s) => <span key={s} className="rounded-full border px-2 py-0.5 text-xs">{s}</span>)}<button className="inline-flex items-center gap-1 rounded-full border px-3 py-1"><Pause className="size-3"/>Pause</button><button className="inline-flex items-center gap-1 rounded-full border px-3 py-1"><Download className="size-3"/>Export</button></div>
        </header>
      )}

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6">
        {tab === 'explorations' && (!exploration ? <Empty /> : <Feed artifacts={exploration.artifacts} onSaveFuture={onSaveFuture} exploration={exploration} onSignalAction={onSignalAction} />)}
        {tab === 'reports' && <div className="mx-auto max-w-3xl"><button onClick={onAddReport} className="rounded-full bg-zinc-900 px-4 py-2 text-white mb-4">Generate report</button>{reports.map((r) => <ArtifactCard key={r.id} title={(r.data as any).title}>Mock report content generated in demo mode.</ArtifactCard>)}</div>}
        {tab === 'visualizations' && <div className="mx-auto grid max-w-3xl gap-3 md:grid-cols-2">{['Trend map', 'Sensitivity radar', 'Probability fan', 'Stakeholder matrix'].map((c) => <div key={c} className="rounded-2xl border p-6 text-sm text-zinc-600">{c} (mock chart)</div>)}</div>}
        {tab === 'preferable' && <div className="mx-auto max-w-3xl space-y-3">{all.preferableFutures.map((f) => <ArtifactCard key={f.id} title={f.title}>{f.brief}</ArtifactCard>)}</div>}
      </div>

      <Composer onSubmit={onSubmit} onStop={onStop} generating={!!generating} />
    </main>
  );
}

function Empty() {
  return <div className="flex h-full items-center justify-center text-3xl text-zinc-500">What future would you like to explore?</div>;
}

function Feed({ artifacts, onSaveFuture, exploration, onSignalAction }: { artifacts: Artifact[]; onSaveFuture: (f: Omit<PreferableFuture, 'id' | 'createdAt'>) => void; exploration: Exploration; onSignalAction: (id: string, action: 'saved' | 'dismissed') => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCollapsed((prev) => {
      const next = { ...prev };
      for (const artifact of artifacts) {
        if (artifact.status === 'locked' && !next[artifact.id]) next[artifact.id] = true;
      }
      return next;
    });
  }, [artifacts]);

  return (
    <div className="mx-auto max-w-5xl space-y-3">
      {artifacts.map((a) => {
        const isOpen = !collapsed[a.id];
        if (a.type === 'clarify') return <ArtifactCard key={a.id} title="Step 0 — Clarify Goal" collapsible open={isOpen}><p>{(a.data as any).summary}</p><ul className="list-disc pl-6">{(a.data as any).bullets.map((b: string) => <li key={b}>{b}</li>)}</ul></ArtifactCard>;
        if (a.type === 'frame') return <ArtifactCard key={a.id} title="Step 1 — Frame" collapsible open={isOpen}>Time horizon: {(a.data as any).timeHorizon}<div className="mt-2 text-xs">60-second guided timer active in demo behavior.</div></ArtifactCard>;
        if (a.type === 'stakeholders') return <ArtifactCard key={a.id} title="Step 2 — Stakeholders" collapsible open={isOpen}>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(a.data as any).map(([bucket, stakeholders]: any) => (
              <section key={bucket} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{bucket}</h4>
                <div className="space-y-2">
                  {stakeholders.map((s: any) => (
                    <div key={s.name} className="rounded-lg border border-zinc-200 bg-white p-2">
                      <div className="font-medium text-zinc-900">{s.name}</div>
                      <div className="mt-1 flex gap-2 text-xs">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">Influence: {s.influence}</span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Interest: {s.interest}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </ArtifactCard>;
        if (a.type === 'personas') return <ArtifactCard key={a.id} title="Step 3 — Personas" collapsible open={isOpen}>
          <div className="grid gap-3 md:grid-cols-2">
            {(a.data as any[]).map((p) => <article key={p.name} className="rounded-xl border border-zinc-200 p-3">
              <div className="text-sm font-semibold text-zinc-900">{p.name}</div>
              <div className="text-xs text-zinc-500">{p.role}</div>
              <p className="mt-2 text-xs"><span className="font-medium">Profile:</span> {p.profile}</p>
              <p className="mt-1 text-xs"><span className="font-medium">Goal:</span> {p.goals}</p>
              <p className="mt-1 text-xs"><span className="font-medium">Fear:</span> {p.fears}</p>
              <p className="mt-1 text-xs"><span className="font-medium">Leverage:</span> {p.leverage}</p>
              <p className="mt-1 text-xs"><span className="font-medium">Channels:</span> {p.preferredChannels}</p>
              <p className="mt-2 rounded-lg bg-zinc-50 p-2 text-xs italic">“{p.quote}”</p>
            </article>)}
          </div>
        </ArtifactCard>;
        if (a.type === 'collection_plan') return <ArtifactCard key={a.id} title="Step 4 — Collection plan" collapsible open={isOpen}>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-zinc-900">Collection objectives</h4>
              <ul className="mt-1 list-disc pl-5 text-xs">{(a.data as any).objectives.map((o: string) => <li key={o}>{o}</li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Supporting data objects</h4>
              <div className="mt-2 grid gap-2 md:grid-cols-3">{(a.data as any).dataObjects.map((obj: any) => <div key={obj.name} className="rounded-xl border border-zinc-200 p-2 text-xs"><div className="font-medium">{obj.name}</div><p className="mt-1 text-zinc-600">{obj.purpose}</p><div className="mt-2 flex flex-wrap gap-1">{obj.fields.map((field: string) => <span key={field} className="rounded-full bg-zinc-100 px-2 py-0.5">{field}</span>)}</div></div>)}</div>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Experience flow</h4>
              <div className="mt-2 grid gap-2 md:grid-cols-4">{(a.data as any).workflow.map((step: any) => <div key={step.stage} className="rounded-xl bg-zinc-50 p-2 text-xs"><div className="font-medium">{step.stage}</div><p className="mt-1">{step.description}</p></div>)}</div>
            </div>
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs">Quality bar: {(a.data as any).qualityBar}</p>
          </div>
        </ArtifactCard>;
        if (a.type === 'signals') return <ArtifactCard key={a.id} title="Step 5 — Signals" collapsible open={isOpen}>
          <div className="space-y-2">{((a.data as any).items || []).map((s: any) => <div key={s.id} className="rounded-lg border border-zinc-200 p-2"><div className="flex items-start justify-between gap-2"><div><div className="font-medium leading-tight text-zinc-900">{s.title}</div><div className="text-[11px] text-zinc-500">{s.source} · {s.date}</div></div><div className="flex gap-1"><button onClick={() => onSignalAction(s.id, 'saved')} className="rounded-full border px-2 py-0.5 text-[11px]">Save</button><button onClick={() => onSignalAction(s.id, 'dismissed')} className="rounded-full border px-2 py-0.5 text-[11px]">Dismiss</button></div></div><div className="mt-1 flex flex-wrap gap-1">{s.tags.map((tag: string) => <span key={tag} className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px]">{tag}</span>)}</div></div>)}</div>
        </ArtifactCard>;
        if (a.type === 'horizon_scan') return <ArtifactCard key={a.id} title="Step 6 — Horizon Scan" collapsible open={isOpen}>
          <div className="space-y-4">
            <div className="grid gap-2 md:grid-cols-3">{(a.data as any).lenses.map((lens: any) => <article key={lens.horizon} className="rounded-xl border border-zinc-200 p-3"><div className="text-xs font-semibold text-zinc-500">{lens.horizon}</div><h4 className="text-sm font-semibold text-zinc-900">{lens.headline}</h4><p className="mt-1 text-xs">{lens.summary}</p><div className="mt-2 space-y-1">{lens.metrics.map((m: any) => <div key={m.name} className="flex justify-between rounded bg-zinc-50 px-2 py-1 text-[11px]"><span>{m.name}</span><span>{m.value}</span></div>)}</div></article>)}</div>
            <div>
              <h4 className="font-semibold text-zinc-900">Driving forces</h4>
              <div className="mt-1 flex flex-wrap gap-1">{(a.data as any).drivingForces.map((f: string) => <span key={f} className="rounded-full border px-2 py-0.5 text-xs">{f}</span>)}</div>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Strategic implications</h4>
              <ul className="mt-1 list-disc pl-5 text-xs">{(a.data as any).implications.map((i: string) => <li key={i}>{i}</li>)}</ul>
            </div>
          </div>
        </ArtifactCard>;
        if (a.type === 'scenarios') return <ArtifactCard key={a.id} title="Step 7 — Scenarios" collapsible open={isOpen}>
          <div className="grid gap-3 md:grid-cols-3">{(a.data as any[]).map((s) => <div key={s.id} className="overflow-hidden rounded-xl border border-zinc-200"><img src={s.image} alt={s.title} className="h-28 w-full object-cover" /><div className="p-3"><div className="font-semibold text-zinc-900">{s.title}</div><p className="mt-1 text-xs">{s.logline}</p><button onClick={() => onSaveFuture({ explorationId: exploration.id, scenarioId: s.id, title: s.title, brief: s.logline, tags: ['scenario'] })} className="mt-2 rounded-full border px-2 py-0.5 text-xs">Save as preferable future</button></div></div>)}</div>
        </ArtifactCard>;
        if (a.type === 'simulation') return <ArtifactCard key={a.id} title="Step 8 — Simulation Results" collapsible open={isOpen}>
          <div className="space-y-3">
            <div className="rounded-lg bg-zinc-50 p-2 text-xs">{(a.data as any).distribution}</div>
            <div>
              <h4 className="font-semibold text-zinc-900">Recommended actions</h4>
              <div className="mt-2 space-y-2">{(a.data as any).decisionSummary.map((d: any) => <div key={d.action} className="rounded-lg border border-zinc-200 p-2 text-xs"><div className="font-medium">{d.action}</div><div className="mt-1 flex flex-wrap gap-1"><span className="rounded-full bg-green-50 px-2 py-0.5 text-green-700">Impact: {d.expectedImpact}</span><span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">Confidence: {d.confidence}</span><span className="rounded-full bg-purple-50 px-2 py-0.5 text-purple-700">Lead time: {d.leadTime}</span></div></div>)}</div>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Scenario score comparison</h4>
              <div className="mt-2 space-y-1">{(a.data as any).scenarioPerformance.map((s: any) => <div key={s.scenario} className="grid grid-cols-4 gap-1 rounded bg-zinc-50 px-2 py-1 text-[11px]"><span className="font-medium">{s.scenario}</span><span>Res {s.resilience}</span><span>Growth {s.growth}</span><span>Equity {s.equity}</span></div>)}</div>
            </div>
            <details className="text-xs"><summary>Model assumptions (mock)</summary>{(a.data as any).assumptions.join(', ')}</details>
          </div>
        </ArtifactCard>;
        return null;
      })}
    </div>
  );
}
