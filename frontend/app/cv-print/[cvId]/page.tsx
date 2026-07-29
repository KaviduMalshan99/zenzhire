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
import { PortraitTemplate } from "@/components/cv-builder/templates/PortraitTemplate";
import { MilestoneTemplate } from "@/components/cv-builder/templates/MilestoneTemplate";
import { CorporateTemplate } from "@/components/cv-builder/templates/CorporateTemplate";
import { VegaTemplate } from "@/components/cv-builder/templates/VegaTemplate";
import { AuroraTemplate } from "@/components/cv-builder/templates/AuroraTemplate";
import { NovaTemplate } from "@/components/cv-builder/templates/NovaTemplate";
import type { CVSection, CVCustomization } from "@/types";
import { DEFAULT_CUSTOMIZATION, mergeCustomization } from "@/types";

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
      // Prefer query-param token (PDF generation), fall back to cookie (iframe preview)
      const authToken =
        token ||
        document.cookie
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("token="))
          ?.split("=")[1];

      if (!authToken) {
        setError("Not authenticated");
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/v1/cv/${cvId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const resolvedTemplateId = data.template_id || "classic";
        setTemplateId(resolvedTemplateId);
        setSections((data.sections || []).filter((s: CVSection) => s.is_visible));
        setCustomization(mergeCustomization(data.customization, resolvedTemplateId));
        // Exposes the resolved template to generate-pdf/route.ts's Puppeteer
        // script, which can't otherwise know which template loaded until
        // this fetch resolves client-side — lets it branch pagination logic
        // per template without changing what any template renders.
        (window as unknown as { __CV_TEMPLATE_ID__?: string }).__CV_TEMPLATE_ID__ = resolvedTemplateId;
        setReady(true);
      } catch (e) {
        setError(String(e));
      }
    }
    if (cvId) loadCV();
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
      case "portrait":  return <PortraitTemplate {...props} />;
      case "milestone":  return <MilestoneTemplate {...props} />;
      case "corporate":  return <CorporateTemplate {...props} />;
      case "vega":       return <VegaTemplate {...props} />;
      case "aurora":     return <AuroraTemplate {...props} />;
      case "nova":       return <NovaTemplate {...props} />;
      default:           return <ClassicTemplate {...props} />;
    }
  };

  return (
    <div style={{ margin: 0, padding: 0, backgroundColor: "white" }}>
      {/* Puppeteer polls for this element instead of document.title */}
      <div id="cv-ready-marker" style={{ display: "none" }} />

      {/* Modern's per-page sidebar color band and Tech's per-page border frame
          are now injected by generate-pdf/route.ts itself (one absolutely-
          positioned div per computed page, at exact PAGE_HEIGHT_A4 multiples)
          rather than drawn here as a single position:fixed div. That relied
          on Puppeteer's page.pdf() reliably repeating a fixed-position element
          on every physical page, which isn't guaranteed -- .modern-sidebar's
          own flexbox alignItems:stretch background and .tech-outer's own
          outline are enough for any non-paginated rendering of this page
          (e.g. the dashboard's iframe thumbnail). */}

      {renderTemplate()}
    </div>
  );
}
