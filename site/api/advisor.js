// POST /api/advisor  { question, history?, plan } → { answer, model }   Owner: P4 (Review tab chat)
// Answers questions about the current plan, using only the plan data sent by the browser.
import { badRequest, complete, handler } from "./_lib/llm.js";

const SYSTEM = `You are an assistant inside a Singapore arts placemaking planner.
Answer the user's question using ONLY the plan data provided (site, activities, steps with agencies and status, funding shortlist, ideas, items still to check).
- Be short: 2-5 sentences or a short list. Plain text, no markdown headings.
- Name the specific step, agency or grant from the data. Mention its status (verified / assumption / gap) when it matters.
- If the data does not answer it, say so and name which agency to ask. Never invent rules, lead times, fees or grant amounts.
- Never say the user will be approved or qualifies; say "appears to meet" or "check with <agency>".`;

export default handler(async ({ question, history, plan }) => {
  if (!question || !plan) throw badRequest("question and plan required");
  const past = (history || []).slice(-6).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n");
  const out = await complete({
    system: SYSTEM,
    user: `PLAN DATA:\n${JSON.stringify(plan)}\n\n${past ? `EARLIER CHAT:\n${past}\n\n` : ""}QUESTION: ${String(question).slice(0, 1000)}`,
  });
  return { answer: out.text, model: out.model };
});
