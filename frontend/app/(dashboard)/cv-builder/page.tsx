"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Layers, Sparkles, X } from "lucide-react";
import api from "@/lib/api";
import type { CVDocument, CVSection, SectionType, TemplateId, SaveStatus } from "@/types";
import { LeftPanel } from "@/components/cv-builder/LeftPanel";
import { CentrePanel } from "@/components/cv-builder/CentrePanel";
import { RightPanel } from "@/components/cv-builder/RightPanel";

// Extract readable text from CV sections for ATS
function extractCVText(sections: CVSection[]): string {
  const lines: string[] = [];
  for (const s of sections) {
    if (!s.is_visible) continue;
    const d = s.data;
    switch (s.section_type) {
      case "personal_details": {
        if (d.full_name) lines.push(d.full_name);
        if (d.title) lines.push(d.title);
        const contacts = [d.email, d.phone, d.location].filter(Boolean);
        if (contacts.length) lines.push(contacts.join(" | "));
        break;
      }
      case "profile_summary":
        if (d.summary) { lines.push("\nPROFILE SUMMARY"); lines.push(d.summary); }
        break;
      case "experience":
        if (d.entries?.length) {
          lines.push("\nEXPERIENCE");
          for (const e of d.entries) {
            lines.push(`${e.job_title} at ${e.employer}${e.location ? `, ${e.location}` : ""} (${e.start_date} - ${e.current ? "Present" : e.end_date})`);
            for (const b of (e.bullets ?? [])) { if (b.text) lines.push(`• ${b.text}`); }
          }
        }
        break;
      case "education":
        if (d.entries?.length) {
          lines.push("\nEDUCATION");
          for (const e of d.entries) {
            lines.push(`${e.degree} - ${e.institution}${e.location ? `, ${e.location}` : ""} (${e.start_date} - ${e.end_date})`);
            if (e.description) lines.push(e.description);
          }
        }
        break;
      case "skills":
        if (d.entries?.length) {
          lines.push("\nSKILLS");
          lines.push(d.entries.map((s: any) => `${s.skill_name}${s.level ? ` (${s.level})` : ""}`).join(", "));
        }
        break;
      case "languages":
        if (d.entries?.length) {
          lines.push("\nLANGUAGES");
          lines.push(d.entries.map((l: any) => `${l.language}${l.level ? ` - ${l.level}` : ""}`).join(", "));
        }
        break;
      case "projects":
        if (d.entries?.length) {
          lines.push("\nPROJECTS");
          for (const p of d.entries) {
            lines.push(`${p.title}${p.subtitle ? ` - ${p.subtitle}` : ""}`);
            if (p.description) lines.push(p.description);
            if (p.tech?.length) lines.push(`Technologies: ${p.tech.join(", ")}`);
          }
        }
        break;
      case "certificates":
        if (d.entries?.length) {
          lines.push("\nCERTIFICATIONS");
          lines.push(d.entries.map((c: any) => `${c.certificate_name}${c.issuer ? ` - ${c.issuer}` : ""}`).join(", "));
        }
        break;
      case "publications":
        if (d.entries?.length) {
          lines.push("\nPUBLICATIONS");
          for (const p of d.entries) {
            lines.push(`${p.title}${p.publisher ? ` - ${p.publisher}` : ""}${p.date ? ` (${p.date})` : ""}`);
          }
        }
        break;
    }
  }
  return lines.join("\n");
}

function CVBuilderInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cvId = searchParams.get("id");

  const [cv, setCV] = useState<CVDocument | null>(null);
  const [sections, setSections] = useState<CVSection[]>([]);
  const [activeSection, setActiveSection] = useState<CVSection | null>(null);
  const [zoom, setZoom] = useState<75 | 100 | 125>(100);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loading, setLoading] = useState(true);

  // Mobile sheet state: 'closed' | 'sections' | 'ai'
  const [mobileSheet, setMobileSheet] = useState<"closed" | "sections" | "ai">("closed");

  const debounceTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // ── Load or create CV ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        if (cvId) {
          const res = await api.get<CVDocument>(`/cv/${cvId}`);
          setCV(res.data);
          setSections(res.data.sections.sort((a, b) => a.display_order - b.display_order));
          setActiveSection(res.data.sections[0] ?? null);
        } else {
          const res = await api.post<CVDocument>("/cv/", { title: "My CV", template_id: "classic" });
          setCV(res.data);
          setSections(res.data.sections.sort((a, b) => a.display_order - b.display_order));
          setActiveSection(res.data.sections[0] ?? null);
          router.replace(`/cv-builder?id=${res.data.id}`);
        }
      } catch {
        toast.error("Failed to load CV builder");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Auto-save section data with debounce ───────────────────────────────────
  const saveSectionData = useCallback(async (section: CVSection, newData: Record<string, any>) => {
    if (!cv) return;
    setSaveStatus("saving");

    const timer = debounceTimers.current.get(section.id);
    if (timer) clearTimeout(timer);

    const newTimer = setTimeout(async () => {
      try {
        const res = await api.put<CVSection>(
          `/cv/${cv.id}/sections/${section.id}`,
          { data: newData }
        );
        setSections((prev) => prev.map((s) => (s.id === section.id ? res.data : s)));
        setActiveSection((prev) => (prev?.id === section.id ? res.data : prev));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
        toast.error("Failed to save");
      }
      debounceTimers.current.delete(section.id);
    }, 1000);

    debounceTimers.current.set(section.id, newTimer);

    // Optimistic local update
    const updated = { ...section, data: newData };
    setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)));
    setActiveSection((prev) => (prev?.id === section.id ? updated : prev));
  }, [cv]);

  // ── Toggle section visibility ──────────────────────────────────────────────
  const toggleVisibility = useCallback(async (section: CVSection) => {
    if (!cv) return;
    try {
      const res = await api.put<CVSection>(
        `/cv/${cv.id}/sections/${section.id}`,
        { is_visible: !section.is_visible }
      );
      setSections((prev) => prev.map((s) => (s.id === section.id ? res.data : s)));
      setActiveSection((prev) => (prev?.id === section.id ? res.data : prev));
    } catch {
      toast.error("Failed to update visibility");
    }
  }, [cv]);

  // ── Reorder sections ───────────────────────────────────────────────────────
  const reorderSections = useCallback(async (newSections: CVSection[]) => {
    if (!cv) return;
    setSections(newSections);
    try {
      const res = await api.put<CVDocument>(`/cv/${cv.id}/reorder`, {
        sections: newSections.map((s, i) => ({ id: s.id, display_order: i })),
      });
      setSections(res.data.sections.sort((a, b) => a.display_order - b.display_order));
    } catch {
      toast.error("Failed to reorder sections");
    }
  }, [cv]);

  // ── Add section ────────────────────────────────────────────────────────────
  const addSection = useCallback(async (type: SectionType) => {
    if (!cv) return;
    try {
      const res = await api.post<CVSection>(`/cv/${cv.id}/sections`, { section_type: type });
      setSections((prev) => [...prev, res.data]);
      setActiveSection(res.data);
      toast.success("Section added");
    } catch {
      toast.error("Failed to add section");
    }
  }, [cv]);

  // ── Delete section ─────────────────────────────────────────────────────────
  const deleteSection = useCallback(async (section: CVSection) => {
    if (!cv) return;
    try {
      await api.delete(`/cv/${cv.id}/sections/${section.id}`);
      setSections((prev) => prev.filter((s) => s.id !== section.id));
      setActiveSection((prev) => (prev?.id === section.id ? null : prev));
      toast.success("Section removed");
    } catch {
      toast.error("Failed to remove section");
    }
  }, [cv]);

  // ── Update CV title or template ────────────────────────────────────────────
  const updateCV = useCallback(async (updates: { title?: string; template_id?: TemplateId }) => {
    if (!cv) return;
    try {
      const res = await api.put<CVDocument>(`/cv/${cv.id}`, updates);
      setCV(res.data);
    } catch {
      toast.error("Failed to update CV");
    }
  }, [cv]);

  // ── Send to ATS Checker ────────────────────────────────────────────────────
  const handleSendToATS = useCallback(() => {
    if (!cv) return;
    const text = extractCVText(sections);
    sessionStorage.setItem("ats_cv_text", text);
    sessionStorage.setItem("ats_cv_id", String(cv.id));
    router.push("/ats-checker?from_cv=1");
  }, [cv, sections, router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0d1117]">
        <div className="text-[#8b949e] text-sm">Loading CV Builder...</div>
      </div>
    );
  }

  if (!cv) return null;

  const panelProps = {
    cv,
    sections,
    activeSection,
    saveStatus,
    onSelectSection: setActiveSection,
    onToggleVisibility: toggleVisibility,
    onReorder: reorderSections,
    onAddSection: addSection,
    onDeleteSection: deleteSection,
    onUpdateCV: updateCV,
    onSectionDataChange: saveSectionData,
  };

  return (
    <>
      {/* Desktop three-panel layout */}
      <div className="hidden md:flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        <LeftPanel {...panelProps} />
        <CentrePanel
          cv={cv}
          sections={sections}
          zoom={zoom}
          onZoomChange={setZoom}
          onSendToATS={handleSendToATS}
        />
        <RightPanel cv={cv} sections={sections} activeSection={activeSection} />
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden h-[calc(100vh-64px)] relative">
        {/* Centre panel takes full width */}
        <CentrePanel
          cv={cv}
          sections={sections}
          zoom={zoom}
          onZoomChange={setZoom}
          onSendToATS={handleSendToATS}
        />

        {/* Mobile floating action buttons */}
        <div className="fixed bottom-6 right-4 flex flex-col gap-3 z-40">
          <button
            onClick={() => setMobileSheet(mobileSheet === "ai" ? "closed" : "ai")}
            className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg flex items-center justify-center transition-colors"
            title="AI Assistant"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileSheet(mobileSheet === "sections" ? "closed" : "sections")}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-colors"
            title="Sections"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile bottom sheet overlay */}
        {mobileSheet !== "closed" && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileSheet("closed")}
            />
            {/* Sheet */}
            <div className="relative bg-[#161b22] rounded-t-2xl border-t border-[#30363d] flex flex-col"
              style={{ maxHeight: "80vh" }}>
              {/* Handle + close */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#30363d] flex-shrink-0">
                <div className="flex items-center gap-2">
                  {mobileSheet === "sections"
                    ? <Layers className="w-4 h-4 text-blue-400" />
                    : <Sparkles className="w-4 h-4 text-purple-400" />}
                  <span className="text-white text-sm font-semibold">
                    {mobileSheet === "sections" ? "Sections" : "AI Assistant"}
                  </span>
                </div>
                <button
                  onClick={() => setMobileSheet("closed")}
                  className="text-[#8b949e] hover:text-white p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {mobileSheet === "sections" ? (
                  <LeftPanel {...panelProps} mobile />
                ) : (
                  <RightPanel cv={cv} sections={sections} activeSection={activeSection} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function CVBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-[#0d1117]">
        <div className="text-[#8b949e] text-sm">Loading CV Builder...</div>
      </div>
    }>
      <CVBuilderInner />
    </Suspense>
  );
}
