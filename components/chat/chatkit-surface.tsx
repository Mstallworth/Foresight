import { Exploration, Mode, PreferableFuture } from '@/lib/types';

export function ChatKitSurface({ exploration, tab, onSubmit }: { exploration: Exploration | null; tab: string; onSubmit: (q: string, mode: Mode) => void; onStop: () => void; onSaveFuture: (f: Omit<PreferableFuture, 'id' | 'createdAt'>) => void }) {
  return (
    <div className="flex flex-1 items-center justify-center text-zinc-500">
      ChatKit mode flag is enabled but adapter is currently a stub. Tab: {tab}, active exploration: {exploration?.title ?? 'none'}
      <button className="ml-2 rounded-full border px-3 py-1" onClick={() => onSubmit('Demo ChatKit fallback prompt', 'guided')}>Run demo</button>
    </div>
  );
}
