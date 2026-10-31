import React, { useState } from 'react';
import { Proposal, BudgetLineItem } from '../types/placemaking';
import { OFFICIAL_GRANTS, auditGrantCoFunding } from '../data/singaporeAgencies';
import {
  Coins,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  FileWarning
} from 'lucide-react';

interface FundingOptimizerProps {
  proposal: Proposal;
  onUpdateLineItems: (newLineItems: BudgetLineItem[]) => void;
}

export const FundingOptimizer: React.FC<FundingOptimizerProps> = ({
  proposal,
  onUpdateLineItems
}) => {
  const audit = auditGrantCoFunding(proposal);
  const [selectedGrantTab, setSelectedGrantTab] = useState<string>('NAC_PP');

  const handleGrantChange = (itemId: string, newGrant: BudgetLineItem['assignedGrant']) => {
    const updated = proposal.lineItems.map(item =>
      item.id === itemId ? { ...item, assignedGrant: newGrant } : item
    );
    onUpdateLineItems(updated);
  };

  const activeGrantDetail = OFFICIAL_GRANTS.find(g => g.id === selectedGrantTab) || OFFICIAL_GRANTS[0];

  return (
    <div className="space-y-6">
      {/* Co-Funding Status Dashboard */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">
              <Coins className="w-4 h-4" />
              <span>OurSG Grants Co-Funding Compliance Engine</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Government Co-Funding Ceilings & Non-Duplication Rules
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Under Singapore whole-of-government grant principles, arts groups cannot claim duplicate funding
              for the same cost components. Total government support is capped at 80% of allowable project costs.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-slate-500">Total Project</div>
              <div className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                S${audit.totalBudget.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-slate-500">NAC P&P Share</div>
              <div className="text-sm font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-0.5">
                S${audit.nacAmount.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-slate-500">URA LPF Share</div>
              <div className="text-sm font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-0.5">
                S${audit.uraAmount.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-slate-500">Self / Matching</div>
              <div className="text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                S${audit.selfAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 80% Cap Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                Total Government Co-Funding:
              </span>
              <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                S${audit.totalGovGrant.toLocaleString()} SGD ({audit.govSharePercentage}%)
              </span>
            </div>
            <span
              className={`font-semibold ${
                audit.govSharePercentage <= 80
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {audit.govSharePercentage <= 80
                ? 'Within 80% OurSG Limit'
                : 'Exceeds 80% Maximum Government Ceiling!'}
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
            {/* NAC segment */}
            <div
              style={{ width: `${(audit.nacAmount / audit.totalBudget) * 100}%` }}
              className="bg-rose-600 h-full transition-all"
              title={`NAC P&P: $${audit.nacAmount.toLocaleString()}`}
            />
            {/* URA segment */}
            <div
              style={{ width: `${(audit.uraAmount / audit.totalBudget) * 100}%` }}
              className="bg-blue-600 h-full transition-all"
              title={`URA Lively Places: $${audit.uraAmount.toLocaleString()}`}
            />
            {/* NHB segment */}
            <div
              style={{ width: `${(audit.nhbAmount / audit.totalBudget) * 100}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`NHB Heritage: $${audit.nhbAmount.toLocaleString()}`}
            />
            {/* Self funded remainder */}
            <div
              style={{ width: `${(audit.selfAmount / audit.totalBudget) * 100}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Self / Match: $${audit.selfAmount.toLocaleString()}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>NAC P&P ({Math.round((audit.nacAmount / audit.totalBudget) * 100)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>URA Lively Places ({Math.round((audit.uraAmount / audit.totalBudget) * 100)}%)</span>
            </div>
            {audit.nhbAmount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>NHB Heritage ({Math.round((audit.nhbAmount / audit.totalBudget) * 100)}%)</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Self-Funded / Sponsorship ({Math.round((audit.selfAmount / audit.totalBudget) * 100)}%)</span>
            </div>
          </div>
        </div>

        {/* Audit warnings / overlap flags */}
        {(audit.warnings.length > 0 || audit.overlaps.length > 0) && (
          <div className="mt-5 space-y-2">
            {audit.warnings.map((warn, i) => (
              <div
                key={i}
                className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{warn}</span>
              </div>
            ))}
            {audit.overlaps.map((ov, i) => (
              <div
                key={i}
                className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2"
              >
                <FileWarning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{ov}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grant Line-Item Budget Allocation Table */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Line-Item Assignment & Double-Funding Prevention
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Reassign budget items to match allowable grant scopes. Items marked as non-allowable (licensing fees, bonds) should be self-funded.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-100 dark:border-slate-700/60">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Budget Line Item</th>
                <th className="py-2.5 px-3 font-semibold">Cost (SGD)</th>
                <th className="py-2.5 px-3 font-semibold">Gov Grant Eligibility</th>
                <th className="py-2.5 px-3 font-semibold">Assigned Source</th>
                <th className="py-2.5 px-3 font-semibold">Justification / Restriction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {proposal.lineItems.map(item => {
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 capitalize">{item.category.replace('_', ' ')}</div>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      S${item.cost.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      {item.isAllowableGovExpense ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Allowable</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Non-Allowable (Deposit/Licence)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={item.assignedGrant}
                        onChange={e => handleGrantChange(item.id, e.target.value as any)}
                        className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-600"
                      >
                        <option value="NAC_PP">NAC P&P Grant</option>
                        <option value="URA_LIVELY">URA Lively Places</option>
                        <option value="NHB_HERITAGE">NHB Heritage Grant</option>
                        <option value="SELF_COMMERCIAL">Self / Non-Gov / Ticketing</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 max-w-xs text-[11px]">
                      {item.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Curated Official Grant Information Tabs */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Curated Official Grant Guidelines
          </h3>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
            {OFFICIAL_GRANTS.map(grant => (
              <button
                key={grant.id}
                onClick={() => setSelectedGrantTab(grant.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedGrantTab === grant.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {grant.id === 'NAC_PP' ? 'NAC P&P' : grant.id === 'URA_LIVELY' ? 'URA Lively Places' : 'NHB Heritage'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {activeGrantDetail.name}
              </div>
              <div className="text-slate-500 mt-0.5">Administered by {activeGrantDetail.agency}</div>
            </div>
            <a
              href={activeGrantDetail.officialPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>OurSG Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Allowable Expenses:</h4>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                {activeGrantDetail.allowableCostCategories.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Disallowed Line Items:</h4>
              <ul className="list-disc list-inside text-rose-700 dark:text-rose-400 space-y-1">
                {activeGrantDetail.disallowedExpenses.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">Double-Funding Restriction: </span>
            {activeGrantDetail.doubleFundingRule}
          </div>
        </div>
      </div>
    </div>
  );
};
