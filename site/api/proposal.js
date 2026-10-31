// POST /api/proposal  { space, draft } → { title, summary, guidelines[], visual_brief, model }   Owner: P3
// Vercel serverless function ("Rewrite with AI" in the Plan tab). Keys from Vercel env vars only.
import { badRequest, complete, handler } from "./_lib/llm.js";

const SYSTEM = `You help an arts group in Singapore plan a placemaking event at a specific site.
Return a JSON object with keys:
"title" (short), "summary" (2-3 sentences),
"guidelines" (3-6 items, each {"category": one of curation|programming|community|accessibility|site_care, "text": one actionable sentence, "why": one sentence}),
"visual_brief" (one paragraph describing what the event looks like on this site, for an image generator).
Rules: do not claim any permit, approval or funding is granted; do not invent regulations or agency requirements; suggest only genuine changes to the activities; write in UK/Singapore English.`;

export default handler(async ({ space, draft }) => {
  if (!space || !draft) throw badRequest("space and draft required");
  const out = await complete({
    system: SYSTEM,
    user: JSON.stringify({ space, activities: draft.components, summary: draft.summary }),
    json: true,
  });
  return { ...out.data, model: out.model };
});
