"use client";

import { useState, useRef } from "react";
import Nav from "@/components/Nav";

type Category = { name: string; amount: number; percentage: number };
type Anomaly = { description: string; amount: number; severity: string };
type AnalysisResult = {
  period: string;
  currency: string;
  summary: string;
  totalCredits: number;
  totalDebits: number;
  netFlow: number;
  topCategories: Category[];
  anomalies: Anomaly[];
  insights: string[];
};

const severityColor: Record<string, string> = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-slate-700 text-slate-400 border-slate-600",
};

export default function StatementAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/analyze-statement", {
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

  const fmt = (n: number, currency = "RM") =>
    `${currency} ${Math.abs(n).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-1">
            Bank Statement Analyzer
          </h1>
          <p className="text-slate-400 text-sm">
            Upload a PDF bank statement. AI extracts transactions, categorises
            spending, and flags anomalies.
          </p>
        </div>

        {/* Upload zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 transition-colors mb-4"
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="text-3xl mb-3">📄</div>
          {file ? (
            <p className="text-slate-200 font-medium">{file.name}</p>
          ) : (
            <>
              <p className="text-slate-300 font-medium">
                Drop your bank statement here
              </p>
              <p className="text-slate-500 text-sm mt-1">PDF only</p>
            </>
          )}
        </div>

        <button
          onClick={analyze}
          disabled={!file || loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors mb-8"
        >
          {loading ? "Analysing…" : "Analyse Statement"}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center text-slate-400 py-16 animate-pulse">
            Reading your statement…
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-100">Summary</h2>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                  {result.period}
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Total Credits",
                  value: fmt(result.totalCredits, result.currency),
                  color: "text-emerald-400",
                },
                {
                  label: "Total Debits",
                  value: fmt(result.totalDebits, result.currency),
                  color: "text-red-400",
                },
                {
                  label: "Net Flow",
                  value: fmt(result.netFlow, result.currency),
                  color:
                    result.netFlow >= 0
                      ? "text-emerald-400"
                      : "text-red-400",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5"
                >
                  <p className="text-slate-500 text-xs mb-1">{m.label}</p>
                  <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Categories */}
            {result.topCategories?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="font-semibold text-slate-100 mb-4">
                  Spending Categories
                </h2>
                <div className="space-y-3">
                  {result.topCategories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{cat.name}</span>
                        <span className="text-slate-400">
                          {fmt(cat.amount, result.currency)} ·{" "}
                          {cat.percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anomalies */}
            {result.anomalies?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="font-semibold text-slate-100 mb-4">
                  Anomaly Flags
                </h2>
                <div className="space-y-2">
                  {result.anomalies.map((a, i) => (
                    <div
                      key={i}
                      className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 ${
                        severityColor[a.severity] ?? severityColor.low
                      }`}
                    >
                      <p className="text-sm">{a.description}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-mono">
                          {fmt(a.amount, result.currency)}
                        </span>
                        <span className="text-xs uppercase font-semibold">
                          {a.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {result.insights?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="font-semibold text-slate-100 mb-4">
                  Key Insights
                </h2>
                <ul className="space-y-2">
                  {result.insights.map((ins, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="text-blue-500 mt-0.5 shrink-0">→</span>
                      {ins}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
