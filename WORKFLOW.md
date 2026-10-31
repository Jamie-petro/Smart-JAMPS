# Team workflow — 31 Oct, build until 13:45

## Roles
| Person | Layer | Owns | First prompt to your agent |
|---|---|---|---|
| P1 | 1 Spaces | `site/layers/map/` | "Read AGENTS.md and CONTRACTS.md. Replace the SAMPLE spaces in `site/layers/map/data/spaces.geojson` with 8–15 real candidate spaces for arts events in Singapore (void decks, plazas, parks, vacant state land, streetscapes). Keep the Space schema. Improve map.js only." |
| P2 | 2 data | `site/layers/proposal/data/` (except template.json) | "Read AGENTS.md, CONTRACTS.md, SCHEMA.md. Replace SAMPLE rules, grants, sources and guidelines with real ones from official pages (OurSG Grants, SLA, licensing, park/HDB managers). Mark each verified / assumption / gap. Edit only files in this folder." |
| P3 | 2 logic | `site/layers/proposal/*.js`, `template.json`, `site/api/proposal.js` | "Read AGENTS.md and CONTRACTS.md. Improve proposal.js and engine.js; write a realistic template.json; make /api/proposal return good guidelines. Do not touch other layers." |
| P4 | 3 Render | `site/layers/render/`, `site/api/render.js` | "Read AGENTS.md and CONTRACTS.md. Make /api/render produce good concept images from the prompt; improve the prompt builder in render.js. Optional: let the user upload a site photo for image-to-image. Do not touch other layers." |
| P5 | Shell | `site/index.html`, `site/core/`, `docs/`, root `*.md` | Integration, Vercel + env vars, merges, pitch, demo script. |

## Migration from the earlier starter (do once, now)
1. Everyone: commit and push your current work to your branch.
2. P5: replace the repo contents with this kit on a branch `p5/three-layers`, then move any real work from the old paths:
   - `site/data/rules.json | grants.json | sources.json` → `site/layers/proposal/data/`
   - `site/data/proposal.json` → merge its components into `site/layers/proposal/data/template.json`
   - `site/js/engine.js` → `site/layers/proposal/engine.js`
3. P5 merges to `main`, posts "pull now". Everyone: `git checkout main && git pull`, then create a new branch from main.

## Rhythm
| Time | |
|---|---|
| ~13:00 | Restructure merged; live URL shows all 3 layers on sample data |
| 13:10 | Checkpoint: demo click path Map → Proposal → Render |
| 13:10–13:40 | Replace SAMPLE data with real; turn on API keys; PRs every ~15 min |
| 13:45 | Code freeze. P5: Netlify Drop backup, incognito test |
| 14:00 | Final session |

## Rules of the road
- Edit only your folder. If you need another layer to change, message its owner.
- Talk between layers only via `App.emit` / `App.on` with the objects in CONTRACTS.md.
- Pull with rebase before every push. Small PRs. P5 merges.
- Everything must still work when `App.api` returns `null`.
- API keys only in Vercel env vars, never in files.
