# Pitch — Arts Ideas → Places

**Problem (problem understanding).** Ground-up arts groups have ideas for public spaces but the path is scattered: land owner (SLA, HDB Town Council, NParks, LTA), licences (IMDA arts entertainment, police notification), structures, food, then funding (URA/HDB Lively Places Fund, NAC grants) — each on a different site, with no order and unclear lead times.

**What we built (usefulness / prototype).** One page, three layers:
1. **Spaces** — OneMap basemap with 12 real candidate spaces, each with kind, land owner, size and an honesty badge.
2. **Proposal** — for the chosen space: a concrete event case, curation and site-care guidelines, *whom to approach in order* with start-by dates, and a funding shortlist with criteria met / not met / check, real improvements and overlap warnings. A what-if toggle (ticketed) re-plans live.
3. **Render** — an AI concept image of the event on that site, from the proposal's visual brief.

**How AI is used (technical / AI execution).**
- Extracting requirements from official pages into structured rules (lead times, conditions) — then checked against the page and marked verified only if the page supports it.
- Optional LLM drafting of title, summary, extra guidelines and the visual brief (Claude, server-side, key in Vercel env).
- Image generation for the concept render (server-side).
- The decisions (which steps apply, in what order, which criteria are met) come from a transparent rules engine, not the LLM.

**How we keep it honest (assumptions & limitations).** Every rule, criterion and guideline is `verified` (official page opened 31 Oct 2026, linked), `assumption` or `gap`. Language is "appears to meet" / "check with <agency>", never "you qualify". Renders are labelled as concepts. See `limitations.md`.

**Feasibility / next steps.** Agencies (or OurSG Grants) maintain `rules.json` / `grants.json` as open data; add more cases and event types; OneMap land-ownership query to replace our estimates; export the workplan as an application checklist.
