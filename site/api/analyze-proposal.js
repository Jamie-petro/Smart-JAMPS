// POST /api/analyze-proposal  { proposal } → { success, analysis, source }   Owner: P4
// Vercel serverless function (ported from the render-layer Express server.ts; used by the dock's Review tab).
// Errors (no key, model error) return 502 with the reason; the browser then shows the rule-based fallback.
import { badRequest, complete, handler } from "./_lib/llm.js";

export default handler(async ({ proposal }) => {
  if (!proposal) throw badRequest("Proposal data is required");
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

  const out = await complete({
    system: "You are a Singapore arts placemaking and public-sector governance adviser. Be precise; say what must be checked with the agency.",
    user: prompt,
    json: true,
  });
  return { success: true, analysis: out.data, source: out.model };
});
