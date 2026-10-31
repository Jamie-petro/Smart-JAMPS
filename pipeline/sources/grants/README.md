# P2 — Funding shortlist

Paste this file into your agent as the task. Owns `site/data/grants.json`. You may append grant sources to `site/data/sources.json` (coordinate with P1 — append only).

**Goal:** 3–6 real grants relevant to the case, each with eligibility criteria the engine can check, overlap restrictions, and genuine improvements — per `SCHEMA.md`.

**Steps (time-boxed)**
1. (by 12:20) Browse **OurSG Grants** (and the owning agencies' pages) for grants that fit arts, placemaking, community programmes. Shortlist 3–6. Add each source with `checked_on`.
2. (by 12:50) For each grant: `covers_types` (which component types it can fund), criteria as checkable fields where possible (`applicant.type`, `component.community_participation`, `component.budget_sgd`, …). Criteria that need judgement → `check: null`.
3. (by 13:10) Overlap: record each grant's stated restriction on double funding in `overlap_rule`; set `funding_group` so the engine can warn when two shortlisted grants may overlap. Status `verified` only if the rule is stated on the official page.
4. (by 13:30) `improvement`: for criteria the case does not meet, suggest a **real change to the project** (e.g. add a resident co-creation session), never re-labelling the same activity. If no genuine improvement exists, leave `null`.

Remember: we output "appears to meet", never "qualifies".
