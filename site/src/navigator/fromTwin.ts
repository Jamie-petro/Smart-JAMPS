// Bridge: the twin's selected site (Space) + Layer 2 proposal + latest Layer 3 render → a navigator Proposal.
// Reads only the bus and the twin's public "artsToPlaces:stateChange" event.
import { useEffect, useMemo, useState } from 'react';
import { useBus, type Space } from '../layers/bus';
import { sampleImage } from '../layers/render/render';
import type { BudgetLineItem, Proposal } from './types/placemaking';

const TENURE: Record<string, Proposal['venueTenure']> = {
  state_land: 'state_land_reserve',
  hdb: 'hdb_void_deck',
  park: 'park_connector',
  public_road: 'public_pedestrian_mall',
  private: 'private_commercial'
};

// Structure height / sound level come from the twin's stress-test sliders.
function useTwinParams() {
  const [params, setParams] = useState<any>(null);
  useEffect(() => {
    // The twin re-broadcasts on every camera move; only take a new object when the sliders change.
    const on = (e: any) => {
      const next = e.detail?.proposalParameters || null;
      setParams((prev: any) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    window.addEventListener('artsToPlaces:stateChange', on);
    return () => window.removeEventListener('artsToPlaces:stateChange', on);
  }, []);
  return params;
}

function lineItems(total: number, id: string): BudgetLineItem[] {
  // Same split as the navigator's custom-proposal builder.
  return [
    { id: `${id}-li-1`, title: 'Artist Honoraria & Production Team Stipends', category: 'artistic_fees', cost: Math.round(total * 0.4), assignedGrant: 'NAC_PP', isAllowableGovExpense: true, notes: 'Covers rehearsals, fabrication, and live presentations.' },
    { id: `${id}-li-2`, title: 'Modular Temporary Infrastructure & Physical Materials', category: 'production_staging', cost: Math.round(total * 0.35), assignedGrant: 'URA_LIVELY', isAllowableGovExpense: true, notes: 'Demountable structure with zero permanent ground fixing.' },
    { id: `${id}-li-3`, title: 'Venue Rental & Reinstatement Deposit', category: 'permits_engineering', cost: Math.round(total * 0.1), assignedGrant: 'SELF_COMMERCIAL', isAllowableGovExpense: false, notes: 'Licensing fee and refundable bond.' },
    { id: `${id}-li-4`, title: 'Public Liability Insurance & Safety Equipment', category: 'insurance_admin', cost: Math.round(total * 0.15), assignedGrant: 'NAC_PP', isAllowableGovExpense: true, notes: 'Indemnity for public space activation.' }
  ];
}

export function toNavigatorProposal(space: Space, p: any, renderSrc: string | null, params: any): Proposal {
  const comps: any[] = p?.components || [];
  const total = comps.reduce((s, c) => s + (c.budget_sgd || 0), 0) || 10000;
  const days = p?.event_start && p?.event_end ? Math.round((Date.parse(p.event_end) - Date.parse(p.event_start)) / 864e5) + 1 : 2;
  const id = `twin-${space.id}`;
  return {
    id,
    title: p?.title || `Arts event at ${space.name}`,
    subtitle: 'From the 3D twin site and the Layer 2 proposal',
    artform: comps.map((c) => c.label).join(', ') || 'Community arts',
    precinct: space.name,
    locationSpecifics: `${space.kind.replace('_', ' ')} · land owner: ${space.land_owner} (${space.status})`,
    venueTenure: TENURE[space.land_owner] || 'public_pedestrian_mall',
    durationDays: days,
    expectedAudience: Math.max(0, ...comps.map((c) => c.audience_size || 0)) || space.capacity_est || 100,
    isOutdoor: space.outdoor,
    hasTemporaryStructures: comps.some((c) => c.temporary_structure),
    structureHeightMeters: params?.maxStructureHeightM ?? 1.5,
    structureFootprintSqm: Math.round((space.area_m2 || 400) * 0.1),
    hasAmplifiedSound: comps.some((c) => c.amplified_sound),
    decibelEstimateDb: params?.soundDecibels ?? 65,
    nightLighting: true,
    isTicketedOrPaid: comps.some((c) => c.ticketed),
    totalBudget: total,
    lineItems: lineItems(total, id),
    leadArtistCollective: p?.applicant?.name || 'Applicant',
    applicantType: p?.applicant?.type === 'informal_group' ? 'unregistered_collective' : 'individual_sep',
    description: p?.summary || '',
    objectives: (p?.guidelines || []).slice(0, 3).map((g: any) => g.text),
    communityInvolvementPlan: comps.filter((c) => c.community_participation).map((c) => c.label).join('; ') || 'To be defined.',
    safetyPlan: 'To be defined with the venue manager.',
    // Latest Layer 3 render if there is one, else the sample concept for this type of site.
    imagePath: renderSrc || sampleImage(space)
  };
}

export function useTwinCase(): Proposal | null {
  const { space, proposal, render } = useBus();
  const params = useTwinParams();
  const src = render?.images?.[0]?.src || null;
  return useMemo(
    () => (space ? toNavigatorProposal(space, proposal, src, params) : null),
    [space, proposal, src, params]
  );
}
