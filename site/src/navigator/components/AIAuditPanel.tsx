import React from 'react';
import { Proposal, AIAnalysisResult } from '../types/placemaking';
import {
  Sparkles,
  Check,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  FileText,
  ExternalLink
} from 'lucide-react';

interface AIAuditPanelProps {
  proposal: Proposal;
  analysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  onRunAudit: () => void;
  onApplyImprovement: (improvement: AIAnalysisResult['strengtheningRecommendations'][0]) => void;
  analysisSource?: string;
}

export const AIAuditPanel: React.FC<AIAuditPanelProps> = ({
  proposal,
  analysis,
  isAnalyzing,
  onRunAudit,
  onApplyImprovement,
  analysisSource
}) => {
  return (
    <div className="space-y-6">
      {/* Header Audit Card */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>AI Proposal Strengthening Copilot</span>
              {analysisSource && (
                <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400">
                  · Powered by {analysisSource}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Eligibility Gap Detection & Regulatory Feasibility Audit
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Analyzes proposal parameters against Singapore public agency clearance thresholds (SLA, URA, SCDF, BCA)
              and OurSG Grants evaluation rubrics to pinpoint concrete, non-misrepresentative enhancements.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <a
              href="https://share.gemini.google/3iOhLJGpEr7L"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-colors border border-rose-200/80 dark:border-rose-900/60 shadow-sm"
              title="Open Arts Placemaking AI Navigator thread on Google Gemini"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open in Gemini</span>
              <ExternalLink className="w-3 h-3 text-rose-500" />
            </a>

            <button
              onClick={onRunAudit}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 active:scale-95 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Proposal...' : 'Re-Run AI Audit'}</span>
            </button>
          </div>
        </div>

        {/* Strategic Summary */}
        {analysis ? (
          <div className="pt-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Executive Feasibility Assessment
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {analysis.strategicSummary}
              </p>
            </div>

            {/* Quick Metrics Bar: Verified vs Assumed */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500">Verified Statutory Clearances</div>
                <div className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {analysis.verifiedVsAssumedSummary.verifiedCount} Requirements Anchored
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500">Contextual Assumptions</div>
                <div className="text-base font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
                  {analysis.verifiedVsAssumedSummary.assumptionsCount} Gaps to Verify
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500">Double-Funding Integrity</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  100% Segregated Line Items
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            Click "Re-Run AI Audit" to analyse this proposal with Gemini (falls back to fixed rule-based advice when the AI is unavailable).
          </div>
        )}
      </div>

      {analysis && (
        <>
          {/* Concrete Strengthening Recommendations */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Genuine Enhancements to Strengthen Grant Eligibility
              </h3>
            </div>

            <div className="space-y-4">
              {analysis.strengtheningRecommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {rec.area}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span>Targeted Support:</span>
                        <span className="font-semibold text-rose-700 dark:text-rose-400">
                          {rec.targetedGrants.join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                      <span className="font-semibold text-rose-700 dark:text-rose-400">Identified Vulnerability: </span>
                      {rec.issue}
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 mb-2.5">
                      <div className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">Actionable Revision: </span>
                        {rec.concreteImprovement}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Impact Mechanism: </span>
                      {rec.impactExplanation}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end">
                    <button
                      onClick={() => onApplyImprovement(rec)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-lg transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Enhancement to Proposal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Pitfalls & Risk Mitigations */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Statutory Red Flags & Clearance Traps
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.regulatoryWarnings.map((warn, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {warn.agency} Jurisdiction Warning
                      </span>
                      <span
                        className={`font-semibold capitalize text-[11px] ${
                          warn.severity === 'critical'
                            ? 'text-rose-600'
                            : warn.severity === 'moderate'
                            ? 'text-amber-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {warn.severity} Risk
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      {warn.warning}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">Mitigation Fix: </span>
                    {warn.actionableFix}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cashflow & Grant Milestone Tips */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              OurSG Grants Milestone & Cashflow Strategy
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {analysis.coFundingStrategy.cashflowMilestoneTip}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Critical Audit Invariant: </span>
              {analysis.coFundingStrategy.doubleFundingRisks[0]}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
