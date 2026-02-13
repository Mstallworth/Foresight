'use client';

import { useEffect, useState } from 'react';

const prompts = [
  'What are the geo-sociopolitical impacts of a space elevator?',
  'How could Project 2025 affect my community?',
  'How might quantum computing impact under-developed countries?',
  'What happens to the U.S. if another country develops AGI first?',
];

export function RotatingPrompts() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || paused) return;
    const id = setInterval(() => setI((v) => (v + 1) % prompts.length), 2000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="mt-20 max-w-md text-3xl font-medium text-white/90 transition-opacity duration-500">
      {prompts[i]}
    </div>
  );
}
