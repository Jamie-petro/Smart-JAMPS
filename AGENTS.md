# Agent instructions — Arts Ideas → Places (hackathon Challenge 6, 31 Oct 2026)

Every AI agent must read this file and `CONTRACTS.md` before editing. `SCHEMA.md` describes Layer 2's data files.

## The app
One page, three layers:
1. **Map** — the Layer 1 3D digital twin (MapLibre, 5 corridor sites, exploded statutory layers). User picks a site.
2. **Proposal** — for the chosen space: proposal draft, curation/enhancement guidelines, agency workplan and funding shortlist (rules engine).
3. **Render** — turns the proposal's `visual_brief` into AI-generated concept images of the event on site.

## Deadlines (SGT)
13:10 checkpoint (live URL must work) · 13:45 CODE FREEZE · 14:00 final session. `main` must always deploy.

## Architecture (do not change)
- `site/` is deployed by Vercel (Root Directory = `site`): a **Vite + React + TypeScript + Tailwind** app (`npm run build` → `dist/`, set in `site/vercel.json`).
- **Layer 1 is the app shell:** `site/src/App.tsx` (the digital twin). It broadcasts `window` event `artsToPlaces:stateChange` and accepts `artsToPlaces:externalCommand`. Don't restructure it.
- **Layers 2 and 3** live in `site/src/layers/` and are shown in the dock (`LayerDock.tsx`) on top of the twin. `space.ts` turns the twin's site into a `Space`. Layers talk only through `site/src/layers/bus.ts` (`emit` / `on` / `useBus`, events in `CONTRACTS.md`). Never import another layer's panel.
- Layer 2's rules engine (`site/public/layers/proposal/engine.js`) and data (`site/public/layers/proposal/data/*.json`) are plain JS/JSON served as static files, so `tools/check.js` and Node can test them.
- `site/api/*.js` = Vercel serverless functions (ES modules, `export default`, Node built-in `fetch`, no dependencies). Keys from `process.env` only.
- Every layer must work when `api(...)` returns `null` (no backend, local dev, static host).

## Folder ownership — edit ONLY your own
| Owner | Edits | Task brief |
|---|---|---|
| P1 Layer 1 Map (mugheeskiyani115-oss) | `site/src/App.tsx`, `site/src/main.tsx`, `site/src/index.css`, `site/index.html`, `site/src/layers/space.ts`, `site/public/layers/map/`, `pipeline/spaces/` | `pipeline/spaces/README.md` |
| P2 Layer 2 data | `site/public/layers/proposal/data/` `sources.json`, `rules.json`, `grants.json`, `guidelines.json`; `pipeline/sources/` | `pipeline/sources/README.md` |
| P3 Layer 2 logic | `site/src/layers/proposal/`, `site/public/layers/proposal/engine.js`, `data/template.json`; `site/api/proposal.js`; `pipeline/case/` | `pipeline/case/README.md` |
| P4 Layer 3 Render (RestfulCube) | `site/src/layers/render/`, `site/api/render.js`, `pipeline/render/` | `pipeline/render/README.md` |
| P5 Shell & integration | `site/src/layers/{bus.ts,ui.tsx,LayerDock.tsx}`, `site/package*.json`, `site/vite.config.ts`, `site/vercel.json`, `docs/`, `tools/`, `.github/`, root `*.md` | `docs/README.md` |

If the task needs a change outside your folder (a new bus event, a new contract field, someone else's file): **stop and tell the human** what to ask the owner for. Do not make the change.

## Honesty rules (judging criteria)
- Every requirement, criterion and guideline has `status` = `verified` (official source opened today, linked) / `assumption` / `gap`.
- Never say "you will be approved" or "you qualify". Use "appears to meet", "check with <agency>".
- Renders are labelled "AI-generated concept, not a design or approval".
- Improvements must be real project changes, never re-labelling an activity.

## Before you say you are done
1. `node tools/check.js` passes (validates data against these contracts, JS syntax, keys, promise wording).
2. `cd site && npm run build` succeeds, and with `npm run dev` the twin loads, the dock's Proposal and Render tabs work, with no console errors.
3. Tell the human which files you changed and anything you marked `assumption` or `gap`.

## Git
- Branch `<person>/<topic>`; `git pull --rebase origin main` before push; push at least every 20 min; PR → P5 merges.
- Never force-push `main`. Never commit `.env` or keys.

## Do not
Add a database, auth, a second framework, new npm dependencies without P5, or calls to keyed APIs from browser code. Don't restructure Layer 1's `App.tsx`.
