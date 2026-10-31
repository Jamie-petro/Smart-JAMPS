# P2 — Funding shortlist (grants)

Give this file to your agent as the task, together with `SCHEMA.md`. Edits `site/public/layers/proposal/data/grants.json`; add each grant's page to `sources.json`.

**Goal:** 3–6 real grants relevant to the case, each with eligibility criteria the engine can check, overlap restrictions, and genuine improvements.

**Steps (time-boxed)**
1. (by 12:30) Browse **OurSG Grants** (and the owning agencies' pages) for grants that fit arts, placemaking, community programmes. Shortlist 3–6. Add each source with `checked_on`.
2. (by 13:00) For each grant: `covers_types` (component types it can fund), criteria as checkable fields where possible (`applicant.type`, `component.community_participation`, `component.budget_sgd` with `min`/`max`, …). Criteria that need judgement → `check: null`.
3. (by 13:15) Overlap: record each grant's stated restriction on double funding in `overlap_rule`; give grants that may not stack the same `funding_group` so the engine warns. `overlap_status: "verified"` only if stated on the official page.
4. (by 13:30) `improvement`: for criteria the case does not meet, a **real change to the project** (e.g. add a resident co-creation session) — never re-labelling the same activity. No genuine improvement → `null`.

We output "appears to meet", never "qualifies".
