"use client";

import { useRef, useState, useEffect } from "react";
import { ZoomIn, ZoomOut, Download, AlertTriangle, Loader2, Target } from "lucide-react";
import type { CVDocument, CVSection, CVCustomization } from "@/types";
import { DEFAULT_CUSTOMIZATION } from "@/types";
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
  customization: CVCustomization;
  onZoomChange: (z: 75 | 100 | 125) => void;
  onSendToATS?: () => void;
}

const A4_W = 794;
const A4_H = 1123;
const PAGE_GAP = 20;

// Returns the template-space Y coordinate where each page begins.
// Uses .cv-section elements for section-aware breaks (works for all templates).
function calcPageStarts(el: HTMLElement): number[] {
  const sections = Array.from(el.querySelectorAll<HTMLElement>(".cv-section"));
  if (!sections.length) return [0];

  const baseTop = el.getBoundingClientRect().top;
  const starts: number[] = [0];
  let pageBottom = A4_H;

  for (const sec of sections) {
    const rect = sec.getBoundingClientRect();
    const secTop = rect.top - baseTop;
    const secBottom = rect.bottom - baseTop;
    if (secBottom > pageBottom && secTop > starts[starts.length - 1] + 20) {
      starts.push(secTop);
      pageBottom = secTop + A4_H;
    }
  }
  return starts;
}

export function CentrePanel({ cv, sections, zoom, customization, onZoomChange, onSendToATS }: Props) {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [pageStartY, setPageStartY] = useState<number[]>([0]);

  const visibleSections = sections.filter((s) => s.is_visible);
  const isTech = cv.template_id === "tech";
  const isCreative = cv.template_id === "creative";
  const isModern = cv.template_id === "modern";
  const scale = zoom / 100;

  // Recalculate page break positions whenever the hidden div resizes
  useEffect(() => {
    const el = hiddenRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (hiddenRef.current) setPageStartY(calcPageStarts(hiddenRef.current));
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
      default:          return <ClassicTemplate {...props} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117] min-w-0 relative">
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
              ...(isCreative ? { borderLeft: `5px solid ${customization.accentColor}` } : {}),
              ...(isModern ? { background: `linear-gradient(to right, ${customization.accentColor} 35%, transparent 35%)` } : {}),
            }}
          >
            {Array.from({ length: pageCount }, (_, i) => (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                {/* White A4 page card */}
                <div
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
                    {renderTemplate()}
                  </div>

                  {/* Top mask for pages 2+: covers the 40px of previous-section content
                      that shifts into view due to the +40 offset, leaving blank top padding */}
                  {i > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 40,
                        backgroundColor: "#ffffff",
                        zIndex: 2,
                      }}
                    />
                  )}

                  {/* Bottom mask: hides content belonging to the next page.
                      Formula differs for page 1 (top=0) vs pages 2+ (top=40-pageStartY[i]). */}
                  {i < pageCount - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        top: i === 0
                          ? pageStartY[i + 1]
                          : 40 + pageStartY[i + 1] - pageStartY[i],
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 2,
                      }}
                    />
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
    </div>
  );
}
