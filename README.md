# Arts Ideas → Places — AI for the Built Environment Hackathon (Challenge 6)

One app, three layers:
1. **Spaces** — OneMap map of Singapore with candidate spaces for arts events.
2. **Proposal** — for the chosen space: proposal, curation/enhancement guidelines, agency workplan, funding shortlist.
3. **Render** — AI concept image of the proposed event on that site.

Read `WORKFLOW.md` (who does what, how to vibe-code in this repo), `AGENTS.md` (rules for AI agents), `CONTRACTS.md` (how layers talk).

## Structure
```
site/                          ← deployed (Vercel Root Directory = site; Vite build → dist/)
  index.html, src/main.tsx      entry: Layer 1 app + the layer dock               P1 / P5
  src/App.tsx                   Layer 1 — 3D digital twin (MapLibre)             P1
  src/layers/space.ts           twin site → Space adapter                        P1
  src/layers/bus.ts             events + api() between layers                    P5
  src/layers/LayerDock.tsx, ui.tsx  dock hosting Layers 2–3 over the twin       P5
  src/layers/proposal/          Layer 2 panel + logic                            P3
  src/layers/render/            Layer 3 panel + logic                            P4
  src/layers/review/            Review tab: AI review + heritage leads           P4
  public/layers/render/images/  sample AI concept renders                        P4
  public/layers/proposal/       engine.js (P3) + data/*.json (P2; template.json P3)
  public/layers/map/data/       spaces.geojson (real candidate spaces, not yet in the twin)  P1
  api/proposal.js               serverless LLM drafting                          P3
  api/render.js                 serverless image generation                      P4
  api/analyze-proposal.js       serverless Gemini plan review (Review tab)     P4
pipeline/                      not deployed: task briefs, notes, prompts, raw outputs
tools/check.js                 validator — run before every push                 P5
.github/                       PR template + CI running tools/check.js           P5
docs/                          pitch, demo script, limitations                   P5
```

## Team
New here? Read `WORKFLOW.md` → set up, then give your agent your brief in `pipeline/<yours>/README.md`.
Before every push: `node tools/check.js`.

## Run locally
```bash
cd site && npm install && npm run dev
```
Open http://localhost:3000. The APIs fall back to template text and sample AI concept images (labelled as samples, not the selected site). With the serverless APIs: `npm i -g vercel`, then `vercel dev` (link to the project; env vars pulled from Vercel).

## Deploy
Vercel → New Project → import repo → Root Directory **`site`** → Deploy. `site/vercel.json` sets the build (`npm run build` → `dist`), so the Framework setting can stay **Other**.
Project Settings → Environment Variables: `ANTHROPIC_API_KEY`, `LLM_MODEL`, `IMAGE_PROVIDER` (`gemini` = Nano Banana, default | `openai`), `GEMINI_API_KEY` / `GEMINI_IMAGE_MODEL` or `OPENAI_API_KEY` / `OPENAI_IMAGE_MODEL`. Redeploy after adding keys.
Backup: run `npm run build` in `site/` and Netlify Drop the `site/dist` folder (no APIs there; the app still runs on fallbacks).
