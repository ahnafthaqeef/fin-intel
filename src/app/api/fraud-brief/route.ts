import { NextRequest } from "next/server";
import { getGroq, MODEL } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicantName,
      applicationCount,
      applicationWindowDays,
      identityCheckResult,
      identityCheckFailures,
      addressMatchCount,
      courtRecords,
      employerVerified,
      incomeConsistency,
      deviceFlags,
      additionalNotes,
    } = body;

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a fraud risk analyst assistant. Given a set of fraud signals for a credit application, generate a structured analyst brief. Return a JSON object:
{
  "riskLevel": "Low | Medium | High | Critical",
  "riskScore": 0-100,
  "verdict": "Approve | Manual Review | Escalate | Decline",
  "summary": "2-3 sentence plain-language risk summary for the analyst",
  "redFlags": ["Specific red flags with evidence"],
  "mitigatingFactors": ["Factors that reduce suspicion"],
  "recommendedActions": ["Specific next steps for the fraud analyst"],
  "signalBreakdown": [
    { "signal": "Signal name", "value": "Signal value", "riskContribution": "Low | Medium | High" }
  ]
}

Rules:
- The AI does NOT make the final decision — the human analyst does
- Be specific and cite the actual signal values in your reasoning
- If a signal is normal, say so — do not inflate risk
- Return ONLY valid JSON`,
        },
        {
          role: "user",
          content: `Fraud signals for application review:

Applicant: ${applicantName || "Anonymous"}
Credit applications in ${applicationWindowDays || 30} days: ${applicationCount}
Identity check result: ${identityCheckResult} (${identityCheckFailures} failures)
Address matches other recent applications: ${addressMatchCount} matches
Court/legal records: ${courtRecords || "None found"}
Employer verification: ${employerVerified ? "Verified" : "Unverified"}
Income vs. bank statement consistency: ${incomeConsistency}
Device/digital flags: ${deviceFlags || "None"}
Additional notes: ${additionalNotes || "None"}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const result = JSON.parse(raw);
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
