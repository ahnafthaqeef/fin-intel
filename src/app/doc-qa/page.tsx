"use client";

import { useState, useRef } from "react";
import Nav from "@/components/Nav";

type DocMeta = { filename: string; pages: number; wordCount: number; chunks: string[] };
type Message = { role: "user" | "assistant"; content: string };

export default function DocQAPage() {
  const [doc, setDoc] = useState<DocMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function uploadDoc(file: File) {
    setUploading(true);
    setError("");
    setDoc(null);
    setMessages([]);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/parse-doc", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDoc(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function ask() {
    if (!doc || !input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/doc-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunks: doc.chunks, question }),
      });

      if (!res.ok) throw new Error("Q&A failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + text,
          };
          return updated;
        });
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err: unknown) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Financial Doc Q&A</h1>
          <p className="text-slate-400 text-sm">
            Upload any financial document. Ask questions in plain English.
          </p>
        </div>

        {/* Upload zone */}
        {!doc && (
          <div
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f?.type === "application/pdf") uploadDoc(f);
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center cursor-pointer hover:border-violet-500 transition-colors"
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadDoc(f);
              }}
            />
            <div className="text-3xl mb-3">💬</div>
            {uploading ? (
              <p className="text-slate-400 animate-pulse">Parsing document…</p>
            ) : (
              <>
                <p className="text-slate-300 font-medium">Drop your financial document here</p>
                <p className="text-slate-500 text-sm mt-1">PDF only · Reports, contracts, statements</p>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 my-4 text-sm">
            {error}
          </div>
        )}

        {/* Chat interface */}
        {doc && (
          <div className="flex flex-col flex-1 gap-4">
            {/* Doc info bar */}
            <div className="flex items-center justify-between bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-violet-400 text-lg">📄</span>
                <div>
                  <p className="text-sm font-medium text-slate-200">{doc.filename}</p>
                  <p className="text-xs text-slate-500">
                    {doc.pages} pages · {doc.wordCount.toLocaleString()} words
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDoc(null);
                  setMessages([]);
                }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Change doc
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto pr-1">
              {messages.length === 0 && (
                <div className="text-center text-slate-600 py-12 text-sm">
                  Ask anything about your document
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {msg.content || (loading && i === messages.length - 1 ? "▌" : "")}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()}
                placeholder="Ask about this document…"
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                onClick={ask}
                disabled={!input.trim() || loading}
                className="px-5 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors"
              >
                Ask
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
