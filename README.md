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
  api/analyze-proposal.js       serverless AI plan review (Review tab)           P4
  api/advisor.js                serverless chat about the plan (Review tab)      P4
  api/_lib/llm.js               shared Claude → Gemini calls for all endpoints   P5
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
### Chat spend (Claude API key)
The Review-tab chat (`/api/advisor`) uses only `ANTHROPIC_API_KEY`, with thinking off and at most 1,024 output tokens per reply. One message is roughly 3–5k input tokens (the plan) and 100–300 output tokens — about S$0.01 on Claude Sonnet 5.5. `CHAT_LIMIT_PER_HOUR` (per visitor) and `CHAT_LIMIT_PER_DAY` cap use; they are in-memory per server instance, so they are soft caps. Each reply logs its token use in Vercel → Logs ("advisor usage").
A Claude.ai Pro/Max subscription does not cover API calls: API keys draw on prepaid credits in the Claude Console. For a hard cap, in the Console use a key from a workspace made for this app, set that workspace's monthly spend limit, and turn off credit auto-reload, so calls stop when the limit or the credits run out.

Backup: run `npm run build` in `site/` and Netlify Drop the `site/dist` folder (no APIs there; the app still runs on fallbacks).
