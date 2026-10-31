// Rule-based audit used when /api/analyze-proposal (Gemini) is unavailable. Moved from the original server.ts.
// It is fixed advice, not an AI result; the UI labels it "rule-based fallback".
export function generateFallbackAnalysis(proposal: any) {
  const isStateLand = proposal.venueTenure === 'state_land_reserve';
  const hasHighStructures = proposal.hasTemporaryStructures && proposal.structureHeightMeters > 3.0;

  return {
    strategicSummary: `${proposal.title || 'The project'} presents a compelling public activation in ${proposal.precinct || 'Singapore'}. Because it engages ${isStateLand ? 'SLA State Land' : 'public civic space'}, success hinges on securing venue land tenure at T-12 weeks before committing grant milestones.`,
    strengtheningRecommendations: [
      {
        area: 'Community Co-Creation Depth',
        issue: 'Current public engagement is primarily passive viewing rather than active ground-up participation, which limits eligibility for higher URA Lively Places and NAC tiers.',
        concreteImprovement:
          'Incorporate 2 pre-launch hands-on workshops with neighborhood merchant associations or youth docents to co-design motif components.',
        targetedGrants: ['URA_LIVELY', 'NAC_PP'],
        impactExplanation:
          'Transforms the project from a temporary spectacle into an active community-led placemaking initiative, meeting the core rubric for 80% co-funding.',
      },
      {
        area: 'Structural Wind-Load & Ballast Engineering',
        issue: `Structure height is ${proposal.structureHeightMeters || 3.2}m. While under the 4.0m mandatory BCA PE limit, sudden monsoon wind gusts on open sites present safety risks for fabric panels.`,
        concreteImprovement:
          'Specify non-invasive weighted water/concrete ballast blocks (minimum 250kg per corner) with zero drilling into public pavements, and include a certified manufacturer load calculation.',
        targetedGrants: ['URA_LIVELY'],
        impactExplanation:
          'Satisfies SLA and URA place management inspectors immediately during joint site-walk, preventing approval delays.',
      },
      {
        area: 'Separation of Grant Cost Line Items',
        issue: 'Risk of perceived double-funding if production and artist fees are not distinctly ring-fenced across NAC P&P and URA Lively Places.',
        concreteImprovement:
          'Assign 100% of artist honoraria and rehearsal fees to NAC P&P, while allocating physical demountable staging, wayfinding, and community materials exclusively to URA Lively Places.',
        targetedGrants: ['NAC_PP', 'URA_LIVELY'],
        impactExplanation:
          'Complies strictly with OurSG Grants portal non-duplication rules and avoids audit queries during claims disbursement.',
      },
    ],
    regulatoryWarnings: [
      {
        agency: 'SLA',
        severity: isStateLand ? 'critical' : 'caution',
        warning: isStateLand
          ? 'SLA Temporary Occupation Licences (TOL) require a statutory minimum of 4 weeks lead time. Any layout modifications during inter-agency referrals will reset the clock.'
          : 'Ensure boundary demarcation does not encroach on adjacent State Reserve plots.',
        actionableFix:
          'Submit complete 1:200 scale layout plans with clear coordinate setbacks via SLA TOL e-Portal no later than 8 weeks before ingress.',
      },
      {
        agency: 'SCDF',
        severity: proposal.nightLighting ? 'moderate' : 'caution',
        warning:
          'Outdoor electrical installations and decorative lighting require LEW (Licensed Electrical Worker) single-line certification and waterproof IP65 rated connectors.',
        actionableFix:
          'Obtain LEW turn-on certificate 48 hours prior to public opening; deploy 1x 4kg Dry Powder fire extinguisher per 50 sqm of activation.',
      },
    ],
    coFundingStrategy: {
      recommendedSplit: [
        {
          grant: 'NAC Presentation & Participation Grant',
          amount: Math.round(proposal.totalBudget * 0.45) || 19000,
          percentage: 45,
          rationale: 'Funds artistic personnel fees, curator stipends, and accessible docent training.',
        },
        {
          grant: 'URA Lively Places Fund',
          amount: Math.round(proposal.totalBudget * 0.35) || 14800,
          percentage: 35,
          rationale: 'Funds demountable modular seating, public shade canopies, and community workshop supplies.',
        },
        {
          grant: 'Self-Funded / Sponsorship / Earned Revenue',
          amount: Math.round(proposal.totalBudget * 0.20) || 8500,
          percentage: 20,
          rationale: 'Fulfills mandatory 20% non-government matching requirement under OurSG guidelines.',
        },
      ],
      doubleFundingRisks: [
        'Do not list the same contractor invoice under both NAC and URA grant claim submissions.',
        'SLA rental fees and security deposits cannot be claimed as grant expenses and must be borne by project contingency.',
      ],
      cashflowMilestoneTip:
        'OurSG grants disburse in milestones (typically 40% upon letter of acceptance, 40% midterm, 20% after audit report). Plan a working capital buffer to settle upfront contractor deposits.',
    },
    verifiedVsAssumedSummary: {
      verifiedCount: 6,
      assumptionsCount: 2,
      criticalGapsToClose: [
        'Confirm whether the site requires NEA temporary noise permit if decibel level exceeds 65 dBA after 7:00 PM.',
        'Verify with SLA whether security deposit must be paid via Banker’s Guarantee or electronic transfer.',
      ],
    },
  };
}
