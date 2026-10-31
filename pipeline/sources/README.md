# P2 — Layer 2 data: official sources, permission rules, curation guidelines

Give this file to your agent as the task, together with `SCHEMA.md`. You edit only `site/public/layers/proposal/data/{sources,rules,grants,guidelines}.json` and `pipeline/sources/`. Grants have their own brief: `pipeline/sources/grants/README.md`.

**Goal:** a register of official sources and a rules list that tells the user WHOM to approach, WHEN and WHY for each kind of site — plus curation guidelines per site type.

**Steps (time-boxed)**
1. (by 12:20) Starting points: **SLA** short-term use of State land/property, **OurSG Grants**. Cover each `land_owner` the map uses: `state_land`, `hdb`, `park`, `public_road`, `private`.
2. (by 12:45) Open official pages only. For each, add to `sources.json` with `checked_on: "2026-10-31"`, `checked_by: "P2"` and a ≤ 2-sentence summary in your own words. Areas to check (confirm which agency handles each — do not assume):
   - use of the site (state land / HDB / park / public road)
   - arts / public entertainment licensing
   - temporary structures, amplified sound, crowd/safety, food
   - who to approach first (land owner usually gates the rest — verify)
3. (by 13:05) `rules.json`: one rule per requirement. `applies_if` uses component fields without a prefix (`"location.land_owner"`, `"type"`, `"amplified_sound"`). `lead_time_weeks` = `null` if not stated. `depends_on` = rule ids that must come first.
   - `verified` only when the page you opened supports it (and its source has `checked_on`).
   - LLM-drafted from a page but not checked line by line → `assumption`.
   - Known need, no source found → `gap`.
4. (by 13:20) `guidelines.json`: 6–12 curation / enhancement tips keyed by `when` on `space.kind`, `space.outdoor`, `component.type` … (see SCHEMA.md). Mostly `assumption` unless an official guide says it.
5. (13:20–13:40) Upgrade assumptions to verified where you can. Give P5 the list of remaining gaps.

**Extraction prompt for your agent:** "From this official page text, list requirements relevant to [component]. For each give: requirement, agency, lead time if stated, the sentence that supports it. If not stated, say 'not stated'. Do not infer."
Check: `node tools/check.js` fails if something is `verified` without a dated source, or a `depends_on` / `source_id` points nowhere.
