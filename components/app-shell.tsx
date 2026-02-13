'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createExploration, runDemoPipeline } from '@/lib/demo-engine';
import { defaultState, loadState, resetState, saveState } from '@/lib/storage';
import { Artifact, DemoState, Exploration, Mode, PreferableFuture } from '@/lib/types';
import { Sidebar } from './layout/sidebar';
import { DemoChatSurface } from './chat/demo-chat-surface';
import { ChatKitSurface } from './chat/chatkit-surface';

const useChatKit = process.env.NEXT_PUBLIC_USE_CHATKIT === '1';

export function AppShell() {
  const [state, setState] = useState<DemoState>(defaultState);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<'explorations' | 'reports' | 'visualizations' | 'preferable'>('explorations');
  const [mobileOpen, setMobileOpen] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const initial = loadState();
    setState(initial);
    setActiveId(initial.explorations[0]?.id ?? null);
  }, []);

  useEffect(() => saveState(state), [state]);

  const active = useMemo(
    () => state.explorations.find((e) => e.id === activeId) ?? null,
    [state.explorations, activeId],
  );

  const patchExploration = (id: string, updater: (exp: Exploration) => Exploration) => {
    setState((s) => ({ ...s, explorations: s.explorations.map((e) => (e.id === id ? updater(e) : e)) }));
  };

  const onSubmit = async (query: string, mode: Mode) => {
    const exploration = createExploration(query, mode);
    setState((s) => ({ ...s, explorations: [exploration, ...s.explorations] }));
    setActiveId(exploration.id);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      for await (const evt of runDemoPipeline(exploration, controller.signal)) {
        if (evt.type === 'artifact') {
          patchExploration(exploration.id, (e) => ({ ...e, artifacts: [...e.artifacts, evt.artifact], updatedAt: new Date().toISOString() }));
        } else if (evt.type === 'artifact-update') {
          patchExploration(exploration.id, (e) => ({
            ...e,
            artifacts: e.artifacts.map((a) => (a.id === evt.artifactId ? ({ ...a, ...evt.patch } as Artifact) : a)),
            updatedAt: new Date().toISOString(),
          }));
        } else {
          patchExploration(exploration.id, (e) => ({ ...e, status: 'done' }));
        }
      }
    } catch {
      patchExploration(exploration.id, (e) => ({ ...e, status: 'paused' }));
    }
  };

  const stopRun = () => controllerRef.current?.abort();

  const saveFuture = (f: Omit<PreferableFuture, 'id' | 'createdAt'>) => {
    setState((s) => ({ ...s, preferableFutures: [{ ...f, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...s.preferableFutures] }));
  };

  return (
    <div className="flex h-screen bg-white text-zinc-900">
      <Sidebar
        state={state}
        activeId={activeId}
        onSetActive={setActiveId}
        tab={tab}
        onTab={setTab}
        onReset={() => {
          resetState();
          setState(defaultState);
          setActiveId(null);
        }}
        mobileOpen={mobileOpen}
        onMobileOpen={setMobileOpen}
      />
      {useChatKit ? (
        <ChatKitSurface exploration={active} tab={tab} onSubmit={onSubmit} onStop={stopRun} onSaveFuture={saveFuture} />
      ) : (
        <DemoChatSurface
          exploration={active}
          tab={tab}
          all={state}
          onSubmit={onSubmit}
          onStop={stopRun}
          onSaveFuture={saveFuture}
          onSignalAction={(id, action) => setState((s) => ({ ...s, signalSelections: { ...s.signalSelections, [id]: action } }))}
          onOpenSidebar={() => setMobileOpen(true)}
          onAddReport={() =>
            active &&
            patchExploration(active.id, (e) => ({
              ...e,
              artifacts: [...e.artifacts, { id: crypto.randomUUID(), type: 'report', version: 1, status: 'locked', data: { title: `Report for ${e.title}` }, createdAt: new Date().toISOString() }],
            }))
          }
        />
      )}
    </div>
  );
}
