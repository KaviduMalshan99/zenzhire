"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles, Check, X, Loader2, RefreshCw, Target, ChevronDown,
  AlertCircle, AlertTriangle, Lightbulb, Zap,
} from "lucide-react";
import type { CVDocument, CVSection, SectionType } from "@/types";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  cv: CVDocument;
  sections: CVSection[];
  activeSection: CVSection | null;
  isPro: boolean;
  targetRole: string;
  onTargetRoleChange: (role: string) => void;
  onJumpToSection: (sectionType: SectionType) => void;
}

interface Issue {
  id: string;
  severity: "critical" | "warning" | "tip";
  text: string;
  sectionType?: SectionType;
}

interface SubScore { label: string; score: number; tip: string; sectionType?: string | null; }

// ─── AI usage (localStorage) ──────────────────────────────────────────────────

const AI_FREE_LIMIT = 5;
function getAIUsageToday(): number {
  try {
    const s = localStorage.getItem("zh_ai_uses");
    if (!s) return 0;
    const { count, date } = JSON.parse(s);
    return date === new Date().toISOString().slice(0, 10) ? (count ?? 0) : 0;
  } catch { return 0; }
}
function incrementAIUsage() {
  try {
    const count = getAIUsageToday() + 1;
    localStorage.setItem("zh_ai_uses", JSON.stringify({ count, date: new Date().toISOString().slice(0, 10) }));
  } catch {}
}

// ─── ATS Score ────────────────────────────────────────────────────────────────

function computeATSScore(sections: CVSection[]): { score: number; missing: string[] } {
  let score = 0;
  const missing: string[] = [];
  const personal = sections.find((s) => s.section_type === "personal_details")?.data ?? {};
  const summary = sections.find((s) => s.section_type === "profile_summary")?.data ?? {};
  const experience = sections.find((s) => s.section_type === "experience")?.data ?? {};
  const education = sections.find((s) => s.section_type === "education")?.data ?? {};
  const skills = sections.find((s) => s.section_type === "skills")?.data ?? {};
  const languages = sections.find((s) => s.section_type === "languages")?.data ?? {};

  if (personal.full_name) score += 6; else missing.push("Full name");
  if (personal.email) score += 6; else missing.push("Email address");
  if (personal.phone) score += 4; else missing.push("Phone number");
  if (personal.links?.some((l: any) => l.platform === "LinkedIn")) score += 4; else missing.push("LinkedIn profile");

  const sumLen = (summary.summary ?? "").length;
  if (sumLen > 200) score += 10;
  else if (sumLen > 80) score += 6;
  else if (sumLen > 20) score += 3;
  else missing.push("Profile summary");

  const expEntries: any[] = experience.entries ?? [];
  if (expEntries.length >= 3) score += 30;
  else if (expEntries.length === 2) score += 22;
  else if (expEntries.length === 1) score += 15;
  else missing.push("Work experience");

  const eduEntries: any[] = education.entries ?? [];
  if (eduEntries.length >= 1) score += 15; else missing.push("Education");

  const skillEntries: any[] = skills.entries ?? [];
  if (skillEntries.length >= 8) score += 15;
  else if (skillEntries.length >= 4) score += 10;
  else if (skillEntries.length >= 1) score += 6;
  else missing.push("Skills");

  const langEntries: any[] = languages.entries ?? [];
  if (langEntries.length >= 1) score += 5; else missing.push("Languages");

  const totalBullets = expEntries.reduce((acc: number, e: any) => acc + (e.bullets?.length ?? 0), 0);
  if (totalBullets >= 6) score += 5; else if (totalBullets >= 3) score += 3;

  return { score: Math.min(100, score), missing };
}

// ─── Sub-scores ───────────────────────────────────────────────────────────────

const ROLE_KEYWORDS: Record<string, string[]> = {
  backend: ["Node.js", "Python", "PostgreSQL", "REST APIs", "Docker", "AWS", "MongoDB", "SQL"],
  frontend: ["React", "TypeScript", "CSS", "JavaScript", "Next.js", "Tailwind"],
  fullstack: ["React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs"],
  "full stack": ["React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs"],
  "data scientist": ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas"],
  "data engineer": ["Python", "SQL", "Spark", "AWS", "dbt", "Airflow"],
  devops: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform"],
  mobile: ["React Native", "iOS", "Android", "Swift", "Kotlin"],
  "product manager": ["Product Roadmap", "Agile", "Jira", "User Research", "KPIs"],
  designer: ["Figma", "UI/UX", "Sketch", "Adobe XD", "Prototyping"],
};

const ACTION_VERBS = ["led","managed","built","designed","developed","created","implemented","launched","improved","reduced","increased","achieved","delivered","coordinated","analyzed","optimized","automated","streamlined","drove","established","generated","negotiated","spearheaded","architected","deployed","migrated","refactored"];

function computeSubScores(sections: CVSection[], targetRole: string) {
  const expEntries: any[] = sections.find((s) => s.section_type === "experience")?.data?.entries ?? [];
  const skillEntries: any[] = sections.find((s) => s.section_type === "skills")?.data?.entries ?? [];
  const allBullets = expEntries.flatMap((e: any) => e.bullets ?? []).filter((b: any) => b.text);
  const personal = sections.find((s) => s.section_type === "personal_details")?.data ?? {};

  // Content Quality
  let contentScore = 0, contentTip = "Add experience bullets to improve content quality";
  if (allBullets.length > 0) {
    const withVerb = allBullets.filter((b: any) => ACTION_VERBS.includes(b.text.trim().toLowerCase().split(" ")[0])).length;
    const withMetric = allBullets.filter((b: any) => /\d+/.test(b.text)).length;
    contentScore = Math.round((withVerb / allBullets.length) * 50 + (withMetric / allBullets.length) * 50);
    const lacking = allBullets.length - withMetric;
    contentTip = lacking > 0 ? `Add numbers to ${lacking} more bullet${lacking > 1 ? "s" : ""}` : "Great use of metrics!";
  }

  // Keyword Match
  const skillNames = skillEntries.map((s: any) => s.skill_name.toLowerCase());
  let keywordScore = 0, keywordTip = "Set a target role above for keyword matching";
  if (targetRole) {
    const roleLower = targetRole.toLowerCase();
    let keywords: string[] = [];
    for (const [key, kws] of Object.entries(ROLE_KEYWORDS)) {
      if (roleLower.includes(key)) { keywords = kws; break; }
    }
    if (keywords.length > 0) {
      const matched = keywords.filter((kw) => skillNames.some((s) => s.includes(kw.toLowerCase())));
      keywordScore = Math.round((matched.length / keywords.length) * 100);
      const missing = keywords.filter((kw) => !skillNames.some((s) => s.includes(kw.toLowerCase())));
      keywordTip = missing.length > 0 ? `Consider adding: ${missing.slice(0, 2).join(", ")}` : `Great ${targetRole} keyword coverage!`;
    } else {
      keywordScore = Math.min(100, skillEntries.length * 12);
      keywordTip = skillEntries.length < 8 ? "Add more role-relevant skills" : "Good skill coverage";
    }
  } else {
    keywordScore = Math.min(100, skillEntries.length * 12);
    keywordTip = skillEntries.length < 8 ? "Add more skills or set a target role" : "Set a target role for specific matching";
  }

  // Completeness
  const CORE: SectionType[] = ["personal_details","profile_summary","experience","education","skills","languages","projects","certificates","awards","references"];
  let filled = 0, firstMissing = "";
  for (const type of CORE) {
    const sec = sections.find((s) => s.section_type === type);
    if (!sec) { if (!firstMissing) firstMissing = type.replace(/_/g, " "); continue; }
    const d = sec.data;
    const ok = type === "personal_details" ? (d.full_name && d.email) :
               type === "profile_summary" ? (d.summary ?? "").replace(/<[^>]+>/g, "").trim().length > 30 :
               (d.entries?.length ?? 0) > 0;
    if (ok) filled++; else if (!firstMissing) firstMissing = type.replace(/_/g, " ");
  }
  const completenessScore = Math.round((filled / CORE.length) * 100);
  const completenessTip = firstMissing ? `Fill "${firstMissing}" to reach ${Math.round((filled + 1) / CORE.length * 100)}%` : "All core sections complete!";

  // Readability
  const rawSummary = sections.find((s) => s.section_type === "profile_summary")?.data?.summary ?? "";
  const plainSummary = rawSummary.replace(/<[^>]+>/g, "").trim();
  const wordCount = plainSummary.split(/\s+/).filter(Boolean).length;
  let readScore = 30, readTip = "Add a profile summary";
  if (wordCount > 0) {
    if (wordCount <= 100) { readScore = 90; readTip = "Perfect length summary!"; }
    else if (wordCount <= 150) { readScore = 70; readTip = `Summary is ${wordCount} words — aim for under 100`; }
    else { readScore = 40; readTip = `Your summary is ${wordCount} words — cut it down`; }
  }

  // Experience Score
  let experienceScore = 0, experienceTip = "Add work experience entries";
  if (expEntries.length > 0) {
    const withDates = expEntries.filter((e: any) => e.start_date).length;
    const withBullets = expEntries.filter((e: any) => (e.bullets?.length ?? 0) >= 2).length;
    experienceScore = Math.min(100, Math.round(
      (expEntries.length >= 3 ? 40 : expEntries.length * 15) +
      (withDates / expEntries.length) * 30 +
      (withBullets / expEntries.length) * 30
    ));
    experienceTip = expEntries.length < 3
      ? `Add ${3 - expEntries.length} more experience ${3 - expEntries.length > 1 ? "entries" : "entry"}`
      : withBullets < expEntries.length ? "Add at least 2 bullets to each job" : "Great experience section!";
  }

  // Skills Score
  let skillsScore = 0, skillsTip = "Add skills to your CV";
  if (skillEntries.length > 0) {
    const withLevel = skillEntries.filter((s: any) => s.level).length;
    skillsScore = Math.min(100, Math.round(
      Math.min(60, skillEntries.length * 7.5) + (withLevel / skillEntries.length) * 40
    ));
    skillsTip = skillEntries.length < 8
      ? `Add ${8 - skillEntries.length} more skills`
      : withLevel < skillEntries.length / 2 ? "Add proficiency levels to your skills" : "Excellent skills section!";
  }

  // Format Score
  const hasPhoto = !!(personal.photo_base64 || personal.photo_url);
  const hasTitle = !!(personal.title);
  const hasLocation = !!(personal.location);
  const hasLinks = (personal.links ?? []).length > 0;
  const formatPoints = [personal.full_name, personal.email, personal.phone, hasPhoto, hasTitle, hasLocation, hasLinks].filter(Boolean).length;
  const formatScore = Math.round((formatPoints / 7) * 100);
  const formatTip = !personal.full_name ? "Add your name" :
    !personal.email ? "Add your email" :
    !hasTitle ? "Add a professional title" :
    !hasLocation ? "Add your location" :
    !hasPhoto ? "Add a profile photo" :
    !hasLinks ? "Add social/portfolio links" : "Great header information!";

  // Impact Score
  let impactScore = 0, impactTip = "Add experience with measurable achievements";
  if (allBullets.length > 0) {
    const withMetric = allBullets.filter((b: any) => /\d+/.test(b.text)).length;
    const withVerb = allBullets.filter((b: any) => ACTION_VERBS.includes(b.text.trim().toLowerCase().split(" ")[0])).length;
    const weakPhrases = allBullets.filter((b: any) =>
      ["responsible for", "helped", "assisted", "worked on"].some((w) => b.text.toLowerCase().includes(w))
    ).length;
    impactScore = Math.min(100, Math.round(
      (withMetric / allBullets.length) * 50 +
      (withVerb / allBullets.length) * 30 +
      ((allBullets.length - weakPhrases) / allBullets.length) * 20
    ));
    const lacking = allBullets.length - withMetric;
    impactTip = lacking > 0 ? `Add metrics to ${lacking} bullet${lacking > 1 ? "s" : ""}` :
      weakPhrases > 0 ? `Remove weak phrases from ${weakPhrases} bullet${weakPhrases > 1 ? "s" : ""}` : "Excellent impact language!";
  }

  return {
    contentQuality: { label: "Content Quality", score: contentScore, tip: contentTip, sectionType: "experience" },
    keywordMatch: { label: "Keyword Match", score: keywordScore, tip: keywordTip, sectionType: "skills" },
    completeness: { label: "Completeness", score: completenessScore, tip: completenessTip, sectionType: null },
    readability: { label: "Readability", score: readScore, tip: readTip, sectionType: "profile_summary" },
    experience: { label: "Experience", score: experienceScore, tip: experienceTip, sectionType: "experience" },
    skills: { label: "Skills", score: skillsScore, tip: skillsTip, sectionType: "skills" },
    format: { label: "CV Format", score: formatScore, tip: formatTip, sectionType: "personal_details" },
    impact: { label: "Impact", score: impactScore, tip: impactTip, sectionType: "experience" },
  };
}

// ─── Job Match ────────────────────────────────────────────────────────────────

function computeJobMatch(sections: CVSection[], jobDesc: string): number {
  if (!jobDesc.trim()) return 0;
  const cvText = sections.map((s) => {
    const d = s.data;
    if (s.section_type === "profile_summary") return d.summary ?? "";
    if (s.section_type === "skills") return d.entries?.map((e: any) => e.skill_name).join(" ") ?? "";
    if (s.section_type === "experience")
      return d.entries?.map((e: any) =>
        `${e.job_title} ${e.employer} ` + (e.bullets?.map((b: any) => b.text).join(" ") ?? "")
      ).join(" ") ?? "";
    return "";
  }).join(" ").toLowerCase();
  const jobWords = jobDesc.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const uniqueWords = [...new Set(jobWords)];
  if (!uniqueWords.length) return 0;
  const matched = uniqueWords.filter((w) => cvText.includes(w));
  return Math.round((matched.length / uniqueWords.length) * 100);
}

// ─── Quick Fixes ──────────────────────────────────────────────────────────────

function computeIssues(sections: CVSection[], targetRole: string): Issue[] {
  const issues: Issue[] = [];
  const personal = sections.find((s) => s.section_type === "personal_details")?.data ?? {};
  const summary = sections.find((s) => s.section_type === "profile_summary")?.data ?? {};
  const experience = sections.find((s) => s.section_type === "experience")?.data ?? {};
  const skills = sections.find((s) => s.section_type === "skills")?.data ?? {};
  const links: any[] = personal.links ?? [];
  const expEntries: any[] = experience.entries ?? [];
  const skillEntries: any[] = skills.entries ?? [];
  const allBullets = expEntries.flatMap((e: any) => e.bullets ?? []).filter((b: any) => b.text);

  // CRITICAL
  if (!personal.email) issues.push({ id: "no_email", severity: "critical", text: "No email address added", sectionType: "personal_details" });
  if (!personal.phone) issues.push({ id: "no_phone", severity: "critical", text: "No phone number added", sectionType: "personal_details" });
  const summaryText = (summary.summary ?? "").replace(/<[^>]+>/g, "").trim();
  if (summaryText.length < 20) issues.push({ id: "no_summary", severity: "critical", text: "Profile summary is empty or too short", sectionType: "profile_summary" });
  if (expEntries.length === 0) {
    issues.push({ id: "no_exp", severity: "critical", text: "No work experience added", sectionType: "experience" });
  } else {
    const noBullets = expEntries.filter((e: any) => (!e.bullets?.length) && !e.description);
    if (noBullets.length > 0) issues.push({ id: "missing_bullets", severity: "critical", text: `${noBullets.length} experience ${noBullets.length > 1 ? "entries have" : "entry has"} no bullets or description`, sectionType: "experience" });
  }

  // WARNING
  const wordCount = summaryText.split(/\s+/).filter(Boolean).length;
  if (wordCount > 150) issues.push({ id: "summary_long", severity: "warning", text: `Summary is ${wordCount} words — keep under 150`, sectionType: "profile_summary" });
  if (skillEntries.length > 0 && skillEntries.length < 3) issues.push({ id: "few_skills_w", severity: "warning", text: "Less than 3 skills listed — add more", sectionType: "skills" });
  if (!links.some((l: any) => l.platform?.toLowerCase().includes("linkedin") && l.url)) issues.push({ id: "no_linkedin", severity: "warning", text: "No LinkedIn profile URL added", sectionType: "personal_details" });
  if (expEntries.some((e: any) => !e.end_date && !e.current)) issues.push({ id: "open_dates", severity: "warning", text: "Some jobs have no end date and not marked as current", sectionType: "experience" });
  const WEAK = ["responsible for", "helped", "assisted", "worked on", "was involved"];
  if (allBullets.some((b: any) => WEAK.some((w) => b.text.toLowerCase().includes(w)))) issues.push({ id: "weak_words", severity: "warning", text: 'Bullets use weak phrases like "responsible for" or "helped"', sectionType: "experience" });
  if (allBullets.length > 0 && !allBullets.some((b: any) => /\d+/.test(b.text))) issues.push({ id: "no_metrics", severity: "warning", text: "No numbers or metrics in any bullet point", sectionType: "experience" });
  if (!sections.some((s) => s.section_type === "projects")) issues.push({ id: "no_projects", severity: "warning", text: "No Projects section — helpful for tech/developer roles" });

  // TIPS
  const hasGH = links.some((l: any) => l.platform?.toLowerCase().includes("github") && l.url);
  const isTech = !targetRole || /developer|engineer|backend|frontend|fullstack|software|programmer|devops/i.test(targetRole);
  if (!hasGH && isTech) issues.push({ id: "no_github", severity: "tip", text: "Add a GitHub URL — essential for tech roles", sectionType: "personal_details" });
  if (!sections.some((s) => s.section_type === "languages" && (s.data.entries?.length ?? 0) > 0)) issues.push({ id: "no_langs", severity: "tip", text: "Consider adding a Languages section" });
  if (!sections.some((s) => s.section_type === "declaration")) issues.push({ id: "no_decl", severity: "tip", text: "Declaration section recommended for GCC/Middle East applications" });
  if (skillEntries.length > 0 && skillEntries.length < 5) issues.push({ id: "few_skills_t", severity: "tip", text: `Only ${skillEntries.length} skills — aim for at least 8`, sectionType: "skills" });
  if (!sections.some((s) => s.section_type === "certificates" && (s.data.entries?.length ?? 0) > 0)) issues.push({ id: "no_certs", severity: "tip", text: "No certifications added — they boost credibility" });

  // DATE GAPS
  if (expEntries.length >= 2) {
    const sorted = [...expEntries]
      .filter((e: any) => e.start_date)
      .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    for (let i = 1; i < sorted.length; i++) {
      const prevEnd = sorted[i - 1].end_date;
      const currStart = sorted[i].start_date;
      if (prevEnd && currStart && !sorted[i - 1].current) {
        const gap = new Date(currStart).getTime() - new Date(prevEnd).getTime();
        const months = Math.floor(gap / (1000 * 60 * 60 * 24 * 30));
        if (months > 6) {
          issues.push({ id: "date_gap", severity: "warning", text: `${months} month gap detected between jobs — consider adding a note or freelance work`, sectionType: "experience" });
          break;
        }
      }
    }
  }

  // DUPLICATE BULLETS
  const bulletTexts = allBullets.map((b: any) => b.text.trim().toLowerCase());
  const uniqueBullets = new Set(bulletTexts);
  if (uniqueBullets.size < bulletTexts.length) {
    issues.push({ id: "duplicate_bullets", severity: "warning", text: "Duplicate bullet points found across experience entries", sectionType: "experience" });
  }

  // TOO LONG CV
  const totalBulletsCount = expEntries.reduce((acc: number, e: any) => acc + (e.bullets?.length ?? 0), 0);
  if (expEntries.length >= 4 && totalBulletsCount >= 20) {
    issues.push({ id: "cv_too_long", severity: "warning", text: "CV may be too long — aim for max 2 pages. Consider trimming older experience bullets", sectionType: "experience" });
  }

  // WEAK SUMMARY OPENER
  const summaryStart = summaryText.toLowerCase().slice(0, 30);
  if (summaryText.length >= 20 && (summaryStart.startsWith("i am") || summaryStart.startsWith("my name is") || summaryStart.startsWith("i'm a"))) {
    issues.push({ id: "weak_opener", severity: "warning", text: 'Summary starts with "I am" or "My name is" — start with your title or strongest skill instead', sectionType: "profile_summary" });
  }

  // MISSING PHOTO
  if (!personal.photo_base64 && !personal.photo_url) {
    issues.push({ id: "no_photo", severity: "tip", text: "No profile photo — adds a personal touch (except US/UK CVs)", sectionType: "personal_details" });
  }

  // SHORT BULLETS
  const shortBullets = allBullets.filter((b: any) => b.text.trim().split(/\s+/).length < 6);
  if (shortBullets.length > 0) {
    issues.push({ id: "short_bullets", severity: "tip", text: `${shortBullets.length} bullet point${shortBullets.length > 1 ? "s are" : " is"} too short — add more detail`, sectionType: "experience" });
  }

  // MISSING JOB TITLE
  if (!personal.title) {
    issues.push({ id: "no_title", severity: "warning", text: "No job title in personal details — add your current/target role title", sectionType: "personal_details" });
  }

  // ALL SKILLS SAME LEVEL
  if (skillEntries.length >= 3) {
    const levels = skillEntries.map((s: any) => s.level);
    const allSame = levels.every((l: any) => l === levels[0]);
    if (allSame && levels[0]) {
      issues.push({ id: "same_skill_levels", severity: "tip", text: "All skills have same level — vary levels (Advanced/Intermediate/Basic) to look more authentic", sectionType: "skills" });
    }
  }

  // MISSING PORTFOLIO/WEBSITE
  const hasPortfolio = links.some((l: any) => l.url && !l.platform?.toLowerCase().includes("linkedin") && !l.platform?.toLowerCase().includes("github"));
  if (!hasPortfolio) {
    issues.push({ id: "no_portfolio", severity: "tip", text: "No portfolio or website link — add one to stand out", sectionType: "personal_details" });
  }

  return issues;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = size * 0.39;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 80 ? "#238636" : score >= 60 ? "#d29922" : score >= 40 ? "#e36209" : "#da3633";
  const dim = size + 10;
  const c = dim / 2;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c - 5} cy={c - 5} r={r} fill="none" stroke="#30363d" strokeWidth="5" />
        <circle cx={c - 5} cy={c - 5} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold" style={{ fontSize: size * 0.22 }}>{score}</span>
      </div>
    </div>
  );
}

function SubScoreBar({ label, score, tip, sectionType, onJump }: SubScore & { onJump?: (s: SectionType) => void }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
  const canJump = !!sectionType && !!onJump;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[#e6edf3] text-[11px] font-medium">{label}</span>
        <span className="text-[#8b949e] text-[11px]">{score}%</span>
      </div>
      <div className="h-1.5 bg-[#30363d] rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${score}%` }} />
      </div>
      {canJump ? (
        <button
          onClick={() => onJump!(sectionType as SectionType)}
          className="text-[10px] text-blue-400 hover:underline mt-1 text-left w-full"
        >
          💡 {tip}
        </button>
      ) : (
        <p className="text-[#8b949e] text-[10px] mt-1">💡 {tip}</p>
      )}
    </div>
  );
}

function SeverityIcon({ severity }: { severity: Issue["severity"] }) {
  if (severity === "critical") return <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />;
  if (severity === "warning") return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />;
  return <Lightbulb className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />;
}

function IssueCard({ issue, isPro, autoFixing, onFix, onAutoFix }: {
  issue: Issue;
  isPro: boolean;
  autoFixing: string | null;
  onFix: () => void;
  onAutoFix: () => void;
}) {
  const canAutoFix = isPro &&
    (issue.sectionType === "profile_summary" || issue.sectionType === "experience") &&
    ["weak_opener", "weak_words", "no_metrics", "improve_bullet"].includes(issue.id);
  return (
    <div className="flex items-start gap-2 bg-[#0d1117] border border-[#30363d] rounded p-2.5">
      <SeverityIcon severity={issue.severity} />
      <div className="flex-1 min-w-0">
        <p className="text-[#e6edf3] text-[11px] leading-snug">{issue.text}</p>
        {(issue.sectionType || canAutoFix) && (
          <div className="flex gap-1.5 mt-1.5">
            {issue.sectionType && (
              <button onClick={onFix} className="text-[10px] px-2 py-0.5 bg-blue-600/10 border border-blue-600/20 text-blue-400 rounded hover:bg-blue-600/20 transition-colors">
                Fix →
              </button>
            )}
            {canAutoFix && (
              <button
                onClick={onAutoFix}
                disabled={autoFixing === issue.id}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-purple-600/10 border border-purple-600/20 text-purple-400 rounded hover:bg-purple-600/20 transition-colors disabled:opacity-40"
              >
                {autoFixing === issue.id ? <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Fixing...</> : <>✨ Auto fix</>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RightPanel({ cv, sections, activeSection, isPro, targetRole, onTargetRoleChange, onJumpToSection }: Props) {
  const [activeTab, setActiveTab] = useState<"ai" | "score" | "fixes">("ai");
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [tone, setTone] = useState<"executive" | "technical" | "friendly">("executive");
  const [showToneMenu, setShowToneMenu] = useState(false);
  const [showTranslateInput, setShowTranslateInput] = useState(false);
  const [translateLang, setTranslateLang] = useState("");
  const [aiUsageToday, setAiUsageToday] = useState(0);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [atsData, setAtsData] = useState(() => computeATSScore(sections));
  const [subScores, setSubScores] = useState(() => computeSubScores(sections, targetRole));
  const [scoreHistory, setScoreHistory] = useState<{ score: number; time: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem(`zh_score_${cv.id}`) ?? "[]"); } catch { return []; }
  });
  const [jobDesc, setJobDesc] = useState("");
  const [jobMatchScore, setJobMatchScore] = useState<number | null>(null);
  const [showJobMatch, setShowJobMatch] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning" | "tip">("all");
  const [groupBySection, setGroupBySection] = useState(false);
  const [fixedIssues, setFixedIssues] = useState<Set<string>>(new Set());
  const [autoFixing, setAutoFixing] = useState<string | null>(null);

  const saveScoreHistory = useCallback((score: number) => {
    const now = new Date();
    const time = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setScoreHistory((prev) => {
      const next = [...prev, { score, time }].slice(-5);
      try { localStorage.setItem(`zh_score_${cv.id}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [cv.id]);

  useEffect(() => {
    setAiUsageToday(getAIUsageToday());
  }, []);

  useEffect(() => {
    const newData = computeATSScore(sections);
    setAtsData(newData);
    setSubScores(computeSubScores(sections, targetRole));
    saveScoreHistory(newData.score);
  }, [sections, targetRole, saveScoreHistory]);

  const sectionType = activeSection?.section_type;

  const getSampleText = useCallback(() => {
    if (!activeSection) return "";
    const d = activeSection.data;
    if (sectionType === "profile_summary") return d.summary ?? "";
    if (sectionType === "experience") {
      const first = d.entries?.[0];
      return first?.bullets?.[0]?.text ?? `${first?.job_title ?? ""} at ${first?.employer ?? ""}`;
    }
    if (sectionType === "skills") return d.entries?.map((e: any) => e.skill_name).join(", ") ?? "";
    if (sectionType === "education") {
      const first = d.entries?.[0];
      return first?.description ?? `${first?.degree ?? ""} at ${first?.institution ?? ""}`;
    }
    if (sectionType === "projects") {
      const first = d.entries?.[0];
      return first?.description ?? first?.title ?? "";
    }
    return "";
  }, [activeSection, sectionType]);

  const runAI = async (actionId: string) => {
    if (!isPro && aiUsageToday >= AI_FREE_LIMIT) return;
    const text = aiInput.trim() || getSampleText();
    if (!text) return;
    setAiLoading(true);
    setAiResponse(null);
    try {
      const context = actionId === "change_tone"
        ? tone
        : actionId === "tailor_for_role"
        ? targetRole
        : actionId === "translate"
        ? translateLang
        : actionId === "suggest_skills"
        ? targetRole
        : actionId === "find_trending_skills"
        ? targetRole
        : actionId === "add_keywords"
        ? targetRole
        : actionId === "generate_summary"
        ? targetRole
        : "";
      const res = await api.post<{ improved_text: string }>("/cv/ai/improve", { text, action: actionId, context });
      setAiResponse(res.data.improved_text);
      incrementAIUsage();
      setAiUsageToday(getAIUsageToday());
    } catch {
      setAiResponse("Failed to get AI response. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIssues(computeIssues(sections, targetRole));
      setHasScanned(true);
      setIsScanning(false);
      setFixedIssues(new Set());
    }, 600);
  };

  const handleAutoFix = async (issue: Issue) => {
    if (!issue.sectionType) return;
    setAutoFixing(issue.id);
    try {
      const section = sections.find((s) => s.section_type === issue.sectionType);
      if (!section) return;
      let text = "";
      let action = "rewrite_professionally";
      if (issue.sectionType === "profile_summary") {
        text = section.data.summary ?? "";
        action = issue.id === "weak_opener" ? "rewrite_professionally" : "make_shorter";
      } else if (issue.sectionType === "experience") {
        text = section.data.entries?.[0]?.bullets?.[0]?.text ?? "";
        action = issue.id === "weak_words" ? "remove_weak_words" : issue.id === "no_metrics" ? "add_metrics" : "improve_bullet";
      }
      if (!text) return;
      const res = await api.post<{ improved_text: string }>("/cv/ai/improve", { text, action, context: targetRole });
      await navigator.clipboard?.writeText(res.data.improved_text);
      setFixedIssues((prev) => new Set([...prev, issue.id]));
      alert("Fixed! Result copied to clipboard. Paste it into the section.");
    } catch {
      alert("Auto fix failed. Please try again.");
    } finally {
      setAutoFixing(null);
    }
  };

  const criticalCount = hasScanned ? issues.filter((i) => i.severity === "critical").length : 0;

  // ── Render AI tab action buttons ──────────────────────────────────────────

  const renderAIButtons = () => {
    const btnClass = "text-[11px] px-2.5 py-1.5 bg-blue-600/10 border border-blue-600/20 text-blue-400 rounded hover:bg-blue-600/20 transition-colors disabled:opacity-40 flex-shrink-0";

    const Btn = ({ id, label }: { id: string; label: string }) => (
      <button key={id} onClick={() => runAI(id)} disabled={aiLoading || (!isPro && aiUsageToday >= AI_FREE_LIMIT)} className={btnClass}>{label}</button>
    );

    switch (sectionType) {
      case "experience":
        return (
          <div className="space-y-1.5">
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="improve_bullet" label="Improve bullet" />
              <Btn id="add_metrics" label="Add metrics" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="convert_to_achievement" label="Duty → Achievement" />
              <Btn id="generate_star" label="STAR format" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="make_longer" label="Make longer" />
              <Btn id="make_shorter" label="Make shorter" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="fix_grammar" label="Fix grammar" />
              <Btn id="remove_weak_words" label="Remove weak words" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="add_keywords" label="Add keywords" />
              <Btn id="make_professional" label="Make professional" />
            </div>
          </div>
        );
      case "profile_summary":
        return (
          <div className="space-y-1.5">
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="rewrite_professionally" label="Rewrite summary" />
              <Btn id="make_shorter" label="Make shorter" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="make_longer" label="Make longer" />
              <Btn id="fix_grammar" label="Fix grammar" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="add_keywords" label="Add keywords" />
              <Btn id="generate_summary" label="Generate from scratch" />
            </div>
            <div className="flex gap-1.5 items-center relative">
              <button
                onClick={() => setShowToneMenu((p) => !p)}
                disabled={aiLoading}
                className={cn(btnClass, "flex items-center gap-1")}
              >
                Change tone <ChevronDown className="w-3 h-3" />
              </button>
              {showToneMenu && (
                <div className="absolute top-8 left-0 z-20 bg-[#21262d] border border-[#30363d] rounded-md shadow-lg overflow-hidden">
                  {(["executive", "technical", "friendly"] as const).map((t) => (
                    <button key={t}
                      onClick={() => { setTone(t); setShowToneMenu(false); runAI("change_tone"); }}
                      className={cn("block w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#30363d] capitalize transition-colors", tone === t ? "text-blue-400" : "text-[#e6edf3]")}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => runAI("tailor_for_role")}
                disabled={aiLoading || (!isPro && aiUsageToday >= AI_FREE_LIMIT) || !targetRole}
                className={cn(btnClass, !targetRole && "opacity-40 cursor-not-allowed")}
                title={!targetRole ? "Set a target role above" : ""}>
                {targetRole ? `Tailor for ${targetRole}` : "Tailor for role"}
              </button>
              <button
                onClick={() => setShowTranslateInput((p) => !p)}
                disabled={aiLoading}
                className={cn(btnClass, "flex items-center gap-1")}>
                Translate
              </button>
            </div>
            {showTranslateInput && (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={translateLang}
                  onChange={(e) => setTranslateLang(e.target.value)}
                  placeholder="e.g. French, Arabic..."
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-[11px] text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => runAI("translate")}
                  disabled={!translateLang || aiLoading}
                  className={cn(btnClass)}>
                  Go
                </button>
              </div>
            )}
          </div>
        );
      case "skills":
        return (
          <div className="space-y-1.5">
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="suggest_skills" label="Suggest skills" />
              <Btn id="find_trending_skills" label="Trending skills" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="group_skills" label="Group by category" />
              <Btn id="add_keywords" label="Add ATS keywords" />
            </div>
          </div>
        );
      case "education":
        return (
          <div className="space-y-1.5">
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="improve_description" label="Improve description" />
              <Btn id="make_professional" label="Make professional" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="make_shorter" label="Make shorter" />
              <Btn id="fix_grammar" label="Fix grammar" />
            </div>
          </div>
        );
      case "projects":
        return (
          <div className="space-y-1.5">
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="improve_description" label="Improve description" />
              <Btn id="add_impact" label="Add impact" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="add_metrics" label="Add metrics" />
              <Btn id="make_professional" label="Make professional" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="make_shorter" label="Make shorter" />
              <Btn id="add_keywords" label="Add keywords" />
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-1.5">
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="rewrite_professionally" label="Improve text" />
              <Btn id="make_shorter" label="Make shorter" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="make_longer" label="Make longer" />
              <Btn id="make_professional" label="Make professional" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn id="fix_grammar" label="Fix grammar" />
              <Btn id="add_keywords" label="Add keywords" />
            </div>
          </div>
        );
    }
  };

  // ── Tab labels with badge ─────────────────────────────────────────────────

  const TabBtn = ({ id, label, badge }: { id: "ai" | "score" | "fixes"; label: string; badge?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
        activeTab === id ? "bg-blue-600 text-white" : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]"
      )}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-[9px] font-bold px-1 rounded-full leading-tight">{badge}</span>
      )}
    </button>
  );

  return (
    <div className="w-80 flex-shrink-0 bg-[#161b22] border-l border-[#30363d] flex flex-col overflow-hidden">

      {/* Target Role */}
      <div className="px-4 pt-3 pb-2 border-b border-[#30363d] flex-shrink-0">
        <label className="flex items-center gap-1.5 text-[#8b949e] text-[11px] font-medium mb-1.5">
          <Target className="w-3.5 h-3.5" /> Target Role
        </label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => onTargetRoleChange(e.target.value)}
          placeholder="e.g. Backend Engineer"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#30363d] flex-shrink-0">
        <TabBtn id="ai" label="AI Assistant" />
        <TabBtn id="score" label="CV Score" />
        <TabBtn id="fixes" label="Quick Fixes" badge={criticalCount || undefined} />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── AI ASSISTANT ─────────────────────────────────────────────────── */}
        {activeTab === "ai" && (
          <div className="px-4 py-3">
            {activeSection && (
              <p className="text-[11px] text-blue-400 mb-3">
                Active: <span className="capitalize">{activeSection.section_type.replace(/_/g, " ")}</span>
              </p>
            )}

            {/* Action buttons */}
            <div className="mb-3">{renderAIButtons()}</div>

            {/* Textarea */}
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Paste text or use active section content"
              rows={3}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
            <button
              onClick={() => setAiInput(getSampleText())}
              className="mt-1 text-[10px] text-[#8b949e] hover:text-blue-400 transition-colors"
            >
              Use current section ↑
            </button>

            {/* Free user limit */}
            {!isPro && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-[#8b949e]">{Math.max(0, AI_FREE_LIMIT - aiUsageToday)} AI uses left today</span>
                {aiUsageToday >= AI_FREE_LIMIT && (
                  <a href="/pricing" className="text-[10px] text-blue-400 hover:underline">Upgrade to Pro</a>
                )}
              </div>
            )}

            {/* Loading */}
            {aiLoading && (
              <div className="mt-3 flex items-center gap-2 text-[#8b949e] text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
              </div>
            )}

            {/* Upgrade prompt for free users at limit */}
            {!isPro && aiUsageToday >= AI_FREE_LIMIT && !aiLoading && (
              <div className="mt-3 bg-blue-600/10 border border-blue-600/20 rounded p-3 text-center">
                <Zap className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-[11px] text-[#e6edf3] mb-2">You've used all 5 free AI assists today</p>
                <a href="/pricing" className="text-[11px] text-blue-400 hover:underline font-medium">Upgrade to Pro for unlimited →</a>
              </div>
            )}

            {/* AI response */}
            {aiResponse && !aiLoading && (
              <div className="mt-3 bg-[#0d1117] border border-[#30363d] rounded p-3">
                <p className="text-[#e6edf3] text-xs leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={() => { navigator.clipboard?.writeText(aiResponse); setAiResponse(null); setAiInput(""); }}
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
        )}

        {/* ── CV SCORE ─────────────────────────────────────────────────────── */}
        {activeTab === "score" && (
          <div className="px-4 py-3">
            {/* ATS Ring + Recalculate */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ScoreRing score={atsData.score} size={52} />
                <div>
                  <p className="text-white text-sm font-medium">ATS Score</p>
                  <p className="text-[#8b949e] text-xs">
                    {atsData.score >= 80 ? "Excellent" : atsData.score >= 60 ? "Good" : atsData.score >= 40 ? "Fair" : "Needs work"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const nd = computeATSScore(sections);
                  setAtsData(nd);
                  setSubScores(computeSubScores(sections, targetRole));
                  saveScoreHistory(nd.score);
                }}
                className="text-[#8b949e] hover:text-white transition-colors p-1 rounded" title="Recalculate">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Score History */}
            {scoreHistory.length > 1 && (
              <div className="mb-4 bg-[#0d1117] rounded p-2.5 border border-[#30363d]">
                <p className="text-[10px] text-[#8b949e] uppercase tracking-wide font-medium mb-2">Score History</p>
                <div className="flex items-end gap-1 h-8">
                  {scoreHistory.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className={cn("w-full rounded-sm", h.score >= 80 ? "bg-green-500" : h.score >= 60 ? "bg-yellow-500" : h.score >= 40 ? "bg-orange-500" : "bg-red-500")}
                        style={{ height: `${Math.max(4, (h.score / 100) * 28)}px` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-[#484f58]">{scoreHistory[0]?.time}</span>
                  <span className="text-[9px] text-[#484f58]">{scoreHistory[scoreHistory.length - 1]?.time}</span>
                </div>
              </div>
            )}

            {/* Missing items */}
            {atsData.missing.length > 0 && (
              <div className="mb-4 bg-[#0d1117] rounded p-2.5 border border-[#30363d]">
                <p className="text-[10px] text-[#8b949e] uppercase tracking-wide font-medium mb-1.5">Missing</p>
                <div className="flex flex-wrap gap-1">
                  {atsData.missing.map((item) => (
                    <span key={item} className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Match Score */}
            <div className="mb-4 border border-[#30363d] rounded">
              <button
                onClick={() => setShowJobMatch((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                <span className="font-medium">Job Match Score</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showJobMatch && "rotate-180")} />
              </button>
              {showJobMatch && (
                <div className="px-3 pb-3">
                  <textarea
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    placeholder="Paste a job description here..."
                    rows={4}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-2 text-xs text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500 resize-none transition-colors"
                  />
                  <button
                    onClick={() => setJobMatchScore(computeJobMatch(sections, jobDesc))}
                    className="mt-2 w-full py-1.5 rounded bg-blue-600/10 border border-blue-600/20 text-blue-400 hover:bg-blue-600/20 text-[11px] font-medium transition-colors"
                  >
                    Calculate Match
                  </button>
                  {jobMatchScore !== null && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#30363d] rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", jobMatchScore >= 60 ? "bg-green-500" : jobMatchScore >= 40 ? "bg-yellow-500" : "bg-red-500")}
                          style={{ width: `${jobMatchScore}%` }}
                        />
                      </div>
                      <span className="text-white text-[11px] font-bold">{jobMatchScore}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sub-scores */}
            <div className="border-t border-[#30363d] pt-3 relative">
              <p className="text-[10px] text-[#8b949e] uppercase tracking-wide font-medium mb-3">Detailed Scores</p>

              {isPro ? (
                <>
                  <SubScoreBar {...subScores.contentQuality} onJump={onJumpToSection} />
                  <SubScoreBar {...subScores.keywordMatch} onJump={onJumpToSection} />
                  <SubScoreBar {...subScores.completeness} onJump={onJumpToSection} />
                  <SubScoreBar {...subScores.readability} onJump={onJumpToSection} />
                  <SubScoreBar {...subScores.experience} onJump={onJumpToSection} />
                  <SubScoreBar {...subScores.skills} onJump={onJumpToSection} />
                  <SubScoreBar {...subScores.format} onJump={onJumpToSection} />
                  <SubScoreBar {...subScores.impact} onJump={onJumpToSection} />
                </>
              ) : (
                <div className="relative">
                  <div className="blur-sm pointer-events-none select-none">
                    <SubScoreBar label="Content Quality" score={72} tip="Add numbers to 3 more bullets" />
                    <SubScoreBar label="Keyword Match" score={55} tip="Consider adding: REST APIs" />
                    <SubScoreBar label="Completeness" score={60} tip="Add Projects section" />
                    <SubScoreBar label="Readability" score={80} tip="Perfect length summary!" />
                    <SubScoreBar label="Experience" score={65} tip="Add more experience entries" />
                    <SubScoreBar label="Skills" score={70} tip="Add proficiency levels" />
                    <SubScoreBar label="CV Format" score={85} tip="Great header information!" />
                    <SubScoreBar label="Impact" score={45} tip="Add metrics to 5 bullets" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#161b22]/70 rounded">
                    <Zap className="w-4 h-4 text-blue-400 mb-1.5" />
                    <p className="text-[11px] text-[#e6edf3] font-medium mb-1">Pro feature</p>
                    <a href="/pricing" className="text-[11px] text-blue-400 hover:underline">Upgrade to unlock →</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── QUICK FIXES ──────────────────────────────────────────────────── */}
        {activeTab === "fixes" && (
          <div className="px-4 py-3">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-blue-600/10 border border-blue-600/20 text-blue-400 hover:bg-blue-600/20 transition-colors text-xs font-medium mb-3 disabled:opacity-60"
            >
              {isScanning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning...</> : <><Zap className="w-3.5 h-3.5" /> Scan CV</>}
            </button>

            {!hasScanned && !isScanning && (
              <p className="text-center text-[#8b949e] text-xs mt-6">Click Scan to detect issues in your CV</p>
            )}

            {hasScanned && issues.length === 0 && (
              <div className="text-center mt-4">
                <Check className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 text-sm font-medium">No issues found!</p>
                <p className="text-[#8b949e] text-xs mt-1">Your CV looks great.</p>
              </div>
            )}

            {hasScanned && issues.length > 0 && (
              <>
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-[#8b949e]">Issues resolved</span>
                    <span className="text-[10px] text-[#8b949e]">{fixedIssues.size}/{issues.length}</span>
                  </div>
                  <div className="h-1.5 bg-[#30363d] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${(fixedIssues.size / issues.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Filters row */}
                <div className="flex gap-1 mb-3 flex-wrap">
                  {(["all", "critical", "warning", "tip"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setSeverityFilter(f)}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border transition-colors capitalize",
                        severityFilter === f
                          ? "bg-blue-600/20 border-blue-500 text-blue-400"
                          : "border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"
                      )}
                    >
                      {f === "all" ? `All (${issues.length})`
                        : f === "critical" ? `🔴 ${issues.filter((i) => i.severity === "critical").length}`
                        : f === "warning" ? `🟡 ${issues.filter((i) => i.severity === "warning").length}`
                        : `💡 ${issues.filter((i) => i.severity === "tip").length}`}
                    </button>
                  ))}
                  <button
                    onClick={() => setGroupBySection((p) => !p)}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border transition-colors ml-auto",
                      groupBySection
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"
                    )}
                  >
                    {groupBySection ? "Ungrouped" : "By section"}
                  </button>
                </div>

                {/* Issues list */}
                {(() => {
                  const filtered = (isPro
                    ? issues
                    : issues.filter((i) => i.severity === "critical").slice(0, 3)
                  ).filter((i) => severityFilter === "all" || i.severity === severityFilter)
                   .filter((i) => !fixedIssues.has(i.id));

                  if (groupBySection) {
                    const grouped: Record<string, Issue[]> = {};
                    filtered.forEach((issue) => {
                      const key = issue.sectionType ?? "general";
                      if (!grouped[key]) grouped[key] = [];
                      grouped[key].push(issue);
                    });
                    return Object.entries(grouped).map(([section, sectionIssues]) => (
                      <div key={section} className="mb-3">
                        <p className="text-[10px] text-[#8b949e] uppercase tracking-wide font-medium mb-1.5 capitalize">
                          {section.replace(/_/g, " ")}
                        </p>
                        <div className="space-y-1.5">
                          {sectionIssues.map((issue) => (
                            <IssueCard
                              key={issue.id}
                              issue={issue}
                              isPro={isPro}
                              autoFixing={autoFixing}
                              onFix={() => onJumpToSection(issue.sectionType as SectionType)}
                              onAutoFix={() => handleAutoFix(issue)}
                            />
                          ))}
                        </div>
                      </div>
                    ));
                  }

                  return (
                    <div className="space-y-1.5">
                      {filtered.map((issue) => (
                        <IssueCard
                          key={issue.id}
                          issue={issue}
                          isPro={isPro}
                          autoFixing={autoFixing}
                          onFix={() => issue.sectionType && onJumpToSection(issue.sectionType as SectionType)}
                          onAutoFix={() => handleAutoFix(issue)}
                        />
                      ))}
                    </div>
                  );
                })()}

                {!isPro && issues.length > 3 && (
                  <div className="mt-3 bg-[#0d1117] border border-[#30363d] rounded p-3 text-center">
                    <p className="text-[11px] text-[#8b949e] mb-1">{issues.length - 3} more issues hidden</p>
                    <a href="/pricing" className="text-[11px] text-blue-400 hover:underline">Upgrade to Pro to see all →</a>
                  </div>
                )}

                <div className="mt-3 flex gap-3 text-[10px] text-[#8b949e]">
                  <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-red-400" /> {issues.filter((i) => i.severity === "critical").length} critical</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-yellow-400" /> {issues.filter((i) => i.severity === "warning").length} warnings</span>
                  <span className="flex items-center gap-1"><Lightbulb className="w-3 h-3 text-green-400" /> {issues.filter((i) => i.severity === "tip").length} tips</span>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
