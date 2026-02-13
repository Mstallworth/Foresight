'use client';

import { DemoState } from './types';

const KEY = 'foresight-demo-state-v1';

export const defaultState: DemoState = {
  explorations: [],
  preferableFutures: [],
  signalSelections: {},
};

export function loadState(): DemoState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveState(state: DemoState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
