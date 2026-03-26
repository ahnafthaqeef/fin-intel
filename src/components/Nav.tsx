"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tools = [
  { href: "/statement-analyzer", label: "Statement Analyzer" },
  { href: "/doc-qa", label: "Doc Q&A" },
  { href: "/roi-calculator", label: "ROI Calculator" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-8 h-14">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-blue-500 font-bold text-lg">FinAI</span>
          <span className="text-slate-400 text-sm font-medium">Intel</span>
        </Link>
        <div className="flex items-center gap-1">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === t.href
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
