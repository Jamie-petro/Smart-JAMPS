// Review logic (from the render-layer zip): AI review of the plan + heritage reading leads. Owner: P4.
// Reads the bus (Space, Layer 2 proposal) and the twin's public "artsToPlaces:stateChange" event.
import { useEffect, useState } from 'react';
import { api, type Space } from '../bus';
import { generateFallbackAnalysis } from './fallbackAnalysis';
import { NLB_HERITAGE_ARCHIVES, type NLBTitleRecord } from './heritage';

const TENURE: Record<string, string> = {
  state_land: 'state_land_reserve',
  hdb: 'hdb_void_deck',
  park: 'park_connector',
  public_road: 'public_pedestrian_mall',
  private: 'private_commercial'
};

// Structure height / sound level come from the twin's "Test your plan" sliders.
// Listen from module load: the Review tab mounts later than the twin's first broadcast.
let latestParams: any = null;
window.addEventListener('artsToPlaces:stateChange', (e: any) => {
  latestParams = e.detail?.proposalParameters || latestParams;
});

export function useTwinParams() {
  const [params, setParams] = useState<any>(latestParams);
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

// The request shape /api/analyze-proposal and the fallback expect.
export function toAuditRequest(space: Space, p: any, params: any) {
  const comps: any[] = p?.components || [];
  const total = comps.reduce((s, c) => s + (c.budget_sgd || 0), 0);
  const days = p?.event_start && p?.event_end ? Math.round((Date.parse(p.event_end) - Date.parse(p.event_start)) / 864e5) + 1 : null;
  return {
    title: p?.title || `Arts event at ${space.name}`,
    subtitle: p?.summary || '',
    artform: comps.map((c) => c.label).join(', '),
    precinct: space.name,
    locationSpecifics: `${space.kind.replace('_', ' ')}, land owner ${space.land_owner} (${space.status})`,
    venueTenure: TENURE[space.land_owner] || 'public_pedestrian_mall',
    durationDays: days,
    expectedAudience: Math.max(0, ...comps.map((c) => c.audience_size || 0)),
    isOutdoor: space.outdoor,
    hasTemporaryStructures: comps.some((c) => c.temporary_structure),
    structureHeightMeters: params?.maxStructureHeightM ?? null,
    structureFootprintSqm: null,
    hasAmplifiedSound: comps.some((c) => c.amplified_sound),
    decibelEstimateDb: params?.soundDecibels ?? null,
    nightLighting: true,
    isTicketedOrPaid: comps.some((c) => c.ticketed),
    totalBudget: total,
    lineItems: comps.map((c) => ({ title: c.label, cost: c.budget_sgd || 0, assignedGrant: 'UNASSIGNED' })),
    communityInvolvementPlan: comps.filter((c) => c.community_participation).map((c) => c.label).join('; ') || 'Not stated',
    safetyPlan: 'Not stated'
  };
}

export async function runReview(space: Space, p: any, params: any) {
  const request = toAuditRequest(space, p, params);
  const res = await api('analyze-proposal', { proposal: request });
  if (res?.analysis) return { analysis: res.analysis, source: res.source || 'AI', isAI: true };
  return { analysis: generateFallbackAnalysis(request), source: 'fixed rule-based advice (AI not connected)', isAI: false };
}

const PRECINCT_BY_SITE: Record<string, NLBTitleRecord['precinctTag']> = {
  bishan: 'Bishan',
  queensway: 'Rail Corridor',
  rochor: 'Telok Ayer' // nearest heritage-shophouse leads in the draft
};

export function heritageLeads(space: Space): NLBTitleRecord[] {
  const tag = PRECINCT_BY_SITE[space.id];
  const hits = NLB_HERITAGE_ARCHIVES.filter((r) => r.precinctTag === tag);
  return hits.length ? hits : NLB_HERITAGE_ARCHIVES.slice(0, 3);
}
