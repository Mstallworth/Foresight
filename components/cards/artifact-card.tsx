import { ReactNode } from 'react';

export function ArtifactCard({ title, children, collapsible = false, open = true }: { title: string; children: ReactNode; collapsible?: boolean; open?: boolean }) {
  return (
    <details open={collapsible ? open : true} className="rounded-2xl border border-zinc-200 bg-white p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold">{title}</summary>
      <div className="mt-3 text-sm text-zinc-700">{children}</div>
    </details>
  );
}
