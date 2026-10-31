export type AgencyId =
  | 'SLA'
  | 'URA'
  | 'SCDF'
  | 'BCA'
  | 'IMDA'
  | 'SPF'
  | 'NPARKS'
  | 'TOWN_COUNCIL';

export type ClearancePhase =
  | 'T-16 (Strategy & Grant Window)'
  | 'T-12 (Land Tenure & Venue Agreement)'
  | 'T-8 (Urban Planning & Place Clearances)'
  | 'T-4 (Safety, Structures & Licences)'
  | 'T-1 (Site Setup, Inspection & Handover)';

export interface BudgetLineItem {
  id: string;
  title: string;
  category: 'artistic_fees' | 'production_staging' | 'permits_engineering' | 'marketing_community' | 'insurance_admin';
  cost: number;
  assignedGrant: 'NAC_PP' | 'URA_LIVELY' | 'NHB_HERITAGE' | 'SELF_COMMERCIAL' | 'UNASSIGNED';
  isAllowableGovExpense: boolean;
  notes: string;
}

export interface Proposal {
  id: string;
  title: string;
  subtitle: string;
  artform: string;
  precinct: string;
  locationSpecifics: string;
  venueTenure: 'state_land_reserve' | 'public_pedestrian_mall' | 'hdb_void_deck' | 'park_connector' | 'private_commercial';
  durationDays: number;
  expectedAudience: number;
  isOutdoor: boolean;
  hasTemporaryStructures: boolean;
  structureHeightMeters: number;
  structureFootprintSqm: number;
  hasAmplifiedSound: boolean;
  decibelEstimateDb: number;
  nightLighting: boolean;
  isTicketedOrPaid: boolean;
  totalBudget: number;
  lineItems: BudgetLineItem[];
  leadArtistCollective: string;
  applicantType: 'individual_sep' | 'unregistered_collective' | 'clg_nonprofit' | 'acra_business';
  description: string;
  objectives: string[];
  communityInvolvementPlan: string;
  safetyPlan: string;
  imagePath: string;
}

export interface AgencyRequirement {
  agencyId: AgencyId;
  agencyName: string;
  permitName: string;
  statutoryLeadTimeWeeks: number;
  phase: ClearancePhase;
  isApplicable: boolean;
  status: 'verified_requirement' | 'assumed_gap' | 'conditional' | 'exempt';
  triggerReason: string;
  prerequisites: string[];
  mandatoryDocs: string[];
  costEstimate: string;
  portalUrl: string;
  officialCitation: string;
  riskSeverity: 'high' | 'medium' | 'low';
  riskMitigation: string;
  verifiedRuleDetails: string;
  assumedContextGap?: string;
}

export interface GrantOpportunity {
  id: string;
  name: string;
  agency: string;
  maxFundingCap: number;
  maxProjectSharePercentage: number; // e.g. 80% for NAC P&P, 80% or $20k for Lively Places
  allowableCostCategories: string[];
  disallowedExpenses: string[];
  doubleFundingRule: string;
  applicationLeadWeeks: number;
  eligibilityNotes: string[];
  isEligible: boolean;
  officialPortalUrl: string;
  grantWindowDescription: string;
}

export interface AIImprovement {
  area: string;
  issue: string;
  concreteImprovement: string;
  targetedGrants: string[];
  impactExplanation: string;
  applied?: boolean;
}

export interface AIRegulatoryWarning {
  agency: string;
  severity: 'critical' | 'moderate' | 'caution';
  warning: string;
  actionableFix: string;
}

export interface AIAnalysisResult {
  strategicSummary: string;
  strengtheningRecommendations: AIImprovement[];
  regulatoryWarnings: AIRegulatoryWarning[];
  coFundingStrategy: {
    recommendedSplit: {
      grant: string;
      amount: number;
      percentage: number;
      rationale: string;
    }[];
    doubleFundingRisks: string[];
    cashflowMilestoneTip: string;
  };
  verifiedVsAssumedSummary: {
    verifiedCount: number;
    assumptionsCount: number;
    criticalGapsToClose: string[];
  };
}
