import { NextRequest } from "next/server";
import { PDFParse } from "pdf-parse";
import { getGroq, MODEL } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const text = pdfData.text.slice(0, 8000);

    if (!text.trim()) {
      return Response.json({ error: "Could not extract text from PDF" }, { status: 400 });
    }

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a financial advisor explaining a credit report to a regular person. Analyse the credit report and return a JSON object with this structure:
{
  "overallHealth": "Good | Fair | Poor | Excellent",
  "healthScore": 0-100,
  "summary": "2-3 sentence plain-English summary of the credit picture",
  "positives": ["What is working in their favour"],
  "concerns": ["What is hurting their credit or raising red flags"],
  "recommendations": ["Specific actions they can take to improve"],
  "keyFacts": [
    { "label": "Fact label", "value": "Fact value" }
  ]
}

Rules:
- Use simple, jargon-free language — write for someone with no financial background
- Be honest but constructive
- keyFacts: extract up to 6 key data points (e.g. total accounts, payment history, outstanding debt, legal cases)
- Return ONLY valid JSON, no markdown, no explanation`,
        },
        {
          role: "user",
          content: `Credit report document:\n\n${text}`,
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
