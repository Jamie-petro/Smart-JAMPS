# Layer 2 data contract — files in `site/public/layers/proposal/data/`

Owners: P2 writes `sources.json`, `rules.json`, `grants.json`, `guidelines.json`. P3 writes `template.json` and the engine. Cross-layer objects are in CONTRACTS.md. `node tools/check.js` validates all of these.


`status` everywhere ∈ `verified` | `assumption` | `gap`.

## sources.json  (P2) — official sources register
```json
[{
  "id": "src-sla-str",
  "agency": "SLA",
  "title": "Short-term rental of State properties / land",
  "url": "https://...",
  "type": "permission",
  "checked_on": "2026-10-31",
  "checked_by": "P1",
  "summary": "One or two sentences in our own words."
}]
```
`type` ∈ `permission`, `licence`, `grant`, `guidance`, `venue`.

## template.json  (P3) — the one concrete case
Layer 2 copies this for the chosen space and fills each component's `location` from the Space, so `location` may be left out of the file.
```json
{
  "id": "case-1",
  "title": "…",
  "applicant": {"name": "…", "type": "registered_society", "uen": null, "track_record_years": 2},
  "summary": "…",
  "event_start": "2027-03-14",
  "event_end": "2027-03-15",
  "assumptions": ["Audience estimate is the applicant's guess"],
  "components": [{
    "id": "c-perf",
    "label": "Outdoor music performance",
    "type": "performance",
    "location": {"name": "Vacant state land at …", "land_owner": "state_land", "outdoor": true},
    "audience_size": 300,
    "ticketed": false,
    "amplified_sound": true,
    "temporary_structure": true,
    "food": false,
    "budget_sgd": 12000,
    "community_participation": true
  }]
}
```
- `applicant.type` ∈ `individual`, `informal_group`, `registered_society`, `company`, `charity`, `other`
- `component.type` ∈ `performance`, `installation`, `workshop`, `exhibition`, `community_programme`, `food_stall`, `other`
- `location.land_owner` ∈ `state_land`, `hdb`, `park`, `private`, `public_road`, `unknown`

## rules.json  (P2) — permissions / requirements
```json
[{
  "id": "r-land",
  "agency": "SLA",
  "requirement": "Apply for temporary use of the state land site",
  "applies_if": {"location.land_owner": ["state_land"]},
  "lead_time_weeks": 8,
  "depends_on": [],
  "why": "The site is state land; use needs the land owner's consent before other permits.",
  "source_id": "src-sla-str",
  "status": "verified",
  "note": ""
}]
```
**`applies_if`** is evaluated per component. Keys are component fields (dot paths allowed, e.g. `location.outdoor`); value is a list of accepted values; all keys must match. `{}` = always applies. The rule applies to the proposal if ≥ 1 component matches; matched components are listed in the output.
`lead_time_weeks` may be `null` (shown as "unknown — check").

## grants.json  (P2)
```json
[{
  "id": "g-1",
  "name": "…",
  "agency": "…",
  "source_id": "src-…",
  "covers_types": ["performance", "community_programme"],
  "max_amount_sgd": null,
  "funding_group": "gov-arts",
  "overlap_rule": "Cannot fund the same activity already funded by another government grant.",
  "overlap_status": "assumption",
  "criteria": [{
    "id": "g-1-a",
    "text": "Applicant is a registered entity",
    "check": {"field": "applicant.type", "in": ["registered_society", "company", "charity"]},
    "status": "verified",
    "improvement": null
  }, {
    "id": "g-1-b",
    "text": "Project involves community participation",
    "check": {"field": "component.community_participation", "in": [true]},
    "status": "assumption",
    "improvement": "Add a co-creation workshop with residents before the performance."
  }]
}]
```
- `check.field` starting with `applicant.` / `proposal.` is evaluated on the proposal; `component.` is evaluated on each covered component (met if any covered component passes). `check: null` → result `unknown` (needs human judgement).
- `improvement` must be a **genuine change to the project**, never a re-description of the same activity.
- Two shortlisted grants with the same `funding_group` trigger an overlap warning.

## guidelines.json  (P2) — curation / enhancement guidelines
```json
[{
  "id": "gl-2",
  "category": "site_care",
  "text": "Keep amplified sound away from bedroom-facing blocks and end before late evening.",
  "why": "Void decks sit under homes; noise complaints can end an event.",
  "when": {"space.kind": ["void_deck"], "component.amplified_sound": [true]},
  "source_id": null,
  "status": "assumption"
}]
```
- `category` ∈ `curation`, `programming`, `community`, `accessibility`, `site_care`, `permissions`, `funding`
- `when`: keys start with `space.` (a Space field) or `component.` (true if any component matches); all keys must match; `{}` = always shown.

## Engine outputs (computed in browser, not files)
- `workplan`: rules that apply, ordered by dependencies then lead time, with `start_by` = event_start − lead_time_weeks, `matched_components`, `status`, `source`.
- `shortlist`: grants with ≥ 1 covered component, each criterion → `met` / `not_met` / `unknown`, linked components, overlap warnings, improvements for `not_met`.
