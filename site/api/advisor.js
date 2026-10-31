// POST /api/advisor  { question, history?, plan } → { answer, model }   Owner: P4 (Review tab chat)
// Answers questions about the current plan, using only the plan data sent by the browser.
// Uses the team's Claude key only, with usage limits (_lib/limit.js) and short, thinking-off replies.
import { badRequest, complete, handler } from "./_lib/llm.js";
import { checkChatLimit } from "./_lib/limit.js";

const SYSTEM = `You are an assistant inside a Singapore arts placemaking planner.
Answer the user's question using ONLY the plan data provided (site, activities, steps with agencies and status, funding shortlist, ideas, items still to check).
- Be short: 2-5 sentences or a short list. Plain text, no markdown headings.
- Name the specific step, agency or grant from the data. Mention its status (verified / assumption / gap) when it matters.
- If the data does not answer it, say so and name which agency to ask. Never invent rules, lead times, fees or grant amounts.
- Never say the user will be approved or qualifies; say "appears to meet" or "check with <agency>".`;

const MAX_QUESTION = 500;
const MAX_PLAN = 15000; // characters of plan JSON sent to the model

export default handler(async ({ question, history, plan }, req) => {
  if (!question || !plan) throw badRequest("question and plan required");
  const limited = checkChatLimit(req);
  if (limited) {
    const e = new Error(limited);
    e.status = 429;
    throw e;
  }
  const past = (history || [])
    .slice(-6)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${String(m.text).slice(0, MAX_QUESTION)}`)
    .join("\n");
  const out = await complete({
    only: "claude",
    thinkingOff: true,
    maxTokens: 1024,
    system: SYSTEM,
    user: `PLAN DATA:\n${JSON.stringify(plan).slice(0, MAX_PLAN)}\n\n${past ? `EARLIER CHAT:\n${past}\n\n` : ""}QUESTION: ${String(question).slice(0, MAX_QUESTION)}`,
  });
  // Shows in Vercel → Logs, so spend can be checked per message.
  console.log("advisor usage", JSON.stringify({ model: out.model, input: out.usage?.input_tokens, output: out.usage?.output_tokens }));
  return { answer: out.text, model: out.model };
});
