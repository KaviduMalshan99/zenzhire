"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Upload, FileText, Target, Loader2, ChevronRight, RotateCcw,
  Shield, AlignLeft, Key, Sparkles, BookOpen, User, Brain,
  CheckCircle, Clock,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { ATSResult } from "@/types";
import { cn } from "@/lib/utils";
import { ScoreGauge } from "@/components/ats-checker/ScoreGauge";
import { LayerCard } from "@/components/ats-checker/LayerCard";
import { KeywordHeatmap } from "@/components/ats-checker/KeywordHeatmap";
import { RecruiterCard } from "@/components/ats-checker/RecruiterCard";
import { GrammarIssues } from "@/components/ats-checker/GrammarIssues";

// ── analysis layers for progress display ──────────────────────────────────────

const ANALYSIS_STEPS = [
  { id: "ats_compatibility", label: "ATS Compatibility Check", icon: Shield },
  { id: "sections_structure", label: "Sections & Structure", icon: AlignLeft },
  { id: "keyword_match", label: "Keyword & Skill Matching", icon: Key },
  { id: "content_quality", label: "Content Quality Analysis", icon: Sparkles },
  { id: "language_grammar", label: "Language & Grammar", icon: BookOpen },
  { id: "professional_data", label: "Professional Data Check", icon: User },
  { id: "ai_recruiter", label: "AI Recruiter Simulation", icon: Brain },
];

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Marketing", "Education",
  "Manufacturing", "Retail", "Consulting", "Legal", "Non-profit",
  "Media", "Hospitality", "Real Estate", "Government",
];

// ── layer config (for results grid) ──────────────────────────────────────────

function layerMeta(key: string): { label: string; icon: React.ComponentType<{ className?: string }> } {
  const map: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    ats_compatibility: { label: "ATS Compatibility", icon: Shield },
    sections_structure: { label: "Sections & Structure", icon: AlignLeft },
    keyword_match: { label: "Keywords & Skills", icon: Key },
    content_quality: { label: "Content Quality", icon: Sparkles },
    language_grammar: { label: "Language & Grammar", icon: BookOpen },
    professional_data: { label: "Professional Data", icon: User },
    ai_recruiter: { label: "AI Recruiter Score", icon: Brain },
  };
  return map[key] ?? { label: key, icon: Target };
}

// ── component ─────────────────────────────────────────────────────────────────

function ATSCheckerInner() {
  const { user } = useAuth();
  const isPro = user?.plan === "pro";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const fromCV = searchParams.get("from_cv");

  // form state
  const [uploadTab, setUploadTab] = useState<"pdf" | "text">("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<ATSResult | null>(null);

  // ── Auto-load from CV builder via sessionStorage ───────────────────────────
  useEffect(() => {
    if (!fromCV) return;
    const text = sessionStorage.getItem("ats_cv_text");
    if (text && text.trim().length > 50) {
      setUploadTab("text");
      setPastedText(text);
      sessionStorage.removeItem("ats_cv_text");
      sessionStorage.removeItem("ats_cv_id");
      toast.success("CV loaded — review and click Analyze");
    }
  }, [fromCV]);

  // ── file handling ────────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are accepted.");
      return;
    }
    setFile(f);
    setResult(null);
  }, []);

  // ── analysis ──────────────────────────────────────────────────────────────

  const analyze = async () => {
    const hasCv = uploadTab === "pdf" ? !!file : pastedText.trim().length > 100;
    if (!hasCv) {
      toast.error(uploadTab === "pdf" ? "Please upload a PDF file." : "Please paste at least 100 characters of CV text.");
      return;
    }

    setAnalyzing(true);
    setCurrentStep(0);
    setResult(null);

    // Simulate progress (real analysis happens server-side, ~15-45s)
    let step = 0;
    const timer = setInterval(() => {
      step = Math.min(step + 1, ANALYSIS_STEPS.length - 1);
      setCurrentStep(step);
    }, 3000);

    try {
      const form = new FormData();
      if (uploadTab === "pdf" && file) {
        form.append("cv_file", file);
      } else {
        form.append("cv_text", pastedText.trim());
      }
      if (jobDescription.trim()) form.append("job_description", jobDescription.trim());
      if (targetRole.trim()) form.append("target_role", targetRole.trim());
      if (targetIndustry) form.append("target_industry", targetIndustry);

      const { data } = await api.post<ATSResult>("/ats/analyze", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });

      clearInterval(timer);
      setCurrentStep(ANALYSIS_STEPS.length);
      await new Promise((r) => setTimeout(r, 600));

      setResult(data);
      toast.success(`Analysis complete — score: ${data.overall_score.toFixed(0)}/100`);
    } catch (err: unknown) {
      clearInterval(timer);
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Analysis failed. Please try again.";
      toast.error(msg);
    } finally {
      setAnalyzing(false);
      setCurrentStep(-1);
    }
  };

  const inputClass =
    "w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2.5 text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none focus:border-blue-500 transition-colors text-sm";

  // ── upload section ────────────────────────────────────────────────────────

  const UploadSection = (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">ATS Checker</h1>
        <p className="text-[#8b949e] mt-1 text-sm">
          7-layer AI analysis — ATS compatibility, keywords, grammar, recruiter simulation and more.
        </p>
      </div>

      {/* CV input tabs */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="flex border-b border-[#30363d]">
          {(["pdf", "text"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setUploadTab(tab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                uploadTab === tab
                  ? "bg-blue-600/10 text-blue-400 border-b-2 border-blue-500"
                  : "text-[#8b949e] hover:text-white"
              )}
            >
              {tab === "pdf" ? <Upload className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {tab === "pdf" ? "Upload PDF" : "Paste Text"}
            </button>
          ))}
        </div>

        <div className="p-5">
          {uploadTab === "pdf" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              className={cn(
                "border-2 border-dashed rounded-lg p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors",
                dragOver ? "border-blue-500 bg-blue-600/5" : file ? "border-green-500/50 bg-green-500/5" : "border-[#30363d] hover:border-blue-500/50"
              )}
            >
              <Upload className={cn("w-8 h-8", file ? "text-green-400" : "text-[#8b949e]")} />
              {file ? (
                <>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-[#8b949e] text-sm">{(file.size / 1024).toFixed(0)} KB — click to replace</p>
                </>
              ) : (
                <>
                  <p className="text-[#e6edf3] font-medium">Drop your CV here or click to browse</p>
                  <p className="text-[#8b949e] text-sm">PDF format only · max 5 MB</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          ) : (
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={10}
              placeholder="Paste your complete CV text here…"
              className={inputClass + " resize-none"}
            />
          )}
        </div>
      </div>

      {/* Job description */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">
            Job Description{" "}
            <span className="text-[#8b949e] font-normal text-xs">(optional — enables keyword matching, +5 pts possible)</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={5}
            placeholder="Paste the job posting here for tailored keyword analysis…"
            className={inputClass + " resize-none"}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Target Role</label>
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Industry</label>
            <select
              value={targetIndustry}
              onChange={(e) => setTargetIndustry(e.target.value)}
              className={inputClass + " cursor-pointer"}
            >
              <option value="">Select industry…</option>
              {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={analyze}
        disabled={analyzing}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Target className="w-5 h-5" />
        Analyze My CV
      </button>
    </div>
  );

  // ── loading state ─────────────────────────────────────────────────────────

  const LoadingSection = (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analyzing your CV…</h1>
        <p className="text-[#8b949e] mt-1 text-sm">Running 7 analysis layers. This takes 20–40 seconds.</p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-3">
        {ANALYSIS_STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          const Icon = step.icon;
          return (
            <div key={step.id} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
              active ? "bg-blue-600/10 border border-blue-600/30" : "opacity-40"
            )}>
              {done ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : active ? (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-[#8b949e] flex-shrink-0" />
              )}
              <Icon className={cn("w-4 h-4 flex-shrink-0", done ? "text-green-400" : active ? "text-blue-400" : "text-[#8b949e]")} />
              <span className={cn("text-sm", done ? "text-green-400" : active ? "text-white font-medium" : "text-[#8b949e]")}>
                {step.label}
              </span>
              {done && <span className="ml-auto text-xs text-green-400">Done</span>}
              {active && <span className="ml-auto text-xs text-blue-400 animate-pulse">Running…</span>}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── results section ───────────────────────────────────────────────────────

  const ResultsSection = result && (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ATS Analysis Results</h1>
          <p className="text-[#8b949e] text-sm mt-1">
            {result.cv_filename}
            {result.target_role && <> · {result.target_role}</>}
          </p>
        </div>
        <button
          onClick={() => setResult(null)}
          className="flex items-center gap-2 border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] text-sm px-4 py-2 rounded-md transition-colors self-start"
        >
          <RotateCcw className="w-4 h-4" /> New Analysis
        </button>
      </div>

      {/* Overall score */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 flex flex-col md:flex-row items-center gap-8">
        <ScoreGauge score={result.overall_score} size={220} />
        <div className="flex-1 space-y-3">
          <h2 className="text-xl font-bold text-white">Overall ATS Score</h2>
          <p className="text-[#8b949e] text-sm leading-relaxed">
            Your CV scored <strong className="text-white">{result.overall_score.toFixed(0)}/100</strong> across 7 analysis dimensions.
            {result.overall_score < 60 && " Significant improvements can be made."}
            {result.overall_score >= 60 && result.overall_score < 80 && " Good foundation — targeted improvements will help."}
            {result.overall_score >= 80 && " Strong CV — you're well-positioned for ATS screening."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {(["ats_compatibility", "keyword_match", "content_quality", "ai_recruiter"] as const).map((key) => {
              const layer = result.layers[key];
              const Meta = layerMeta(key);
              const color = layer.percentage >= 75 ? "text-green-400" : layer.percentage >= 50 ? "text-yellow-400" : "text-red-400";
              return (
                <div key={key} className="bg-[#0d1117] rounded-md p-3 text-center border border-[#30363d]">
                  <p className={`text-xl font-bold ${color}`}>{layer.score.toFixed(0)}</p>
                  <p className="text-[#8b949e] text-xs mt-0.5">{Meta.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7 layer cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Layer Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(result.layers) as (keyof typeof result.layers)[]).map((key) => {
            const layer = result.layers[key];
            const Meta = layerMeta(key);
            const locked = !isPro && (key === "ai_recruiter");
            const Icon = Meta.icon;
            return (
              <LayerCard
                key={key}
                title={Meta.label}
                icon={<Icon className="w-4 h-4" />}
                score={layer.score}
                maxScore={layer.max_score}
                percentage={layer.percentage}
                issues={layer.issues}
                locked={locked}
              />
            );
          })}
        </div>
      </div>

      {/* Keyword heatmap */}
      <KeywordHeatmap
        matched={result.layers.keyword_match.matched_keywords}
        missing={result.layers.keyword_match.missing_keywords}
        semantic={result.layers.keyword_match.semantic_matches}
        matchPct={result.layers.keyword_match.match_percentage}
        mode={result.layers.keyword_match.mode}
        isPro={isPro}
      />

      {/* Grammar issues */}
      <GrammarIssues
        errors={result.layers.language_grammar.grammar_errors}
        fillerWords={result.layers.language_grammar.filler_words}
        tenseIssues={result.layers.language_grammar.tense_issues}
        isPro={isPro}
      />

      {/* Content quality detail */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <h3 className="text-white font-semibold mb-4">Content Quality Detail</h3>
        {(() => {
          const ba = result.layers.content_quality.bullet_analysis;
          const total = ba.total_bullets || 1;
          const bars = [
            { label: "Action verbs", value: ba.with_action_verb, color: "bg-blue-500" },
            { label: "Quantified metrics", value: ba.with_metrics, color: "bg-green-500" },
            { label: "Achievement focused", value: ba.achievement_focused, color: "bg-purple-500" },
          ];
          return (
            <div className="space-y-3">
              <p className="text-xs text-[#8b949e] mb-3">{ba.total_bullets} bullet points analysed</p>
              {bars.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8b949e]">{b.label}</span>
                    <span className="text-white">{b.value}/{ba.total_bullets}</span>
                  </div>
                  <div className="w-full bg-[#0d1117] rounded-full h-2">
                    <div className={cn("h-2 rounded-full", b.color)} style={{ width: `${Math.round(b.value / total * 100)}%` }} />
                  </div>
                </div>
              ))}
              {(ba.weak_phrases_found ?? []).length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-red-400 mb-1">Weak phrases to remove:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(ba.weak_phrases_found ?? []).map((p) => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        &ldquo;{p}&rdquo;
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(result.layers.content_quality.suggestions ?? []).length > 0 && (
                <div className="pt-1 space-y-1">
                  {(result.layers.content_quality.suggestions ?? []).map((s, i) => (
                    <p key={i} className="text-xs text-blue-400 flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />{s}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* AI Recruiter card */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">AI Recruiter Simulation</h2>
        <RecruiterCard layer={result.layers.ai_recruiter} isPro={isPro} />
      </div>

      {/* Pro upsell if free */}
      {!isPro && (
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-600/30 rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Unlock Full Analysis</p>
            <p className="text-[#8b949e] text-sm mt-1">
              Pro includes: all keyword gaps, full grammar report, AI recruiter card, and "Fix with AI" buttons.
            </p>
          </div>
          <a
            href="/pricing"
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
          >
            Upgrade to Pro
          </a>
        </div>
      )}
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full">
      <div className="max-w-3xl mx-auto">
        {analyzing ? LoadingSection : result ? ResultsSection : UploadSection}
      </div>
    </div>
  );
}

export default function ATSCheckerPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="max-w-3xl mx-auto">
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#8b949e] animate-spin" />
          </div>
        </div>
      </div>
    }>
      <ATSCheckerInner />
    </Suspense>
  );
}
