import React, { useState } from 'react';
import { Proposal, AgencyRequirement } from '../types/placemaking';
import { X, Copy, Check, Printer, FileText, Download } from 'lucide-react';

interface SubmissionPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal;
  requirements: AgencyRequirement[];
  attachedCitations?: string[];
}

export const SubmissionPackModal: React.FC<SubmissionPackModalProps> = ({
  isOpen,
  onClose,
  proposal,
  requirements,
  attachedCitations = []
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const triggeredReqs = requirements.filter(r => r.isApplicable);

  const generateMarkdownDossier = () => {
    return `# ARTS-LED PLACEMAKING SUBMISSION DOSSIER (SINGAPORE)
Generated: ${new Date().toLocaleDateString('en-SG')} via Arts to Places Navigator

================================================================================
1. PROPOSAL IDENTIFICATION
================================================================================
Project Title: ${proposal.title}
Subtitle: ${proposal.subtitle}
Lead Collective / Artist: ${proposal.leadArtistCollective} (${proposal.applicantType.toUpperCase()})
Artform: ${proposal.artform}
Target Precinct: ${proposal.precinct}
Specific Location: ${proposal.locationSpecifics}
Venue Land Tenure: ${proposal.venueTenure.toUpperCase()}
Duration: ${proposal.durationDays} Days
Expected Footfall: ${proposal.expectedAudience.toLocaleString()} Visitors
Total Budget: SGD $${proposal.totalBudget.toLocaleString()}

Scope Parameters:
- Temporary Structures: ${proposal.hasTemporaryStructures ? `Yes (${proposal.structureHeightMeters}m height, ${proposal.structureFootprintSqm} sqm)` : 'None'}
- Sound Amplification: ${proposal.hasAmplifiedSound ? `Yes (Estimated ~${proposal.decibelEstimateDb} dB)` : 'Ambient acoustic only'}
- Evening/Night Lighting: ${proposal.nightLighting ? 'Yes (LEW Turn-on required)' : 'No'}
- Ticketing/Commercial: ${proposal.isTicketedOrPaid ? 'Ticketed/Commercial' : 'Free Public Access (Non-Commercial)'}

================================================================================
2. AGENCY CLEARANCE WORKPLAN & PREREQUISITES
================================================================================
${triggeredReqs
  .map(
    (r, i) => `[${i + 1}] ${r.agencyName}
    Permit/Licence: ${r.permitName}
    Phase: ${r.phase} (Lead Time: ${r.statutoryLeadTimeWeeks} weeks)
    Status: ${r.status.toUpperCase()}
    Official Citation: ${r.officialCitation}
    Trigger Rationale: ${r.triggerReason}
    Required Documents:
${r.mandatoryDocs.map(d => `      - ${d}`).join('\n')}
    Prerequisite Clearances:
${r.prerequisites.map(p => `      - ${p}`).join('\n')}
`
  )
  .join('\n')}

================================================================================
3. OURSG GRANTS BUDGET & CO-FUNDING SCHEDULE
================================================================================
${proposal.lineItems
  .map(
    li =>
      `- ${li.title.padEnd(50, ' ')} | SGD $${li.cost.toString().padStart(6, ' ')} | ${li.assignedGrant.padEnd(14, ' ')} | Allowable: ${li.isAllowableGovExpense ? 'YES' : 'NO'}`
  )
  .join('\n')}

Total Project Budget: SGD $${proposal.totalBudget.toLocaleString()}
Total Government Grant Requested: SGD $${proposal.lineItems
      .filter(l => l.assignedGrant !== 'SELF_COMMERCIAL' && l.assignedGrant !== 'UNASSIGNED')
      .reduce((s, l) => s + l.cost, 0)
      .toLocaleString()}

================================================================================
4. VERIFIED REGULATIONS VS ASSUMPTIONS DISCLOSURE
================================================================================
Verified Official Invariants:
- SLA TOL statutory lead time is minimum 4 weeks from receipt of complete plans.
- OurSG Grants enforces maximum 80% whole-of-government co-funding cap.
- No double-funding across identical budget line items between NAC P&P and URA Lively Places.
- SCDF TFSP required for covered tentage >300 sqm or structural electrical generator hookups.

Key Project Assumptions Requiring Site Confirmation:
${triggeredReqs
  .filter(r => !!r.assumedContextGap)
  .map(r => `- [${r.agencyId}] ${r.assumedContextGap}`)
  .join('\n')}

================================================================================
5. ATTACHED NLB HERITAGE ARCHIVES & RESEARCH CITATIONS
================================================================================
${
  attachedCitations.length > 0
    ? attachedCitations
        .map(
          (cId, idx) =>
            `[Citation ${idx + 1}] ID: ${cId}\nSource: National Library Board Singapore (NLB OpenWeb Services v2)\nPurpose: Substantiating site heritage resonance for NHB Heritage Project Grant & URA Place Management.`
        )
        .join('\n\n')
    : 'No NLB archival citations attached yet. (Use the NLB Heritage Archives tab to attach relevant historical records).'
}

--------------------------------------------------------------------------------
AI Strategic Deliberation Record:
- Platform: Google Gemini (Arts Placemaking AI Navigator)
- Session URL: https://share.gemini.google/3iOhLJGpEr7L
- Model: Gemini 3.8 Flash (Server-Side @google/genai)

Note: This document compiles curated regulatory guidelines from SLA, URA, NAC, SCDF, and BCA.
It does not constitute official approval. All applications must be submitted via Singpass/Corppass.
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdownDossier());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Official Agency Submission Dossier
              </h3>
              <p className="text-xs text-slate-500">
                Ready for Singpass / Corppass filing with SLA, URA & OurSG Grants
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-950/60 select-all">
          {generateMarkdownDossier()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Format: Standard Plaintext / Markdown</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
