// POST /api/render  { prompt, size } → { images: [{src, alt}], model }   Owner: P4
// Vercel serverless function. Keys come from Vercel env vars only.
// Tries IMAGE_PROVIDER first, then the other provider if its key is set; 502 if none returns an image
// (the browser then falls back to a keyless service or a labelled placeholder).
const SIZES = ["1024x1024", "1536x1024", "1024x1536"];

async function openai(prompt, size) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
  const gptImage = model.startsWith("gpt-image");
  const body = { model, prompt, size: SIZES.includes(size) ? size : "1536x1024", n: 1 };
  // JPEG keeps the base64 response well under Vercel's 4.5 MB body limit; medium quality keeps it fast.
  if (gptImage) Object.assign(body, { quality: "medium", output_format: "jpeg", output_compression: 80 });
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`openai ${r.status}: ${j?.error?.message || "error"}`);
  const mime = gptImage ? "image/jpeg" : "image/png";
  const images = (j.data || []).map((d) => ({ src: d.b64_json ? `data:${mime};base64,${d.b64_json}` : d.url, alt: "AI concept render" }));
  return { images, model };
}

// Nano Banana = gemini-2.5-flash-image (set GEMINI_IMAGE_MODEL for a newer Nano Banana model).
const ASPECT = { "1536x1024": "3:2", "1024x1024": "1:1", "1024x1536": "2:3" };
async function gemini(prompt, size) {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
  const call = (generationConfig) =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
    });
  let r = await call({ responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: ASPECT[size] || "3:2" } });
  if (r.status === 400) r = await call({ responseModalities: ["TEXT", "IMAGE"] }); // model without imageConfig support
  const j = await r.json();
  if (!r.ok) throw new Error(`gemini ${r.status}: ${j?.error?.message || "error"}`);
  const parts = j.candidates?.[0]?.content?.parts || [];
  const images = parts.filter((p) => p.inlineData).map((p) => ({ src: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`, alt: "AI concept render" }));
  return { images, model };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { prompt, size = "1536x1024" } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt required" });
  const first = (process.env.IMAGE_PROVIDER || "gemini").toLowerCase() === "openai" ? "openai" : "gemini";
  const order = first === "gemini" ? [gemini, openai] : [openai, gemini];
  const errors = [];
  for (const provider of order) {
    try {
      const out = await provider(String(prompt).slice(0, 4000), size);
      if (out.images.length) return res.status(200).json(out);
      errors.push(`${provider.name}: no image returned`);
    } catch (e) {
      errors.push(String(e.message || e));
    }
  }
  return res.status(502).json({ error: "no image provider succeeded", detail: errors });
};
