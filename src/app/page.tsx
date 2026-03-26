"use client";

import Link from "next/link";
import { useState } from "react";

const tools = [
  {
    href: "/statement-analyzer",
    icon: "📊",
    title: "Bank Statement Analyzer",
    description:
      "Upload any bank statement PDF. Get instant breakdown of income, expenses, spending categories, and anomaly flags.",
    tags: ["PDF Parsing", "Anomaly Detection", "Categorisation"],
    cta: "Analyze Statement",
    accent: "from-blue-600 to-blue-500",
    accentBorder: "group-hover:border-blue-500/40",
    iconBg: "bg-blue-500/10 text-blue-400",
  },
  {
    href: "/doc-qa",
    icon: "💬",
    title: "Financial Doc Q&A",
    description:
      "Upload financial reports, contracts, or any document. Ask questions in plain English and get grounded answers.",
    tags: ["RAG", "Document Intelligence", "LLM"],
    cta: "Start Q&A",
    accent: "from-violet-600 to-violet-500",
    accentBorder: "group-hover:border-violet-500/40",
    iconBg: "bg-violet-500/10 text-violet-400",
  },
  {
    href: "/credit-explainer",
    icon: "📋",
    title: "Credit Report Explainer",
    description:
      "Upload a credit report PDF. AI translates it into plain English — health score, positives, concerns, and recommended actions.",
    tags: ["Credit Intelligence", "PDF Parsing", "LLM"],
    cta: "Explain Report",
    accent: "from-emerald-600 to-emerald-500",
    accentBorder: "group-hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10 text-emerald-400",
  },
  {
    href: "/fraud-brief",
    icon: "🛡️",
    title: "Fraud Signal Brief",
    description:
      "Input fraud signals for a credit application. AI synthesises them into a structured analyst brief with risk level and recommended actions.",
    tags: ["Fraud Detection", "Risk Analysis", "LLM"],
    cta: "Generate Brief",
    accent: "from-red-600 to-red-500",
    accentBorder: "group-hover:border-red-500/40",
    iconBg: "bg-red-500/10 text-red-400",
  },
  {
    href: "/roi-calculator",
    icon: "📈",
    title: "AI Initiative ROI Calculator",
    description:
      "Input your AI initiative details. Get calculated ROI, payback period, multi-year projections, and an AI-generated business case.",
    tags: ["ROI Analysis", "Business Case", "AI Strategy"],
    cta: "Calculate ROI",
    accent: "from-amber-600 to-amber-500",
    accentBorder: "group-hover:border-amber-500/40",
    iconBg: "bg-amber-500/10 text-amber-400",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload or input data",
    desc: "Drop a PDF bank statement, credit report, or financial document — or fill in a form with your data.",
    color: "text-blue-400",
    border: "border-blue-500/20",
  },
  {
    step: "02",
    title: "AI processes in seconds",
    desc: "Groq Llama 3.3 70B parses, categorises, and analyses your data with structured output — no waiting.",
    color: "text-violet-400",
    border: "border-violet-500/20",
  },
  {
    step: "03",
    title: "Get structured, actionable insights",
    desc: "Receive breakdowns, risk scores, visualisations, and recommended next steps — ready to act on.",
    color: "text-emerald-400",
    border: "border-emerald-500/20",
  },
];

function ToolCard({ tool }: { tool: (typeof tools)[number] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={tool.href}
      className={`group block bg-[#111] border border-slate-800 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 ${tool.accentBorder}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${tool.iconBg} mb-5 text-2xl`}
      >
        {tool.icon}
      </div>
      <h2 className="text-lg font-semibold text-slate-100 mb-2">
        {tool.title}
      </h2>
      <p className="text-slate-400 text-sm leading-relaxed mb-5">
        {tool.description}
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {tool.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <span
        className={`text-sm font-medium transition-colors ${
          hovered ? "text-white" : "text-slate-400"
        }`}
      >
        {hovered ? `→ Try Demo` : `${tool.cta} →`}
      </span>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 z-10 bg-[#080808]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-2">
          <span className="text-blue-500 font-bold text-xl">FinAI</span>
          <span className="text-slate-400 text-sm font-medium">Intel</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI-Powered Financial Intelligence
          </div>
          <h1 className="text-5xl font-bold text-slate-50 leading-tight mb-4">
            Enterprise AI tools for
            <br />
            <span className="text-blue-400">financial analysis</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            5 AI-powered financial intelligence tools — document analysis, credit
            insights, fraud detection, RAG Q&A, and ROI modelling.
          </p>
        </section>

        {/* Stats bar */}
        <section className="max-w-6xl mx-auto px-6 pb-12">
          <div className="flex flex-wrap items-center justify-center gap-6 py-4 border-y border-slate-800">
            {[
              "5 Tools",
              "100% Free",
              "Powered by Groq Llama 3.3 70B",
              "No login required",
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                )}
                <span className="text-slate-400 text-sm font-medium">
                  {stat}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-8 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className={`bg-[#111] border rounded-xl p-6 ${step.border}`}
              >
                <p className={`text-3xl font-black mb-3 ${step.color}`}>
                  {step.step}
                </p>
                <h3 className="text-slate-100 font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tool cards — 3-2 grid */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-8 text-center">
            The tools
          </h2>
          {/* Top row — 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {tools.slice(0, 3).map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
          </div>
          {/* Bottom row — 2 centered cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:max-w-2xl md:mx-auto">
            {tools.slice(3).map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-600 text-sm">
          FinAI Intel · Built with Next.js + Groq
        </div>
      </footer>
    </div>
  );
}
