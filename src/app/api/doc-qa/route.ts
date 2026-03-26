import { NextRequest } from "next/server";
import { groq, MODEL } from "@/lib/groq";

function findRelevantChunks(
  chunks: string[],
  question: string,
  topK = 5
): string[] {
  const keywords = question
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const scored = chunks.map((chunk) => {
    const lower = chunk.toLowerCase();
    const score = keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0
    );
    return { chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk);
}

export async function POST(request: NextRequest) {
  try {
    const { chunks, question } = await request.json();

    if (!chunks?.length || !question?.trim()) {
      return Response.json(
        { error: "Missing chunks or question" },
        { status: 400 }
      );
    }

    const relevant = findRelevantChunks(chunks, question);
    const context = relevant.join("\n\n---\n\n");

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a financial document analyst. Answer questions based ONLY on the document context provided. If the answer is not in the context, say so clearly. Be concise and precise.`,
        },
        {
          role: "user",
          content: `Document context:\n\n${context}\n\n---\n\nQuestion: ${question}`,
        },
      ],
      stream: true,
      temperature: 0.2,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
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
    return Response.json({ error: "Q&A failed" }, { status: 500 });
  }
}
