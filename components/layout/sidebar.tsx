'use client';
import { Menu, Plus, Search, Settings, X } from 'lucide-react';
import { DemoState } from '@/lib/types';
import { cx } from '@/lib/utils';

type Tab = 'explorations' | 'reports' | 'visualizations' | 'preferable';

export function Sidebar({
  state,
  activeId,
  onSetActive,
  tab,
  onTab,
  onReset,
  mobileOpen,
  onMobileOpen,
}: {
  state: DemoState;
  activeId: string | null;
  onSetActive: (id: string) => void;
  tab: Tab;
  onTab: (t: Tab) => void;
  onReset: () => void;
  mobileOpen: boolean;
  onMobileOpen: (b: boolean) => void;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'explorations', label: 'Explorations' },
    { id: 'reports', label: 'Reports' },
    { id: 'visualizations', label: 'Visualizations' },
    { id: 'preferable', label: 'Preferable futures' },
  ];

  return (
    <>
      <button className="md:hidden fixed top-3 left-3 z-30 rounded-full border bg-white p-2" onClick={() => onMobileOpen(true)} aria-label="Open sidebar">
        <Menu className="size-4" />
      </button>
      <aside
        className={cx(
          'fixed md:static inset-y-0 left-0 z-20 w-[320px] border-r border-zinc-200 bg-zinc-100 p-3 transition-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <button className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white inline-flex items-center gap-2"><Plus className="size-4" />New exploration</button>
          <button onClick={() => onMobileOpen(false)} className="md:hidden p-1" aria-label="Close sidebar"><X className="size-4" /></button>
        </div>
        <label className="mb-3 flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-2 text-sm">
          <Search className="size-4" />
          <input className="w-full bg-transparent outline-none" placeholder="Search" />
        </label>

        <div className="mb-3 grid grid-cols-2 gap-1 rounded-2xl bg-zinc-200 p-1 text-xs">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => onTab(t.id)} className={cx('rounded-xl px-2 py-1', tab === t.id && 'bg-white')}>{t.label}</button>
          ))}
        </div>

        <div className="space-y-2 overflow-y-auto h-[calc(100vh-220px)] pr-1">
          {tab === 'explorations' &&
            state.explorations.map((e) => (
              <div key={e.id} className={cx('rounded-xl border p-2', activeId === e.id ? 'border-zinc-900 bg-white' : 'border-zinc-300 bg-zinc-50')}>
                <button onClick={() => onSetActive(e.id)} className="w-full text-left text-sm font-medium">{e.title}</button>
                <div className="mt-2 space-y-1">
                  {e.artifacts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-xs text-zinc-600">
                      <span className="inline-flex items-center gap-1"><span className={cx('size-2 rounded-full', a.status === 'streaming' ? 'bg-amber-400' : a.status === 'draft' ? 'bg-zinc-400' : 'bg-emerald-500')} />{a.type}</span>
                      <span className="rounded-full bg-zinc-200 px-2">v{a.version}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {tab === 'preferable' && state.preferableFutures.map((f) => <div key={f.id} className="rounded-xl border border-zinc-300 bg-white p-2 text-sm">{f.title}</div>)}
          {tab === 'reports' && <p className="text-sm text-zinc-600">Reports appear here.</p>}
          {tab === 'visualizations' && <p className="text-sm text-zinc-600">Visualization placeholders appear here.</p>}
        </div>

        <button onClick={onReset} className="mt-3 inline-flex items-center gap-2 text-xs text-zinc-600"><Settings className="size-3" />Reset demo data</button>
      </aside>
    </>
  );
}
