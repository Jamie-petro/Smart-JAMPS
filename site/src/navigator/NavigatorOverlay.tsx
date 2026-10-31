// Full-screen view of the grant & agency navigator, opened from the layer dock. Owner: P4.
import React from 'react';
import NavigatorApp from './NavigatorApp';
import { useTwinCase } from './fromTwin';

export default function NavigatorOverlay({ onClose }: { onClose: () => void }) {
  const twinCase = useTwinCase();
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-100 dark:bg-slate-950">
      <button
        onClick={onClose}
        className="fixed bottom-4 right-4 z-[70] px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 text-xs font-bold shadow-xl"
      >
        ← Back to map
      </button>
      <NavigatorApp twinCase={twinCase} />
    </div>
  );
}
