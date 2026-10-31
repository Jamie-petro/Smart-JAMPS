// Review logic (from the render-layer zip): AI review of the plan + heritage reading leads. Owner: P4.
// Reads the bus (Space, Layer 2 proposal) and the twin's public "artsToPlaces:stateChange" event.
import { useEffect, useState } from 'react';
import { apiCall, type Space } from '../bus';
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
  const { data, error } = await apiCall('analyze-proposal', { proposal: request });
  if (data?.analysis) return { analysis: data.analysis, source: data.source || 'AI', isAI: true };
  return { analysis: generateFallbackAnalysis(request), source: `fixed rule-based advice — AI not available (${error})`, isAI: false };
}

// The part of the plan the chat may use (sent to /api/advisor and searched offline).
export function planForChat(space: Space, p: any) {
  return {
    site: { name: space.name, kind: space.kind, land_owner: space.land_owner, status: space.status },
    event: { title: p.title, dates: `${p.event_start} to ${p.event_end}`, summary: p.summary },
    activities: p.components.map((c: any) => ({ label: c.label, type: c.type, budget_sgd: c.budget_sgd, audience: c.audience_size, ticketed: c.ticketed, amplified_sound: c.amplified_sound })),
    steps: p.workplan.map((s: any, i: number) => ({ order: i + 1, agency: s.agency, requirement: s.requirement, status: s.status, start_by: s.start_by, why: s.why, source: s.source?.url || null })),
    funding: p.shortlist.map((g: any) => ({ grant: g.name, appears_to_meet: g.counts.met, not_met: g.counts.not_met, to_check: g.counts.unknown, could_fund: g.linked_components.map((c: any) => c.label), overlap: g.overlap_warnings.map((w: any) => w.with) })),
    ideas: p.guidelines.map((g: any) => ({ text: g.text, status: g.status })),
    still_to_check: p.gaps.map((g: any) => g.label)
  };
}

export interface ChatMsg {
  role: 'user' | 'assistant';
  text: string;
  source?: string;
}

// Offline answer: pick matching items from the plan data. Labelled as not AI.
function offlineAnswer(q: string, plan: ReturnType<typeof planForChat>): string {
  const t = q.toLowerCase();
  const steps = (n: number) => plan.steps.slice(0, n).map((s) => `${s.order}. ${s.agency}: ${s.requirement} (${s.status}${s.start_by ? `, start by ${s.start_by}` : ''})`);
  if (/first|start|order|when|begin|timeline/.test(t)) return ['In order:', ...steps(4)].join('\n');
  if (/grant|fund|money|budget|pay/.test(t))
    return plan.funding.length
      ? ['Funding to look at (check with the agency):', ...plan.funding.map((g) => `- ${g.grant}: appears to meet ${g.appears_to_meet}, to check ${g.to_check}`)].join('\n')
      : 'No grant in our data covers these activities.';
  if (/check|unverified|gap|risk|missing/.test(t)) return ['Still to check:', ...plan.still_to_check.slice(0, 5).map((x) => `- ${x}`)].join('\n');
  const words = t.split(/\W+/).filter((w) => w.length > 3);
  const hits = [
    ...plan.steps.map((s) => `${s.agency}: ${s.requirement} (${s.status})`),
    ...plan.ideas.map((i) => `Idea: ${i.text}`)
  ].filter((line) => words.some((w) => line.toLowerCase().includes(w)));
  return hits.length ? hits.slice(0, 4).join('\n') : 'Nothing in the plan data matches that. Try asking about steps, funding or what is still to check.';
}

export async function askAdvisor(question: string, history: ChatMsg[], space: Space, p: any): Promise<ChatMsg> {
  const plan = planForChat(space, p);
  const { data, error } = await apiCall('advisor', { question, history, plan });
  if (data?.answer) return { role: 'assistant', text: data.answer, source: data.model };
  return { role: 'assistant', text: offlineAnswer(question, plan), source: `from the plan data, not AI — AI not available (${error})` };
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
