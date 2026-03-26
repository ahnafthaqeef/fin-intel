"use client";

import { useState, useRef } from "react";
import Nav from "@/components/Nav";
import GaugeArc from "@/components/GaugeArc";
import { SAMPLE_CREDIT } from "@/lib/sampleData";

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

const keyFactIcons: Record<string, string> = {
  "Active Accounts": "🏦",
  "Payment History": "✅",
  "Credit Utilisation": "📊",
  "Credit History": "📅",
  "Recent Enquiries": "🔍",
  "Legal Records": "⚖️",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-slate-800 rounded-xl h-40" />
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 rounded-xl h-20" />
        <div className="bg-slate-800 rounded-xl h-20" />
        <div className="bg-slate-800 rounded-xl h-20" />
        <div className="bg-slate-800 rounded-xl h-20" />
        <div className="bg-slate-800 rounded-xl h-20" />
        <div className="bg-slate-800 rounded-xl h-20" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl h-36" />
        <div className="bg-slate-800 rounded-xl h-36" />
      </div>
      <div className="bg-slate-800 rounded-xl h-40" />
    </div>
  );
}

export default function CreditExplainerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/credit-explainer", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setResult(SAMPLE_CREDIT as Result);
    setError("");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <Nav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">
              Credit Report Explainer
            </h1>
            <p className="text-slate-400 text-sm">
              Upload a credit report PDF. AI translates it into plain English —
              health score, positives, concerns, and what to do next.
            </p>
          </div>
          <button
            onClick={loadSample}
            className="shrink-0 px-4 py-2 rounded-xl border border-emerald-500/40 text-emerald-400 text-sm font-medium hover:bg-emerald-500/10 transition-colors"
          >
            Try Sample Report
          </button>
        </div>

        {/* Upload zone */}
        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f?.type === "application/pdf") setFile(f);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-4 ${
            dragOver
              ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              : "border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="text-3xl mb-3">📋</div>
          {file ? (
            <div>
              <p className="text-slate-200 font-medium">{file.name}</p>
              <p className="text-slate-500 text-xs mt-1">
                {(file.size / 1024).toFixed(0)} KB · PDF
              </p>
            </div>
          ) : (
            <>
              <p className="text-slate-300 font-medium">
                Drop your credit report here
              </p>
              <p className="text-slate-500 text-sm mt-1">
                PDF only · CTOS, CCRIS, or any credit report format
              </p>
            </>
          )}
        </div>

        <button
          onClick={analyze}
          disabled={!file || loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors mb-8"
        >
          {loading ? "Analysing…" : "Explain My Credit Report"}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {result && (
          <div className="space-y-5">
            {/* Health score + gauge */}
            <div className="bg-[#111] border border-slate-800 rounded-xl p-6">
              <div className="flex flex-col items-center gap-2 mb-4">
                <GaugeArc score={result.healthScore} />
                <div className="text-center -mt-2">
                  <p
                    className={`text-5xl font-black ${
                      healthColor[result.overallHealth] ?? "text-slate-200"
                    }`}
                  >
                    {result.healthScore}
                  </p>
                  <p
                    className={`text-lg font-bold mt-1 ${
                      healthColor[result.overallHealth] ?? "text-slate-400"
                    }`}
                  >
                    {result.overallHealth}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Credit Health Score
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-4 mt-2">
                <p className="text-slate-300 text-sm leading-relaxed text-center max-w-2xl mx-auto">
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Key facts — 3-column grid with icons */}
            {result.keyFacts?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {result.keyFacts.map((f, i) => (
                  <div
                    key={i}
                    className="bg-[#111] border border-slate-800 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">
                        {keyFactIcons[f.label] ?? "📌"}
                      </span>
                      <p className="text-slate-500 text-xs">{f.label}</p>
                    </div>
                    <p className="text-slate-100 font-semibold text-sm">
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Positives + Concerns side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.positives?.length > 0 && (
                <div className="bg-[#111] border border-emerald-500/20 rounded-xl p-5">
                  <h2 className="font-semibold text-emerald-400 mb-3 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    What&apos;s Working
                  </h2>
                  <ul className="space-y-2.5">
                    {result.positives.map((p, i) => (
                      <li
                        key={i}
                        className="text-slate-300 text-sm flex gap-2 items-start"
                      >
                        <span className="text-emerald-500 shrink-0 mt-0.5">
                          ✓
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.concerns?.length > 0 && (
                <div className="bg-[#111] border border-red-500/20 rounded-xl p-5">
                  <h2 className="font-semibold text-red-400 mb-3 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    Concerns
                  </h2>
                  <ul className="space-y-2.5">
                    {result.concerns.map((c, i) => (
                      <li
                        key={i}
                        className="text-slate-300 text-sm flex gap-2 items-start"
                      >
                        <span className="text-red-400 shrink-0 mt-0.5">⚠</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendations — numbered checklist */}
            {result.recommendations?.length > 0 && (
              <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
                <h2 className="font-semibold text-slate-100 mb-4">
                  What To Do Next
                </h2>
                <ol className="space-y-3">
                  {result.recommendations.map((r, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-slate-300 items-start"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      {r}
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
