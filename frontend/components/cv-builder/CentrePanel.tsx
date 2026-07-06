"use client";

import { useRef, useState, useEffect } from "react";
import { ZoomIn, ZoomOut, Download, AlertTriangle, Loader2, Target } from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { CVDocument, CVSection, CVCustomization } from "@/types";
import { DEFAULT_CUSTOMIZATION } from "@/types";
import { PAGE_HEIGHT_A4, CONTINUATION_TOP_GAP, extractPageChunks, computePageBreaks, type PageChunkExtent } from "@/lib/pagination";
import { CVEditProvider } from "./templates/edit/CVEditContext";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";
import { TechTemplate } from "./templates/TechTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { AcademicTemplate } from "./templates/AcademicTemplate";
import { GCCTemplate } from "./templates/GCCTemplate";
import { PortraitTemplate, PORTRAIT_SIDEBAR_TYPES } from "./templates/PortraitTemplate";
import { MilestoneTemplate } from "./templates/MilestoneTemplate";
import { CorporateTemplate } from "./templates/CorporateTemplate";
import { VegaTemplate } from "./templates/VegaTemplate";
import { cn } from "@/lib/utils";

interface Props {
  cv: CVDocument;
  sections: CVSection[];
  zoom: 75 | 100 | 125;
  customization: CVCustomization;
  onZoomChange: (z: 75 | 100 | 125) => void;
  onSendToATS?: () => void;
  onSectionDataChange?: (section: CVSection, data: Record<string, any>) => void;
  onReorder?: (sections: CVSection[]) => void;
}

const A4_W = 794;
const A4_H = PAGE_HEIGHT_A4;
const PAGE_GAP = 20;
// PortraitTemplate's own fixed layout constants (32px horizontal page padding,
// 34%-width sidebar) — deterministic regardless of customization.spacing,
// since that shorthand only varies vertical padding. Used to place the
// per-page-card divider overlay at the same X the template's own (suppressed
// inside .cv-page-card) borderRight would have landed at.
const PORTRAIT_DIVIDER_X = 32 + 0.34 * (A4_W - 64);

interface PageLayout {
  /** Template-space Y coordinate where each page begins. */
  starts: number[];
  /** Portrait only: independent per-page Y coordinates for the sidebar column
   *  (see extractSidebarChunks/computeSidebarPageStart below). Equal to
   *  `starts` for every other template. */
  sidebarStarts: number[];
  /** Portrait only: Y coordinate where the two-column body (sidebar + main)
   *  actually starts, below the full-width header. 0 for every other
   *  template. Used to keep the per-page-card divider overlay from crossing
   *  through the header on page 1 (see the isPortrait divider JSX below). */
  bodyTop: number;
  /** section.id -> the page index it visually starts on, used to decide which page-card is allowed to register that section as a drag source/target. */
  sectionPage: Map<number, number>;
}

// Portrait's sidebar sections don't carry .cv-section (see PortraitTemplate.tsx
// — they're deliberately excluded from the main computePageBreaks() decision
// so a tall sidebar can't corrupt the DOM-order chunk list main's page breaks
// are computed from). But their own .cv-heading-group/.cv-entry atomic units
// still need their OWN break-avoidance: real print pagination honors CSS
// break-inside:avoid regardless of which column an element is in, but this
// live preview's clip-mask rendering doesn't consult that CSS property at
// all (it's just a manual crop), so a sidebar entry landing across the
// main-driven cut point gets visually sliced unless something here also
// avoids that split. Mirrors extractPageChunks()'s heading-group-glued-to-
// first-entry grouping, just scoped to the sidebar column instead of walking
// .cv-section.
function extractSidebarChunks(sidebarEl: HTMLElement, baseTop: number): PageChunkExtent[] {
  const atomic = Array.from(sidebarEl.querySelectorAll<HTMLElement>(".cv-heading-group, .cv-entry")).filter(
    (el) => el.classList.contains("cv-heading-group") || !el.closest(".cv-heading-group")
  );
  return atomic.map((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top - baseTop, bottom: r.bottom - baseTop };
  });
}

// For each page, checks whether a sidebar chunk straddles that page's TRUE
// physical bottom edge — if so, that whole chunk (not the boundary) becomes
// the sidebar's own effective start for the next page, pushing it entirely
// onto the next page-card instead of letting the boundary cut through its
// middle. A page with no straddling sidebar chunk keeps the sidebar in
// lockstep with main (today's behavior, unchanged).
//
// Critically, "that page's true physical bottom edge" is NOT mainStarts[i]
// (where main's *next* chunk begins) — mainStarts[i] is often earlier than
// the physical page edge, because main forces a break there to protect one
// of its OWN entries or reserve the next page's CONTINUATION_TOP_GAP. That
// gap between mainStarts[i] and the true edge is real, fillable space on the
// physical page; treating it as off-page incorrectly pushes sidebar content
// (e.g. a certificate entry that comfortably fits before the true edge) onto
// the next page a page early, which is what created the visible mismatch
// against the PDF (real print pagination fills that space, since it also
// isn't bound by mainStarts[i] — only by the true edge). The true edge is
// exactly computePageBreaks()'s own internal `pageBottom` value for that
// page, recomputed here from `starts` since the function doesn't expose it.
//
// The fallback (no straddle) is the true edge itself, NOT mainStarts[i]: the
// sidebar's own clip/shift for the next page-card is driven directly by this
// return value, so falling back to mainStarts[i] would still physically cut
// the sidebar there even though nothing needed to be pushed — exactly
// reproducing the original split-entry bug from the opposite direction.
// Using the true edge lets the sidebar's own render keep filling that page
// all the way to its real bottom, matching the PDF.
function computeSidebarPageStart(mainStarts: number[], sidebarChunks: PageChunkExtent[]): number[] {
  const result = [0];
  for (let i = 1; i < mainStarts.length; i++) {
    const trueEdgeOfPrevPage =
      i === 1 ? A4_H : mainStarts[i - 1] + (A4_H - CONTINUATION_TOP_GAP);
    const straddling = sidebarChunks.find((c) => c.top < trueEdgeOfPrevPage - 1 && c.bottom > trueEdgeOfPrevPage + 1);
    result.push(straddling ? straddling.top : trueEdgeOfPrevPage);
  }
  return result;
}

// Break-point decisions (which chunk starts a new page) are computed by the
// shared computePageBreaks() in lib/pagination.ts — the same function
// generate-pdf/route.ts uses for Classic's PDF export, so the preview and
// the PDF can't independently disagree on where a page break belongs.
function calcPageLayout(el: HTMLElement): PageLayout {
  const chunks = extractPageChunks(el);
  const { starts } = computePageBreaks(chunks, A4_H);
  const baseTop = el.getBoundingClientRect().top;

  const sidebarEl = el.querySelector<HTMLElement>(".portrait-sidebar");
  const sidebarStarts = sidebarEl
    ? computeSidebarPageStart(starts, extractSidebarChunks(sidebarEl, baseTop))
    : starts;
  const bodyTop = sidebarEl ? sidebarEl.getBoundingClientRect().top - baseTop : 0;

  // Every SortableSection (main-column sections and, in Modern, sidebar
  // sections too) tags itself with data-section-id regardless of whether
  // it's editable — bucket each one into the page it visually starts on.
  // Sidebar-column markers (Portrait only) are bucketed against the
  // sidebar's own independent starts, not main's, so a section pushed onto
  // the next page-card by computeSidebarPageStart() above also gets its
  // drag-target registration pointed at that same page-card.
  const sectionPage = new Map<number, number>();
  const markers = Array.from(el.querySelectorAll<HTMLElement>("[data-section-id]"));
  for (const marker of markers) {
    const id = Number(marker.getAttribute("data-section-id"));
    const top = marker.getBoundingClientRect().top - baseTop;
    const relevantStarts = sidebarEl && sidebarEl.contains(marker) ? sidebarStarts : starts;
    let page = 0;
    for (let i = 0; i < relevantStarts.length; i++) {
      if (top >= relevantStarts[i] - 1) page = i;
    }
    sectionPage.set(id, page);
  }

  return { starts, sidebarStarts, bodyTop, sectionPage };
}

export function CentrePanel({ cv, sections, zoom, customization, onZoomChange, onSendToATS, onSectionDataChange, onReorder }: Props) {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [pageStartY, setPageStartY] = useState<number[]>([0]);
  const [sidebarPageStart, setSidebarPageStart] = useState<number[]>([0]);
  const [bodyTop, setBodyTop] = useState(0);
  const [sectionPage, setSectionPage] = useState<Map<number, number>>(new Map());

  const visibleSections = sections.filter((s) => s.is_visible);
  const isTech = cv.template_id === "tech";
  const isCreative = cv.template_id === "creative";
  const isModern = cv.template_id === "modern";
  const isPortrait = cv.template_id === "portrait";
  const scale = zoom / 100;

  const editable = !!(onSectionDataChange && onReorder);
  const reorderableIds = visibleSections
    .filter((s) => s.section_type !== "personal_details")
    .map((s) => s.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(sections, oldIndex, newIndex));
    }
  };

  // Recalculate page break positions (and which page each section lands on)
  // whenever the hidden div resizes
  useEffect(() => {
    const el = hiddenRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (!hiddenRef.current) return;
      const layout = calcPageLayout(hiddenRef.current);
      setPageStartY(layout.starts);
      setSidebarPageStart(layout.sidebarStarts);
      setBodyTop(layout.bodyTop);
      setSectionPage(layout.sectionPage);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pageCount = pageStartY.length;
  // Natural (unscaled) height of the pages column including page labels (~20px each) and gaps
  const totalPagesNaturalHeight = pageCount * (A4_H + 20) + (pageCount - 1) * PAGE_GAP;

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const token = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];

      if (!token) throw new Error("Not authenticated");

      const personalSection = sections.find((s) => s.section_type === "personal_details");
      const name = personalSection?.data?.full_name || "cv";

      const fileName = `${name}-zenzhire`;

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId: cv.id, token, fileName, templateId: cv.template_id }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.details || err.error || "PDF export failed");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error("PDF export error:", e);
    } finally {
      setExporting(false);
    }
  };

  const renderTemplate = () => {
    const props = { sections: visibleSections, customization };
    switch (cv.template_id) {
      case "modern":    return <ModernTemplate {...props} />;
      case "minimal":   return <MinimalTemplate {...props} />;
      case "executive": return <ExecutiveTemplate {...props} />;
      case "tech":      return <TechTemplate {...props} />;
      case "creative":  return <CreativeTemplate {...props} />;
      case "academic":  return <AcademicTemplate {...props} />;
      case "gcc":       return <GCCTemplate {...props} />;
      case "portrait":  return <PortraitTemplate {...props} />;
      case "milestone":  return <MilestoneTemplate {...props} />;
      case "corporate":  return <CorporateTemplate {...props} />;
      case "vega":       return <VegaTemplate {...props} />;
      default:           return <ClassicTemplate {...props} />;
    }
  };

  // Every page-card renders the full template (pagination is done via clipping,
  // not by slicing the section list). Every page-card is editable at once —
  // only the page-card where a given section visually lands (per `sectionPage`)
  // is allowed to register it as a drag source/target, so a section can be
  // dragged from, or dropped onto, any page.
  //
  // Portrait renders its sidebar as a second, independently-offset overlay per
  // page-card (see the isPortrait branch below) — that overlay and the shared
  // "main" content div both render the FULL template via this same function,
  // so without `role` filtering a section landing on this pageIndex would
  // register as a drag target in BOTH copies simultaneously, which dnd-kit's
  // useSortable() can't tolerate (two elements claiming the same section id
  // at once). `role` makes each copy only claim the sections that actually
  // belong to it; every other template always passes no role and keeps the
  // original single-copy behavior untouched.
  const renderEditableTemplate = (pageIndex: number, role?: "main" | "sidebar") => {
    if (!editable) return renderTemplate();
    return (
      <CVEditProvider
        value={{
          editable: true,
          onFieldChange: (section, data) => onSectionDataChange!(section, data),
          onReorder: (newSections) => onReorder!(newSections),
          isDragTarget: (sectionId) => {
            if ((sectionPage.get(sectionId) ?? 0) !== pageIndex) return false;
            if (!isPortrait || !role) return true;
            const section = sections.find((s) => s.id === sectionId);
            const isSidebarSection = !!section && PORTRAIT_SIDEBAR_TYPES.has(section.section_type);
            return role === "sidebar" ? isSidebarSection : !isSidebarSection;
          },
        }}
      >
        {renderTemplate()}
      </CVEditProvider>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117] min-w-0 relative">
      {/* TechTemplate's own root outline (.tech-outer) is meant for
          non-paginated rendering (e.g. the dashboard's thumbnail iframe),
          where it draws one frame around the whole document. Inside this
          editor, each page-card is a clipped window onto that same
          continuous element, so the outline's own bottom edge lands wherever
          the real content happens to end on the last page — a stray line
          above the blank remainder of that page-card, separate from (and
          redundant with) the isTech overlay below, which already draws the
          correct per-page frame from computePageBreaks() output. Suppressed
          only inside .cv-page-card so cv-print's own non-paginated rendering
          of the same template is untouched. */}
      <style>{`.cv-page-card .tech-outer { outline: none; }`}</style>
      {/* CreativeTemplate's own left accent line (data-creative-accent-line)
          is meant for non-paginated rendering, where it spans the full
          (auto) height of the continuous document. Inside this editor, each
          page-card is a clipped window onto that same continuous element,
          so the single strip only covers whichever page happens to hold its
          one absolutely-positioned box — not every page. Suppressed only
          inside .cv-page-card in favor of the isCreative per-page-card strip
          below, which is sized to that card's own A4 box. */}
      <style>{`.cv-page-card .creative-outer [data-creative-accent-line] { display: none; }`}</style>
      {/* PortraitTemplate's own sidebar divider (.portrait-sidebar's
          borderRight) is meant for non-paginated rendering, where it runs
          the full (auto) height of the two-column document. Inside this
          editor, each page-card is a clipped window onto that same
          continuous element, so suppressed here in favor of the isPortrait
          per-page-card divider below, sized to that card's own A4 box. */}
      <style>{`.cv-page-card .portrait-sidebar { border-right: none; }`}</style>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#30363d] flex-shrink-0 bg-[#0d1117]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onZoomChange(zoom === 125 ? 100 : zoom === 100 ? 75 : 75)}
            disabled={zoom === 75}
            className="p-1.5 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-white disabled:opacity-40 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="flex gap-1">
            {([75, 100, 125] as const).map((z) => (
              <button
                key={z}
                onClick={() => onZoomChange(z)}
                className={cn(
                  "text-xs px-2 py-1 rounded transition-colors",
                  zoom === z
                    ? "bg-blue-600 text-white"
                    : "text-[#8b949e] hover:bg-[#21262d] hover:text-white"
                )}
              >
                {z}%
              </button>
            ))}
          </div>
          <button
            onClick={() => onZoomChange(zoom === 75 ? 100 : zoom === 100 ? 125 : 125)}
            disabled={zoom === 125}
            className="p-1.5 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-white disabled:opacity-40 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onSendToATS && (
            <button
              onClick={onSendToATS}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[#30363d] hover:border-blue-500/60 text-[#8b949e] hover:text-blue-400 text-xs font-medium rounded-md transition-colors"
              title="Send to ATS Checker"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Send to ATS</span>
            </button>
          )}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </div>

      {/* Hidden off-screen div â€” single continuous render for measurement + PDF export */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: A4_W,
          pointerEvents: "none",
        }}
      >
        <div
          id="cv-preview"
          ref={hiddenRef}
          style={{ width: A4_W, minHeight: A4_H, fontFamily: "Arial, sans-serif", backgroundColor: "#ffffff" }}
        >
          {renderTemplate()}
        </div>
      </div>

      {/* Scrollable paged preview â€” Google Docs style */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={reorderableIds} strategy={verticalListSortingStrategy}>
      <div
        className="flex-1 overflow-auto min-h-0"
        style={{ backgroundColor: "#94a3b8" }}
      >
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* All page cards in a single scaled column */}
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              display: "flex",
              flexDirection: "column",
              gap: `${PAGE_GAP}px`,
              // Compensate for transform not affecting layout height
              marginBottom: `${totalPagesNaturalHeight * (scale - 1)}px`,
            }}
          >
            {Array.from({ length: pageCount }, (_, i) => (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                {/* White A4 page card */}
                <div
                  className="cv-page-card"
                  style={{
                    width: A4_W,
                    height: A4_H,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    borderRadius: "2px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Modern's sidebar color band, drawn per page-card at exactly this
                      card's own dimensions (0 to A4_H) â€” the same source of truth
                      (pageCount from computePageBreaks()) the content and masks below
                      use, instead of trusting the template's own flex "stretch" to
                      track page boundaries (which it can't, since each page-card here
                      is a clipped window onto one continuous flex row) or a single
                      whole-column gradient (which had no per-page boundary awareness
                      at all). No explicit z-index here -- it's declared before the
                      content/mask siblings below, so plain DOM order already paints
                      it underneath them without needing one. */}
                  {isModern && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "35%",
                        height: A4_H,
                        backgroundColor: customization.accentColor,
                      }}
                    />
                  )}

                  {/* Template content â€” page 1 starts at Y=0 (template has native 40px padding);
                      pages 2+ shift up so the section lands 40px from the card top */}
                  <div
                    style={{
                      position: "absolute",
                      top: i === 0 ? 0 : 40 - pageStartY[i],
                      left: 0,
                      width: A4_W,
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    {renderEditableTemplate(i, isPortrait ? "main" : undefined)}
                  </div>

                  {/* Top mask for pages 2+: covers the 40px of previous-section content
                      that shifts into view due to the +40 offset, leaving blank top padding.
                      For Modern, starts at 35% instead of 0 so it doesn't paint over (and
                      hide) the sidebar band above, which must stay uninterrupted. */}
                  {i > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: isModern ? "35%" : 0,
                        right: 0,
                        height: 40,
                        backgroundColor: "#ffffff",
                        zIndex: 2,
                      }}
                    />
                  )}

                  {/* Bottom mask: hides content belonging to the next page.
                      Formula differs for page 1 (top=0) vs pages 2+ (top=40-pageStartY[i]).
                      Same 35% carve-out as the top mask, for the same reason. */}
                  {i < pageCount - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        top: i === 0
                          ? pageStartY[i + 1]
                          : 40 + pageStartY[i + 1] - pageStartY[i],
                        left: isModern ? "35%" : 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 2,
                      }}
                    />
                  )}

                  {/* Portrait: the shared content div above uses pageStartY (main-driven)
                      for its single shift/mask, which can slice a sidebar entry that
                      straddles that same cut point (real print pagination would honor
                      break-inside:avoid there; this clip-based preview doesn't). Rather
                      than let the shared copy show the sidebar at all, permanently blank
                      its sidebar column here and re-render just the sidebar below, shifted
                      by its own independent, entry-aware sidebarPageStart instead. */}
                  {isPortrait && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: PORTRAIT_DIVIDER_X,
                        bottom: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 2,
                      }}
                    />
                  )}

                  {/* Portrait: sidebar column re-rendered independently of the main
                      content above, shifted by sidebarPageStart (which pushes a whole
                      straddling .cv-entry/.cv-heading-group onto the next page-card
                      instead of letting pageStartY's cut slice through it — see
                      computeSidebarPageStart()). Clipped to exactly the sidebar's own
                      width so it never paints over the main column. */}
                  {isPortrait && (
                    <div style={{ position: "absolute", top: 0, left: 0, width: PORTRAIT_DIVIDER_X, height: A4_H, overflow: "hidden", zIndex: 3 }}>
                      <div
                        style={{
                          position: "absolute",
                          top: i === 0 ? 0 : 40 - sidebarPageStart[i],
                          left: 0,
                          width: A4_W,
                          fontFamily: "Arial, sans-serif",
                        }}
                      >
                        {renderEditableTemplate(i, "sidebar")}
                      </div>
                      {i > 0 && (
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 40, backgroundColor: "#ffffff", zIndex: 2 }} />
                      )}
                      {i < pageCount - 1 && (
                        <div
                          style={{
                            position: "absolute",
                            top: i === 0
                              ? sidebarPageStart[i + 1]
                              : 40 + sidebarPageStart[i + 1] - sidebarPageStart[i],
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "#ffffff",
                            zIndex: 2,
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Bordered template: overlay frame drawn on top of content and masks */}
                  {isTech && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        border: `8px solid ${customization.accentColor}`,
                        boxSizing: "border-box",
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    />
                  )}

                  {/* Creative's left accent line: drawn per page-card at exactly this
                      card's own A4 box (top:0 to bottom:0), same as isTech's frame above,
                      instead of trusting the template's own single strip (suppressed via
                      the .cv-page-card override), which can't track page-card boundaries
                      since each card is a clipped window onto one continuous element. */}
                  {isCreative && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: 8,
                        backgroundColor: customization.accentColor,
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    />
                  )}

                  {/* Portrait's sidebar divider: drawn per page-card at exactly this
                      card's own A4 box, same as isTech/isCreative above, instead of
                      trusting the template's own borderRight (suppressed via the
                      .cv-page-card override), which can't track page-card boundaries
                      since each card is a clipped window onto one continuous element.
                      Page 1 only: starts at bodyTop instead of 0, since the header
                      (photo/name/contact strip) sits above the two-column body as a
                      full-width block — the divider belongs to the body, not the page. */}
                  {isPortrait && (
                    <div
                      style={{
                        position: "absolute",
                        top: i === 0 ? bodyTop : 0,
                        left: PORTRAIT_DIVIDER_X,
                        bottom: 0,
                        width: 1,
                        backgroundColor: "#d1d5db",
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    />
                  )}
                </div>

                {/* Page number label in dark gap below each card */}
                <div
                  style={{
                    color: "#374151",
                    fontSize: "12px",
                    textAlign: "center",
                    marginTop: "4px",
                    userSelect: "none",
                  }}
                >
                  Page {i + 1} of {pageCount}
                </div>
              </div>
            ))}
          </div>

          {/* Page count badge + warnings */}
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: pageCount === 1 ? "#22c55e" : pageCount === 2 ? "#f59e0b" : "#ef4444",
              }}
            >
              {pageCount} page{pageCount > 1 ? "s" : ""}
            </span>
            {pageCount === 3 && (
              <div className="flex items-center gap-1.5 text-yellow-400 text-xs bg-yellow-400/10 border border-yellow-400/20 rounded-md px-3 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                CV exceeds 2 pages â€” consider condensing content
              </div>
            )}
            {pageCount > 3 && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-md px-3 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                CV is {pageCount} pages â€” significantly over the recommended limit
              </div>
            )}
          </div>
        </div>
      </div>
      </SortableContext>
      </DndContext>
    </div>
  );
}
