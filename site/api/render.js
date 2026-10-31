// POST /api/render  { prompt, size } → { images: [{src, alt}], model }   Owner: P4
// Vercel serverless function. Keys come from Vercel env vars only.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { prompt, size = "1536x1024" } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt required" });
  const provider = (process.env.IMAGE_PROVIDER || "openai").toLowerCase();

  try {
    if (provider === "gemini") {
      const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY || "" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const j = await r.json();
      if (!r.ok) return res.status(502).json({ error: "gemini", detail: j });
      const parts = j.candidates?.[0]?.content?.parts || [];
      const images = parts.filter((p) => p.inlineData).map((p) => ({ src: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`, alt: "AI concept render" }));
      return res.status(200).json({ images, model });
    }

    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}` },
      body: JSON.stringify({ model, prompt, size, n: 1 }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: "openai", detail: j });
    const images = (j.data || []).map((d) => ({ src: d.b64_json ? `data:image/png;base64,${d.b64_json}` : d.url, alt: "AI concept render" }));
    return res.status(200).json({ images, model });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
