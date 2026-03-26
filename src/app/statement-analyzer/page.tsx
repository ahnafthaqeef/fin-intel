"use client";

import { useState, useRef } from "react";
import Nav from "@/components/Nav";
import DonutChart, { CHART_COLORS } from "@/components/DonutChart";
import { SAMPLE_STATEMENT } from "@/lib/sampleData";

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

const severityConfig: Record<
  string,
  { bg: string; text: string; border: string; icon: string; label: string }
> = {
  high: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: "🔴",
    label: "HIGH",
  },
  medium: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
    icon: "🟡",
    label: "MEDIUM",
  },
  low: {
    bg: "bg-slate-700/40",
    text: "text-slate-400",
    border: "border-slate-600",
    icon: "⚪",
    label: "LOW",
  },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-slate-800 rounded-xl h-32" />
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl h-20" />
        <div className="bg-slate-800 rounded-xl h-20" />
        <div className="bg-slate-800 rounded-xl h-20" />
      </div>
      <div className="bg-slate-800 rounded-xl h-48" />
      <div className="bg-slate-800 rounded-xl h-36" />
    </div>
  );
}

export default function StatementAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
  }

  function loadSample() {
    setResult(SAMPLE_STATEMENT as AnalysisResult);
    setError("");
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
    `${currency} ${Math.abs(n).toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <Nav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">
              Bank Statement Analyzer
            </h1>
            <p className="text-slate-400 text-sm">
              Upload a PDF bank statement. AI extracts transactions, categorises
              spending, and flags anomalies.
            </p>
          </div>
          <button
            onClick={loadSample}
            className="shrink-0 px-4 py-2 rounded-xl border border-blue-500/40 text-blue-400 text-sm font-medium hover:bg-blue-500/10 transition-colors"
          >
            Try Sample Data
          </button>
        </div>

        {/* Upload zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-4 ${
            dragOver
              ? "border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              : "border-slate-700 hover:border-blue-500 hover:bg-blue-500/5 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
          }`}
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
            <div>
              <p className="text-slate-200 font-medium">{file.name}</p>
              <p className="text-slate-500 text-xs mt-1">
                {(file.size / 1024).toFixed(0)} KB · PDF
              </p>
            </div>
          ) : (
            <>
              <p className="text-slate-300 font-medium">
                Drop your bank statement here
              </p>
              <p className="text-slate-500 text-sm mt-1">
                PDF only · Drag & drop or click to browse
              </p>
            </>
          )}
        </div>

        {/* Actions row */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={analyze}
            disabled={!file || loading}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? "Analysing…" : "Analyse Statement"}
          </button>
          <button
            disabled
            className="px-5 py-3 rounded-xl border border-slate-700 text-slate-500 text-sm font-medium cursor-not-allowed"
            title="Export coming soon"
          >
            Export
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {result && (
          <div className="space-y-6">
            {/* Summary card */}
            <div className="bg-[#111] border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-100">
                  Statement Summary
                </h2>
                <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                  {result.period}
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Total Credits",
                  value: fmt(result.totalCredits, result.currency),
                  color: "text-emerald-400",
                  sub: "Income & deposits",
                  arrow: "↑",
                  arrowColor: "text-emerald-500",
                },
                {
                  label: "Total Debits",
                  value: fmt(result.totalDebits, result.currency),
                  color: "text-red-400",
                  sub: "Spending & withdrawals",
                  arrow: "↓",
                  arrowColor: "text-red-500",
                },
                {
                  label: "Net Cash Flow",
                  value: fmt(result.netFlow, result.currency),
                  color:
                    result.netFlow >= 0 ? "text-emerald-400" : "text-red-400",
                  sub: result.netFlow >= 0 ? "Positive balance" : "Deficit",
                  arrow: result.netFlow >= 0 ? "↑" : "↓",
                  arrowColor:
                    result.netFlow >= 0 ? "text-emerald-500" : "text-red-500",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-[#111] border border-slate-800 rounded-xl p-5"
                >
                  <p className="text-slate-500 text-xs mb-2">{m.label}</p>
                  <div className="flex items-end gap-1.5">
                    <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                    <span className={`text-base font-bold mb-0.5 ${m.arrowColor}`}>
                      {m.arrow}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs mt-1">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Categories + Donut chart side by side */}
            {result.topCategories?.length > 0 && (
              <div className="bg-[#111] border border-slate-800 rounded-xl p-6">
                <h2 className="font-semibold text-slate-100 mb-5">
                  Spending Categories
                </h2>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Bars */}
                  <div className="flex-1 space-y-3">
                    {result.topCategories.map((cat, i) => (
                      <div key={cat.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  CHART_COLORS[i % CHART_COLORS.length],
                              }}
                            />
                            <span className="text-slate-300">{cat.name}</span>
                          </div>
                          <span className="text-slate-400 tabular-nums">
                            {fmt(cat.amount, result.currency)} ·{" "}
                            <span className="text-slate-300 font-medium">
                              {cat.percentage}%
                            </span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(cat.percentage, 100)}%`,
                              backgroundColor:
                                CHART_COLORS[i % CHART_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Donut */}
                  <div className="shrink-0 flex flex-col items-center">
                    <DonutChart slices={result.topCategories} />
                    <p className="text-slate-500 text-xs mt-1">by % of spend</p>
                  </div>
                </div>
              </div>
            )}

            {/* Anomalies */}
            {result.anomalies?.length > 0 && (
              <div className="bg-[#111] border border-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-semibold text-slate-100">
                    Anomaly Flags
                  </h2>
                  <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">
                    {result.anomalies.length} flagged
                  </span>
                </div>
                <div className="space-y-2">
                  {result.anomalies.map((a, i) => {
                    const s = severityConfig[a.severity] ?? severityConfig.low;
                    return (
                      <div
                        key={i}
                        className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3.5 ${s.bg} ${s.border}`}
                      >
                        <p className={`text-sm leading-relaxed ${s.text}`}>
                          {a.description}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-sm font-mono font-medium ${s.text}`}>
                            {fmt(a.amount, result.currency)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.border} ${s.text}`}
                          >
                            {s.icon} {s.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Insights */}
            {result.insights?.length > 0 && (
              <div className="bg-[#111] border border-slate-800 rounded-xl p-6">
                <h2 className="font-semibold text-slate-100 mb-4">
                  Key Insights
                </h2>
                <ul className="space-y-3">
                  {result.insights.map((ins, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="text-[#FFD166] mt-0.5 shrink-0 font-bold">
                        →
                      </span>
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
