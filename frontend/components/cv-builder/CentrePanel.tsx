"use client";

import { useRef, useState, useEffect } from "react";
import { ZoomIn, ZoomOut, Download, AlertTriangle, Loader2, Target } from "lucide-react";
import type { CVDocument, CVSection } from "@/types";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";
import { TechTemplate } from "./templates/TechTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { AcademicTemplate } from "./templates/AcademicTemplate";
import { GCCTemplate } from "./templates/GCCTemplate";
import { cn } from "@/lib/utils";

interface Props {
  cv: CVDocument;
  sections: CVSection[];
  zoom: 75 | 100 | 125;
  onZoomChange: (z: 75 | 100 | 125) => void;
  onSendToATS?: () => void;
}

const A4_W = 794;
const A4_H = 1123;

export function CentrePanel({ cv, sections, zoom, onZoomChange, onSendToATS }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [contentHeight, setContentHeight] = useState(A4_H);

  const visibleSections = sections.filter((s) => s.is_visible);
  const isClassic = !cv.template_id || cv.template_id === "classic";
  const isMinimal = cv.template_id === "minimal";
  const isExecutive = cv.template_id === "executive";
  const isGCC = cv.template_id === "gcc";
  const isAcademic = cv.template_id === "academic";
  const isTech = cv.template_id === "tech";
  const scale = zoom / 100;

  // Measure actual content height with ResizeObserver
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pageCount = Math.max(1, Math.ceil(contentHeight / A4_H));

  const handleExportPDF = async () => {
    setExporting(true);

    let parent: HTMLElement | null = null;
    let savedParentTransform = "";
    let savedParentMarginBottom = "";
    let savedBodyBg = "";
    let savedHtmlBg = "";
    let shadowRemoved = false;
    const savedChildBgs = new Map<HTMLElement, string>();

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("cv-preview");
      if (!element) return;

      const personalSection = sections.find((s) => s.section_type === "personal_details");
      const name = personalSection?.data?.full_name || "cv";

      // Neutralize parent scale so getBoundingClientRect returns the real 794px A4 width
      parent = element.parentElement as HTMLElement;
      savedParentTransform = parent.style.transform;
      savedParentMarginBottom = parent.style.marginBottom;
      parent.style.transform = "none";
      parent.style.marginBottom = "0";

      if (isClassic) {
        // margin: 0 — the template's own padding (40px top/bottom, 45px left/right)
        // fills the A4 page exactly. Adding extra pdf margins would squeeze the
        // 794px (= 210mm A4-width) content into less space and clip the right side.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const classicOpts: any = {
          margin: 0,
          filename: `${name}-cv-zenzhire.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: "#ffffff",
            windowWidth: A4_W,
            scrollX: 0,
            scrollY: 0,
            logging: false,
            onclone: (clonedDoc: Document) => {
              // Remove the preview box-shadow so it doesn't bleed into PDF pages
              const preview = clonedDoc.getElementById("cv-preview");
              if (preview) {
                preview.classList.remove("shadow-2xl");
                preview.style.boxShadow = "none";
                preview.style.backgroundColor = "#ffffff";
              }
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
            avoid: [".cv-entry", ".cv-section"],
          },
        };
        await html2pdf().set(classicOpts).from(element).save();
        return;
      }

      if (isMinimal) {
        // margin: 0 — the template's own padding (28px top/bottom, 35px left/right)
        // fills the A4 page. Adding pdf margins would squeeze the 794px (= 210mm)
        // content into less space and clip the right side.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const minimalOpts: any = {
          margin: 0,
          filename: `${name}-cv-zenzhire.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: "#ffffff",
            windowWidth: A4_W,
            scrollX: 0,
            scrollY: 0,
            logging: false,
            onclone: (clonedDoc: Document) => {
              const preview = clonedDoc.getElementById("cv-preview");
              if (preview) {
                preview.classList.remove("shadow-2xl");
                preview.style.boxShadow = "none";
                preview.style.backgroundColor = "#ffffff";
              }
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
            avoid: [".cv-entry", ".cv-section-header"],
          },
        };
        await html2pdf().set(minimalOpts).from(element).save();
        return;
      }

      if (isExecutive) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const executiveOpts: any = {
          margin: [20, 0, 15, 0],
          filename: `${name}-cv-zenzhire.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: "#ffffff",
            windowWidth: A4_W,
            scrollX: 0,
            scrollY: 0,
            logging: false,
            onclone: (clonedDoc: Document) => {
              const preview = clonedDoc.getElementById("cv-preview");
              if (preview) {
                preview.classList.remove("shadow-2xl");
                preview.style.boxShadow = "none";
                preview.style.backgroundColor = "#ffffff";
              }
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
            avoid: [".cv-entry", ".cv-section-header"],
          },
        };
        await html2pdf().set(executiveOpts).from(element).save();
        return;
      }

      if (isGCC) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gccOpts: any = {
          margin: 0,
          filename: `${name}-cv-zenzhire.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: "#ffffff",
            windowWidth: A4_W,
            scrollX: 0,
            scrollY: 0,
            logging: false,
            onclone: (clonedDoc: Document) => {
              const preview = clonedDoc.getElementById("cv-preview");
              if (preview) {
                preview.classList.remove("shadow-2xl");
                preview.style.boxShadow = "none";
                preview.style.backgroundColor = "#ffffff";
              }
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
            avoid: [".cv-entry", ".cv-section-header"],
          },
        };
        await html2pdf().set(gccOpts).from(element).save();
        return;
      }

      if (isAcademic) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const academicOpts: any = {
          margin: 0,
          filename: `${name}-cv-zenzhire.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: "#ffffff",
            windowWidth: A4_W,
            scrollX: 0,
            scrollY: 0,
            logging: false,
            onclone: (clonedDoc: Document) => {
              const preview = clonedDoc.getElementById("cv-preview");
              if (preview) {
                preview.classList.remove("shadow-2xl");
                preview.style.boxShadow = "none";
                preview.style.backgroundColor = "#ffffff";
              }
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
            avoid: [".cv-entry", ".cv-section-header"],
          },
        };
        await html2pdf().set(academicOpts).from(element).save();
        return;
      }

      if (isTech) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const techOpts: any = {
          margin: 0,
          filename: `${name}-cv-zenzhire.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: "#ffffff",
            windowWidth: A4_W,
            scrollX: 0,
            scrollY: 0,
            logging: false,
            onclone: (clonedDoc: Document) => {
              const preview = clonedDoc.getElementById("cv-preview");
              if (preview) {
                preview.classList.remove("shadow-2xl");
                preview.style.boxShadow = "none";
                preview.style.backgroundColor = "#ffffff";
              }
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
            avoid: [".cv-entry", ".cv-section-header"],
          },
        };
        await html2pdf().set(techOpts).from(element).save();
        return;
      }

      // Remove box-shadow — shadow-2xl renders as a gray ring artifact in the PDF
      if (element.classList.contains("shadow-2xl")) {
        element.classList.remove("shadow-2xl");
        shadowRemoved = true;
      }

      // Force element to exact A4 width with pure white background
      element.style.width = `${A4_W}px`;
      element.style.maxWidth = `${A4_W}px`;
      element.style.backgroundColor = "#ffffff";

      // Set document/body to white so html2canvas canvas fill is clean
      savedBodyBg = document.body.style.backgroundColor;
      savedHtmlBg = document.documentElement.style.backgroundColor;
      document.body.style.backgroundColor = "#ffffff";
      document.documentElement.style.backgroundColor = "#ffffff";

      // Force white on child elements whose background comes from global/inherited CSS
      // (skip elements with explicit inline backgroundColor — those are intentional template colours)
      element.querySelectorAll<HTMLElement>("*").forEach((el) => {
        const bg = window.getComputedStyle(el).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "rgb(255, 255, 255)" && !el.style.backgroundColor) {
          savedChildBgs.set(el, "");
          el.style.backgroundColor = "#ffffff";
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfOpts: any = {
        margin: [10, 6, 10, 6],
        filename: `${name}-cv-zenzhire.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: {
          scale: 2.5,
          useCORS: true,
          letterRendering: true,
          backgroundColor: "#ffffff",
          windowWidth: A4_W,
          width: A4_W,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          onclone: (clonedDoc: Document) => {
            const preview = clonedDoc.getElementById("cv-preview");
            if (preview) {
              preview.style.width = `${A4_W}px`;
              preview.style.maxWidth = `${A4_W}px`;
              preview.style.backgroundColor = "#ffffff";
            }
          },
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
          avoid: [".cv-entry", ".cv-section"],
        },
      };

      await html2pdf().set(pdfOpts).from(element).save();
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      const element = document.getElementById("cv-preview");
      if (element) {
        element.style.width = "";
        element.style.maxWidth = "";
        element.style.backgroundColor = "";
        if (shadowRemoved) element.classList.add("shadow-2xl");
        savedChildBgs.forEach((_, el) => {
          el.style.backgroundColor = "";
        });
      }
      if (parent) {
        parent.style.transform = savedParentTransform;
        parent.style.marginBottom = savedParentMarginBottom;
      }
      document.body.style.backgroundColor = savedBodyBg;
      document.documentElement.style.backgroundColor = savedHtmlBg;
      setExporting(false);
    }
  };

  const renderTemplate = () => {
    const props = { sections: visibleSections };
    switch (cv.template_id) {
      case "modern":    return <ModernTemplate {...props} />;
      case "minimal":   return <MinimalTemplate {...props} />;
      case "executive": return <ExecutiveTemplate {...props} />;
      case "tech":      return <TechTemplate {...props} />;
      case "creative":  return <CreativeTemplate {...props} />;
      case "academic":  return <AcademicTemplate {...props} />;
      case "gcc":       return <GCCTemplate {...props} />;
      default:          return <ClassicTemplate {...props} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117] min-w-0">
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

      {/* Paper preview */}
      <div className="flex-1 overflow-auto">
        <div
          style={{
            minWidth: "fit-content",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 40px",
            minHeight: A4_H * scale + 96,
          }}
        >
          {/* Scaled wrapper with page break overlays */}
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              width: A4_W,
              marginBottom: `${A4_H * (scale - 1)}px`,
              position: "relative",
            }}
          >
            <div
              id="cv-preview"
              ref={previewRef}
              className="bg-white shadow-2xl"
              style={{ width: A4_W, minHeight: A4_H, fontFamily: "Arial, sans-serif" }}
            >
              {renderTemplate()}
            </div>

            {/* Page break indicators */}
            {Array.from({ length: pageCount - 1 }, (_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: A4_H * (i + 1),
                  left: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                <div style={{ position: "absolute", left: 0, right: 0, borderTop: "2px dashed rgba(96,165,250,0.5)" }} />
                <span
                  style={{
                    position: "relative",
                    background: "#0d1117",
                    color: "#60a5fa",
                    fontSize: 10,
                    padding: "1px 8px",
                    borderRadius: 4,
                    whiteSpace: "nowrap",
                    border: "1px solid rgba(96,165,250,0.3)",
                  }}
                >
                  Page {i + 2}
                </span>
              </div>
            ))}
          </div>

          {/* Page count + warnings */}
          <div
            className="flex flex-col items-center gap-2"
            style={{ marginTop: scale < 1 ? `${A4_H * (1 - scale) + 16}px` : "16px" }}
          >
            <span className="text-[#8b949e] text-xs">
              {pageCount} page{pageCount > 1 ? "s" : ""}
            </span>
            {pageCount === 3 && (
              <div className="flex items-center gap-1.5 text-yellow-400 text-xs bg-yellow-400/10 border border-yellow-400/20 rounded-md px-3 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                CV exceeds 2 pages — consider condensing content
              </div>
            )}
            {pageCount > 3 && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-md px-3 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                CV is {pageCount} pages — significantly over the recommended limit
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
