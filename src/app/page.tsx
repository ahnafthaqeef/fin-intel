import Link from "next/link";

const tools = [
  {
    href: "/statement-analyzer",
    icon: "📊",
    title: "Bank Statement Analyzer",
    description:
      "Upload any bank statement PDF. Get instant breakdown of income, expenses, spending categories, and anomaly flags.",
    tags: ["PDF Parsing", "Anomaly Detection", "Categorisation"],
    cta: "Analyze Statement →",
    accent: "from-blue-600 to-blue-500",
  },
  {
    href: "/doc-qa",
    icon: "💬",
    title: "Financial Doc Q&A",
    description:
      "Upload financial reports, contracts, or any document. Ask questions in plain English and get grounded answers.",
    tags: ["RAG", "Document Intelligence", "LLM"],
    cta: "Start Q&A →",
    accent: "from-violet-600 to-violet-500",
  },
  {
    href: "/roi-calculator",
    icon: "📈",
    title: "AI Initiative ROI Calculator",
    description:
      "Input your AI initiative details. Get calculated ROI, payback period, multi-year projections, and an AI-generated business case.",
    tags: ["ROI Analysis", "Business Case", "AI Strategy"],
    cta: "Calculate ROI →",
    accent: "from-emerald-600 to-emerald-500",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-2">
          <span className="text-blue-500 font-bold text-xl">FinAI</span>
          <span className="text-slate-400 text-sm font-medium">Intel</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI-Powered Financial Intelligence
          </div>
          <h1 className="text-5xl font-bold text-slate-50 leading-tight mb-4">
            Enterprise AI tools for
            <br />
            <span className="text-blue-400">financial analysis</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Three purpose-built tools that turn documents, data, and decisions
            into actionable intelligence — in seconds.
          </p>
        </section>

        {/* Tool Cards */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-all hover:-translate-y-1"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tool.accent} mb-5 text-2xl`}
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
                <span className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                  {tool.cta}
                </span>
              </Link>
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
