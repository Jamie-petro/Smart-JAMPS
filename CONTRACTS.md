# Contracts between layers

Layers never call each other's functions. They talk only through `site/src/layers/bus.ts` using the objects and events below. Do not rename fields; add optional fields if needed.

## Flow
```
Layer 1 Map ──space:selected──▶ Layer 2 Proposal ──proposal:ready──▶ Layer 3 Render ──render:ready──▶ (shell shows result)
```

## Bus API (`site/src/layers/bus.ts`, owned by P5)
```ts
emit(event, payload)          // sets state[...] and notifies listeners
on(event, fn) → unsubscribe   // fn(payload)
useBus()                      // React hook → { space, proposal, render }, re-renders on every event
api(path, body)               // POST /api/<path>; resolves null if no backend or error
```
Layer 1 → bus: `LayerDock.tsx` listens to the twin's `window` event `artsToPlaces:stateChange` and emits `space:selected` with `toSpace(site, proposalParameters)` (`space.ts`). To drive the twin from code, dispatch `artsToPlaces:externalCommand` with `{ action: "SELECT_SITE", siteId }`.
Events: `space:selected` (Space), `proposal:ready` (Proposal), `render:ready` (Render).
Selecting a new space clears `proposal` and `render`.

## Space  — produced by Layer 1
```json
{
  "id": "sp-01",
  "name": "Void deck, Blk 123 Toa Payoh Lor 1",
  "lat": 1.3326, "lon": 103.8474,
  "kind": "void_deck",
  "land_owner": "hdb",
  "outdoor": false,
  "area_m2": 300,
  "capacity_est": 80,
  "photo_url": null,
  "notes": "Why this space is a candidate",
  "source": "team survey / OneMap / URA / SLA …",
  "status": "verified"
}
```
`kind` ∈ `void_deck`, `plaza`, `park`, `vacant_land`, `streetscape`, `heritage_building`, `community_space`, `other`
`land_owner` ∈ `state_land`, `hdb`, `park`, `private`, `public_road`, `unknown`
`status` ∈ `verified`, `assumption`, `gap` (same meaning everywhere)

## Proposal  — produced by Layer 2
Same shape as the earlier `proposal.json` (see SCHEMA.md) plus:
```json
{
  "space_id": "sp-01",
  "guidelines": [{
    "id": "gl-1",
    "category": "curation",
    "text": "Programme the installation to be seen from the walkway after dark.",
    "why": "…",
    "source_id": null,
    "status": "assumption"
  }],
  "workplan": [ /* Engine.workplan output */ ],
  "shortlist": [ /* Engine.shortlist output */ ],
  "visual_brief": "One paragraph describing what the event looks like on site — Layer 3 uses this.",
  "generated_by": "template | llm:<model>",
  "gaps": [ /* optional: Engine.gaps output — items still to check */ ]
}
```
`guidelines[].category` ∈ `curation`, `programming`, `community`, `accessibility`, `site_care`, `permissions`, `funding`

## Render  — produced by Layer 3
```json
{
  "id": "rd-…",
  "proposal_id": "case-1",
  "prompt": "the exact prompt sent",
  "images": [{ "src": "data:image/png;base64,… or URL", "alt": "…" }],
  "model": "gpt-image-1 | gemini-… | demo",
  "generated_at": "ISO time",
  "is_demo": false
}
```

## Backend endpoints (Vercel serverless, `site/api/`)
| Path | Owner | Body | Returns |
|---|---|---|---|
| `POST /api/proposal` | P3 | `{ space, draft }` | `{ title, summary, guidelines[], visual_brief, model }` |
| `POST /api/render` | P4 | `{ prompt, size }` | `{ images: [{src, alt}], model }` |
| `POST /api/analyze-proposal` | P4 | `{ proposal }` (built by `toAuditRequest` in `review.ts`) | `{ success, analysis, source }`; 502 when Gemini is unavailable |

Keys only in Vercel env vars. Every layer must still work with demo data when `api(...)` returns `null` (local dev, static host or offline).
