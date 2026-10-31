// Review tab — chat about the plan, AI review with "Add to plan", heritage reading leads. Owner: P4.
import React, { useEffect, useRef, useState } from 'react';
import { emit, useBus } from '../bus';
import { Badge, Section } from '../ui';
import { askAdvisor, heritageLeads, runReview, useTwinParams, type ChatMsg } from './review';

const SEVERITY: Record<string, string> = {
  critical: 'text-rose-300 border-rose-500/50',
  moderate: 'text-amber-300 border-amber-500/50',
  caution: 'text-slate-300 border-slate-600'
};
const SUGGESTIONS = ['What do I do first?', 'Which grants could fit?', 'What is still unverified?'];

export default function ReviewPanel() {
  const { space, proposal } = useBus();
  const params = useTwinParams();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ analysis: any; source: string; isAI: boolean } | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(null);
    setAdded([]);
    setChat([]);
  }, [space?.id]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [chat, asking]);

  if (!space || !proposal) return <p className="text-slate-400 text-xs">Open the plan first.</p>;

  const review = async () => {
    setBusy(true);
    setResult(await runReview(space, proposal, params));
    setBusy(false);
  };
  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || asking) return;
    const history = [...chat, { role: 'user' as const, text: question }];
    setChat(history);
    setInput('');
    setAsking(true);
    const reply = await askAdvisor(question, chat, space, proposal);
    setChat([...history, reply]);
    setAsking(false);
  };
  const addToPlan = (text: string) => {
    emit('plan:idea', text);
    setAdded((a) => [...a, text]);
  };

  const a = result?.analysis;
  const muted = 'text-[11px] text-slate-400';

  return (
    <div className="text-xs text-slate-300 leading-relaxed">
      <Section open title="Ask about this plan">
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {chat.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="text-right">
                <span className="inline-block bg-amber-500 text-slate-950 rounded-lg px-2 py-1 font-medium">{m.text}</span>
              </div>
            ) : (
              <div key={i} className="bg-[#121722] border border-[#1e2430] rounded-lg px-2 py-1.5">
                <div className="whitespace-pre-line">{m.text}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{m.source}</div>
              </div>
            )
          )}
          {asking && <div className={muted}>Thinking…</div>}
          <div ref={end} />
        </div>
        {chat.length === 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} className="px-2 py-0.5 rounded-full border border-[#1e2430] text-[11px] text-sky-300 hover:border-sky-400">
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          className="flex gap-1.5 mt-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Do I need a licence for the music?"
            className="flex-1 min-w-0 bg-[#090b10] border border-[#1e2430] rounded px-2 py-1"
          />
          <button disabled={asking || !input.trim()} className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold disabled:opacity-50">
            Ask
          </button>
        </form>
      </Section>

      <Section open title="Review the plan">
        <div className="flex items-center gap-2">
          <p className={`${muted} flex-1`}>Ideas and watch-outs to check with the agency, not decisions.</p>
          <button onClick={review} disabled={busy} className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold disabled:opacity-50">
            {busy ? 'Reviewing…' : result ? 'Review again' : 'Review my plan'}
          </button>
        </div>
        {a && (
          <>
            <p className="mt-2">
              <Badge s={result!.isAI ? 'assumption' : 'gap'} />
              <span className={muted}>{result!.source}</span>
            </p>
            <p className="mt-1">{a.strategicSummary}</p>
            <div className="mt-2 font-semibold text-slate-200">Ideas</div>
            <ul className="space-y-1.5">
              {(a.strengtheningRecommendations || []).map((r: any, i: number) => (
                <li key={i} className="flex gap-2">
                  <div className="flex-1">
                    <b className="text-white">{r.area}:</b> {r.concreteImprovement}
                    <div className={muted}>{r.issue}</div>
                  </div>
                  <button
                    onClick={() => addToPlan(r.concreteImprovement)}
                    disabled={added.includes(r.concreteImprovement)}
                    className="self-start shrink-0 px-2 py-0.5 rounded border border-emerald-500/50 text-[11px] text-emerald-300 disabled:opacity-60"
                  >
                    {added.includes(r.concreteImprovement) ? 'Added ✓' : 'Add to plan'}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 font-semibold text-slate-200">Watch-outs</div>
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
            {(a.verifiedVsAssumedSummary?.criticalGapsToClose || []).length > 0 && (
              <>
                <div className="mt-2 font-semibold text-slate-200">Confirm with agencies</div>
                <ul className={`list-disc pl-4 ${muted}`}>
                  {a.verifiedVsAssumedSummary.criticalGapsToClose.map((g: string, i: number) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </Section>

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
