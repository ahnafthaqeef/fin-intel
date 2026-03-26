"use client";

import { useState, useRef, useEffect } from "react";
import Nav from "@/components/Nav";
import { SAMPLE_DOC_META, SUGGESTED_QUESTIONS } from "@/lib/sampleData";

type DocMeta = {
  filename: string;
  pages: number;
  wordCount: number;
  chunks: string[];
};
type Message = { role: "user" | "assistant"; content: string; ts: string };

function getTimestamp() {
  return new Date().toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DocQAPage() {
  const [doc, setDoc] = useState<DocMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function uploadDoc(file: File) {
    setUploading(true);
    setError("");
    setDoc(null);
    setMessages([]);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/parse-doc", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDoc(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function loadSample() {
    setDoc(SAMPLE_DOC_META);
    setMessages([]);
    setError("");
  }

  async function ask(question?: string) {
    const q = (question ?? input).trim();
    if (!doc || !q || loading) return;
    setInput("");
    const ts = getTimestamp();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: q, ts },
    ]);
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", ts: getTimestamp() },
    ]);

    try {
      const res = await fetch("/api/doc-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunks: doc.chunks, question: q }),
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
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + text,
          };
          return updated;
        });
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
      chatInputRef.current?.focus();
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">
              Financial Doc Q&A
            </h1>
            <p className="text-slate-400 text-sm">
              Upload any financial document. Ask questions in plain English and
              get grounded, cited answers.
            </p>
          </div>
          {!doc && (
            <button
              onClick={loadSample}
              className="shrink-0 px-4 py-2 rounded-xl border border-violet-500/40 text-violet-400 text-sm font-medium hover:bg-violet-500/10 transition-colors"
            >
              Load Sample Report
            </button>
          )}
        </div>

        {/* Upload zone — only shown when no doc */}
        {!doc && (
          <div
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f?.type === "application/pdf") uploadDoc(f);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-violet-500 bg-violet-500/5 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                : "border-slate-700 hover:border-violet-500 hover:bg-violet-500/5 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
            }`}
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
              <p className="text-slate-400 animate-pulse">
                Parsing document…
              </p>
            ) : (
              <>
                <p className="text-slate-300 font-medium">
                  Drop your financial document here
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  PDF only · Reports, contracts, statements
                </p>
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
                  <p className="text-sm font-medium text-slate-200">
                    {doc.filename}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {doc.pages} pages
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {doc.wordCount.toLocaleString()} words
                    </span>
                  </div>
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
            <div className="flex-1 space-y-3 min-h-[300px] max-h-[420px] overflow-y-auto pr-1">
              {messages.length === 0 && (
                <div className="text-center text-slate-600 py-12 text-sm">
                  Ask anything about your document
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="shrink-0 w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-sm mt-1">
                      🤖
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-violet-600 text-white rounded-tr-sm"
                          : "bg-slate-800 text-slate-200 rounded-tl-sm"
                      }`}
                    >
                      {msg.content ||
                        (loading && i === messages.length - 1 ? "▌" : "")}
                    </div>
                    <span
                      className={`text-xs text-slate-600 ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.ts}
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <div className="shrink-0 w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-sm mt-1">
                      👤
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Suggested question chips */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    disabled={loading}
                    className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-3">
              <input
                ref={chatInputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()}
                placeholder="Ask about this document…"
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                onClick={() => ask()}
                disabled={!input.trim() || loading}
                className="px-5 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors"
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
