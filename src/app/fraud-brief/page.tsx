"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import {
  SAMPLE_FRAUD_INPUTS,
  SAMPLE_FRAUD_RESULT,
} from "@/lib/sampleData";

type SignalBreakdown = {
  signal: string;
  value: string;
  riskContribution: string;
};
type Result = {
  riskLevel: string;
  riskScore: number;
  verdict: string;
  summary: string;
  redFlags: string[];
  mitigatingFactors: string[];
  recommendedActions: string[];
  signalBreakdown: SignalBreakdown[];
};

const riskColor: Record<string, string> = {
  Low: "text-emerald-400",
  Medium: "text-yellow-400",
  High: "text-orange-400",
  Critical: "text-red-400",
};
const riskBg: Record<string, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-yellow-500",
  High: "bg-orange-500",
  Critical: "bg-red-500",
};
const verdictStyle: Record<string, string> = {
  Approve: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  "Manual Review": "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
  Escalate: "bg-orange-500/15 text-orange-400 border-orange-500/40",
  Decline: "bg-red-500/15 text-red-400 border-red-500/40",
};
const verdictPulse: Record<string, boolean> = {
  High: true,
  Critical: true,
};
const contributionWidth: Record<string, string> = {
  Low: "20%",
  Medium: "55%",
  High: "90%",
};
const contributionColor: Record<string, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-yellow-500",
  High: "bg-red-500",
};
const contributionText: Record<string, string> = {
  Low: "text-emerald-400",
  Medium: "text-yellow-400",
  High: "text-red-400",
};

const DEFAULT = {
  applicantName: "",
  applicationCount: 1,
  applicationWindowDays: 30,
  identityCheckResult: "Passed",
  identityCheckFailures: 0,
  addressMatchCount: 0,
  courtRecords: "",
  employerVerified: true,
  incomeConsistency: "Consistent",
  deviceFlags: "",
  additionalNotes: "",
};

const LOW_RISK_INPUTS = {
  applicantName: "Siti Aminah binti Hamid",
  applicationCount: 1,
  applicationWindowDays: 30,
  identityCheckResult: "Passed",
  identityCheckFailures: 0,
  addressMatchCount: 0,
  courtRecords: "",
  employerVerified: true,
  incomeConsistency: "Consistent",
  deviceFlags: "",
  additionalNotes: "Returning customer, 5-year banking relationship, no prior issues.",
};

const LOW_RISK_RESULT: Result = {
  riskLevel: "Low",
  riskScore: 12,
  verdict: "Approve",
  summary:
    "This application presents a clean risk profile. Single application within a normal window, verified employer, consistent income, no device flags, and a clean identity check. No fraud indicators detected. Standard credit decision process applies.",
  redFlags: [],
  mitigatingFactors: [
    "Identity check passed on first attempt — no failures recorded",
    "Employer independently verified — income consistent with bank statement credits",
    "Only 1 application in 30 days — well within normal velocity range",
    "No device flags, no VPN, no shared fingerprint detected",
    "No court records or legal proceedings on file",
  ],
  recommendedActions: [
    "Proceed with standard credit assessment — no escalation required",
    "Apply normal credit scoring and policy rules",
    "Document clean fraud check result in the application file",
  ],
  signalBreakdown: [
    { signal: "Application Velocity", value: "1 in 30 days", riskContribution: "Low" },
    { signal: "Address Matches", value: "None", riskContribution: "Low" },
    { signal: "Identity Check", value: "Passed (0 failures)", riskContribution: "Low" },
    { signal: "Employer Verification", value: "Verified", riskContribution: "Low" },
    { signal: "Income Consistency", value: "Consistent", riskContribution: "Low" },
    { signal: "Device Flags", value: "None", riskContribution: "Low" },
    { signal: "Legal Records", value: "None", riskContribution: "Low" },
  ],
};

const inputCls =
  "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-red-500 transition-colors";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
      {children}
    </p>
  );
}

export default function FraudBriefPage() {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  function set(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function loadSuspicious() {
    setForm(SAMPLE_FRAUD_INPUTS);
    setResult(SAMPLE_FRAUD_RESULT as Result);
    setError("");
  }

  function loadLowRisk() {
    setForm(LOW_RISK_INPUTS);
    setResult(LOW_RISK_RESULT);
    setError("");
  }

  async function generate() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/fraud-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <Nav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 mb-1">
                Fraud Signal Brief Generator
              </h1>
              <p className="text-slate-400 text-sm">
                Input fraud signals for a credit application. AI synthesises
                them into a structured analyst brief with risk level and
                recommended actions.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={loadLowRisk}
                className="px-3 py-2 rounded-xl border border-emerald-500/40 text-emerald-400 text-xs font-medium hover:bg-emerald-500/10 transition-colors"
              >
                Load Low-Risk Case
              </button>
              <button
                onClick={loadSuspicious}
                className="px-3 py-2 rounded-xl border border-red-500/40 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors"
              >
                Load Suspicious Case
              </button>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-3 py-1.5 rounded-full">
            ⚠ AI assists analysts — it does not replace human judgement or make
            final decisions.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-5">
            {/* Applicant */}
            <div>
              <SectionLabel>Applicant</SectionLabel>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Applicant Name (optional)
                </label>
                <input
                  className={inputCls}
                  value={form.applicantName}
                  onChange={(e) => set("applicantName", e.target.value)}
                  placeholder="e.g. Ahmad bin Razak"
                />
              </div>
            </div>

            {/* Application velocity */}
            <div>
              <SectionLabel>Application Velocity</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Credit Applications
                  </label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.applicationCount}
                    onChange={(e) =>
                      set("applicationCount", Number(e.target.value))
                    }
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Within (days)
                  </label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.applicationWindowDays}
                    onChange={(e) =>
                      set("applicationWindowDays", Number(e.target.value))
                    }
                    min={1}
                  />
                </div>
              </div>
            </div>

            {/* Identity */}
            <div>
              <SectionLabel>Identity & Address</SectionLabel>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Identity Check
                    </label>
                    <select
                      className={inputCls}
                      value={form.identityCheckResult}
                      onChange={(e) =>
                        set("identityCheckResult", e.target.value)
                      }
                    >
                      <option>Passed</option>
                      <option>Failed</option>
                      <option>Partial</option>
                      <option>Not Checked</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      ID Failures
                    </label>
                    <input
                      type="number"
                      className={inputCls}
                      value={form.identityCheckFailures}
                      onChange={(e) =>
                        set("identityCheckFailures", Number(e.target.value))
                      }
                      min={0}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Address matches other recent applications
                  </label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.addressMatchCount}
                    onChange={(e) =>
                      set("addressMatchCount", Number(e.target.value))
                    }
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Employment & Income */}
            <div>
              <SectionLabel>Employment & Income</SectionLabel>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Employer Verified
                    </label>
                    <select
                      className={inputCls}
                      value={form.employerVerified ? "Yes" : "No"}
                      onChange={(e) =>
                        set("employerVerified", e.target.value === "Yes")
                      }
                    >
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Income Consistency
                    </label>
                    <select
                      className={inputCls}
                      value={form.incomeConsistency}
                      onChange={(e) =>
                        set("incomeConsistency", e.target.value)
                      }
                    >
                      <option>Consistent</option>
                      <option>Minor discrepancy</option>
                      <option>Major discrepancy</option>
                      <option>Not verifiable</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Digital & Legal */}
            <div>
              <SectionLabel>Digital & Legal Signals</SectionLabel>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Court / Legal Records
                  </label>
                  <input
                    className={inputCls}
                    value={form.courtRecords}
                    onChange={(e) => set("courtRecords", e.target.value)}
                    placeholder="e.g. 2 bankruptcy proceedings 2022–2023"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Device / Digital Flags
                  </label>
                  <input
                    className={inputCls}
                    value={form.deviceFlags}
                    onChange={(e) => set("deviceFlags", e.target.value)}
                    placeholder="e.g. VPN detected, device used in 3 other applications"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    className={`${inputCls} resize-none h-20`}
                    value={form.additionalNotes}
                    onChange={(e) => set("additionalNotes", e.target.value)}
                    placeholder="Any other signals or observations…"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-3 bg-red-700 hover:bg-red-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? "Generating Brief…" : "Generate Fraud Brief"}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {!result && !loading && (
              <div className="h-full min-h-[200px] flex items-center justify-center text-slate-700 text-sm text-center border border-dashed border-slate-800 rounded-xl">
                Fill in the fraud signals and generate a brief,
                <br />
                or load a demo case above
              </div>
            )}
            {loading && (
              <div className="text-center text-slate-400 py-16 animate-pulse">
                Analysing signals…
              </div>
            )}

            {result && (
              <>
                {/* Risk score + verdict */}
                <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Risk Level</p>
                      <p
                        className={`text-4xl font-black ${
                          riskColor[result.riskLevel] ?? "text-slate-200"
                        }`}
                      >
                        {result.riskLevel}
                      </p>
                    </div>
                    <div
                      className={`px-5 py-2.5 rounded-xl border text-sm font-bold ${
                        verdictStyle[result.verdict] ??
                        "bg-slate-800 text-slate-300 border-slate-700"
                      } ${
                        verdictPulse[result.riskLevel]
                          ? "animate-pulse"
                          : ""
                      }`}
                    >
                      {result.verdict}
                    </div>
                  </div>
                  {/* Risk score bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Risk Score</span>
                      <span className="font-mono font-medium text-slate-300">
                        {result.riskScore}/100
                      </span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          riskBg[result.riskLevel] ?? "bg-slate-500"
                        }`}
                        style={{ width: `${result.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* Signal breakdown — visual bars */}
                {result.signalBreakdown?.length > 0 && (
                  <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
                    <h2 className="font-semibold text-slate-100 mb-4 text-sm">
                      Signal Breakdown
                    </h2>
                    <div className="space-y-3">
                      {result.signalBreakdown.map((s, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-400">{s.signal}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 max-w-[120px] truncate text-right">
                                {s.value}
                              </span>
                              <span
                                className={`font-semibold w-14 text-right ${
                                  contributionText[s.riskContribution] ??
                                  "text-slate-400"
                                }`}
                              >
                                {s.riskContribution}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                contributionColor[s.riskContribution] ??
                                "bg-slate-500"
                              }`}
                              style={{
                                width:
                                  contributionWidth[s.riskContribution] ?? "10%",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red flags + mitigating */}
                {result.redFlags?.length > 0 && (
                  <div className="bg-[#111] border border-red-500/20 rounded-xl p-5">
                    <h2 className="font-semibold text-red-400 text-sm mb-3">
                      🚩 Red Flags
                    </h2>
                    <ul className="space-y-2">
                      {result.redFlags.map((f, i) => (
                        <li
                          key={i}
                          className="text-slate-300 text-sm flex gap-2 items-start"
                        >
                          <span className="text-red-400 shrink-0 mt-0.5">
                            →
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.mitigatingFactors?.length > 0 && (
                  <div className="bg-[#111] border border-emerald-500/20 rounded-xl p-5">
                    <h2 className="font-semibold text-emerald-400 text-sm mb-3">
                      ✓ Mitigating Factors
                    </h2>
                    <ul className="space-y-2">
                      {result.mitigatingFactors.map((f, i) => (
                        <li
                          key={i}
                          className="text-slate-300 text-sm flex gap-2 items-start"
                        >
                          <span className="text-emerald-400 shrink-0 mt-0.5">
                            →
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended actions */}
                {result.recommendedActions?.length > 0 && (
                  <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
                    <h2 className="font-semibold text-slate-100 text-sm mb-3">
                      Recommended Actions
                    </h2>
                    <ol className="space-y-2.5">
                      {result.recommendedActions.map((a, i) => (
                        <li
                          key={i}
                          className="text-slate-300 text-sm flex gap-3 items-start"
                        >
                          <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          {a}
                        </li>
                      ))}
                    </ol>
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
