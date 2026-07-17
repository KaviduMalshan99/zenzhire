"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Layers, Sparkles, X } from "lucide-react";
import api from "@/lib/api";
import type { CVDocument, CVSection, CVCustomization, SectionType, TemplateId, SaveStatus } from "@/types";
import { DEFAULT_CUSTOMIZATION, mergeCustomization } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { LeftPanel } from "@/components/cv-builder/LeftPanel";
import { CentrePanel } from "@/components/cv-builder/CentrePanel";
import { RightPanel } from "@/components/cv-builder/RightPanel";

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

interface HistorySnapshot {
  sections: CVSection[];
  customization: CVCustomization;
  templateId: TemplateId;
  title: string;
}

export default function CVEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [cv, setCV] = useState<CVDocument | null>(null);
  const [sections, setSections] = useState<CVSection[]>([]);
  const [activeSection, setActiveSection] = useState<CVSection | null>(null);
  const [customization, setCustomizationState] = useState<CVCustomization>(DEFAULT_CUSTOMIZATION);
  const [zoom, setZoom] = useState<75 | 100 | 125>(100);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loading, setLoading] = useState(true);
  const [targetRole, setTargetRole] = useState("");
  const [leftPanelTab, setLeftPanelTab] = useState<"sections" | "style">("sections");
  const [leftPanelMode, setLeftPanelMode] = useState<"list" | "form">("list");
  const [mobileSheet, setMobileSheet] = useState<"closed" | "sections">("closed");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [past, setPast] = useState<HistorySnapshot[]>([]);
  const [future, setFuture] = useState<HistorySnapshot[]>([]);
  const [isRestoringHistory, setIsRestoringHistory] = useState(false);

  const debounceTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const customizationTimer = useRef<NodeJS.Timeout | null>(null);

  // Read via refs (not the plain state closures) so pushHistory stays a
  // single stable function callable from handlers with older dependency
  // arrays (e.g. saveSectionData only depends on [cv]) without going stale.
  const cvRef = useRef(cv);
  const sectionsRef = useRef(sections);
  const customizationRef = useRef(customization);
  const isRestoringRef = useRef(false);
  useEffect(() => { cvRef.current = cv; }, [cv]);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);
  useEffect(() => { customizationRef.current = customization; }, [customization]);
  useEffect(() => { isRestoringRef.current = isRestoringHistory; }, [isRestoringHistory]);

  const snapshotNow = useCallback((): HistorySnapshot | null => {
    if (!cvRef.current) return null;
    return {
      sections: sectionsRef.current.map((s) => ({ ...s, data: { ...s.data } })),
      customization: { ...customizationRef.current },
      templateId: cvRef.current.template_id,
      title: cvRef.current.title,
    };
  }, []);

  // Called at the start of every mutating action so it captures the state
  // immediately before that action — one undo step per completed edit
  // (field blur, stepper click, drag/resize release, reorder, add/delete
  // section, customization change, template/title change), not per keystroke,
  // since those already only call onFieldChange on commit rather than per
  // change. Capped so history can't grow unbounded over a long session.
  const pushHistory = useCallback(() => {
    if (isRestoringRef.current) return;
    const snap = snapshotNow();
    if (!snap) return;
    setPast((prev) => [...prev.slice(-49), snap]);
    setFuture([]);
  }, [snapshotNow]);

  // Reconciles the CV's sections/customization/template/title back to a
  // saved snapshot. Sections present now but not in the snapshot are
  // deleted; sections in the snapshot but missing now (e.g. redoing past a
  // delete) are recreated with matching type/data — under a new id, which is
  // the one real limitation here, since the backend doesn't support
  // resurrecting a specific deleted row's id.
  const restoreSnapshot = useCallback(async (snapshot: HistorySnapshot) => {
    const currentCV = cvRef.current;
    if (!currentCV) return;
    setIsRestoringHistory(true);
    try {
      const currentSections = sectionsRef.current;
      const currentIds = new Set(currentSections.map((s) => s.id));
      const snapshotIds = new Set(snapshot.sections.map((s) => s.id));

      for (const s of currentSections) {
        if (!snapshotIds.has(s.id) && s.section_type !== "personal_details") {
          await api.delete(`/cv/${currentCV.id}/sections/${s.id}`);
        }
      }

      const idMap = new Map<number, number>();
      for (const snapSec of snapshot.sections) {
        if (currentIds.has(snapSec.id)) {
          await api.put(`/cv/${currentCV.id}/sections/${snapSec.id}`, {
            data: snapSec.data,
            is_visible: snapSec.is_visible,
          });
          idMap.set(snapSec.id, snapSec.id);
        } else {
          const res = await api.post<CVSection>(`/cv/${currentCV.id}/sections`, {
            section_type: snapSec.section_type,
            data: snapSec.data,
          });
          idMap.set(snapSec.id, res.data.id);
        }
      }

      await api.put(`/cv/${currentCV.id}/reorder`, {
        sections: snapshot.sections.map((s, i) => ({ id: idMap.get(s.id)!, display_order: i })),
      });

      if (snapshot.templateId !== currentCV.template_id || snapshot.title !== currentCV.title) {
        await api.put(`/cv/${currentCV.id}`, { template_id: snapshot.templateId, title: snapshot.title });
      }
      if (JSON.stringify(snapshot.customization) !== JSON.stringify(customizationRef.current)) {
        await api.put(`/cv/${currentCV.id}`, { customization: snapshot.customization });
      }

      const res = await api.get<CVDocument>(`/cv/${currentCV.id}`);
      setCV(res.data);
      setSections(res.data.sections.sort((a, b) => a.display_order - b.display_order));
      setActiveSection((prev) => (prev ? res.data.sections.find((s) => s.id === prev.id) ?? null : null));
      setCustomizationState(mergeCustomization(res.data.customization as Partial<CVCustomization> | null));
    } catch {
      toast.error("Failed to restore that step");
    } finally {
      setIsRestoringHistory(false);
    }
  }, []);

  const handleUndo = useCallback(async () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const currentSnap = snapshotNow();
    setPast((prev) => prev.slice(0, -1));
    if (currentSnap) setFuture((prev) => [currentSnap, ...prev]);
    await restoreSnapshot(previous);
  }, [past, snapshotNow, restoreSnapshot]);

  const handleRedo = useCallback(async () => {
    if (future.length === 0) return;
    const next = future[0];
    const currentSnap = snapshotNow();
    setFuture((prev) => prev.slice(1));
    if (currentSnap) setPast((prev) => [...prev, currentSnap]);
    await restoreSnapshot(next);
  }, [future, snapshotNow, restoreSnapshot]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get<CVDocument>(`/cv/${id}`);
        setCV(res.data);
        setSections(res.data.sections.sort((a, b) => a.display_order - b.display_order));
        setActiveSection(res.data.sections[0] ?? null);
        setCustomizationState(mergeCustomization(res.data.customization as Partial<CVCustomization> | null));
      } catch {
        toast.error("Failed to load CV");
        router.push("/cv-builder");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const saveSectionData = useCallback(async (section: CVSection, newData: Record<string, any>) => {
    if (!cv) return;
    pushHistory();
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

    const updated = { ...section, data: newData };
    setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)));
    setActiveSection((prev) => (prev?.id === section.id ? updated : prev));
  }, [cv, pushHistory]);

  const toggleVisibility = useCallback(async (section: CVSection) => {
    if (!cv) return;
    pushHistory();
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
  }, [cv, pushHistory]);

  const reorderSections = useCallback(async (newSections: CVSection[]) => {
    if (!cv) return;
    pushHistory();
    setSections(newSections);
    try {
      const res = await api.put<CVDocument>(`/cv/${cv.id}/reorder`, {
        sections: newSections.map((s, i) => ({ id: s.id, display_order: i })),
      });
      setSections(res.data.sections.sort((a, b) => a.display_order - b.display_order));
    } catch {
      toast.error("Failed to reorder sections");
    }
  }, [cv, pushHistory]);

  const addSection = useCallback(async (type: SectionType) => {
    if (!cv) return;
    pushHistory();
    try {
      const res = await api.post<CVSection>(`/cv/${cv.id}/sections`, { section_type: type });
      setSections((prev) => [...prev, res.data]);
      setActiveSection(res.data);
      toast.success("Section added");
    } catch {
      toast.error("Failed to add section");
    }
  }, [cv, pushHistory]);

  const deleteSection = useCallback(async (section: CVSection) => {
    if (!cv) return;
    pushHistory();
    try {
      await api.delete(`/cv/${cv.id}/sections/${section.id}`);
      setSections((prev) => prev.filter((s) => s.id !== section.id));
      setActiveSection((prev) => (prev?.id === section.id ? null : prev));
      toast.success("Section removed");
    } catch {
      toast.error("Failed to remove section");
    }
  }, [cv, pushHistory]);

  const handleCustomizationChange = useCallback((next: CVCustomization) => {
    if (cv) pushHistory();
    setCustomizationState(next);
    if (!cv) return;
    if (customizationTimer.current) clearTimeout(customizationTimer.current);
    customizationTimer.current = setTimeout(async () => {
      try {
        await api.put<CVDocument>(`/cv/${cv.id}`, { customization: next });
      } catch {
        // silent — customization save failure is non-critical
      }
    }, 1000);
  }, [cv, pushHistory]);

  const updateCV = useCallback(async (updates: { title?: string; template_id?: TemplateId }) => {
    if (!cv) return;
    pushHistory();
    try {
      const res = await api.put<CVDocument>(`/cv/${cv.id}`, updates);
      setCV(res.data);
    } catch {
      toast.error("Failed to update CV");
    }
  }, [cv, pushHistory]);

  const handleJumpToSection = useCallback((sectionType: SectionType) => {
    const section = sections.find((s) => s.section_type === sectionType);
    if (section) {
      setActiveSection(section);
      setLeftPanelTab("sections");
      setLeftPanelMode("form");
    }
  }, [sections]);

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

  const isPro = user?.plan === "pro";

  const panelProps = {
    cv,
    sections,
    activeSection,
    saveStatus,
    customization,
    isPro,
    onSelectSection: setActiveSection,
    onToggleVisibility: toggleVisibility,
    onReorder: reorderSections,
    onAddSection: addSection,
    onDeleteSection: deleteSection,
    onUpdateCV: updateCV,
    onSectionDataChange: saveSectionData,
    onCustomizationChange: handleCustomizationChange,
    controlledTab: leftPanelTab,
    onControlledTabChange: setLeftPanelTab,
    controlledMode: leftPanelMode,
    onControlledModeChange: setLeftPanelMode,
    onUndo: handleUndo,
    onRedo: handleRedo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };

  return (
    <>
      {/* Desktop two-panel layout */}
      <div className="hidden md:flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        <LeftPanel {...panelProps} />
        <CentrePanel
          cv={cv}
          sections={sections}
          zoom={zoom}
          customization={customization}
          onZoomChange={setZoom}
          onSendToATS={handleSendToATS}
          onSectionDataChange={saveSectionData}
          onReorder={reorderSections}
        />
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden flex-col overflow-hidden relative" style={{ height: "calc(100vh - 64px)" }}>
        <CentrePanel
          cv={cv}
          sections={sections}
          zoom={zoom}
          customization={customization}
          onZoomChange={setZoom}
          onSendToATS={handleSendToATS}
          onSectionDataChange={saveSectionData}
          onReorder={reorderSections}
        />

        <div className="fixed bottom-6 right-4 z-40">
          <button
            onClick={() => setMobileSheet(mobileSheet === "sections" ? "closed" : "sections")}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-colors"
            title="Sections"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>

        {mobileSheet === "sections" && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileSheet("closed")}
            />
            <div className="relative bg-[#161b22] rounded-t-2xl border-t border-[#30363d] flex flex-col"
              style={{ maxHeight: "80vh" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#30363d] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm font-semibold">Sections</span>
                </div>
                <button
                  onClick={() => setMobileSheet("closed")}
                  className="text-[#8b949e] hover:text-white p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <LeftPanel {...panelProps} mobile />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Career Mentor AI entry point — visible on every viewport and section */}
      <button
        onClick={() => setAiPanelOpen(true)}
        className="fixed z-40 bottom-24 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: "#2563eb" }}
        title="Career Mentor"
        aria-label="Open Career Mentor AI assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {aiPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setAiPanelOpen(false)}
          />
          <div
            className="relative bg-[#161b22] border-l border-[#30363d] h-full w-full sm:w-[400px] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#30363d] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-semibold">Career Mentor</span>
              </div>
              <button
                onClick={() => setAiPanelOpen(false)}
                className="text-[#8b949e] hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <RightPanel
                cv={cv}
                sections={sections}
                activeSection={activeSection}
                isPro={isPro}
                targetRole={targetRole}
                onTargetRoleChange={setTargetRole}
                onJumpToSection={handleJumpToSection}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
