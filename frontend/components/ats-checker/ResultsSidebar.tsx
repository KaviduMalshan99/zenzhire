"use client";

import { cn } from "@/lib/utils";
import type { ATSResult } from "@/types";

interface Props {
  result: ATSResult;
}

const JUMP_LINKS = [
  { id: "ats-score-section", label: "Overall Score" },
  { id: "ats-diagnosis-section", label: "What's Wrong" },
  { id: "ats-layers-section", label: "Layer Breakdown" },
  { id: "ats-keywords-section", label: "Keywords" },
  { id: "ats-grammar-section", label: "Grammar" },
  { id: "ats-recruiter-section", label: "AI Recruiter" },
];

function scoreColor(score: number) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function MiniGauge({ score }: { score: number }) {
  const size = 110;
  const r = size * 0.42;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = scoreColor(score);
  const c = size / 2;

  return (
    <div className="relative flex-shrink-0 mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#30363d" strokeWidth="8" />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-bold text-2xl">{Math.round(score)}</span>
        <span className="text-[#8b949e] text-[9px]">/ 100</span>
      </div>
    </div>
  );
}

export function ResultsSidebar({ result }: Props) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-6 flex flex-col gap-4">
      {/* Mini score card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
        <MiniGauge score={result.overall_score} />
        <p className="text-[#8b949e] text-xs mt-2 truncate" title={result.cv_filename}>
          {result.cv_filename}
        </p>
        {result.target_role && (
          <p className="text-blue-400 text-[11px] mt-0.5 truncate">{result.target_role}</p>
        )}
      </div>

      {/* Jump links */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
        <p className="text-[10px] text-[#8b949e] uppercase tracking-wide font-medium px-2 mb-1">
          Jump to
        </p>
        <div className="flex flex-col">
          {JUMP_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={cn(
                "text-left px-2 py-1.5 rounded text-[12px] text-[#8b949e]",
                "hover:text-white hover:bg-[#21262d] transition-colors"
              )}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col gap-2">
        <a
          href="/templates"
          className="text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2.5 rounded-md transition-colors"
        >
          🎨 Browse Templates
        </a>
        <a
          href="/cv-builder"
          className="text-center border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] text-xs font-medium py-2.5 rounded-md transition-colors"
        >
          ✏️ Build/Edit CV
        </a>
      </div>
    </div>
  );
}
