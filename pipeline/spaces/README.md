# P1 — Layer 1: the 3D digital twin

Give this file to your agent as the task. You edit `site/src/App.tsx`, `main.tsx`, `index.css`, `site/index.html`, `site/src/layers/space.ts`, `site/public/layers/map/` and `pipeline/spaces/`.

**Goal:** the twin is the app's shell. Keep its structure; make its content honest and keep it talking to Layers 2–3.

**Keep working**
- `App.tsx` must keep broadcasting `artsToPlaces:stateChange` with `site.id`, `site.name`, `site.code`, `site.wgs84`, and `proposalParameters.crowdSize` — the dock turns that into a `Space` for Layer 2 (CONTRACTS.md).
- `space.ts` maps each site id to `kind` / `land_owner` / `area_m2`. If you add a site, add it there too; check the land owner on OneMap / SLA and say where you checked.

**Content to verify (judging: honesty)** — `SITES_DATA` marks items `VERIFIED RULE` without a link someone opened today:
1. Lot numbers (e.g. `LOT MK03-02100W`) — real cadastral lots? If not confirmed, label them illustrative.
2. Rules quoted as fact: 3.0m LTA soffit buffer, ≤0.5m / <1.5m BCA exemption, 22:00 SPF cut-off, 75/65 dBA, T-12…T-3 week timings.
3. Grant caps and the "readiness %" numbers.
For each: link the official page and keep `VERIFIED RULE`, or change it to `ASSUMPTION` / `CRITICAL GAP`.
