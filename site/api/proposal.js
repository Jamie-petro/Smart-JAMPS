// POST /api/proposal  { space, draft } → { title, summary, guidelines[], visual_brief, model }   Owner: P3
// Vercel serverless function. Key from Vercel env var ANTHROPIC_API_KEY.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { space, draft } = req.body || {};
  if (!space || !draft) return res.status(400).json({ error: "space and draft required" });
  const model = process.env.LLM_MODEL || "claude-sonnet-5-5";

  const instructions = `You help an arts group in Singapore plan a placemaking event at a specific site.
Return ONLY a JSON object with keys:
"title" (short), "summary" (2-3 sentences),
"guidelines" (3-6 items, each {"category": one of curation|programming|community|accessibility|site_care, "text": one actionable sentence, "why": one sentence}),
"visual_brief" (one paragraph describing what the event looks like on this site, for an image generator).
Rules: do not claim any permit, approval or funding is granted; do not invent regulations or agency requirements; suggest only genuine changes to the activities; write in UK/Singapore English.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        system: instructions,
        messages: [{ role: "user", content: JSON.stringify({ space, activities: draft.components, summary: draft.summary }) }],
      }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: "anthropic", detail: j });
    const text = (j.content || []).map((c) => c.text || "").join("");
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    return res.status(200).json({ ...json, model });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
