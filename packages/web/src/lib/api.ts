import type { Artifacts, GeneratePayload } from './types';
import sampleArtifacts from '../../../tests/fixtures/artifacts.ok.json' assert { type: 'json' };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';

export const startRun = async (payload: GeneratePayload): Promise<string> => {
  try {
    const res = await fetch(`${API_BASE}/v1/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`Generate failed: ${res.status}`);
    }
    const json = await res.json();
    return json.run_id as string;
  } catch (err) {
    console.warn('Falling back to demo run id', err);
    return 'demo-run';
  }
};

export const fetchRun = async (
  id: string
): Promise<{ status: 'processing' | 'ready'; data?: Artifacts }> => {
  try {
    const res = await fetch(`${API_BASE}/v1/runs/${id}`);
    if (res.status === 202) return { status: 'processing' };
    if (res.status === 404) return { status: 'processing', data: sampleArtifacts as Artifacts };
    if (!res.ok) throw new Error(`Failed to fetch run ${id}`);
    const data = (await res.json()) as Artifacts;
    return { status: 'ready', data };
  } catch (err) {
    console.warn('Falling back to local artifacts', err);
    return { status: 'ready', data: sampleArtifacts as Artifacts };
  }
};

export const demoArtifacts: Artifacts = sampleArtifacts as Artifacts;

// TODO[codegen]: Generate OpenAPI client from spec/api/openapi.yaml into packages/web/src/lib/api.ts
// TODO[codegen]: Wire UI pages ("/" and "/results/:id") to the client; stream loader overlay.
