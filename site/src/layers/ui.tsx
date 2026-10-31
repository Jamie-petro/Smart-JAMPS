// Small shared UI pieces for the layer panels. Owner: P5.
import React from 'react';

const BADGE: Record<string, string> = {
  verified: 'text-emerald-300 border-emerald-500/50',
  met: 'text-emerald-300 border-emerald-500/50',
  assumption: 'text-amber-300 border-amber-500/50',
  unknown: 'text-amber-300 border-amber-500/50',
  'needs check': 'text-amber-300 border-amber-500/50',
  gap: 'text-rose-300 border-rose-500/50',
  not_met: 'text-rose-300 border-rose-500/50'
};

export function Badge({ s }: { s: string }) {
  return (
    <span className={`inline-block text-[10px] font-mono px-1.5 rounded border mr-1 whitespace-nowrap ${BADGE[s] || 'text-slate-300 border-slate-600'}`}>
      {s.replace('_', ' ')}
    </span>
  );
}

export function SourceLink({ source }: { source: any }) {
  if (!source) return <span className="text-slate-500">no source</span>;
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline">
      {source.agency}
    </a>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[10px] px-1.5 py-px rounded-full bg-[#161c28] border border-[#1e2430] mr-1 mb-0.5">
      {children}
    </span>
  );
}

export function H({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 mt-4 mb-1.5">{children}</h3>;
}

// Collapsible section: one line until opened.
export function Section({ title, open, children }: { title: React.ReactNode; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="border-t border-[#1e2430] py-2 group">
      <summary className="cursor-pointer list-none flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
        <span className="text-slate-500 group-open:rotate-90 transition-transform">›</span>
        {title}
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
