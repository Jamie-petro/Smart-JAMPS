# Arts Ideas → Places — AI for the Built Environment Hackathon (Challenge 6)

One app, three layers:
1. **Spaces** — OneMap map of Singapore with candidate spaces for arts events.
2. **Proposal** — for the chosen space: proposal, curation/enhancement guidelines, agency workplan, funding shortlist.
3. **Render** — AI concept image of the proposed event on that site.

Read `WORKFLOW.md` (who does what, when), `AGENTS.md` (rules for AI agents), `CONTRACTS.md` (how layers talk).

## Structure
```
site/                         ← deployed (Vercel Root Directory = site)
  index.html                  shell page                      P5
  core/app.js, app.css        event bus, tabs, App.api        P5
  layers/map/                 Layer 1                         P1
    map.js, map.css, data/spaces.geojson
  layers/proposal/            Layer 2                         P3 (logic) + P2 (data/)
    proposal.js, engine.js, proposal.css
    data/template.json guidelines.json rules.json grants.json sources.json
  layers/render/              Layer 3                         P4
    render.js, render.css
  api/proposal.js             serverless LLM drafting         P3
  api/render.js               serverless image generation     P4
pipeline/                     offline notes/scripts per owner
docs/                         pitch, demo script, limitations P5
```

## Run locally
Static only (APIs fall back to template text and a labelled placeholder image):
```bash
python -m http.server 8000 -d site
```
With the serverless APIs: `npm i -g vercel`, then `vercel dev` from the repo root (link to the project; env vars pulled from Vercel).

## Deploy
Vercel → New Project → import repo → Framework **Other** → Root Directory **`site`** → no build command → Deploy.
Project Settings → Environment Variables: `ANTHROPIC_API_KEY`, `LLM_MODEL`, `IMAGE_PROVIDER` (`openai`|`gemini`), `OPENAI_API_KEY` / `OPENAI_IMAGE_MODEL` or `GEMINI_API_KEY` / `GEMINI_IMAGE_MODEL`. Redeploy after adding keys.
Backup: Netlify Drop the `site/` folder (no APIs there; the app still runs on fallbacks).
