import React, { useState } from 'react';
import { Proposal } from '../types/placemaking';
import {
  MapPin,
  Calendar,
  Users,
  Volume2,
  Layers,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

interface ProposalOverviewProps {
  proposal: Proposal;
  onNavigateTab: (tab: string) => void;
  onRunAIAudit: () => void;
  isAnalyzing: boolean;
}

export const ProposalOverview: React.FC<ProposalOverviewProps> = ({
  proposal,
  onNavigateTab,
  onRunAIAudit,
  isAnalyzing
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-6">
      {/* Hero Showcase Card */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Editorial Photo (5 cols) */}
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[380px] bg-slate-900 overflow-hidden">
            {!imgError ? (
              <img
                src={proposal.imagePath}
                alt={proposal.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-400 p-8 text-center">
                <div>
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                  <p className="text-sm font-semibold">{proposal.precinct}</p>
                  <p className="text-xs text-slate-500 mt-1">{proposal.artform}</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
              <div className="text-xs text-white/90 font-medium">
                <span>{proposal.locationSpecifics}</span>
              </div>
              <div className="text-[10px] text-amber-200/90 mt-1">AI-generated concept, not a design or approval.</div>
            </div>
          </div>

          {/* Right: Proposal Details (7 cols) */}
          <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="font-semibold text-rose-700 dark:text-rose-400">{proposal.artform}</span>
                <span aria-hidden="true">·</span>
                <span>{proposal.applicantType.replace('_', ' ').toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                <span>Led by {proposal.leadArtistCollective}</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {proposal.title}
              </h1>

              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {proposal.description}
              </p>

              {/* Core Parameters Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Duration</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
                    {proposal.durationDays} Days
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>Audience</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
                    {proposal.expectedAudience.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Structures</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {proposal.hasTemporaryStructures ? `${proposal.structureHeightMeters}m (Under 4m)` : 'None'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Sound</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
                    {proposal.hasAmplifiedSound ? `~${proposal.decibelEstimateDb} dB` : 'Ambient only'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action strip */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums text-sm">
                  S${proposal.totalBudget.toLocaleString()} SGD
                </span>
                <span>Total budget</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('timeline')}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors"
                >
                  <span>See timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onRunAIAudit}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg transition-all shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placemaking Objectives & Safety Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ground-Up Community & Placemaking Objectives */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Community involvement
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {proposal.communityInvolvementPlan}
          </p>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Key Objectives
            </h4>
            <ul className="space-y-1.5">
              {proposal.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Site Safety & Risk Mitigation Plan */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Safety
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {proposal.safetyPlan}
          </p>

          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Note: </span>
              Check every permit with the agency.
                          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
