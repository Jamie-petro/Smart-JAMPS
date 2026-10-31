# P4 — Layer 3 Render: AI concept images

Give this file to your agent as the task. You edit `site/src/layers/render/` (`RenderPanel.tsx`, `render.ts`), `site/api/render.js` and `pipeline/render/`.

**Goal:** from the Proposal's `visual_brief` (plus Space and guidelines), generate a believable concept image of the event on that site, clearly labelled "AI-generated concept, not a design or approval".

**Steps (time-boxed)**
1. (by 12:40) Get `/api/render` returning an image with one provider (`IMAGE_PROVIDER=openai` or `gemini`, key in Vercel env vars). Test with `vercel dev` or on the preview URL — the static server has no `/api`.
2. (by 13:05) Improve `buildPrompt` in `render.ts`: scale, Singapore context, time of day, the activities, the curation guidelines. Save prompt experiments and good/bad outputs in `pipeline/render/` (images go in `pipeline/render/cache/images/`, which is git-ignored).
3. (13:10–13:40, optional) Let the user upload a site photo for image-to-image; 2–3 variations; a "prompt used" disclosure under each image.

Must keep working with no backend: the labelled SVG placeholder (`is_demo: true`) stays. Render object shape is in CONTRACTS.md.
