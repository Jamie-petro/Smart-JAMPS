// Layer 2 logic — builds a Proposal for a Space from template + rules engine. Owner: P3.
// Data files (public/layers/proposal/data/) are validated by tools/check.js; see SCHEMA.md.
import type { Space } from '../bus';

const BASE = '/layers/proposal/';
export interface Data {
  template: any;
  rules: any[];
  grants: any[];
  sources: any[];
  guidelines: any[];
}

declare global {
  interface Window {
    Engine?: any;
  }
}

// engine.js is plain JS (pure functions, sets window.Engine) so tools/check.js and Node can test it too.
export function loadEngine(): Promise<any> {
  if (window.Engine) return Promise.resolve(window.Engine);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = BASE + 'engine.js';
    s.onload = () => resolve(window.Engine);
    s.onerror = () => reject(new Error('engine.js failed to load'));
    document.head.appendChild(s);
  });
}

async function load(name: string, fallback: any) {
  try {
    const r = await fetch(BASE + 'data/' + name, { cache: 'no-store' });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } catch {
    return fallback;
  }
}

export async function loadData(): Promise<Data> {
  const [template, rules, grants, sources, guidelines] = await Promise.all([
    load('template.json', null),
    load('rules.json', []),
    load('grants.json', []),
    load('sources.json', []),
    load('guidelines.json', [])
  ]);
  return { template, rules, grants, sources, guidelines };
}

const get = (o: any, p: string) => p.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);

// guidelines.json "when": keys "space.<field>" or "component.<field>" → accepted values. All keys must match.
function guidelinesFor(D: Data, space: Space, proposal: any) {
  return D.guidelines.filter((g) =>
    Object.entries(g.when || {}).every(([path, ok]: [string, any]) => {
      const [scope, ...rest] = path.split('.');
      const f = rest.join('.');
      if (scope === 'space') return ok.includes(get(space, f));
      if (scope === 'component') return proposal.components.some((c: any) => ok.includes(get(c, f)));
      return false;
    })
  );
}

const KIND_SCENE: Record<string, string> = {
  void_deck: 'under a sheltered HDB void deck with pillars and lift lobby behind',
  plaza: 'on an open paved plaza',
  park: 'on a park lawn under rain trees',
  vacant_land: 'on an open plot of vacant land',
  streetscape: 'along a shophouse street with five-foot ways',
  heritage_building: 'in front of a heritage building',
  community_space: 'in a sheltered community plaza',
  other: 'on site'
};

export interface Options {
  enabled: Record<string, boolean>;
  ticketed: boolean;
}

export function buildProposal(D: Data, Engine: any, space: Space, opt: Options) {
  let p = JSON.parse(JSON.stringify(D.template));
  p.space_id = space.id;
  p.title = (p.title || 'Arts event').replace('{space}', space.name);
  p.summary = (p.summary || '').replace('{space}', space.name);
  p.components.forEach((c: any) => {
    c.location = { name: space.name, land_owner: space.land_owner, outdoor: space.outdoor };
    if (space.capacity_est && c.audience_size) c.audience_size = Math.min(c.audience_size, space.capacity_est);
  });
  p.generated_by = 'template';
  p.components = p.components.filter((c: any) => opt.enabled[c.id] !== false);
  if (opt.ticketed)
    p = Engine.applyOverrides(p, Object.fromEntries(p.components.map((c: any) => [c.id, { ticketed: true }])));
  p.guidelines = guidelinesFor(D, space, p);
  p.visual_brief =
    `A${opt.ticketed ? ' ticketed' : ' free'} evening community arts event at ${space.name}, ${KIND_SCENE[space.kind] || KIND_SCENE.other}. ` +
    `${p.components.map((c: any) => c.label.toLowerCase()).join('; ')}. ` +
    `Warm lantern light at dusk, residents of mixed ages — seniors on benches, children holding handmade lanterns, families walking through.`;
  p.workplan = Engine.workplan(p, D.rules, D.sources);
  p.shortlist = Engine.shortlist(p, D.grants, D.sources);
  p.gaps = Engine.gaps(p.workplan, p.shortlist);
  return p;
}

// Optional LLM pass (/api/proposal). Returns the proposal unchanged when the backend is unavailable.
export function mergeAiDraft(p: any, ai: any) {
  if (!ai) return p;
  return {
    ...p,
    title: ai.title || p.title,
    summary: ai.summary || p.summary,
    visual_brief: ai.visual_brief || p.visual_brief,
    guidelines: [
      ...p.guidelines,
      ...(ai.guidelines || []).map((g: any, i: number) => ({
        id: `ai-${i}`,
        status: 'assumption',
        source_id: null,
        ...g,
        category: g.category || 'curation'
      }))
    ],
    generated_by: `llm:${ai.model || '?'}`
  };
}

// Timeline phases (from the render-layer navigator), keyed by a step's lead time in weeks.
export const PHASES = [
  { id: 't12', label: '12+ weeks before' },
  { id: 't8', label: '8–11 weeks before' },
  { id: 't4', label: '4–7 weeks before' },
  { id: 't0', label: 'Under 4 weeks' },
  { id: 'unknown', label: 'Lead time unknown — ask the agency' }
];
export function phaseOf(weeks: number | null | undefined) {
  if (weeks == null) return 'unknown';
  return weeks >= 12 ? 't12' : weeks >= 8 ? 't8' : weeks >= 4 ? 't4' : 't0';
}

// "Download plan": a Markdown file of the plan with statuses and sources (replaces the navigator's submission pack).
export function downloadPlan(space: Space, p: any) {
  const src = (s: any) => (s ? `[${s.agency}](${s.url})` : 'no source');
  const lines = [
    `# ${p.title}`,
    '',
    `${space.name} · ${p.event_start} to ${p.event_end}`,
    '',
    p.summary,
    '',
    '> Guidance only. Not an approval or a funding decision. Statuses: verified (official source checked) / assumption / gap.',
    '',
    '## Activities',
    ...p.components.map((c: any) => `- ${c.label} — S$${(c.budget_sgd || 0).toLocaleString()}`),
    '',
    '## Steps, in order',
    ...p.workplan.map(
      (s: any, i: number) =>
        `${i + 1}. **${s.agency}** — ${s.requirement} _(${s.status})_  \n   Start by ${s.start_by || 'unknown — ask the agency'}. ${s.why} Source: ${src(s.source)}`
    ),
    '',
    '## Funding to look at',
    ...p.shortlist.map(
      (g: any) =>
        `- **${g.name}** (${src(g.source)}) — appears to meet ${g.counts.met}, not met ${g.counts.not_met}, to check ${g.counts.unknown}. Could fund: ${g.linked_components.map((c: any) => c.label).join(', ')}`
    ),
    '',
    '## Ideas to improve it',
    ...p.guidelines.map((g: any) => `- ${g.text} _(${g.status})_`),
    '',
    '## Still to check',
    ...p.gaps.map((g: any) => `- ${g.label}`),
    ''
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `plan-${space.id}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
