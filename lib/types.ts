export type Mode = 'guided' | 'manual' | 'rapid';
export type ArtifactType =
  | 'clarify'
  | 'frame'
  | 'stakeholders'
  | 'personas'
  | 'collection_plan'
  | 'signals'
  | 'horizon_scan'
  | 'scenarios'
  | 'simulation'
  | 'report';
export type ArtifactStatus = 'draft' | 'streaming' | 'locked';

export interface Artifact<T = unknown> {
  id: string;
  type: ArtifactType;
  version: number;
  status: ArtifactStatus;
  data: T;
  createdAt: string;
}

export interface FrameData {
  timeHorizon: string;
  scope: Record<string, string>;
  metrics: { name: string; value: string; unit: string; note: string }[];
}

export interface Exploration {
  id: string;
  title: string;
  query: string;
  goal: string;
  createdAt: string;
  updatedAt: string;
  mode: Mode;
  status: 'idle' | 'running' | 'paused' | 'done';
  frame: FrameData;
  artifacts: Artifact[];
}

export interface PreferableFuture {
  id: string;
  explorationId: string;
  scenarioId: string;
  title: string;
  brief: string;
  tags: string[];
  createdAt: string;
}

export interface DemoState {
  explorations: Exploration[];
  preferableFutures: PreferableFuture[];
  signalSelections: Record<string, 'saved' | 'dismissed'>;
}
