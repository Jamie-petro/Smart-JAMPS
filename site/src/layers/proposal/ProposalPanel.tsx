// Layer 2 — Proposal, curation guidelines, workplan, funding. Owner: P3 (data files: P2).
// Listens "space:selected" → builds Proposal → emits "proposal:ready" (see CONTRACTS.md).
import React, { useEffect, useMemo, useState } from 'react';
import { api, emit, useBus } from '../bus';
import { Badge, Chip, H, SourceLink } from '../ui';
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
  if (!space) return <p className="text-slate-400 text-xs">Pick a site in the 3D map first.</p>;
  if (!p || !D) return <p className="text-slate-400 text-xs">Loading rules engine…</p>;

  const srcById = (id: string) => D.sources.find((s) => s.id === id);
  const byCat: Record<string, any[]> = {};
  p.guidelines.forEach((g: any) => (byCat[g.category] = byCat[g.category] || []).push(g));

  return (
    <div className="text-xs text-slate-300 leading-relaxed">
      <h2 className="text-sm font-bold text-white">{p.title}</h2>
      <p className="text-[11px] text-slate-400">
        {space.name} · {p.event_start} → {p.event_end} · drafted by {p.generated_by} · site data <Badge s={space.status} />
      </p>
      <p className="mt-1">{p.summary}</p>
      <label className="block mt-1 text-[11px] text-slate-400">
        <input type="checkbox" checked={useLLM} onChange={(e) => setUseLLM(e.target.checked)} className="mr-1 accent-amber-500" />
        Draft text with AI (needs backend) {note && <span className="text-amber-300">— {note}</span>}
      </label>

      <H>Activities</H>
      {D.template.components.map((c: any) => (
        <label key={c.id} className="block">
          <input
            type="checkbox"
            className="mr-1 accent-amber-500"
            checked={enabled[c.id] !== false}
            onChange={(e) => setEnabled({ ...enabled, [c.id]: e.target.checked })}
          />
          {c.label} <Chip>{c.type}</Chip>
        </label>
      ))}
      <H>What if…</H>
      <label className="block">
        <input type="checkbox" className="mr-1 accent-amber-500" checked={ticketed} onChange={(e) => setTicketed(e.target.checked)} />
        Charge for tickets (watch the steps and funding change)
      </label>
      {p.assumptions?.length > 0 && (
        <details className="text-[11px] text-slate-400 mt-1">
          <summary>Assumptions in this draft ({p.assumptions.length})</summary>
          <ul className="list-disc pl-4">{p.assumptions.map((a: string) => <li key={a}>{a}</li>)}</ul>
        </details>
      )}

      <H>Whom to approach, in order</H>
      <ol className="list-decimal pl-4 space-y-1.5">
        {p.workplan.length ? (
          p.workplan.map((s: any) => (
            <li key={s.id}>
              <b className="text-white">{s.agency}</b> — {s.requirement} <Badge s={s.status} />
              <div className="text-[11px] text-slate-400">
                Start by {s.start_by || 'unknown — check'} · {s.why} · <SourceLink source={s.source} />
              </div>
              <div className="text-[11px] text-slate-400">
                For: {s.matched_components.map((c: any) => <Chip key={c.id}>{c.label}</Chip>)}
                {s.note ? ` · ${s.note}` : ''}
              </div>
            </li>
          ))
        ) : (
          <li className="text-slate-500">No requirements matched.</li>
        )}
      </ol>

      <H>How to enhance & curate this event</H>
      {Object.keys(byCat).length ? (
        Object.entries(byCat).map(([cat, gs]) => (
          <div key={cat} className="mb-2">
            <b className="text-slate-200">{cat.replace('_', ' ')}</b>
            <ul className="list-disc pl-4">
              {gs.map((g) => (
                <li key={g.id}>
                  {g.text} <Badge s={g.status} />
                  <div className="text-[11px] text-slate-400">
                    {g.why}
                    {g.source_id ? <> · <SourceLink source={srcById(g.source_id)} /></> : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p className="text-slate-500">No guidelines match yet.</p>
      )}

      <H>Funding shortlist</H>
      <p className="text-[11px] text-slate-400">"Appears to meet" is not eligibility — check with the agency.</p>
      {p.shortlist.length ? (
        p.shortlist.map((g: any) => (
          <div key={g.id} className="border-t border-[#1e2430] py-1.5">
            <b className="text-white">{g.name}</b> <SourceLink source={g.source} />
            {g.max_amount_sgd ? <span className="text-slate-400"> · up to ${g.max_amount_sgd.toLocaleString()}</span> : null}
            <div className="text-[11px] text-slate-400">
              appears to meet {g.counts.met} · not met {g.counts.not_met} · check {g.counts.unknown}
            </div>
            <div className="text-[11px] text-slate-400">
              Could fund: {g.linked_components.map((c: any) => <Chip key={c.id}>{c.label}</Chip>)}
            </div>
            <ul className="pl-1">
              {g.criteria.map((c: any) => (
                <li key={c.id}>
                  <Badge s={c.result} /> {c.text} <Badge s={c.status} />
                </li>
              ))}
            </ul>
            {g.improvements.map((i: any) => (
              <div key={i.criterion} className="border-l-2 border-amber-500 pl-2 my-1">Improvement: {i.improvement}</div>
            ))}
            {g.overlap_warnings.map((w: any) => (
              <div key={w.with} className="border-l-2 border-rose-500 pl-2 my-1">
                Possible overlap with {w.with} — {w.rule} <Badge s={w.status} />
              </div>
            ))}
          </div>
        ))
      ) : (
        <p className="text-slate-500">No grants cover these activities.</p>
      )}

      <H>Still to check ({p.gaps.length})</H>
      <ul className="list-disc pl-4 text-[11px] text-slate-400">
        {p.gaps.slice(0, 8).map((g: any, i: number) => (
          <li key={i}>
            {g.label} — <Badge s={g.status} />
          </li>
        ))}
      </ul>

      <H>Visual brief (sent to Layer 3)</H>
      <textarea
        rows={4}
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        className="w-full bg-[#090b10] border border-[#1e2430] rounded p-2 text-xs"
      />
      <button
        onClick={() => {
          emit('proposal:ready', { ...p, visual_brief: brief });
          onVisualise();
        }}
        className="mt-2 px-3 py-1.5 rounded bg-amber-500 text-slate-950 font-bold"
      >
        Visualise this event →
      </button>
    </div>
  );
}
