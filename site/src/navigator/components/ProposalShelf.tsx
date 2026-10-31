import React from 'react';
import { Proposal } from '../types/placemaking';
import { Plus, Check, Landmark, Building2, Trees } from 'lucide-react';

interface ProposalShelfProps {
  proposals: Proposal[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenCreate: () => void;
}

export const ProposalShelf: React.FC<ProposalShelfProps> = ({
  proposals,
  selectedId,
  onSelect,
  onOpenCreate,
}) => {
  const getTenureIcon = (tenure: string) => {
    switch (tenure) {
      case 'state_land_reserve':
        return <Landmark className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'hdb_void_deck':
        return <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'park_connector':
        return <Trees className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Landmark className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getTenureLabel = (tenure: string) => {
    switch (tenure) {
      case 'state_land_reserve':
        return 'SLA State Land (TOL Required)';
      case 'hdb_void_deck':
        return 'HDB Void Deck (Town Council)';
      case 'park_connector':
        return 'NParks Park Connector';
      default:
        return 'Public Civic Space';
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 py-4 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
              Placemaking Case Shelf
            </h2>
            <span className="text-xs text-slate-600 dark:text-slate-400">·</span>
            <span className="text-xs text-slate-600 dark:text-slate-400">Select a project to review clearance & funding</span>
          </div>
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-800 hover:underline transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Test Custom Proposal</span>
          </button>
        </div>

        {/* Shelf cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {proposals.map(proposal => {
            const isSelected = proposal.id === selectedId;
            return (
              <button
                key={proposal.id}
                onClick={() => onSelect(proposal.id)}
                className={`group text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-rose-600/80 dark:border-rose-500/80 shadow-md ring-1 ring-rose-600/30 dark:ring-rose-400/20'
                    : 'bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div>
                  {/* Top tenure indicator */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <div className="flex items-center gap-1.5 font-medium">
                      {getTenureIcon(proposal.venueTenure)}
                      <span className="truncate max-w-[200px]">{getTenureLabel(proposal.venueTenure)}</span>
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Case</span>
                      </span>
                    )}
                  </div>

                  {/* Title & precinct */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors">
                    {proposal.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {proposal.precinct}
                  </p>
                </div>

                {/* Bottom metadata strip */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                    S${proposal.totalBudget.toLocaleString()} SGD
                  </span>
                  <span>{proposal.durationDays} Days Duration</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
