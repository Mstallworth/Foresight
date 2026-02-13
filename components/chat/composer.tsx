'use client';
import { Square, ArrowUp } from 'lucide-react';
import { FormEvent, KeyboardEvent, useState } from 'react';
import { Mode } from '@/lib/types';

export function Composer({ onSubmit, onStop, generating }: { onSubmit: (q: string, mode: Mode) => void; onStop: () => void; generating: boolean }) {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<Mode>('guided');

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!value.trim() || generating) return;
    onSubmit(value, mode);
    setValue('');
  };

  return (
    <form onSubmit={submit} className="sticky bottom-0 bg-white/90 backdrop-blur px-4 pb-4">
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-300 p-3 shadow-sm">
        <textarea
          aria-label="Compose exploration"
          className="max-h-40 min-h-20 w-full resize-y border-0 bg-transparent outline-none"
          value={value}
          placeholder="Describe a future to explore…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
            if (e.key === 'Escape') onStop();
          }}
        />
        <div className="mt-2 flex items-center justify-between">
          <select aria-label="Mode selector" value={mode} onChange={(e) => setMode(e.target.value as Mode)} className="rounded-full border px-3 py-1 text-sm">
            <option value="guided">Guided</option><option value="manual">Manual</option><option value="rapid">Rapid</option>
          </select>
          <button type={generating ? 'button' : 'submit'} onClick={generating ? onStop : undefined} className="rounded-full bg-zinc-900 p-2 text-white" aria-label={generating ? 'Stop generation' : 'Send'}>
            {generating ? <Square className="size-4" /> : <ArrowUp className="size-4" />}
          </button>
        </div>
      </div>
    </form>
  );
}
