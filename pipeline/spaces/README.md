# P1 — Layer 1 Map: candidate spaces

Give this file to your agent as the task. You edit only `site/layers/map/` and `pipeline/spaces/`.

**Goal:** a map of 8–15 real Singapore spaces that could host an arts event, each one a `Space` (CONTRACTS.md). Selecting one sends it to Layer 2 via `App.emit("space:selected", space)` — already wired in `map.js`.

**Steps (time-boxed)**
1. (by 12:30) Pick spaces across different `kind`s and `land_owner`s (void deck/HDB, plaza, park, vacant state land, streetscape, heritage building). Different land owners make Layer 2's workplan visibly different — that is the demo.
2. (by 13:00) Replace the SAMPLE features in `site/layers/map/data/spaces.geojson`. Coordinates are `[lon, lat]`. Get them from OneMap search (the search box in the app uses the same API). Keep every field in the Space schema; `photo_url` may be `null`.
3. `status`: `verified` only if you confirmed the site and its land owner from an official source (OneMap / URA Master Plan / SLA / NParks) — put it in `source`. Otherwise `assumption`. Unknown land owner → `land_owner: "unknown"`, `status: "gap"`.
4. (13:10–13:40, optional) Improve `map.js`: legend by `kind`, filter by kind/land owner, marker clustering is NOT needed. Keep the OSM fallback.

Notes and raw research go in `pipeline/spaces/` (not deployed).
Check: `node tools/check.js` catches wrong enums and swapped lat/lon.
