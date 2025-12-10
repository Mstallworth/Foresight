import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { LoaderOverlay } from '../../src/components/LoaderOverlay';
import { demoArtifacts, fetchRun } from '../../src/lib/api';
import type { Artifacts, Cone } from '../../src/lib/types';

const sectionStyle = { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18 };

export default function Results() {
  const router = useRouter();
  const { run_id: runId } = router.query as { run_id?: string };
  const [artifacts, setArtifacts] = useState<Artifacts>(demoArtifacts);
  const [loading, setLoading] = useState(true);
  const [showCredibility, setShowCredibility] = useState(false);
  const [quickTakeExpanded, setQuickTakeExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      if (!runId) return;
      const result = await fetchRun(runId);
      attempts += 1;
      if (cancelled) return;

      if (result.status === 'ready' && result.data) {
        setArtifacts(result.data);
        setLoading(false);
        return;
      }

      if (attempts > 6) {
        setArtifacts(demoArtifacts);
        setLoading(false);
        return;
      }

      setTimeout(poll, 400);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [runId]);

  const quickBullets = useMemo(() => {
    return quickTakeExpanded
      ? artifacts.quick_take.bullets
      : artifacts.quick_take.bullets.slice(0, 3);
  }, [artifacts, quickTakeExpanded]);

  return (
    <>
      <Head>
        <title>Foresight | Results</title>
      </Head>
      <div style={{ minHeight: '100vh', padding: '40px 26px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.2em', color: '#9ca3af' }}>Results</div>
            <h1 style={{ margin: '6px 0 0' }}>Future cones and moves</h1>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              aria-label="Credibility"
              onChange={(e) => setShowCredibility(e.target.checked)}
              checked={showCredibility}
            />
            <span>Credibility</span>
          </label>
        </header>

        <main style={{ display: 'grid', gap: 18, marginTop: 20 }}>
          <div className="card" data-testid="quick-take">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Quick Take</h2>
              <button
                onClick={() => setQuickTakeExpanded((prev) => !prev)}
                aria-label="Expand"
                style={{
                  background: 'transparent',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer'
                }}
              >
                {quickTakeExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
            <p style={{ color: '#6b7280', marginTop: 8 }}>{artifacts.quick_take.one_line}</p>
            <ul style={{ paddingLeft: 18, marginTop: 8 }}>
              {quickBullets.map((b, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {b}
                </li>
              ))}
            </ul>
            {showCredibility && (
              <div style={{ marginTop: 10, padding: 10, border: '1px dashed #e5e7eb', borderRadius: 10 }}>
                <div style={{ fontWeight: 700 }}>Assumptions</div>
                <ul style={{ paddingLeft: 18 }}>
                  {artifacts.quick_take.assumptions.map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
                <div>Confidence: {artifacts.quick_take.confidence}</div>
              </div>
            )}
          </div>

          <div style={sectionStyle as any}>
            <div className="card">
              <h2 style={{ marginTop: 0 }}>Cones</h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {artifacts.cones.map((cone: Cone, idx: number) => (
                  <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{cone.name}</strong>
                      <span style={{ color: '#9ca3af' }}>Vignette</span>
                    </div>
                    <p style={{ color: '#6b7280' }}>{cone.vignette}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 13 }}>
                      <div>
                        <div style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: 11 }}>Drivers</div>
                        <ul style={{ paddingLeft: 16 }}>
                          {cone.drivers.map((d, dIdx) => (
                            <li key={dIdx}>{d}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: 11 }}>
                          Uncertainties
                        </div>
                        <ul style={{ paddingLeft: 16 }}>
                          {cone.uncertainties.map((u, uIdx) => (
                            <li key={uIdx}>{u}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: 11 }}>
                          Early signals
                        </div>
                        <ul style={{ paddingLeft: 16 }}>
                          {cone.early_signals.map((s, sIdx) => (
                            <li key={sIdx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 style={{ marginTop: 0 }}>Signals & Drivers</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {artifacts.signals_drivers.signals.map((signal, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>
                    <strong>{signal.title}</strong>
                    <div style={{ color: '#6b7280' }}>{signal.summary}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: 11 }}>Key drivers</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {artifacts.signals_drivers.drivers.map((driver, idx) => (
                    <span
                      key={idx}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 999,
                        padding: '6px 10px',
                        fontSize: 13
                      }}
                    >
                      {driver.name} — {driver.why}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={sectionStyle as any}>
            <div className="card">
              <h2 style={{ marginTop: 0 }}>Timeline</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {artifacts.timeline.milestones.map((m, idx) => (
                  <li key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ fontWeight: 700 }}>{m.when}</div>
                    <div>{m.what}</div>
                    <div style={{ color: '#6b7280' }}>{m.so_what}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h2 style={{ marginTop: 0 }}>Moves</h2>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <div style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: 11 }}>No regrets</div>
                  <ul>
                    {artifacts.moves.no_regrets.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: 11 }}>Options</div>
                  <ul>
                    {artifacts.moves.options.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: 11 }}>Watch outs</div>
                  <ul>
                    {artifacts.moves.watch_outs.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {loading && <LoaderOverlay text="exploring the future" />}
    </>
  );
}
