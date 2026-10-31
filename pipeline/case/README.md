# P3 — Layer 2 logic: the case, the engine, the proposal panel

Give this file to your agent as the task. You edit `site/layers/proposal/*.js`, `proposal.css`, `data/template.json`, `site/api/proposal.js` and `pipeline/case/`. P2 owns the other data files — read them, don't edit them.

**Goal:** one realistic arts placemaking case, turned for any chosen space into: proposal text, guidelines, workplan (whom/when/why), funding shortlist, and a `visual_brief` for Layer 3.

**Steps (time-boxed)**
1. (by 12:20) Agree the case with the team. It should touch several agencies, e.g. weekend outdoor performance + light installation + resident workshop. Write it as a one-page plain-text brief in `pipeline/case/brief.txt` (the "user input").
2. (by 12:40) Use your agent/LLM to convert `brief.txt` → `site/layers/proposal/data/template.json` per SCHEMA.md (`{space}` in the title is replaced with the space name). Anything the brief didn't say goes in `assumptions`. Save the prompt and raw output in `pipeline/case/` — it shows the AI step in the pitch.
3. (by 13:00) `/api/proposal` already calls Claude with `ANTHROPIC_API_KEY`. Improve the prompt so guidelines are specific to the site; keep the "no invented regulations, no promises" rules. The UI must still work when it returns `null`.
4. (13:10–13:40) What-if in the UI: `Engine.applyOverrides(proposal, overrides)` exists — add controls (e.g. "make it ticketed", "no amplified sound") so the workplan changes live. Keep `engine.js` pure (no DOM).

Do not change the `Proposal` fields in CONTRACTS.md; Layer 3 reads `title`, `components`, `guidelines`, `visual_brief`, `id`.
