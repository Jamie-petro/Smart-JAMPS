# P3 — Concrete case & rules engine

Paste this file into your agent as the task. Owns `pipeline/case/`, `site/data/proposal.json`, `site/js/engine.js`.

**Goal:** one realistic arts placemaking proposal, and an engine that turns proposal + rules + grants into a workplan and a funding shortlist.

**Steps (time-boxed)**
1. (by 12:10) Pick the case with the team. It should touch several agencies: e.g. a weekend outdoor performance + light installation + resident workshop on a vacant state-land site. Write it as a one-page plain-text brief in `pipeline/case/brief.txt` (this is the "user input").
2. (by 12:30) Use your agent/LLM to convert `brief.txt` → `site/data/proposal.json` per `SCHEMA.md`. Put anything the brief didn't say into `assumptions`. Save the prompt and raw output in `pipeline/case/` (shows the AI step in the pitch).
3. (by 12:50) `engine.js` already works on sample data. Extend if needed: `Engine.workplan(proposal, rules, sources)` and `Engine.shortlist(proposal, grants, sources)`. Keep functions pure — no DOM.
4. (13:10–13:40) Add what-if support used by the UI: `Engine.applyOverrides(proposal, overrides)` (e.g. switch venue to HDB, make it ticketed) so the workplan changes live.
