# Team workflow — 31 Oct, build until 13:45

Five people, one repo, each with an AI coding agent. This works because each person edits **only their own folder** and layers talk **only through `App` events** (CONTRACTS.md). Your agent can't break someone else's layer if it never opens their files.

## Roles
| Person | Layer | You edit | Give your agent |
|---|---|---|---|
| P1 (mugheeskiyani115-oss) | 1 Map — 3D digital twin | `site/src/App.tsx`, `main.tsx`, `index.css`, `site/index.html`, `site/src/layers/space.ts`, `site/public/layers/map/`, `pipeline/spaces/` | `pipeline/spaces/README.md` |
| P2 | 2 data | `site/public/layers/proposal/data/` (not `template.json`), `pipeline/sources/` | `pipeline/sources/README.md`, then `pipeline/sources/grants/README.md` |
| P3 | 2 logic | `site/src/layers/proposal/`, `site/public/layers/proposal/engine.js`, `data/template.json`, `site/api/proposal.js`, `pipeline/case/` | `pipeline/case/README.md` |
| P4 (RestfulCube) | 3 Render | `site/src/layers/render/`, `site/api/render.js`, `pipeline/render/` | `pipeline/render/README.md` |
| P5 | Shell | `site/src/layers/{bus.ts,ui.tsx,LayerDock.tsx}`, `site/package*.json`, `site/vite.config.ts`, `site/vercel.json`, `docs/`, `tools/`, `.github/`, root `*.md` | `docs/README.md` · merges PRs |

## 1. Set up (once, ~5 min)
```bash
git clone https://github.com/Jamie-petro/Smart-JAMPS.git
```
```bash
cd Smart-JAMPS
```
```bash
git checkout -b p1/spaces
```
(Use your own number and topic: `p2/rules`, `p3/engine`, `p4/render` …)

Run the app locally (Node 20+) and open http://localhost:3000:
```bash
cd site
```
```bash
npm install
```
```bash
npm run dev
```
You should see the 3D twin; the amber **Open Layer 2 · Proposal & Layer 3 · Render** button opens the dock with the proposal for the selected site, and Render gives a labelled image. That's the baseline — keep it working.

## 2. Start your agent
Open the agent **in the repo root** (not inside `site/`).
- **Claude Code** reads `CLAUDE.md` automatically. **Codex, Cursor, Copilot agent** read `AGENTS.md`.
- Any other tool (ChatGPT, Gemini, …): paste `AGENTS.md`, `CONTRACTS.md` and your brief into the chat first.

First prompt (change P1 and the brief path to yours):
> I am P1. Read AGENTS.md, CONTRACTS.md and pipeline/spaces/README.md. Edit only the folders AGENTS.md gives P1. Do step 1 of the brief only, then stop, run `node tools/check.js`, and list the files you changed.

## 3. The loop (repeat every 10–15 min)
1. **One step per prompt.** "Do step 2" beats "do everything". Small steps = small diffs you can actually check.
2. **Check the diff is only your folder:**
   ```bash
   git status --short
   ```
   If a file outside your folder changed, undo it (`git checkout -- <path>`) and tell the agent "do not edit that file".
3. **Validate:**
   ```bash
   node tools/check.js
   ```
   If it fails, paste the output to your agent: "fix these errors".
4. **Look at it:** reload http://localhost:3000, pick a site in the twin, open the dock, click Proposal → Render, open the browser console (F12) — no red errors.
5. **Commit and push:**
   ```bash
   git add -A && git commit -m "P1: add 10 real spaces"
   ```
   ```bash
   git pull --rebase origin main
   ```
   ```bash
   git push -u origin HEAD
   ```
6. **Open a PR** on GitHub (the "Compare & pull request" button), fill the checklist. The `check` action runs `tools/check.js`. P5 merges. Keep working on the same branch; later pushes update the PR, or open a new one after it's merged.

## Prompts that work
- "Replace the SAMPLE entries in `<file>` with real ones. Keep the schema in SCHEMA.md exactly. Mark anything you did not confirm on an official page as `assumption`."
- "Here is the text of <official page URL>: … Extract requirements for an outdoor amplified performance. Quote the sentence that supports each. Say 'not stated' if absent. Don't infer."
- "The proposal panel shows X but should show Y. Change only `proposal.js`."
- "Explain what `engine.js` `workplan()` does before changing it."

## Prompts to avoid
- "Make the app better" / "fix everything" — the agent will wander into other layers.
- "Add React / a build step / npm package" — not allowed in `site/` (AGENTS.md).
- "Make it say the user qualifies" — honesty rules; we say "appears to meet", "check with <agency>".
- Pasting an API key into the chat or a file. Keys live only in Vercel env vars.

## When something goes wrong
| Problem | Do this |
|---|---|
| Agent edited another person's file | `git checkout -- <path>` (or `git restore <path>`), then re-prompt: "only edit <your folder>" |
| You need something from another layer | Use the data in the event payload (`on("space:selected", s => …)` / `useBus()` from `site/src/layers/bus.ts`). If a field is missing, ask its owner to add an optional field — don't add it yourself |
| `git pull --rebase` conflict | You probably edited a file you don't own. `git rebase --abort`, then ask P5 |
| Page is blank | Browser console (F12) → paste the red error to your agent |
| `/api/...` returns nothing locally | Normal — `npm run dev` has no backend; the layer must fall back to demo data. Test APIs on the Vercel preview (below) |
| `check.js` says "verified but …" | Either link a source you opened today with `checked_on`, or change the status to `assumption` |

## Testing the AI endpoints (P3, P4)
- If the repo is connected to Vercel, every pushed branch gets a **preview URL** (shown on the PR). P5 must set the env vars for **Preview** as well as Production.
- Or run locally with the backend: `npm i -g vercel`, `vercel link`, `vercel env pull .env`, `vercel dev`. `.env` is git-ignored — never commit it.

## Rhythm
| Time | |
|---|---|
| ~13:00 | Live URL shows all 3 layers on sample data |
| 13:10 | Checkpoint: demo click path Map → Proposal → Render on the live URL |
| 13:10–13:40 | Replace SAMPLE data with real; turn on API keys; PR every ~15 min |
| 13:40 | Last PRs. `node tools/check.js` warnings show remaining SAMPLE placeholders |
| 13:45 | Code freeze. P5: Netlify Drop backup of `site/`, incognito test |
| 14:00 | Final session |

## Rules of the road
- Edit only your folder. Need another layer changed → message its owner.
- Layers talk only via `bus.ts` (`emit` / `on` / `useBus`) with the objects in CONTRACTS.md.
- `git pull --rebase origin main` before every push. Small PRs. P5 merges. Never force-push `main`.
- Everything must still work when `api(...)` returns `null`.
- `cd site && npm run build` must pass before you push (Vercel runs the same build).
- API keys only in Vercel env vars, never in files or chat.
