// Layer 2 — Proposal, curation guidelines, workplan, funding. Owner: P3 (data files: P2).
// Listens "space:selected" → builds Proposal → emits "proposal:ready" (see CONTRACTS.md).
import React, { useEffect, useMemo, useState } from 'react';
import { api, emit, useBus } from '../bus';
import { Badge, Section, SourceLink } from '../ui';
import { buildProposal, loadData, loadEngine, mergeAiDraft, type Data } from './proposal';

export default function ProposalPanel({ onVisualise }: { onVisualise: () => void }) {
  const { space } = useBus();
  const [D, setD] = useState<Data | null>(null);
  const [Engine, setEngine] = useState<any>(null);
  const [err, setErr] = useState('');
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [ticketed, setTicketed] = useState(false);
  const [useLLM, setUseLLM] = useState(false);
  const [ai, setAi] = useState<any>(null);
  const [note, setNote] = useState('');
  const [brief, setBrief] = useState('');

  useEffect(() => {
    Promise.all([loadData(), loadEngine()])
      .then(([d, e]) => (d.template ? (setD(d), setEngine(() => e)) : setErr('template.json missing.')))
      .catch((e) => setErr(String(e.message || e)));
  }, []);

  // New space → reset the what-ifs (CONTRACTS: selecting a space clears proposal and render).
  useEffect(() => {
    setEnabled({});
    setTicketed(false);
    setAi(null);
  }, [space?.id]);

  const base = useMemo(
    () => (D && Engine && space ? buildProposal(D, Engine, space, { enabled, ticketed }) : null),
    [D, Engine, space, enabled, ticketed]
  );

  useEffect(() => {
    if (!useLLM || !base || !space) return setAi(null);
    let live = true;
    setNote('Drafting with AI…');
    api('proposal', { space, draft: base }).then((res) => {
      if (!live) return;
      setAi(res);
      setNote(res ? '' : 'AI drafting unavailable here — using the template.');
    });
    return () => {
      live = false;
    };
  }, [useLLM, base, space]);

  const p = useMemo(() => (base ? mergeAiDraft(base, ai) : null), [base, ai]);
  useEffect(() => {
    if (!p) return;
    setBrief(p.visual_brief);
    emit('proposal:ready', p); // unlock Layer 3 straight away
  }, [p]);

  if (err) return <p className="text-rose-400 text-xs">{err}</p>;
  if (!space) return <p className="text-slate-400 text-xs">Pick a site on the map first.</p>;
  if (!p || !D) return <p className="text-slate-400 text-xs">Loading…</p>;

  const srcById = (id: string) => D.sources.find((s) => s.id === id);
  const muted = 'text-[11px] text-slate-400';

  return (
    <div className="text-xs text-slate-300 leading-relaxed">
      <h2 className="text-sm font-bold text-white">{p.title}</h2>
      <p className={muted}>
        {p.event_start} → {p.event_end}
        {p.generated_by !== 'template' ? ` · written by ${p.generated_by}` : ''}
      </p>
      <p className="mt-1 mb-2 line-clamp-3">{p.summary}</p>

      <Section title="Plan & what-ifs">
        {D.template.components.map((c: any) => (
          <label key={c.id} className="block">
            <input
              type="checkbox"
              className="mr-1 accent-amber-500"
              checked={enabled[c.id] !== false}
              onChange={(e) => setEnabled({ ...enabled, [c.id]: e.target.checked })}
            />
            {c.label}
          </label>
        ))}
        <label className="block mt-2">
          <input type="checkbox" className="mr-1 accent-amber-500" checked={ticketed} onChange={(e) => setTicketed(e.target.checked)} />
          Charge for tickets
        </label>
        <label className="block">
          <input type="checkbox" checked={useLLM} onChange={(e) => setUseLLM(e.target.checked)} className="mr-1 accent-amber-500" />
          Rewrite with AI {note && <span className="text-amber-300">— {note}</span>}
        </label>
        {p.assumptions?.length > 0 && (
          <ul className={`list-disc pl-4 mt-2 ${muted}`}>{p.assumptions.map((a: string) => <li key={a}>{a}</li>)}</ul>
        )}
      </Section>

      <Section open title={`Steps (${p.workplan.length})`}>
        {p.workplan.length ? (
          p.workplan.map((s: any, i: number) => (
            <details key={s.id} className="mb-1">
              <summary className="cursor-pointer">
                {i + 1}. <b className="text-white">{s.agency}</b> — {s.requirement} <Badge s={s.status} />
              </summary>
              <div className={`pl-4 ${muted}`}>
                <div>Start by {s.start_by || 'unknown — ask the agency'}</div>
                <div>{s.why}</div>
                <div>
                  Source: <SourceLink source={s.source} />
                </div>
              </div>
            </details>
          ))
        ) : (
          <p className="text-slate-500">No steps for this plan.</p>
        )}
      </Section>

      <Section title={`Ideas to improve it (${p.guidelines.length})`}>
        <ul className="list-disc pl-4 space-y-1">
          {p.guidelines.map((g: any) => (
            <li key={g.id}>
              {g.text} <Badge s={g.status} />
              {g.source_id ? <> <SourceLink source={srcById(g.source_id)} /></> : null}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`Funding (${p.shortlist.length})`}>
        <p className={muted}>"Appears to meet" is not eligibility. Check with the agency.</p>
        {p.shortlist.length ? (
          p.shortlist.map((g: any) => (
            <details key={g.id} className="mt-1">
              <summary className="cursor-pointer">
                <b className="text-white">{g.name}</b>{' '}
                <span className={muted}>
                  meets {g.counts.met} · not {g.counts.not_met} · check {g.counts.unknown}
                </span>
              </summary>
              <div className="pl-4">
                <div className={muted}>
                  <SourceLink source={g.source} />
                  {g.max_amount_sgd ? ` · up to $${g.max_amount_sgd.toLocaleString()}` : ''}
                </div>
                <ul>
                  {g.criteria.map((c: any) => (
                    <li key={c.id}>
                      <Badge s={c.result} /> {c.text}
                    </li>
                  ))}
                </ul>
                {g.improvements.map((i: any) => (
                  <div key={i.criterion} className="border-l-2 border-amber-500 pl-2 my-1">Idea: {i.improvement}</div>
                ))}
                {g.overlap_warnings.map((w: any) => (
                  <div key={w.with} className="border-l-2 border-rose-500 pl-2 my-1">
                    May overlap with {w.with}
                  </div>
                ))}
              </div>
            </details>
          ))
        ) : (
          <p className="text-slate-500">No grants cover these activities.</p>
        )}
      </Section>

      <Section title={`Still to check (${p.gaps.length})`}>
        <ul className={`list-disc pl-4 ${muted}`}>
          {p.gaps.slice(0, 8).map((g: any, i: number) => (
            <li key={i}>{g.label}</li>
          ))}
        </ul>
      </Section>

      <Section title="Image brief">
        <textarea
          rows={4}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          className="w-full bg-[#090b10] border border-[#1e2430] rounded p-2 text-xs"
        />
      </Section>
      <button
        onClick={() => {
          emit('proposal:ready', { ...p, visual_brief: brief });
          onVisualise();
        }}
        className="mt-2 px-3 py-1.5 rounded bg-amber-500 text-slate-950 font-bold"
      >
        See it on site →
      </button>
    </div>
  );
}
