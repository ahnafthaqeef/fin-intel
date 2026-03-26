import { NextRequest } from "next/server";
import { PDFParse } from "pdf-parse";

function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    chunks.push(chunk);
    i += chunkSize - overlap;
  }
  return chunks;
}

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
    const text = pdfData.text;

    if (!text.trim()) {
      return Response.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    const chunks = chunkText(text);

    return Response.json({
      filename: file.name,
      pages: pdfData.total ?? 0,
      wordCount: text.split(/\s+/).length,
      chunks,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Parsing failed" }, { status: 500 });
  }
}
