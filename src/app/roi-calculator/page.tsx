"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

type Metrics = {
  annualHoursSaved: number;
  annualValue: number;
  year1Value: number;
  year3Value: number;
  year5Value: number;
  roi: string;
  paybackMonths: string;
};

const DEFAULT = {
  initiativeName: "",
  description: "",
  teamSize: 10,
  hoursSavedPerWeek: 5,
  hourlyRate: 75,
  implementationCost: 150000,
  maintenanceCostPerYear: 20000,
  timelineMonths: 3,
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        {label}
        {hint && <span className="text-slate-500 font-normal ml-1 text-xs">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors";

export default function ROICalculatorPage() {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [narrative, setNarrative] = useState("");
  const [error, setError] = useState("");

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function calculate() {
    if (!form.initiativeName.trim()) return;
    setLoading(true);
    setError("");
    setMetrics(null);
    setNarrative("");

    try {
      const res = await fetch("/api/roi-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Calculation failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let metricsExtracted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value);

        if (!metricsExtracted && buffer.includes("__END__")) {
          const start = buffer.indexOf("__METRICS__") + "__METRICS__".length;
          const end = buffer.indexOf("__END__");
          const json = buffer.slice(start, end);
          setMetrics(JSON.parse(json));
          buffer = buffer.slice(end + "__END__".length);
          metricsExtracted = true;
        }

        if (metricsExtracted) {
          setNarrative(buffer);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  const fmtRM = (n: number) =>
    `RM ${n.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-1">
            AI Initiative ROI Calculator
          </h1>
          <p className="text-slate-400 text-sm">
            Input your AI initiative details. Get ROI metrics + an AI-generated business case.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-5">
            <Field label="Initiative Name">
              <input
                className={inputCls}
                value={form.initiativeName}
                onChange={(e) => set("initiativeName", e.target.value)}
                placeholder="e.g. AI Document Processing"
              />
            </Field>

            <Field label="Description">
              <textarea
                className={`${inputCls} resize-none h-20`}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief description of what this AI initiative does…"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Team Size" hint="people affected">
                <input
                  type="number"
                  className={inputCls}
                  value={form.teamSize}
                  onChange={(e) => set("teamSize", Number(e.target.value))}
                  min={1}
                />
              </Field>
              <Field label="Hours Saved" hint="per person/week">
                <input
                  type="number"
                  className={inputCls}
                  value={form.hoursSavedPerWeek}
                  onChange={(e) => set("hoursSavedPerWeek", Number(e.target.value))}
                  min={0}
                  step={0.5}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Hourly Rate" hint="RM">
                <input
                  type="number"
                  className={inputCls}
                  value={form.hourlyRate}
                  onChange={(e) => set("hourlyRate", Number(e.target.value))}
                  min={0}
                />
              </Field>
              <Field label="Timeline" hint="months to deploy">
                <input
                  type="number"
                  className={inputCls}
                  value={form.timelineMonths}
                  onChange={(e) => set("timelineMonths", Number(e.target.value))}
                  min={1}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Implementation Cost" hint="RM">
                <input
                  type="number"
                  className={inputCls}
                  value={form.implementationCost}
                  onChange={(e) => set("implementationCost", Number(e.target.value))}
                  min={0}
                />
              </Field>
              <Field label="Maintenance/Year" hint="RM">
                <input
                  type="number"
                  className={inputCls}
                  value={form.maintenanceCostPerYear}
                  onChange={(e) => set("maintenanceCostPerYear", Number(e.target.value))}
                  min={0}
                />
              </Field>
            </div>

            <button
              onClick={calculate}
              disabled={!form.initiativeName.trim() || loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? "Calculating…" : "Calculate ROI"}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-5">
            {!metrics && !loading && (
              <div className="h-full flex items-center justify-center text-slate-700 text-sm text-center">
                Fill in the form and click Calculate to see your ROI
              </div>
            )}

            {loading && !metrics && (
              <div className="text-center text-slate-400 py-16 animate-pulse">
                Calculating…
              </div>
            )}

            {metrics && (
              <>
                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "ROI (Year 1)", value: `${metrics.roi}%`, color: Number(metrics.roi) > 0 ? "text-emerald-400" : "text-red-400" },
                    { label: "Payback Period", value: `${metrics.paybackMonths} mo`, color: "text-blue-400" },
                    { label: "Annual Value", value: fmtRM(metrics.annualValue), color: "text-slate-200" },
                    { label: "Hours Saved/Year", value: metrics.annualHoursSaved.toLocaleString() + "h", color: "text-slate-200" },
                  ].map((m) => (
                    <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                      <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Multi-year */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Net Value Projection</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Year 1", value: metrics.year1Value },
                      { label: "Year 3", value: metrics.year3Value },
                      { label: "Year 5", value: metrics.year5Value },
                    ].map((y) => (
                      <div key={y.label}>
                        <p className="text-xs text-slate-500 mb-1">{y.label}</p>
                        <p className={`text-sm font-semibold ${y.value >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {fmtRM(y.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Narrative */}
                {narrative && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-emerald-400 text-sm">✦</span>
                      <h3 className="text-sm font-medium text-slate-300">AI Business Case</h3>
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap prose-headings:text-slate-100">
                      {narrative}
                    </div>
                  </div>
                )}
                {loading && narrative === "" && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-500 text-sm animate-pulse">
                    Generating business case…
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
