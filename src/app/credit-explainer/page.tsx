"use client";

import { useState, useRef } from "react";
import Nav from "@/components/Nav";

type KeyFact = { label: string; value: string };
type Result = {
  overallHealth: string;
  healthScore: number;
  summary: string;
  positives: string[];
  concerns: string[];
  recommendations: string[];
  keyFacts: KeyFact[];
};

const healthColor: Record<string, string> = {
  Excellent: "text-emerald-400",
  Good: "text-blue-400",
  Fair: "text-yellow-400",
  Poor: "text-red-400",
};

const healthBg: Record<string, string> = {
  Excellent: "bg-emerald-500",
  Good: "bg-blue-500",
  Fair: "bg-yellow-500",
  Poor: "bg-red-500",
};

export default function CreditExplainerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/credit-explainer", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Credit Report Explainer</h1>
          <p className="text-slate-400 text-sm">
            Upload a credit report PDF. AI translates it into plain English — health score, positives,
            concerns, and what to do next.
          </p>
        </div>

        <div
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setFile(f); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-emerald-500 transition-colors mb-4"
        >
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div className="text-3xl mb-3">📋</div>
          {file ? (
            <p className="text-slate-200 font-medium">{file.name}</p>
          ) : (
            <>
              <p className="text-slate-300 font-medium">Drop your credit report here</p>
              <p className="text-slate-500 text-sm mt-1">PDF only · CTOS, CCRIS, or any credit report format</p>
            </>
          )}
        </div>

        <button onClick={analyze} disabled={!file || loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors mb-8">
          {loading ? "Analysing…" : "Explain My Credit Report"}
        </button>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm">{error}</div>}
        {loading && <div className="text-center text-slate-400 py-16 animate-pulse">Reading your credit report…</div>}

        {result && (
          <div className="space-y-5">
            {/* Health score */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center gap-6">
              <div className="shrink-0">
                <div className={`text-5xl font-black ${healthColor[result.overallHealth] ?? "text-slate-200"}`}>
                  {result.healthScore}
                </div>
                <div className={`text-sm font-bold mt-1 ${healthColor[result.overallHealth] ?? "text-slate-400"}`}>
                  {result.overallHealth}
                </div>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${healthBg[result.overallHealth] ?? "bg-slate-500"}`}
                    style={{ width: `${result.healthScore}%` }} />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Key facts */}
            {result.keyFacts?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {result.keyFacts.map((f, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <p className="text-slate-500 text-xs mb-1">{f.label}</p>
                    <p className="text-slate-100 font-semibold text-sm">{f.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Positives + Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.positives?.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h2 className="font-semibold text-emerald-400 mb-3 text-sm">✓ What&apos;s Working</h2>
                  <ul className="space-y-2">
                    {result.positives.map((p, i) => (
                      <li key={i} className="text-slate-300 text-sm flex gap-2"><span className="text-emerald-500 shrink-0">→</span>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.concerns?.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h2 className="font-semibold text-red-400 mb-3 text-sm">⚠ Concerns</h2>
                  <ul className="space-y-2">
                    {result.concerns.map((c, i) => (
                      <li key={i} className="text-slate-300 text-sm flex gap-2"><span className="text-red-400 shrink-0">→</span>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h2 className="font-semibold text-slate-100 mb-3">What To Do Next</h2>
                <ol className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="text-slate-300 text-sm flex gap-3">
                      <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>{r}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
