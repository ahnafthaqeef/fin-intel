import { NextRequest } from "next/server";
import { groq, MODEL } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      initiativeName,
      description,
      teamSize,
      hoursSavedPerWeek,
      hourlyRate,
      implementationCost,
      maintenanceCostPerYear,
      timelineMonths,
    } = body;

    // Calculate ROI metrics
    const annualHoursSaved = hoursSavedPerWeek * 52 * teamSize;
    const annualValue = annualHoursSaved * hourlyRate;
    const year1Value = annualValue - implementationCost - maintenanceCostPerYear;
    const year3Value =
      annualValue * 3 - implementationCost - maintenanceCostPerYear * 3;
    const year5Value =
      annualValue * 5 - implementationCost - maintenanceCostPerYear * 5;
    const roi = ((year1Value / implementationCost) * 100).toFixed(1);
    const paybackMonths = implementationCost / (annualValue / 12);

    const metrics = {
      annualHoursSaved,
      annualValue,
      year1Value,
      year3Value,
      year5Value,
      roi,
      paybackMonths: paybackMonths.toFixed(1),
    };

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a senior AI strategy consultant. Write a concise business case narrative for an AI initiative. Be direct and data-driven. Structure your response as:

1. **Executive Summary** (2-3 sentences)
2. **Value Drivers** (bullet points)
3. **Risks & Assumptions** (bullet points)
4. **Recommendation** (1-2 sentences with clear go/no-go stance)

Keep it under 300 words.`,
        },
        {
          role: "user",
          content: `Initiative: ${initiativeName}
Description: ${description}
Team size affected: ${teamSize} people
Hours saved per person per week: ${hoursSavedPerWeek}h
Hourly rate: RM${hourlyRate}
Implementation cost: RM${implementationCost.toLocaleString()}
Annual maintenance: RM${maintenanceCostPerYear.toLocaleString()}
Timeline: ${timelineMonths} months to deploy
ROI (Year 1): ${roi}%
Payback period: ${paybackMonths.toFixed(1)} months
Annual value generated: RM${annualValue.toLocaleString()}
3-year net value: RM${year3Value.toLocaleString()}`,
        },
      ],
      stream: true,
      temperature: 0.3,
    });

    // Stream the metrics as a header line first, then the narrative
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        // First chunk: metrics JSON
        controller.enqueue(
          encoder.encode(`__METRICS__${JSON.stringify(metrics)}__END__\n\n`)
        );
        // Then stream the narrative
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Calculation failed" }, { status: 500 });
  }
}
