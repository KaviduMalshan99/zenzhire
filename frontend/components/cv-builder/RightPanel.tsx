"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Check, X, Loader2, RefreshCw } from "lucide-react";
import type { CVDocument, CVSection, SectionType } from "@/types";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  cv: CVDocument;
  sections: CVSection[];
  activeSection: CVSection | null;
}

interface AIAction {
  id: string;
  label: string;
}

const SECTION_ACTIONS: Partial<Record<SectionType, AIAction[]>> = {
  experience: [
    { id: "improve_bullet", label: "Improve bullet" },
    { id: "add_metrics", label: "Add metrics" },
    { id: "convert_to_achievement", label: "Achievement format" },
    { id: "generate_star", label: "STAR bullet" },
  ],
  profile_summary: [
    { id: "rewrite_professionally", label: "Rewrite professionally" },
    { id: "make_shorter", label: "Make shorter" },
    { id: "tailor_for_role", label: "Tailor for role" },
  ],
  skills: [
    { id: "suggest_skills", label: "Suggest missing skills" },
    { id: "group_skills", label: "Group by category" },
  ],
};

const FALLBACK_ACTIONS: AIAction[] = [
  { id: "rewrite_professionally", label: "Improve text" },
  { id: "make_shorter", label: "Make shorter" },
];

function computeATSScore(sections: CVSection[]): { score: number; missing: string[] } {
  let score = 0;
  const missing: string[] = [];

  const personal = sections.find((s) => s.section_type === "personal_details")?.data ?? {};
  const summary = sections.find((s) => s.section_type === "profile_summary")?.data ?? {};
  const experience = sections.find((s) => s.section_type === "experience")?.data ?? {};
  const education = sections.find((s) => s.section_type === "education")?.data ?? {};
  const skills = sections.find((s) => s.section_type === "skills")?.data ?? {};
  const languages = sections.find((s) => s.section_type === "languages")?.data ?? {};

  // Personal details (20 pts)
  if (personal.full_name) score += 6; else missing.push("Full name");
  if (personal.email) score += 6; else missing.push("Email address");
  if (personal.phone) score += 4; else missing.push("Phone number");
  if (personal.links?.some((l: any) => l.platform === "LinkedIn")) score += 4;
  else missing.push("LinkedIn profile");

  // Summary (10 pts)
  const summaryLen = (summary.summary ?? "").length;
  if (summaryLen > 200) score += 10;
  else if (summaryLen > 80) score += 6;
  else if (summaryLen > 20) score += 3;
  else missing.push("Profile summary");

  // Experience (30 pts)
  const expEntries: any[] = experience.entries ?? [];
  if (expEntries.length >= 3) score += 30;
  else if (expEntries.length === 2) score += 22;
  else if (expEntries.length === 1) score += 15;
  else missing.push("Work experience");

  // Education (15 pts)
  const eduEntries: any[] = education.entries ?? [];
  if (eduEntries.length >= 1) score += 15;
  else missing.push("Education");

  // Skills (15 pts)
  const skillEntries: any[] = skills.entries ?? [];
  if (skillEntries.length >= 8) score += 15;
  else if (skillEntries.length >= 4) score += 10;
  else if (skillEntries.length >= 1) score += 6;
  else missing.push("Skills");

  // Languages (5 pts)
  const langEntries: any[] = languages.entries ?? [];
  if (langEntries.length >= 1) score += 5;
  else missing.push("Languages");

  // Bullet points (5 pts)
  const totalBullets = expEntries.reduce((acc: number, e: any) => acc + (e.bullets?.length ?? 0), 0);
  if (totalBullets >= 6) score += 5;
  else if (totalBullets >= 3) score += 3;

  return { score: Math.min(100, score), missing };
}

function ScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;

  const color =
    score >= 80 ? "#238636" : score >= 60 ? "#d29922" : score >= 40 ? "#e36209" : "#da3633";

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="#30363d" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={radius} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xs font-bold">{score}</span>
        </div>
      </div>
      <div>
        <p className="text-white text-sm font-medium">ATS Score</p>
        <p className="text-[#8b949e] text-xs mt-0.5">
          {score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs work"}
        </p>
      </div>
    </div>
  );
}

export function RightPanel({ cv, sections, activeSection }: Props) {
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [atsData, setAtsData] = useState(() => computeATSScore(sections));

  // Recalculate ATS score every 30 seconds
  useEffect(() => {
    setAtsData(computeATSScore(sections));
    const interval = setInterval(() => {
      setAtsData(computeATSScore(sections));
    }, 30000);
    return () => clearInterval(interval);
  }, [sections]);

  const sectionType = activeSection?.section_type;
  const actions =
    (sectionType && SECTION_ACTIONS[sectionType]) ?? FALLBACK_ACTIONS;

  const getSampleText = useCallback(() => {
    if (!activeSection) return "";
    const data = activeSection.data;
    if (activeSection.section_type === "profile_summary") return data.summary ?? "";
    if (activeSection.section_type === "experience") {
      const first = data.entries?.[0];
      return first?.bullets?.[0]?.text ?? `${first?.job_title ?? ""} at ${first?.employer ?? ""}`;
    }
    if (activeSection.section_type === "skills") {
      return data.entries?.map((e: any) => e.skill_name).join(", ") ?? "";
    }
    return "";
  }, [activeSection]);

  const runAI = async (actionId: string) => {
    const text = aiInput.trim() || getSampleText();
    if (!text) return;
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await api.post<{ improved_text: string }>("/cv/ai/improve", {
        text,
        action: actionId,
        context: "",
      });
      setAiResponse(res.data.improved_text);
    } catch {
      setAiResponse("Failed to get AI response. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-80 flex-shrink-0 bg-[#161b22] border-l border-[#30363d] flex flex-col overflow-hidden">
      {/* AI Assistant Header */}
      <div className="px-4 py-3 border-b border-[#30363d] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-white text-sm font-semibold">AI Assistant</span>
        </div>
        {activeSection && (
          <p className="text-[#8b949e] text-[11px] mt-1">
            Active: <span className="text-blue-400">{activeSection.section_type.replace(/_/g, " ")}</span>
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* AI Input */}
        <div className="px-4 py-3 border-b border-[#30363d]">
          <textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Paste text to improve, or click an action to use current section content..."
            rows={3}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-xs text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />

          {/* Action buttons */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => runAI(action.id)}
                disabled={aiLoading}
                className="text-[11px] px-2.5 py-1 bg-blue-600/10 border border-blue-600/20 text-blue-400 rounded-md hover:bg-blue-600/20 transition-colors disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* AI Response */}
          {aiLoading && (
            <div className="mt-3 flex items-center gap-2 text-[#8b949e] text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Thinking...
            </div>
          )}

          {aiResponse && !aiLoading && (
            <div className="mt-3 bg-[#0d1117] border border-[#30363d] rounded-md p-3">
              <p className="text-[#e6edf3] text-xs leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(aiResponse);
                    }
                    setAiResponse(null);
                    setAiInput("");
                  }}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-green-600/10 border border-green-600/20 text-green-400 rounded hover:bg-green-600/20 transition-colors"
                >
                  <Check className="w-3 h-3" /> Copy & Accept
                </button>
                <button
                  onClick={() => setAiResponse(null)}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-[#21262d] border border-[#30363d] text-[#8b949e] rounded hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" /> Reject
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ATS Score */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#8b949e] text-[11px] uppercase tracking-wide font-medium">ATS Score</span>
            <button
              onClick={() => setAtsData(computeATSScore(sections))}
              className="text-[#8b949e] hover:text-white transition-colors"
              title="Recalculate"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <ScoreRing score={atsData.score} />

          {atsData.missing.length > 0 && (
            <div className="mt-4">
              <p className="text-[#8b949e] text-[11px] uppercase tracking-wide font-medium mb-2">
                Missing / Incomplete
              </p>
              <div className="space-y-1">
                {atsData.missing.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-[#8b949e]">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {atsData.score >= 80 && (
            <p className="mt-3 text-xs text-green-400">
              Your CV is well-optimized for ATS systems.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
