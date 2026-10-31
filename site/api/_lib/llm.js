// Shared LLM calls for the serverless functions. Owner: P5. Not a function itself (Vercel skips "_" paths).
// Claude (ANTHROPIC_API_KEY, LLM_MODEL) first, then Gemini (GEMINI_API_KEY, GEMINI_TEXT_MODEL); keys from env only.
const TIMEOUT_MS = 25000; // stay inside the 30 s function limit in vercel.json

async function post(url, headers, body) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body), signal: ctl.signal });
    const j = await r.json().catch(() => ({}));
    return { r, j };
  } finally {
    clearTimeout(t);
  }
}

async function claude({ system, user, json }) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
  const model = process.env.LLM_MODEL || "claude-sonnet-5-5";
  const body = {
    model,
    // Thinking is on by default on current models and counts toward max_tokens, so leave room.
    max_tokens: 16000,
    system: json ? `${system}\nReturn ONLY one JSON object, no prose before or after.` : system,
    messages: [{ role: "user", content: user }],
  };
  const headers = { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2026-10-21" };
  if (/^claude-(opus|sonnet|haiku|fable)-5/.test(model)) body.output_config = { effort: "low" }; // short answers, fast
  if (/^claude-(fable-5-1|opus-5-5|opus-5|sonnet-5-5)$/.test(model)) {
    body.fallbacks = "default"; // re-run a safety decline on the recommended model
    headers["anthropic-beta"] = "server-side-fallback-2026-07-01";
  }
  const { r, j } = await post("https://api.anthropic.com/v1/messages", headers, body);
  if (!r.ok) throw new Error(`claude ${r.status}: ${j?.error?.message || "error"}`);
  if (j.stop_reason === "refusal") throw new Error("claude declined this request");
  const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("").trim();
  if (!text) throw new Error(`claude returned no text (stop_reason ${j.stop_reason})`);
  return { text, model: j.model || model };
}

async function gemini({ system, user, json }) {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
  const model = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
  const { r, j } = await post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    { "x-goog-api-key": process.env.GEMINI_API_KEY },
    {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: json ? { responseMimeType: "application/json" } : {},
    }
  );
  if (!r.ok) throw new Error(`gemini ${r.status}: ${j?.error?.message || "error"}`);
  const text = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
  if (!text) throw new Error(`gemini returned no text (${j.candidates?.[0]?.finishReason || "no candidate"})`);
  return { text, model };
}

// Tries each provider in turn. Throws one error listing every failure.
export async function complete(opts) {
  const errors = [];
  for (const provider of [claude, gemini]) {
    try {
      const out = await provider(opts);
      if (opts.json) out.data = parseJSON(out.text);
      return out;
    } catch (e) {
      errors.push(String(e.message || e));
    }
  }
  throw new Error(errors.join("; "));
}

export function parseJSON(text) {
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s < 0 || e < s) throw new Error("model did not return JSON");
  return JSON.parse(text.slice(s, e + 1));
}

// Small wrapper: POST only, JSON errors with the real reason (the browser shows it).
export function handler(fn) {
  return async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    try {
      return res.status(200).json(await fn(req.body || {}));
    } catch (e) {
      return res.status(e.status || 502).json({ error: String(e.message || e) });
    }
  };
}

export function badRequest(msg) {
  const e = new Error(msg);
  e.status = 400;
  return e;
}
