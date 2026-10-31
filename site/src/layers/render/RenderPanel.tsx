// Layer 3 — AI concept visualisation of the proposed event. Owner: P4.
// Listens "proposal:ready" → builds prompt → POST /api/render → emits "render:ready" (see CONTRACTS.md).
import React, { useEffect, useState } from 'react';
import { emit, on, useBus } from '../bus';
import { buildPrompt, generate } from './render';

export default function RenderPanel() {
  const { space, proposal } = useBus();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1536x1024');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [gallery, setGallery] = useState<any[]>([]);

  useEffect(() => on('space:selected', () => setGallery([])), []);
  useEffect(() => {
    if (space && proposal) setPrompt(buildPrompt(space, proposal));
  }, [space, proposal]);

  if (!space || !proposal) return <p className="text-slate-400 text-xs">Finish a proposal in Layer 2 first.</p>;

  const go = async () => {
    setBusy(true);
    setNote('Generating image…');
    const { render, note } = await generate(space, proposal, prompt, size);
    setGallery((g) => [render, ...g]);
    emit('render:ready', render);
    setNote(note);
    setBusy(false);
  };

  return (
    <div className="text-xs text-slate-300">
      <h2 className="text-sm font-bold text-white">Visualise: {proposal.title}</h2>
      <p className="text-[11px] text-amber-300">AI-generated concept, not a design or approval.</p>
      <h3 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 mt-3 mb-1">Prompt (editable)</h3>
      <textarea
        rows={7}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full bg-[#090b10] border border-[#1e2430] rounded p-2 text-[11px]"
      />
      <div className="flex items-center gap-2 mt-2">
        <label className="text-[11px] text-slate-400">
          Size{' '}
          <select value={size} onChange={(e) => setSize(e.target.value)} className="bg-[#090b10] border border-[#1e2430] rounded px-1">
            <option>1536x1024</option>
            <option>1024x1024</option>
            <option>1024x1536</option>
          </select>
        </label>
        <button onClick={go} disabled={busy} className="px-3 py-1.5 rounded bg-amber-500 text-slate-950 font-bold disabled:opacity-50">
          {busy ? 'Generating…' : 'Generate image'}
        </button>
      </div>
      {note && <p className="text-[11px] text-slate-400 mt-1">{note}</p>}
      <div className="grid gap-2 mt-2">
        {gallery.map((r) =>
          r.images.map((im: any, i: number) => (
            <figure key={r.id + i} className="m-0">
              <img src={im.src} alt={im.alt} className="w-full rounded border border-[#1e2430]" />
              <figcaption className="text-[10px] text-slate-400">
                AI-generated concept, not a design or approval · {r.model}
                {r.is_demo && r.model !== 'demo' ? ' · demo' : ''} · {r.generated_at.slice(11, 16)}
              </figcaption>
            </figure>
          ))
        )}
      </div>
    </div>
  );
}
