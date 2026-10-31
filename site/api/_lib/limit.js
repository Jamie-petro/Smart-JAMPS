// Usage limits for the chat. Owner: P5.
// In-memory and per server instance: Vercel may run several instances, so treat these as soft caps.
// The hard cap on spend is the monthly limit set in the Anthropic Console (see README "Chat spend").
const hits = new Map(); // ip -> timestamps (last hour)
let day = "", today = 0;

const num = (v, d) => (Number.isFinite(+v) && +v >= 0 ? +v : d);

export function checkChatLimit(req) {
  if (String(process.env.CHAT_ENABLED || "true").toLowerCase() === "false") return "the chat is switched off (CHAT_ENABLED=false)";
  const perHour = num(process.env.CHAT_LIMIT_PER_HOUR, 20);
  const perDay = num(process.env.CHAT_LIMIT_PER_DAY, 300);
  const now = Date.now();
  const d = new Date(now).toISOString().slice(0, 10);
  if (d !== day) (day = d), (today = 0);
  if (today >= perDay) return `daily chat limit reached (${perDay} messages); try again tomorrow`;
  const ip = String(req?.headers?.["x-forwarded-for"] || "anon").split(",")[0].trim();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  if (recent.length >= perHour) return `hourly chat limit reached (${perHour} messages); try again later`;
  recent.push(now);
  hits.set(ip, recent);
  today++;
  return null;
}
