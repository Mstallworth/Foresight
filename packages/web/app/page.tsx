'use client';

import { FormEvent, useMemo, useState } from 'react';

const scenarioTemplates = [
  {
    id: 'A',
    title: 'Baseline momentum',
    color: '#38bdf8'
  },
  {
    id: 'B',
    title: 'Acceleration',
    color: '#a855f7'
  },
  {
    id: 'C',
    title: 'Headwinds',
    color: '#f97316'
  }
];

const starterQuestion = 'What happens to local newsrooms if AI writes most community updates?';

function deriveStructuredOutputs(statement: string) {
  const trimmed = statement.trim();
  const topic = trimmed || 'your focus area';
  const words = topic
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const focus = words.slice(0, 6).join(' ');
  const signals = words
    .slice(-5)
    .map((word, index) => ({ id: `${word}-${index}`, label: word }))
    .slice(0, 4);

  return {
    topic,
    focus,
    horizon: '18-36 months',
    actors: ['Policy makers', 'Market leaders', 'Communities', 'Emerging entrants'],
    disambiguation: [
      'Time horizon you care most about',
      'Geography or market segment',
      'Metrics that define success or failure'
    ],
    signals
  };
}

function buildScenarios(statement: string) {
  const base = statement.trim() || 'your chosen topic';

  return scenarioTemplates.map((scenario, idx) => ({
    ...scenario,
    outcome:
      idx === 0
        ? `${base} continues on its current trajectory with steady but uneven adoption.`
        : idx === 1
          ? `${base} accelerates as enablers line up, creating outsized momentum and new power players.`
          : `${base} faces friction from regulation, economics, or public pushback, slowing meaningful change.`,
    moves: [
      'Frame the decision points and owners',
      'Identify the few signals that flip the scenario',
      'List moves to double down or hedge'
    ]
  }));
}

export default function Home() {
  const [question, setQuestion] = useState(starterQuestion);
  const [submitted, setSubmitted] = useState(starterQuestion);

  const structuredOutputs = useMemo(() => deriveStructuredOutputs(submitted), [submitted]);
  const scenarios = useMemo(() => buildScenarios(submitted), [submitted]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(question.trim() || starterQuestion);
  };

  return (
    <main className="page">
      <section className="shell hero">
        <p className="chip">Foresight intake</p>
        <h1>What do you want to know the future of?</h1>
        <p className="lede">
          Start with a single sentence. The agent will disambiguate it the same way every time, pull out structured
          context, and set up three scenario states so you can pressure test your next move.
        </p>
        <form className="question-box" onSubmit={handleSubmit}>
          <label htmlFor="question">Describe the thing you want to explore</label>
          <div className="input-row">
            <textarea
              id="question"
              name="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: What happens to urban mobility if micro-EVs replace last-mile vans?"
              rows={3}
            />
            <button type="submit">Send</button>
          </div>
          <p className="hint">The agent will always clarify time horizon, geography, and success metrics.</p>
        </form>
      </section>

      <section className="shell grid three-col" aria-label="Agent outputs">
        <article className="card">
          <div className="card-title">
            <h3>Agent interpretation</h3>
            <span>Standard pass</span>
          </div>
          <p className="muted">Single pass that runs after you hit send.</p>
          <ul className="pill-list">
            <li><strong>Focus:</strong> {structuredOutputs.focus}</li>
            <li><strong>Horizon:</strong> {structuredOutputs.horizon}</li>
            <li>
              <strong>Actors:</strong> {structuredOutputs.actors.join(', ')}
            </li>
          </ul>
          <div className="question-set">
            <p className="muted">Disambiguation prompts</p>
            <ol>
              {structuredOutputs.disambiguation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </article>

        <article className="card">
          <div className="card-title">
            <h3>Structured outputs</h3>
            <span>Always returned</span>
          </div>
          <p className="muted">
            The agent maps your statement to consistent fields so downstream generators can run without extra cleanup.
          </p>
          <div className="output-block">
            <p>
              <strong>Topic:</strong> {structuredOutputs.topic}
            </p>
            <p>
              <strong>Signals to watch:</strong>
            </p>
            <div className="pill-row">
              {structuredOutputs.signals.map((signal) => (
                <span className="pill" key={signal.id}>
                  {signal.label}
                </span>
              ))}
            </div>
            <p>
              <strong>Context spine:</strong> intent → actors → stakes → signals → moves
            </p>
          </div>
        </article>

        <article className="card">
          <div className="card-title">
            <h3>State generation</h3>
            <span>Three scenarios</span>
          </div>
          <p className="muted">
            After disambiguation the agent seeds three stateful futures so you can explore how the topic plays out.
          </p>
          <div className="scenario-list">
            {scenarios.map((scenario) => (
              <div className="scenario" key={scenario.id}>
                <span className="scenario-badge" style={{ background: scenario.color }}>
                  {scenario.id}
                </span>
                <div>
                  <p className="scenario-title">{scenario.title}</p>
                  <p className="muted scenario-outcome">{scenario.outcome}</p>
                  <ul>
                    {scenario.moves.map((move) => (
                      <li key={`${scenario.id}-${move}`}>{move}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
