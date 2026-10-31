// Dock that hosts Layer 2 (Plan), Layer 3 (Image) and the review tools on top of the Layer 1 digital twin. Owner: P5.
// Layer 1 (App.tsx) is not modified: we listen to its "artsToPlaces:stateChange" window event
// and turn the selected site into a Space ("space:selected").
import React, { useEffect, useRef, useState } from 'react';
import { emit, useBus } from './bus';
import { toSpace } from './space';
import ProposalPanel from './proposal/ProposalPanel';
import RenderPanel from './render/RenderPanel';
import ReviewPanel from './review/ReviewPanel';

type Tab = 'proposal' | 'render' | 'review';

export default function LayerDock() {
  const { space, proposal } = useBus();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('proposal');
  const last = useRef('');

  useEffect(() => {
    const onState = (e: any) => {
      const d = e.detail || {};
      if (!d.site) return;
      const key = `${d.site.id}|${d.proposalParameters?.crowdSize ?? ''}`;
      if (key === last.current) return;
      last.current = key;
      emit('space:selected', toSpace(d.site, d.proposalParameters));
    };
    window.addEventListener('artsToPlaces:stateChange', onState);
    return () => window.removeEventListener('artsToPlaces:stateChange', onState);
  }, []);

  const tabs: { id: Tab; label: string; ready: boolean }[] = [
    { id: 'proposal', label: 'Plan', ready: !!space },
    { id: 'render', label: 'Image', ready: !!proposal },
    { id: 'review', label: 'Review', ready: !!proposal }
  ];

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-1/2 lg:left-[calc(50%-190px)] -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-xl"
      >
        Plan this site{space ? `: ${space.name}` : ''} →
      </button>
    );

  return (
    <section className="fixed bottom-4 left-1/2 lg:left-[calc(50%-190px)] -translate-x-1/2 z-40 w-[min(760px,94vw)] lg:w-[min(680px,calc(100vw-460px))] h-[62vh] bg-[#0e121b]/97 backdrop-blur-md border border-[#1e2430] rounded-xl shadow-2xl flex flex-col">
      <header className="h-10 px-3 border-b border-[#1e2430] flex items-center gap-1 shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            disabled={!t.ready}
            onClick={() => setTab(t.id)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold disabled:opacity-40 ${
              tab === t.id ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-[#161c28]'
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-slate-500 hidden sm:inline">Guidance only, not approval</span>
        <button onClick={() => setOpen(false)} className="ml-2 px-2 text-slate-400 hover:text-white" title="Minimise">
          ▾
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-3">
        {/* All stay mounted so their state survives tab switches. */}
        <div hidden={tab !== 'proposal'}>
          <ProposalPanel onVisualise={() => setTab('render')} />
        </div>
        <div hidden={tab !== 'render'}>
          <RenderPanel />
        </div>
        <div hidden={tab !== 'review'}>
          <ReviewPanel />
        </div>
      </div>
    </section>
  );
}
