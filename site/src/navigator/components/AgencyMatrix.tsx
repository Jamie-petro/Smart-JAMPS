import React, { useState } from 'react';
import { Proposal, AgencyRequirement } from '../types/placemaking';
import {
  Search,
  Filter,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Building2,
  Landmark,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface AgencyMatrixProps {
  proposal: Proposal;
  requirements: AgencyRequirement[];
}

export const AgencyMatrix: React.FC<AgencyMatrixProps> = ({
  proposal,
  requirements
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'applicable' | 'verified' | 'assumptions'>('all');

  const filtered = requirements.filter(req => {
    const matchesSearch =
      req.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.permitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.triggerReason.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'applicable') return req.isApplicable;
    if (filterType === 'verified') return req.status === 'verified_requirement';
    if (filterType === 'assumptions') return req.status === 'assumed_gap' || !!req.assumedContextGap;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter bar */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Singapore Agency Directory & Regulatory Matrix
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Statutory jurisdictions, contact channels, and risk parameters governing public space arts activations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search agency or permit..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-600 w-52"
              />
            </div>

            {/* Segmented Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({requirements.length})
              </button>
              <button
                onClick={() => setFilterType('applicable')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'applicable'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Triggered ({requirements.filter(r => r.isApplicable).length})
              </button>
              <button
                onClick={() => setFilterType('assumptions')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'assumptions'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Gaps to Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Agency Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(req => {
          return (
            <div
              key={req.agencyId}
              className={`bg-white dark:bg-slate-800/80 rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                req.isApplicable
                  ? 'border-slate-200 dark:border-slate-700'
                  : 'border-slate-100 dark:border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {req.agencyName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {req.statutoryLeadTimeWeeks} Weeks Lead
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-rose-700 dark:text-rose-400 mt-0.5">
                      {req.permitName}
                    </h3>
                  </div>

                  <a
                    href={req.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                    title="Open official portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Status indicator */}
                <div className="flex flex-wrap items-center gap-2 text-xs py-2 my-2 border-y border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-500">Status for Case:</span>
                  {req.isApplicable ? (
                    req.status === 'verified_requirement' ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Mandatory Verified Clearance
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        Conditional / Assumption to Verify
                      </span>
                    )
                  ) : (
                    <span className="text-slate-600 dark:text-slate-400 italic">
                      Exempt (Criteria not triggered)
                    </span>
                  )}
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-slate-500">Risk: </span>
                  <span
                    className={`font-semibold capitalize ${
                      req.riskSeverity === 'high'
                        ? 'text-rose-600'
                        : req.riskSeverity === 'medium'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {req.riskSeverity}
                  </span>
                </div>

                {/* Why Approach this agency */}
                <div className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                  <span className="font-semibold text-slate-900 dark:text-white">Why Approach: </span>
                  {req.triggerReason}
                </div>

                {/* Statutory rule details */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-white">Rule Basis: </span>
                    {req.verifiedRuleDetails}
                  </div>
                  {req.assumedContextGap && (
                    <div className="text-amber-800 dark:text-amber-300 leading-relaxed">
                      <span className="font-semibold">Assumption to Clarify: </span>
                      {req.assumedContextGap}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom footer with cost and legislation */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="truncate max-w-[240px]">Citation: {req.officialCitation}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[140px] text-right">
                  {req.costEstimate.split('+')[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
