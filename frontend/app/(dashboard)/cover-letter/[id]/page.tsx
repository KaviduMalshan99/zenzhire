"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { coverLetterApi } from "@/lib/api";
import type { CoverLetter, CoverLetterCustomization, CVDocument, CLPersonalDetails } from "@/types";
import { DEFAULT_CL_CUSTOMIZATION } from "@/types";
import { Loader2, Download, Sparkles, ChevronLeft, Save, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoverLetterPreview } from "./CoverLetterPreview";

const TEMPLATES = [
  { id: "classic",      name: "Classic",      desc: "Clean traditional — matches Classic CV" },
  { id: "modern",       name: "Modern",       desc: "Colored sidebar — matches Modern CV" },
  { id: "colorful",     name: "Colorful",     desc: "Bold color banner — matches Colorful CV" },
  { id: "executive",    name: "Executive",    desc: "Elegant formal — matches Executive CV" },
  { id: "bordered",     name: "Bordered",     desc: "Frame border — matches Bordered CV" },
  { id: "creative",     name: "Timeline",     desc: "Left accent line — matches Timeline CV" },
  { id: "inline",       name: "Inline",       desc: "Icon contacts — matches Inline CV" },
  { id: "gcc",          name: "GCC",          desc: "Dark header — matches GCC CV" },
];

const TONES = [
  { value: "formal",    label: "Formal",    desc: "Professional and respectful" },
  { value: "friendly",  label: "Friendly",  desc: "Warm and personable" },
  { value: "confident", label: "Confident", desc: "Direct and assertive" },
];

const ACCENT_COLORS = [
  "#2563eb", "#16a34a", "#7c3aed", "#dc2626",
  "#ea580c", "#0891b2", "#111827", "#b45309",
];

const CV_TO_CL_TEMPLATE: Record<string, string> = {
  "classic":   "classic",
  "modern":    "modern",
  "minimal":   "colorful",
  "executive": "executive",
  "tech":      "bordered",
  "creative":  "creative",
  "academic":  "inline",
  "gcc":       "gcc",
};

const EMPTY_PERSONAL: CLPersonalDetails = {
  full_name: "", title: "", email: "", phone: "",
  location: "", linkedin: "", github: "", portfolio: "",
  nationality: "", date_of_birth: "", gender: "", visa_status: "",
};

export default function CoverLetterEditor() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [cvList, setCvList] = useState<CVDocument[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "style">("details");
  const [editMode, setEditMode] = useState(false);
  const [autoMatchMsg, setAutoMatchMsg] = useState<string | null>(null);

  // Letter fields
  const [title, setTitle] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [tone, setTone] = useState("formal");
  const [content, setContent] = useState("");
  const [templateId, setTemplateId] = useState("classic");
  const [customization, setCustomization] = useState<CoverLetterCustomization>(DEFAULT_CL_CUSTOMIZATION);

  // Personal details (from linked CV or entered manually)
  const [personalDetails, setPersonalDetails] = useState<CLPersonalDetails>(EMPTY_PERSONAL);
  const [manualName, setManualName] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualLocation, setManualLocation] = useState("");

  const extractPersonalFromCV = useCallback(async (cvId: number) => {
    try {
      const res = await api.get(`/cv/${cvId}`);
      const cv = res.data;

      // Extract personal details
      const personalSection = cv.sections?.find((s: any) => s.section_type === "personal_details");
      if (personalSection) {
        const d = personalSection.data ?? {};
        const links: any[] = d.links ?? [];
        const linkedin = links.find((l: any) => l.platform?.toLowerCase().includes("linkedin"))?.url ?? "";
        const github = links.find((l: any) => l.platform?.toLowerCase().includes("github"))?.url ?? "";
        const portfolio = links.find((l: any) => !l.platform?.toLowerCase().includes("linkedin") && !l.platform?.toLowerCase().includes("github"))?.url ?? "";
        setPersonalDetails({
          full_name: d.full_name ?? "",
          title: d.title ?? "",
          email: d.email ?? "",
          phone: d.phone ?? "",
          location: d.location ?? "",
          linkedin,
          github,
          portfolio,
          nationality: d.nationality ?? "",
          date_of_birth: d.date_of_birth ?? "",
          gender: d.gender ?? "",
          visa_status: d.visa_status ?? "",
          photo_base64: d.photo_base64,
          photo_url: d.photo_url,
        });
      }

      // Auto-match CV template, color and font
      const cvCustomization = cv.customization ?? {};
      const cvTemplateId = cv.template_id ?? "classic";
      const matchedCLTemplate = CV_TO_CL_TEMPLATE[cvTemplateId] ?? "classic";

      setTemplateId(matchedCLTemplate);

      const newCustomization = {
        ...DEFAULT_CL_CUSTOMIZATION,
        accentColor: cvCustomization.accentColor ?? DEFAULT_CL_CUSTOMIZATION.accentColor,
        fontFamily: cvCustomization.fontFamily ?? DEFAULT_CL_CUSTOMIZATION.fontFamily,
      };
      setCustomization(newCustomization);

      setAutoMatchMsg(`Template auto-matched to ${matchedCLTemplate} from your CV`);
      setTimeout(() => setAutoMatchMsg(null), 3000);

      await coverLetterApi.update(Number(id), {
        template_id: matchedCLTemplate,
        customization: newCustomization,
      });
    } catch (err) {
      console.error("Failed to extract CV data", err);
    }
  }, [id]);

  useEffect(() => {
    Promise.all([
      coverLetterApi.get(Number(id)),
      api.get<CVDocument[]>("/cv/"),
    ]).then(([clRes, cvRes]) => {
      const cl = clRes.data;
      setLetter(cl);
      setTitle(cl.title);
      setJobTitle(cl.job_title);
      setCompany(cl.company);
      setJobDesc(cl.job_description);
      setTone(cl.tone);
      setContent(cl.content);
      setTemplateId(cl.template_id);
      setCustomization({
        ...DEFAULT_CL_CUSTOMIZATION,
        ...(cl.customization && Object.keys(cl.customization).length > 0 ? cl.customization : {}),
      } as CoverLetterCustomization);
      setSelectedCvId(cl.cv_id);
      setCvList(cvRes.data);
      if (cl.cv_id) extractPersonalFromCV(cl.cv_id);
    }).finally(() => setLoading(false));
  }, [id, extractPersonalFromCV]);

  const save = useCallback(async (updates: Partial<Parameters<typeof coverLetterApi.update>[1]> = {}) => {
    setSaving(true);
    try {
      await coverLetterApi.update(Number(id), {
        title, job_title: jobTitle, company,
        job_description: jobDesc, tone, content,
        template_id: templateId, customization,
        cv_id: selectedCvId ?? undefined,
        ...updates,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [id, title, jobTitle, company, jobDesc, tone, content, templateId, customization, selectedCvId]);

  const handleGenerate = async () => {
    if (!jobTitle || !company) {
      alert("Please enter a job title and company first.");
      return;
    }
    setGenerating(true);
    try {
      const res = await coverLetterApi.generate({
        cv_id: selectedCvId ?? undefined,
        job_title: jobTitle, company,
        job_description: jobDesc, tone,
      });
      setContent(res.data.content);
    } catch {
      alert("Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const res = await fetch("/api/generate-cl-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letterId: id, content, templateId, customization, jobTitle, company, letter, personal: personalDetails }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_")}-cover-letter.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF export failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  const inputCls = "w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500";
  const labelCls = "text-[10px] text-[#8b949e] uppercase tracking-wide font-medium block mb-1.5";

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0d1117]">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 bg-[#161b22] border-r border-[#30363d] flex flex-col overflow-hidden">

        {/* Back + Title */}
        <div className="px-4 pt-4 pb-3 border-b border-[#30363d]">
          <button
            onClick={() => router.push("/cover-letter")}
            className="flex items-center gap-1 text-[#8b949e] hover:text-[#e6edf3] text-xs mb-3 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Cover Letters
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => save()}
            className="w-full bg-transparent text-[#e6edf3] font-semibold text-sm focus:outline-none border-b border-transparent focus:border-[#30363d] pb-0.5"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#30363d]">
          {(["details", "style"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 text-[11px] font-medium capitalize transition-colors",
                activeTab === tab
                  ? "text-blue-400 border-b-2 border-blue-500"
                  : "text-[#8b949e] hover:text-[#e6edf3]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">

          {activeTab === "details" && (
            <div className="space-y-4">

              {/* Link CV */}
              <div>
                <label className={labelCls}>Link to CV (optional)</label>
                <select
                  value={selectedCvId ?? ""}
                  onChange={(e) => {
                    const newCvId = e.target.value ? Number(e.target.value) : null;
                    setSelectedCvId(newCvId);
                    if (newCvId) {
                      extractPersonalFromCV(newCvId);
                    } else {
                      setPersonalDetails({
                        full_name: manualName, title: manualTitle,
                        email: manualEmail, phone: manualPhone,
                        location: manualLocation,
                        linkedin: "", github: "", portfolio: "",
                        nationality: "", date_of_birth: "", gender: "", visa_status: "",
                      });
                      setTemplateId("classic");
                      setCustomization(DEFAULT_CL_CUSTOMIZATION);
                    }
                  }}
                  className={inputCls}
                >
                  <option value="">No CV linked</option>
                  {cvList.map((cv) => (
                    <option key={cv.id} value={cv.id}>{cv.title}</option>
                  ))}
                </select>
                {autoMatchMsg && (
                  <div className="mt-2 px-3 py-2 bg-blue-600/10 border border-blue-600/20 rounded text-[11px] text-blue-400 flex items-center gap-2">
                    <span>✨</span>
                    {autoMatchMsg}
                  </div>
                )}
              </div>

              {/* Manual fields when no CV linked */}
              {!selectedCvId && (
                <div className="space-y-2 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
                  <p className="text-[10px] text-[#8b949e] uppercase tracking-wide font-medium">Your Details</p>
                  {[
                    { label: "Full Name",  value: manualName,     setter: setManualName,     placeholder: "John Smith",       key: "full_name" },
                    { label: "Job Title",  value: manualTitle,    setter: setManualTitle,    placeholder: "Backend Engineer", key: "title" },
                    { label: "Email",      value: manualEmail,    setter: setManualEmail,    placeholder: "john@email.com",   key: "email" },
                    { label: "Phone",      value: manualPhone,    setter: setManualPhone,    placeholder: "+1 234 567 890",   key: "phone" },
                    { label: "Location",   value: manualLocation, setter: setManualLocation, placeholder: "New York, USA",    key: "location" },
                  ].map((field) => (
                    <input
                      key={field.key}
                      value={field.value}
                      onChange={(e) => {
                        field.setter(e.target.value);
                        setPersonalDetails((prev) => ({ ...prev, [field.key]: e.target.value }));
                      }}
                      placeholder={field.placeholder}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-[11px] text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500"
                    />
                  ))}
                </div>
              )}

              {/* Job Title */}
              <div>
                <label className={labelCls}>Job Title *</label>
                <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Backend Engineer" className={inputCls} />
              </div>

              {/* Company */}
              <div>
                <label className={labelCls}>Company *</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" className={inputCls} />
              </div>

              {/* Job Description */}
              <div>
                <label className={labelCls}>Job Description</label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the job description here for better AI results..."
                  rows={6}
                  className={cn(inputCls, "resize-none")}
                />
              </div>

              {/* Tone */}
              <div>
                <label className={labelCls}>Tone</label>
                <div className="space-y-1">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md border text-xs transition-all",
                        tone === t.value ? "border-blue-500 bg-blue-600/10" : "border-[#30363d] hover:border-[#8b949e]"
                      )}
                    >
                      <div className={cn("font-medium", tone === t.value ? "text-blue-400" : "text-[#e6edf3]")}>{t.label}</div>
                      <div className="text-[10px] text-[#8b949e]">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template */}
              <div>
                <label className={labelCls}>Template</label>
                <div className="space-y-1">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTemplateId(t.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md border text-xs transition-all",
                        templateId === t.id ? "border-blue-500 bg-blue-600/10" : "border-[#30363d] hover:border-[#8b949e]"
                      )}
                    >
                      <div className={cn("font-medium", templateId === t.id ? "text-blue-400" : "text-[#e6edf3]")}>{t.name}</div>
                      <div className="text-[10px] text-[#8b949e]">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === "style" && (
            <div className="space-y-4">

              {/* Accent Color */}
              <div>
                <label className={labelCls}>Accent Color</label>
                <div className="flex gap-1.5 flex-wrap">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCustomization((prev) => ({ ...prev, accentColor: c }))}
                      style={{ backgroundColor: c }}
                      className={cn(
                        "w-6 h-6 rounded-full transition-all",
                        customization.accentColor === c
                          ? "ring-2 ring-white ring-offset-1 ring-offset-[#161b22]"
                          : "hover:scale-110"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Font */}
              <div>
                <label className={labelCls}>Font</label>
                <div className="space-y-1">
                  {["Arial", "Georgia", "Roboto", "Lato"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setCustomization((prev) => ({ ...prev, fontFamily: f }))}
                      style={{ fontFamily: f }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md border text-xs transition-all",
                        customization.fontFamily === f
                          ? "border-blue-500 bg-blue-600/10 text-blue-400"
                          : "border-[#30363d] text-[#e6edf3] hover:border-[#8b949e]"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Save */}
        <div className="p-4 border-t border-[#30363d]">
          <button
            onClick={() => save()}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-xs font-medium hover:bg-[#30363d] transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : saved ? <Check className="w-3.5 h-3.5 text-green-400" />
              : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* ── CENTER PANEL ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#30363d] bg-[#161b22] flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[#8b949e] text-xs">Cover Letter Preview</span>
            <button
              onClick={() => setEditMode((p) => !p)}
              className={cn(
                "px-3 py-1 rounded text-xs border transition-colors",
                editMode
                  ? "border-blue-500 bg-blue-600/10 text-blue-400"
                  : "border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"
              )}
            >
              {editMode ? "Preview" : "Edit"}
            </button>
          </div>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>

        {/* A4 canvas */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-8" style={{ backgroundColor: "#94a3b8" }}>
          {editMode ? (
            <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: "#ffffff", padding: "40px 48px", boxShadow: "0 4px 32px rgba(0,0,0,0.4)" }}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={() => save()}
                placeholder="Write or edit your cover letter here..."
                style={{ width: "100%", minHeight: "217mm", border: "none", outline: "none", resize: "none", fontSize: 12, lineHeight: 1.8, color: "#374151", fontFamily: customization.fontFamily, backgroundColor: "transparent" }}
              />
            </div>
          ) : (
            <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: "#ffffff", boxShadow: "0 4px 32px rgba(0,0,0,0.4)", fontFamily: customization.fontFamily }}>
              <CoverLetterPreview
                content={content}
                templateId={templateId}
                customization={customization}
                jobTitle={jobTitle}
                company={company}
                letter={letter}
                personal={personalDetails}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 bg-[#161b22] border-l border-[#30363d] flex flex-col overflow-hidden">

        <div className="px-4 py-3 border-b border-[#30363d]">
          <h3 className="text-[#e6edf3] text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            AI Assistant
          </h3>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">

          <button
            onClick={handleGenerate}
            disabled={generating || !jobTitle || !company}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              : <><Sparkles className="w-4 h-4" /> Generate Cover Letter</>}
          </button>

          {(!jobTitle || !company) && (
            <p className="text-[10px] text-[#8b949e] text-center">Enter job title and company in the left panel first</p>
          )}

          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
            <p className="text-[11px] text-[#8b949e] font-medium mb-2">💡 Tips for better results</p>
            <ul className="space-y-1.5">
              {[
                "Link your CV for personalized content",
                "Paste the full job description",
                "Choose a tone that matches the company culture",
                "Edit the generated text to add personal touches",
              ].map((tip, i) => (
                <li key={i} className="text-[10px] text-[#8b949e] flex items-start gap-1.5">
                  <span className="text-blue-400 flex-shrink-0 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {content && (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
              <p className="text-[11px] text-[#8b949e] font-medium mb-2">Letter Stats</p>
              <div className="space-y-1">
                {[
                  ["Words", content.trim().split(/\s+/).filter(Boolean).length],
                  ["Characters", content.length],
                  ["Reading time", `${Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200)} min`],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between">
                    <span className="text-[10px] text-[#8b949e]">{label}</span>
                    <span className="text-[10px] text-[#e6edf3]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
