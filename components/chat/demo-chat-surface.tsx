'use client';

import { useEffect, useMemo, useRef } from 'react';
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
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {artifacts.map((a) => {
        if (a.type === 'clarify') return <ArtifactCard key={a.id} title="Step 0 — Clarify Goal"><p>{(a.data as any).summary}</p><ul className="list-disc pl-6">{(a.data as any).bullets.map((b: string) => <li key={b}>{b}</li>)}</ul></ArtifactCard>;
        if (a.type === 'frame') return <ArtifactCard key={a.id} title="Step 1 — Frame">Time horizon: {(a.data as any).timeHorizon}<div className="mt-2 text-xs">60-second guided timer active in demo behavior.</div></ArtifactCard>;
        if (a.type === 'stakeholders') return <ArtifactCard key={a.id} title="Step 2 — Stakeholders">{JSON.stringify(a.data)}</ArtifactCard>;
        if (a.type === 'personas') return <ArtifactCard key={a.id} title="Step 3 — Personas" collapsible>{(a.data as any[]).map((p) => <div key={p.name} className="mb-2"><strong>{p.name}</strong> — {p.role}<p>{p.quote}</p></div>)}</ArtifactCard>;
        if (a.type === 'collection_plan') return <ArtifactCard key={a.id} title="Step 4 — Collection plan">{(a.data as any).criteria}</ArtifactCard>;
        if (a.type === 'signals') return <ArtifactCard key={a.id} title="Step 5 — Signals">{((a.data as any).items || []).map((s: any) => <div key={s.id} className="mb-2 rounded-xl border p-2"><div className="font-medium">{s.title}</div><div className="text-xs">{s.source} · {s.date}</div><div className="flex gap-2 mt-1"><button onClick={() => onSignalAction(s.id, 'saved')} className="rounded-full border px-2 text-xs">Save</button><button onClick={() => onSignalAction(s.id, 'dismissed')} className="rounded-full border px-2 text-xs">Dismiss</button></div></div>)}</ArtifactCard>;
        if (a.type === 'horizon_scan') return <ArtifactCard key={a.id} title="Step 6 — Horizon Scan">{(a.data as any).present}</ArtifactCard>;
        if (a.type === 'scenarios') return <ArtifactCard key={a.id} title="Step 7 — Scenarios">{(a.data as any[]).map((s) => <div key={s.id} className="mb-2 rounded-xl border p-2"><div className="font-semibold">{s.title}</div><p>{s.logline}</p><button onClick={() => onSaveFuture({ explorationId: exploration.id, scenarioId: s.id, title: s.title, brief: s.logline, tags: ['scenario'] })} className="mt-1 rounded-full border px-2 text-xs">Save as preferable future</button></div>)}</ArtifactCard>;
        if (a.type === 'simulation') return <ArtifactCard key={a.id} title="Step 8 — Simulation Results">{(a.data as any).distribution}<details className="mt-2"><summary>Model assumptions (mock)</summary>{(a.data as any).assumptions.join(', ')}</details></ArtifactCard>;
        return null;
      })}
    </div>
  );
}
