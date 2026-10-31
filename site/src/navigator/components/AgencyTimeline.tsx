import React, { useState } from 'react';
import { Proposal, AgencyRequirement } from '../types/placemaking';
import {
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Landmark,
  ShieldAlert,
  Building,
  Radio,
  Sparkles
} from 'lucide-react';

interface AgencyTimelineProps {
  proposal: Proposal;
  requirements: AgencyRequirement[];
  onSelectAgency: (agencyId: string) => void;
}

export const AgencyTimeline: React.FC<AgencyTimelineProps> = ({
  proposal,
  requirements,
  onSelectAgency
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleComplete = (id: string) => {
    setCompletedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const phases = [
    {
      id: 'T-16 (Strategy & Grant Window)',
      title: 'T-16 to T-12 Weeks',
      label: 'Phase 1: Grant Windows & Tenure In-Principle',
      description: 'Apply for OurSG Grants (NAC P&P / URA Lively Places) and initiate SLA State Land / venue site checks.',
      agencies: ['NAC', 'URA', 'SLA']
    },
    {
      id: 'T-12 (Land Tenure & Venue Agreement)',
      title: 'T-12 to T-8 Weeks',
      label: 'Phase 2: Formal Land Tenure & Site Agreement',
      description: 'Submit formal SLA Temporary Occupation Licence (TOL) or Town Council / NParks booking.',
      agencies: ['SLA', 'NPARKS', 'TOWN_COUNCIL']
    },
    {
      id: 'T-8 (Urban Planning & Place Clearances)',
      title: 'T-8 to T-4 Weeks',
      label: 'Phase 3: Urban Planning & Conservation Review',
      description: 'Secure URA Place Management endorsement, merchant alignment, and pedestrian circulation permits.',
      agencies: ['URA']
    },
    {
      id: 'T-4 (Safety, Structures & Licences)',
      title: 'T-4 to T-1 Weeks',
      label: 'Phase 4: Safety, Structural & Performance Licences',
      description: 'File SCDF Fire Safety, BCA structural review if >4m, IMDA classification, and SPF police permits.',
      agencies: ['SCDF', 'BCA', 'IMDA', 'SPF']
    },
    {
      id: 'T-1 (Site Setup, Inspection & Handover)',
      title: 'T-1 Week to Day 0',
      label: 'Phase 5: Ingress, LEW Turn-On & Site Handover',
      description: 'On-site Licensed Electrical Worker (LEW) inspection, fire extinguisher placement, and site opening.',
      agencies: ['SLA', 'SCDF']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">
              <Clock className="w-4 h-4" />
              <span>Critical-Path Agency Workplan</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Official Approval Sequence & Statutory Lead Times
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Every agency clearance is anchored in official Singapore statutory guidelines.
              Pay special attention to prerequisite chains (e.g., SLA requires URA and SCDF clearance before issuing a TOL).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <div className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {requirements.filter(r => r.isApplicable).length}
              </div>
              <div className="text-slate-500 text-[11px]">Agencies to Clear</div>
            </div>
            <div className="w-px h-7 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {Object.values(completedSteps).filter(Boolean).length}
              </div>
              <div className="text-slate-500 text-[11px]">Milestones Marked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phased Roadmap Sequence */}
      <div className="space-y-6">
        {phases.map((phase, pIndex) => {
          const phaseReqs = requirements.filter(
            r => r.phase === phase.id && r.isApplicable
          );

          return (
            <div
              key={phase.id}
              className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
            >
              {/* Phase header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center font-mono">
                    0{pIndex + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                      {phase.title}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {phase.label}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md hidden sm:block text-right">
                  {phase.description}
                </p>
              </div>

              {/* Phase agency cards */}
              {phaseReqs.length > 0 ? (
                <div className="space-y-3">
                  {phaseReqs.map(req => {
                    const isDone = !!completedSteps[req.agencyId];
                    const isExpanded = expandedCard === req.agencyId;

                    return (
                      <div
                        key={req.agencyId}
                        className={`border rounded-xl transition-all ${
                          isDone
                            ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-80'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleComplete(req.agencyId)}
                              aria-label={`Mark ${req.agencyName} as ready`}
                              className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                                isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-rose-600'
                              }`}
                            >
                              {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>

                            <div>
                              <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {req.agencyName}
                                </span>
                                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>

                                {/* Verified Requirement vs Assumption Badge */}
                                {req.status === 'verified_requirement' ? (
                                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                    Verified Statutory Rule
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                    Assumption to Verify
                                  </span>
                                )}

                                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                                <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                                  {req.statutoryLeadTimeWeeks} Weeks Lead Time
                                </span>
                              </div>

                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {req.permitName}
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                {req.triggerReason}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <a
                              href={req.portalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1"
                              title="Official government e-service"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="sr-only sm:not-sr-only">Portal</span>
                            </a>
                            <button
                              onClick={() => setExpandedCard(isExpanded ? null : req.agencyId)}
                              className="text-xs font-semibold px-2.5 py-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <span>{isExpanded ? 'Less' : 'Details'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable details panel */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Prerequisites */}
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                                  <FileCheck className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Prerequisites Before Applying:</span>
                                </h4>
                                <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-300 pl-1">
                                  {req.prerequisites.map((p, i) => (
                                    <li key={i}>{p}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Mandatory Docs */}
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Required Submission Documents:</span>
                                </h4>
                                <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-300 pl-1">
                                  {req.mandatoryDocs.map((doc, i) => (
                                    <li key={i}>{doc}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Verification note & Citation */}
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                              <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                <span className="font-bold text-slate-900 dark:text-white">Legal Grounding: </span>
                                {req.verifiedRuleDetails}
                              </div>
                              {req.assumedContextGap && (
                                <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                                  <span className="font-bold">Assumption to Clarify: </span>
                                  {req.assumedContextGap}
                                </div>
                              )}
                              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5">
                                Authority citation: <span className="font-mono">{req.officialCitation}</span> · Est. fee: {req.costEstimate}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-600 dark:text-slate-400 py-3 italic">
                  No statutory clearances triggered for this project in this timeframe phase.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
