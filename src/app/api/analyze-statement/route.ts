import { NextRequest } from "next/server";
import { PDFParse } from "pdf-parse";
import { groq, MODEL } from "@/lib/groq";

const SYSTEM_PROMPT = `You are a financial analyst AI. Analyze the bank statement text provided and return a JSON object with this exact structure:
{
  "period": "detected date range e.g. Jan 2025 - Mar 2025",
  "currency": "MYR or USD etc",
  "summary": "2-3 sentence executive summary of the account activity",
  "totalCredits": 0.00,
  "totalDebits": 0.00,
  "netFlow": 0.00,
  "topCategories": [
    { "name": "Category name", "amount": 0.00, "percentage": 0 }
  ],
  "anomalies": [
    { "description": "What is unusual", "amount": 0.00, "severity": "low|medium|high" }
  ],
  "insights": [
    "Key insight 1",
    "Key insight 2"
  ]
}

Rules:
- topCategories: list up to 6 spending categories by total amount
- anomalies: flag unusual transactions (large one-offs, round numbers, late-night transactions, duplicate amounts)
- insights: 3-5 actionable observations
- All amounts should be positive numbers
- Return ONLY valid JSON, no markdown, no explanation`;

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
    const text = pdfData.text.slice(0, 10000);

    if (!text.trim()) {
      return Response.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Bank statement:\n\n${text}` },
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
