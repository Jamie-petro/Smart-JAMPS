// Review tab — AI review of the plan + heritage reading leads (from the render-layer zip). Owner: P4.
import React, { useEffect, useState } from 'react';
import { useBus } from '../bus';
import { Badge, Section } from '../ui';
import { heritageLeads, runReview, useTwinParams } from './review';

const SEVERITY: Record<string, string> = {
  critical: 'text-rose-300 border-rose-500/50',
  moderate: 'text-amber-300 border-amber-500/50',
  caution: 'text-slate-300 border-slate-600'
};

export default function ReviewPanel() {
  const { space, proposal } = useBus();
  const params = useTwinParams();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ analysis: any; source: string; isAI: boolean } | null>(null);

  useEffect(() => setResult(null), [space?.id]);

  if (!space || !proposal) return <p className="text-slate-400 text-xs">Open the plan first.</p>;

  const go = async () => {
    setBusy(true);
    setResult(await runReview(space, proposal, params));
    setBusy(false);
  };
  const a = result?.analysis;
  const muted = 'text-[11px] text-slate-400';

  return (
    <div className="text-xs text-slate-300 leading-relaxed">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-white flex-1">Review: {proposal.title}</h2>
        <button onClick={go} disabled={busy} className="px-3 py-1.5 rounded bg-amber-500 text-slate-950 font-bold disabled:opacity-50">
          {busy ? 'Reviewing…' : result ? 'Review again' : 'Review my plan'}
        </button>
      </div>
      <p className={muted}>Suggestions to check with the agency, not decisions.</p>

      {a && (
        <>
          <p className="mt-2">
            <Badge s={result!.isAI ? 'assumption' : 'gap'} />
            <span className={muted}>{result!.source}</span>
          </p>
          <p className="mt-1">{a.strategicSummary}</p>

          <Section open title={`Ideas (${a.strengtheningRecommendations?.length || 0})`}>
            <ul className="space-y-1.5">
              {(a.strengtheningRecommendations || []).map((r: any, i: number) => (
                <li key={i}>
                  <b className="text-white">{r.area}:</b> {r.concreteImprovement}
                  <div className={muted}>{r.issue}</div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={`Watch-outs (${a.regulatoryWarnings?.length || 0})`}>
            <ul className="space-y-1.5">
              {(a.regulatoryWarnings || []).map((w: any, i: number) => (
                <li key={i}>
                  <span className={`inline-block text-[10px] font-mono px-1.5 rounded border mr-1 ${SEVERITY[w.severity] || SEVERITY.caution}`}>
                    {w.agency}
                  </span>
                  {w.warning}
                  <div className={muted}>Fix: {w.actionableFix}</div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={`Confirm with agencies (${a.verifiedVsAssumedSummary?.criticalGapsToClose?.length || 0})`}>
            <ul className={`list-disc pl-4 ${muted}`}>
              {(a.verifiedVsAssumedSummary?.criticalGapsToClose || []).map((g: string, i: number) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </Section>
        </>
      )}

      <Section title="Heritage reading leads">
        <p className={muted}>
          From the render-layer draft and not yet checked. Confirm each title on{' '}
          <a href="https://www.nlb.gov.sg/" target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline">
            NLB
          </a>{' '}
          before citing it.
        </p>
        <ul className="mt-1 space-y-1">
          {heritageLeads(space).map((r) => (
            <li key={r.id}>
              <Badge s="gap" />
              <b className="text-white">{r.title}</b> <span className={muted}>· {r.author}, {r.publishYear} · {r.format}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
