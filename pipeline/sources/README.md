# P1 — Official sources & permission rules

Paste this file into your agent as the task. Also owns `site/data/sources.json` and `site/data/rules.json`.

**Goal:** a curated register of official sources and a rules list that tells the case WHOM to approach, WHEN, and WHY — per `SCHEMA.md`.

**Steps (time-boxed)**
1. (by 12:10) Agree the case with P3 (venue type drives everything). Starting points from the brief: **OurSG Grants** portal and **SLA short-term rental guidance**.
2. (by 12:40) Open official pages only. For each, add an entry to `sources.json` with `checked_on: "2026-10-31"` and a ≤ 2-sentence summary in your own words. Candidate areas to check (confirm which agency actually handles each — do not assume):
   - use of the site (state land / HDB / park / public road)
   - arts entertainment / public entertainment licensing
   - temporary structures, amplified sound, crowd/safety, food
   - who to approach first (land owner usually gates everything else — verify)
3. (by 13:00) Write `rules.json`: one rule per requirement, with `applies_if` on component fields, `lead_time_weeks` (null if not stated), `depends_on`, `why`, `source_id`, `status`.
   - `verified` only when the official page you opened supports it.
   - LLM-drafted from a page but not checked line-by-line → `assumption`.
   - Known need, no source found → `gap`.
4. (13:10–13:40) Upgrade assumptions to verified where you can. Give P5 the list of remaining gaps.

**Suggested agent prompt for extraction:** "From this official page text, list requirements relevant to [component]. For each give: requirement, agency, lead time if stated, the sentence that supports it. If not stated, say 'not stated'. Do not infer."
