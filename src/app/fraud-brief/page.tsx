"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

type SignalBreakdown = { signal: string; value: string; riskContribution: string };
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
  Low: "text-emerald-400", Medium: "text-yellow-400",
  High: "text-orange-400", Critical: "text-red-400",
};
const riskBg: Record<string, string> = {
  Low: "bg-emerald-500", Medium: "bg-yellow-500",
  High: "bg-orange-500", Critical: "bg-red-500",
};
const verdictStyle: Record<string, string> = {
  Approve: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "Manual Review": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  Escalate: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  Decline: "bg-red-500/10 text-red-400 border-red-500/30",
};
const contributionColor: Record<string, string> = {
  Low: "text-emerald-400", Medium: "text-yellow-400", High: "text-red-400",
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

const inputCls = "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-red-500 transition-colors";

export default function FraudBriefPage() {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  function set(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Fraud Signal Brief Generator</h1>
          <p className="text-slate-400 text-sm">
            Input fraud signals for a credit application. AI synthesises them into a structured analyst brief with risk level, red flags, and recommended actions.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-3 py-1.5 rounded-full">
            ⚠ AI assists analysts — it does not replace human judgement or make final decisions.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Applicant Name (optional)</label>
              <input className={inputCls} value={form.applicantName} onChange={(e) => set("applicantName", e.target.value)} placeholder="e.g. Ahmad bin Razak" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Credit Applications</label>
                <input type="number" className={inputCls} value={form.applicationCount} onChange={(e) => set("applicationCount", Number(e.target.value))} min={1} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Within (days)</label>
                <input type="number" className={inputCls} value={form.applicationWindowDays} onChange={(e) => set("applicationWindowDays", Number(e.target.value))} min={1} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Identity Check</label>
                <select className={inputCls} value={form.identityCheckResult} onChange={(e) => set("identityCheckResult", e.target.value)}>
                  <option>Passed</option><option>Failed</option><option>Partial</option><option>Not Checked</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">ID Failures</label>
                <input type="number" className={inputCls} value={form.identityCheckFailures} onChange={(e) => set("identityCheckFailures", Number(e.target.value))} min={0} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Address matches other recent applications</label>
              <input type="number" className={inputCls} value={form.addressMatchCount} onChange={(e) => set("addressMatchCount", Number(e.target.value))} min={0} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Court / Legal Records</label>
              <input className={inputCls} value={form.courtRecords} onChange={(e) => set("courtRecords", e.target.value)} placeholder="e.g. 2 bankruptcy proceedings 2022-2023" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Employer Verified</label>
                <select className={inputCls} value={form.employerVerified ? "Yes" : "No"} onChange={(e) => set("employerVerified", e.target.value === "Yes")}>
                  <option>Yes</option><option>No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Income Consistency</label>
                <select className={inputCls} value={form.incomeConsistency} onChange={(e) => set("incomeConsistency", e.target.value)}>
                  <option>Consistent</option><option>Minor discrepancy</option><option>Major discrepancy</option><option>Not verifiable</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Device / Digital Flags</label>
              <input className={inputCls} value={form.deviceFlags} onChange={(e) => set("deviceFlags", e.target.value)} placeholder="e.g. VPN detected, device used in 3 other applications" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Additional Notes</label>
              <textarea className={`${inputCls} resize-none h-20`} value={form.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} placeholder="Any other signals or observations…" />
            </div>

            <button onClick={generate} disabled={loading}
              className="w-full py-3 bg-red-700 hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors">
              {loading ? "Generating Brief…" : "Generate Fraud Brief"}
            </button>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">{error}</div>}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {!result && !loading && (
              <div className="h-full flex items-center justify-center text-slate-700 text-sm text-center">
                Fill in the fraud signals and generate a brief
              </div>
            )}
            {loading && <div className="text-center text-slate-400 py-16 animate-pulse">Analysing signals…</div>}

            {result && (
              <>
                {/* Risk level + verdict */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Risk Level</p>
                    <p className={`text-3xl font-black ${riskColor[result.riskLevel] ?? "text-slate-200"}`}>{result.riskLevel}</p>
                    <div className="h-1.5 bg-slate-800 rounded-full mt-2 w-32 overflow-hidden">
                      <div className={`h-full rounded-full ${riskBg[result.riskLevel] ?? "bg-slate-500"}`} style={{ width: `${result.riskScore}%` }} />
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${verdictStyle[result.verdict] ?? "bg-slate-800 text-slate-300 border-slate-700"}`}>
                    {result.verdict}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
                </div>

                {/* Signal breakdown */}
                {result.signalBreakdown?.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h2 className="font-semibold text-slate-100 mb-3 text-sm">Signal Breakdown</h2>
                    <div className="space-y-2">
                      {result.signalBreakdown.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">{s.signal}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-300">{s.value}</span>
                            <span className={`text-xs font-semibold ${contributionColor[s.riskContribution] ?? "text-slate-400"}`}>{s.riskContribution}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red flags + mitigating */}
                <div className="grid grid-cols-1 gap-4">
                  {result.redFlags?.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h2 className="font-semibold text-red-400 text-sm mb-3">🚩 Red Flags</h2>
                      <ul className="space-y-2">
                        {result.redFlags.map((f, i) => <li key={i} className="text-slate-300 text-sm flex gap-2"><span className="text-red-400 shrink-0">→</span>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.mitigatingFactors?.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h2 className="font-semibold text-emerald-400 text-sm mb-3">✓ Mitigating Factors</h2>
                      <ul className="space-y-2">
                        {result.mitigatingFactors.map((f, i) => <li key={i} className="text-slate-300 text-sm flex gap-2"><span className="text-emerald-400 shrink-0">→</span>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Recommended actions */}
                {result.recommendedActions?.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h2 className="font-semibold text-slate-100 text-sm mb-3">Recommended Actions</h2>
                    <ol className="space-y-2">
                      {result.recommendedActions.map((a, i) => (
                        <li key={i} className="text-slate-300 text-sm flex gap-3"><span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>{a}</li>
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
