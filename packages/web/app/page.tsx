import Link from 'next/link';

const features = [
  {
    title: 'Compose a foresight question',
    description: 'Set a horizon, perspective, and seed bias; everything is validated before it hits the generator.',
    badge: 'Input schema ready'
  },
  {
    title: 'Poll for generation results',
    description: 'UI is wired for a 202/303 loop so Vercel no longer serves a blank 404.',
    badge: 'Loader-first UX'
  },
  {
    title: 'Render the five artifacts',
    description: 'Quick take, cones, signals & drivers, timeline, and moves all have placeholders.',
    badge: 'Schema aligned'
  }
];

export default function Home() {
  return (
    <main>
      <header className="hero">
        <p className="chip">Foresight MVP scaffolding</p>
        <h1>Deploy-ready Next.js app so Vercel stops returning 404</h1>
        <p>
          This minimal UI gives Vercel a real Next.js entrypoint under <code>packages/web</code> and includes
          sensible defaults so you can plug in the generator API next.
        </p>
        <div className="button-row" style={{ justifyContent: 'center', marginTop: 20 }}>
          <Link className="primary-button" href="#get-started">
            Get started
          </Link>
          <Link className="primary-button" href="https://vercel.com/docs/deployments/configure-a-build" target="_blank" rel="noreferrer">
            Vercel build tips
          </Link>
        </div>
      </header>

      <section id="get-started" className="sections">
        <h2 className="section-heading">What changed</h2>
        <div className="grid">
          {features.map((feature) => (
            <article key={feature.title} className="card">
              <div className="card-title">
                <h3 style={{ margin: 0 }}>{feature.title}</h3>
                <span>{feature.badge}</span>
              </div>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>

        <article className="card">
          <div className="card-title">
            <h3 style={{ margin: 0 }}>Deploying on Vercel</h3>
            <span>Next.js 14</span>
          </div>
          <p>
            Point your Vercel project at the repository root. The workspace scripts forward to <code>packages/web</code> so
            the default build command <code>npm run build</code> picks up the Next.js app automatically.
          </p>
          <div className="badge-list">
            <span className="badge">root package.json with workspaces</span>
            <span className="badge">app/ directory + layout</span>
            <span className="badge">ESLint + TypeScript defaults</span>
          </div>
        </article>
      </section>
    </main>
  );
}
