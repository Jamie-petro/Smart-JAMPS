# Agent instructions — Arts Ideas → Places (hackathon Challenge 6, 31 Oct 2026)

Every AI agent must read this file and `CONTRACTS.md` before editing. `SCHEMA.md` describes Layer 2's data files.

## The app
One page, three layers:
1. **Map** — map of Singapore (OneMap basemap) marking potential spaces for arts events. User picks a space.
2. **Proposal** — for the chosen space: proposal draft, curation/enhancement guidelines, agency workplan and funding shortlist (rules engine).
3. **Render** — turns the proposal's `visual_brief` into AI-generated concept images of the event on site.

## Deadlines (SGT)
13:10 checkpoint (live URL must work) · 13:45 CODE FREEZE · 14:00 final session. `main` must always deploy.

## Architecture (do not change)
- `site/` is deployed by Vercel (Root Directory = `site`). Plain HTML + vanilla JS + MapLibre GL from CDN (3D/2D map). **No framework, no bundler, no npm in the browser.**
- `site/core/` = shell (P5). Layers live in `site/layers/<id>/` and register with `App.registerLayer`. Layers talk only through `App` events (see `CONTRACTS.md`). Never call another layer's functions or read its DOM.
- `site/api/*.js` = Vercel serverless functions (CommonJS, Node built-in `fetch`, no dependencies). Keys from `process.env` only.
- Every layer must work with its demo data when `App.api(...)` returns `null`.

## Folder ownership — edit ONLY your own
| Owner | Folder | Notes |
|---|---|---|
| P1 Layer 1 Map | `site/layers/map/` | `map.js`, `map.css`, `data/spaces.geojson` |
| P2 Layer 2 data | `site/layers/proposal/data/` | `rules.json`, `grants.json`, `sources.json`, `guidelines.json` |
| P3 Layer 2 logic | `site/layers/proposal/*.js`, `site/api/proposal.js`, `pipeline/case/` | `proposal.js`, `engine.js` |
| P4 Layer 3 Render | `site/layers/render/`, `site/api/render.js` | |
| P5 Shell & integration | `site/index.html`, `site/core/`, `docs/`, root `*.md` | merges PRs |

## Honesty rules (judging criteria)
- Every requirement, criterion and guideline has `status` = `verified` (official source opened today, linked) / `assumption` / `gap`.
- Never say "you will be approved" or "you qualify". Use "appears to meet", "check with <agency>".
- Renders are labelled "AI-generated concept, not a design or approval".
- Improvements must be real project changes, never re-labelling an activity.

## Git
- Branch `<person>/<topic>`; `git pull --rebase origin main` before push; push at least every 20 min; PR → P5 merges.
- Never force-push `main`. Never commit `.env` or keys.

## Do not
Add React/Next/Vite, a database, auth, npm dependencies in `site/`, or calls to keyed APIs from browser code.
