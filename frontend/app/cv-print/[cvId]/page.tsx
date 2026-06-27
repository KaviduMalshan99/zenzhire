"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ClassicTemplate } from "@/components/cv-builder/templates/ClassicTemplate";
import { ModernTemplate } from "@/components/cv-builder/templates/ModernTemplate";
import { MinimalTemplate } from "@/components/cv-builder/templates/MinimalTemplate";
import { ExecutiveTemplate } from "@/components/cv-builder/templates/ExecutiveTemplate";
import { TechTemplate } from "@/components/cv-builder/templates/TechTemplate";
import { CreativeTemplate } from "@/components/cv-builder/templates/CreativeTemplate";
import { AcademicTemplate } from "@/components/cv-builder/templates/AcademicTemplate";
import { GCCTemplate } from "@/components/cv-builder/templates/GCCTemplate";
import type { CVSection, CVCustomization } from "@/types";
import { DEFAULT_CUSTOMIZATION } from "@/types";

export default function CVPrintPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const cvId = params.cvId as string;
  const token = searchParams.get("token");

  const [templateId, setTemplateId] = useState<string>("classic");
  const [sections, setSections] = useState<CVSection[]>([]);
  const [customization, setCustomization] = useState<CVCustomization>(DEFAULT_CUSTOMIZATION);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCV() {
      try {
        console.log("[cv-print] Loading CV:", cvId, "token present:", !!token);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/v1/cv/${cvId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("[cv-print] API response status:", res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("[cv-print] CV data:", { template_id: data.template_id, sections_count: (data.sections || []).length });
        setTemplateId(data.template_id || "classic");
        setSections((data.sections || []).filter((s: CVSection) => s.is_visible));
        if (data.customization) setCustomization(data.customization);
        setReady(true);
      } catch (e) {
        console.error("[cv-print] Error:", e);
        setError(String(e));
      }
    }
    if (cvId && token) loadCV();
    else console.warn("[cv-print] Missing cvId or token", { cvId, token: !!token });
  }, [cvId, token]);

  if (error) {
    return (
      <div id="cv-error" style={{ color: "red", padding: 20, fontFamily: "Arial, sans-serif" }}>
        Error loading CV: {error}
      </div>
    );
  }

  if (!ready) {
    return (
      <div id="cv-loading" style={{ padding: 20, color: "#111", fontFamily: "Arial, sans-serif" }}>
        Loading CV…
      </div>
    );
  }

  const props = { sections, customization };

  const renderTemplate = () => {
    switch (templateId) {
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
    <div style={{ margin: 0, padding: 0, backgroundColor: "white" }}>
      {/* Puppeteer polls for this element instead of document.title */}
      <div id="cv-ready-marker" style={{ display: "none" }} />

      {/* Fixed border overlay — renders on every PDF page in Puppeteer */}
      {templateId === "tech" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: `8px solid ${customization.accentColor}`,
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}

      {/* Fixed sidebar background — fills every PDF page for modern template */}
      {templateId === "modern" && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            width: "35%",
            backgroundColor: customization.accentColor,
            zIndex: 0,
            pointerEvents: "none",
            WebkitPrintColorAdjust: "exact",
          } as React.CSSProperties}
        />
      )}

      {renderTemplate()}
    </div>
  );
}
