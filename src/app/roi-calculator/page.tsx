"use client";

import { useState, useMemo } from "react";
import Nav from "@/components/Nav";
import { SAMPLE_ROI_INPUTS } from "@/lib/sampleData";

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

const PRESETS: Record<string, typeof DEFAULT> = {
  custom: DEFAULT,
  "AI Document Processing": {
    ...SAMPLE_ROI_INPUTS,
    initiativeName: "AI Document Processing",
    description: SAMPLE_ROI_INPUTS.description,
  },
  "Fraud Detection Bot": {
    initiativeName: "Fraud Detection Bot",
    description:
      "Automated real-time fraud signal analysis for credit applications, reducing manual review time and improving detection accuracy.",
    teamSize: 8,
    hoursSavedPerWeek: 6,
    hourlyRate: 90,
    implementationCost: 180000,
    maintenanceCostPerYear: 25000,
    timelineMonths: 4,
  },
  "Customer Service Chatbot": {
    initiativeName: "Customer Service Chatbot",
    description:
      "AI-powered chatbot handling tier-1 customer queries 24/7, reducing call centre load and improving first-response time.",
    teamSize: 20,
    hoursSavedPerWeek: 3,
    hourlyRate: 55,
    implementationCost: 80000,
    maintenanceCostPerYear: 15000,
    timelineMonths: 2,
  },
};

function calcMetrics(form: typeof DEFAULT): Metrics {
  const weeksPerYear = 52;
  const annualHoursSaved = form.hoursSavedPerWeek * form.teamSize * weeksPerYear;
  const annualValue = annualHoursSaved * form.hourlyRate;
  const totalCost1 = form.implementationCost + form.maintenanceCostPerYear;
  const totalCost3 =
    form.implementationCost + form.maintenanceCostPerYear * 3;
  const totalCost5 =
    form.implementationCost + form.maintenanceCostPerYear * 5;
  const year1Value = annualValue - totalCost1;
  const year3Value = annualValue * 3 - totalCost3;
  const year5Value = annualValue * 5 - totalCost5;
  const roi =
    form.implementationCost > 0
      ? (((annualValue - form.maintenanceCostPerYear - form.implementationCost) /
          form.implementationCost) *
          100).toFixed(0)
      : "N/A";
  const monthlyValue = annualValue / 12;
  const paybackMonths =
    monthlyValue > 0
      ? Math.ceil(
          (form.implementationCost + form.maintenanceCostPerYear) / monthlyValue
        ).toString()
      : "N/A";
  return {
    annualHoursSaved,
    annualValue,
    year1Value,
    year3Value,
    year5Value,
    roi,
    paybackMonths,
  };
}

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
        {hint && (
          <span className="text-slate-500 font-normal ml-1 text-xs">
            ({hint})
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors";

function HBarChart({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1);
  const fmtRM = (n: number) =>
    `RM ${n.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = (Math.abs(item.value) / max) * 100;
        const positive = item.value >= 0;
        return (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{item.label}</span>
              <span
                className={`font-mono font-medium ${
                  positive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {positive ? "+" : ""}
                {fmtRM(item.value)}
              </span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  positive ? "bg-emerald-500" : "bg-red-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PaybackTimeline({
  paybackMonths,
  timelineMonths,
}: {
  paybackMonths: string;
  timelineMonths: number;
}) {
  const pb = parseInt(paybackMonths);
  const milestones = [
    { label: "Deploy", month: timelineMonths, color: "bg-blue-500" },
    {
      label: "Payback",
      month: isNaN(pb) ? timelineMonths + 6 : pb,
      color: "bg-yellow-500",
    },
    {
      label: "Year 3",
      month: 36,
      color: "bg-emerald-500",
    },
    {
      label: "Year 5",
      month: 60,
      color: "bg-emerald-400",
    },
  ];
  const totalSpan = 64;

  return (
    <div className="relative pt-4 pb-2">
      {/* Line */}
      <div className="absolute left-0 right-0 top-[22px] h-0.5 bg-slate-700 rounded-full" />
      {/* Dots */}
      <div className="relative flex justify-between items-start">
        {milestones.map((m) => {
          const leftPct = (m.month / totalSpan) * 100;
          return (
            <div
              key={m.label}
              className="flex flex-col items-center"
              style={{
                position: "absolute",
                left: `${Math.min(leftPct, 95)}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 border-[#080808] ${m.color} z-10`}
              />
              <span className="text-xs text-slate-500 mt-2 whitespace-nowrap">
                {m.label}
              </span>
              <span className="text-xs text-slate-600">mo {m.month}</span>
            </div>
          );
        })}
      </div>
      <div style={{ height: "56px" }} />
    </div>
  );
}

export default function ROICalculatorPage() {
  const [form, setForm] = useState(DEFAULT);
  const [preset, setPreset] = useState("custom");
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [error, setError] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);

  // Live metrics — computed immediately from form
  const liveMetrics = useMemo(() => calcMetrics(form), [form]);

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function applyPreset(name: string) {
    setPreset(name);
    if (name !== "custom" && PRESETS[name]) {
      setForm(PRESETS[name]);
    }
  }

  function loadDemo() {
    setForm(SAMPLE_ROI_INPUTS);
    setPreset("custom");
    setHasCalculated(true);
    setNarrative("");
  }

  async function calculate() {
    if (!form.initiativeName.trim()) return;
    setLoading(true);
    setError("");
    setNarrative("");
    setHasCalculated(true);

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
      let metricsSkipped = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value);

        if (!metricsSkipped && buffer.includes("__END__")) {
          const end = buffer.indexOf("__END__");
          buffer = buffer.slice(end + "__END__".length);
          metricsSkipped = true;
        }

        if (metricsSkipped) {
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

  const showResults = hasCalculated;

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <Nav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">
              AI Initiative ROI Calculator
            </h1>
            <p className="text-slate-400 text-sm">
              Input your AI initiative details. Get ROI metrics + an AI-generated
              business case. Numbers update live as you type.
            </p>
          </div>
          <button
            onClick={loadDemo}
            className="shrink-0 px-4 py-2 rounded-xl border border-emerald-500/40 text-emerald-400 text-sm font-medium hover:bg-emerald-500/10 transition-colors"
          >
            Load Demo Initiative
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-5">
            {/* Preset selector */}
            <Field label="Quick Preset">
              <select
                className={inputCls}
                value={preset}
                onChange={(e) => applyPreset(e.target.value)}
              >
                <option value="custom">Custom Initiative</option>
                <option value="AI Document Processing">
                  AI Document Processing
                </option>
                <option value="Fraud Detection Bot">Fraud Detection Bot</option>
                <option value="Customer Service Chatbot">
                  Customer Service Chatbot
                </option>
              </select>
            </Field>

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
                  onChange={(e) =>
                    set("hoursSavedPerWeek", Number(e.target.value))
                  }
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
                  onChange={(e) =>
                    set("timelineMonths", Number(e.target.value))
                  }
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
                  onChange={(e) =>
                    set("implementationCost", Number(e.target.value))
                  }
                  min={0}
                />
              </Field>
              <Field label="Maintenance/Year" hint="RM">
                <input
                  type="number"
                  className={inputCls}
                  value={form.maintenanceCostPerYear}
                  onChange={(e) =>
                    set("maintenanceCostPerYear", Number(e.target.value))
                  }
                  min={0}
                />
              </Field>
            </div>

            <button
              onClick={calculate}
              disabled={!form.initiativeName.trim() || loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? "Generating Business Case…" : "Calculate ROI + Generate Business Case"}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}

            {/* Live metrics preview below form */}
            <div className="bg-[#111] border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
                Live Preview
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Annual Hours Saved</p>
                  <p className="text-slate-200 font-semibold">
                    {liveMetrics.annualHoursSaved.toLocaleString()}h
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Annual Value</p>
                  <p className="text-slate-200 font-semibold">
                    {fmtRM(liveMetrics.annualValue)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Year 1 ROI</p>
                  <p
                    className={`font-semibold ${
                      Number(liveMetrics.roi) > 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {liveMetrics.roi}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Payback Period</p>
                  <p className="text-blue-400 font-semibold">
                    {liveMetrics.paybackMonths} months
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results panel */}
          <div className="space-y-5">
            {!showResults && (
              <div className="h-full min-h-[300px] flex items-center justify-center text-slate-700 text-sm text-center border border-dashed border-slate-800 rounded-xl">
                Fill in the form to see your ROI projection
              </div>
            )}

            {showResults && (
              <>
                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "ROI (Year 1)",
                      value: `${liveMetrics.roi}%`,
                      color:
                        Number(liveMetrics.roi) > 0
                          ? "text-emerald-400"
                          : "text-red-400",
                    },
                    {
                      label: "Payback Period",
                      value: `${liveMetrics.paybackMonths} mo`,
                      color: "text-blue-400",
                    },
                    {
                      label: "Annual Value",
                      value: fmtRM(liveMetrics.annualValue),
                      color: "text-slate-200",
                    },
                    {
                      label: "Hours Saved/Year",
                      value:
                        liveMetrics.annualHoursSaved.toLocaleString() + "h",
                      color: "text-slate-200",
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="bg-[#111] border border-slate-800 rounded-xl p-4"
                    >
                      <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                      <p className={`text-xl font-bold ${m.color}`}>
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Multi-year bar chart */}
                <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-slate-400 mb-4">
                    Net Value Projection
                  </h3>
                  <HBarChart
                    items={[
                      { label: "Year 1", value: liveMetrics.year1Value },
                      { label: "Year 3", value: liveMetrics.year3Value },
                      { label: "Year 5", value: liveMetrics.year5Value },
                    ]}
                  />
                </div>

                {/* Payback timeline */}
                <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    Payback Timeline
                  </h3>
                  <PaybackTimeline
                    paybackMonths={liveMetrics.paybackMonths}
                    timelineMonths={form.timelineMonths}
                  />
                </div>

                {/* AI Narrative */}
                {narrative && (
                  <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-emerald-400 text-sm">✦</span>
                      <h3 className="text-sm font-medium text-slate-300">
                        AI Business Case
                      </h3>
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {narrative}
                    </div>
                  </div>
                )}
                {loading && narrative === "" && (
                  <div className="bg-[#111] border border-slate-800 rounded-xl p-5 text-slate-500 text-sm animate-pulse">
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
