import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LoaderOverlay } from '../src/components/LoaderOverlay';
import { startRun } from '../src/lib/api';
import type { GeneratePayload } from '../src/lib/types';

// TODO[codegen]: Wire UI pages ("/" and "/results/:id") to the client; stream loader overlay.

export default function Home() {
  const router = useRouter();
  const [question, setQuestion] = useState('What is the future of Project 2025');
  const [loading, setLoading] = useState(false);

  const triggerGenerate = async (payload: GeneratePayload) => {
    setLoading(true);
    const runId = await startRun(payload);
    setTimeout(() => {
      router.push(`/results/${runId}`);
    }, 400);
  };

  const handleSubmit = async () => {
    await triggerGenerate({
      question,
      horizon: 24,
      perspective: 'me',
      seed_bias: 'conservative',
      location: null
    });
  };

  const handlePreset = async () => {
    await triggerGenerate({
      question: 'What other people are wondering',
      horizon: 24,
      perspective: 'community',
      seed_bias: 'exploratory',
      location: null
    });
  };

  return (
    <>
      <Head>
        <title>Foresight | Compose</title>
      </Head>
      <div
        style={{
          minHeight: '100vh',
          background: '#f9fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '60px 20px'
        }}
      >
        <h1 style={{ fontSize: 42, fontWeight: 600, marginBottom: 32 }}>
          What Future should we explore?
        </h1>

        <div
          className="card"
          style={{
            width: 'min(900px, 90vw)',
            borderRadius: 30,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            height: 72
          }}
        >
          <button
            aria-label="Generate"
            onClick={handleSubmit}
            style={{
              marginLeft: 20,
              background: 'transparent',
              border: 'none',
              fontSize: 26,
              color: '#111827',
              cursor: 'pointer'
            }}
          >
            +
          </button>
          <input
            data-testid="question-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 20,
              color: '#111827'
            }}
          />
          <button
            aria-label="Generate"
            onClick={handleSubmit}
            style={{
              marginRight: 20,
              background: 'transparent',
              border: 'none',
              fontSize: 22,
              color: '#6b7280',
              cursor: 'pointer'
            }}
          >
            🎙️
          </button>
        </div>

        <button
          className="card"
          aria-label="What other people are wondering"
          onClick={handlePreset}
          style={{
            marginTop: 28,
            width: 'min(700px, 90vw)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 18px',
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #eceff4',
            boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <span
            aria-hidden
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background:
                'linear-gradient(135deg, #ffe3b3 0%, #ffd180 50%, #ff9f7a 100%)',
              display: 'inline-block'
            }}
          />
          <strong style={{ fontSize: 18 }}>Recent Projections</strong>
          <span style={{ color: '#9ca3af', marginLeft: 6, fontSize: 16 }}>
            What is the future of Project 2025
          </span>
        </button>
      </div>
      {loading && <LoaderOverlay text="exploring the future" />}
    </>
  );
}
