// POST /api/analyze-proposal  { proposal } → { success, analysis, source }   Owner: P4
// Vercel serverless function (ported from the render-layer Express server.ts; used by the dock's Review tab). Key from Vercel env var GEMINI_API_KEY.
// Returns 502 when Gemini is unavailable; the browser then shows the rule-based fallback, labelled as such.
export default async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { proposal } = req.body || {};
  if (!proposal) return res.status(400).json({ error: "Proposal data is required" });
  if (!process.env.GEMINI_API_KEY) return res.status(502).json({ error: "GEMINI_API_KEY not set" });
  const model = process.env.GEMINI_TEXT_MODEL || "gemini-3.8-flash";

  const prompt = `Analyze this arts-led placemaking proposal in Singapore:
Title: ${proposal.title}
Subtitle: ${proposal.subtitle}
Artform: ${proposal.artform}
Precinct: ${proposal.precinct} (${proposal.locationSpecifics})
Venue Tenure: ${proposal.venueTenure}
Duration: ${proposal.durationDays} days
Audience: ${proposal.expectedAudience}
Outdoor: ${proposal.isOutdoor}
Temporary Structures: ${proposal.hasTemporaryStructures ? `Yes, ${proposal.structureHeightMeters}m height, ${proposal.structureFootprintSqm} sqm` : "No"}
Amplified Sound: ${proposal.hasAmplifiedSound ? `Yes, ~${proposal.decibelEstimateDb} dB` : "No"}
Night Lighting: ${proposal.nightLighting ? "Yes" : "No"}
Total Budget: SGD $${proposal.totalBudget}
Community Involvement: ${proposal.communityInvolvementPlan}
Safety Plan: ${proposal.safetyPlan}
Budget Line Items:
${(proposal.lineItems || []).map((li) => `- ${li.title} ($${li.cost}) -> Assigned to ${li.assignedGrant}`).join("\n")}

Return ONLY a JSON object with this shape:
{"strategicSummary": "2-3 sentences",
 "strengtheningRecommendations": [{"area": "", "issue": "", "concreteImprovement": "a real change to the project, never a re-description", "targetedGrants": [""], "impactExplanation": ""}],
 "regulatoryWarnings": [{"agency": "", "severity": "critical|moderate|caution", "warning": "", "actionableFix": ""}],
 "coFundingStrategy": {"recommendedSplit": [{"grant": "", "amount": 0, "percentage": 0, "rationale": ""}], "doubleFundingRisks": [""], "cashflowMilestoneTip": ""},
 "verifiedVsAssumedSummary": {"verifiedCount": 0, "assumptionsCount": 0, "criticalGapsToClose": [""]}}
Rules: do not claim any permit, approval or funding is granted; do not invent regulations, lead times or grant caps — if unsure, put it in criticalGapsToClose as something to confirm with the agency.`;

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You are a Singapore arts placemaking and public-sector governance adviser. Be precise; say what must be checked with the agency." }],
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: `gemini ${r.status}`, detail: j?.error?.message });
    const text = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
    const analysis = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    return res.status(200).json({ success: true, analysis, source: model });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
};
