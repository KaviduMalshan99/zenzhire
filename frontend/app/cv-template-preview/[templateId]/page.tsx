"use client";

import { useSearchParams } from "next/navigation";
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
import { DEFAULT_CUSTOMIZATION, TEMPLATE_DEFAULT_CUSTOMIZATION } from "@/types";
import type { CVCustomization } from "@/types";
import { SAMPLE_CV_DATA } from "@/lib/sample-cv-data";


export default function TemplatePreviewPage({
  params,
}: {
  params: { templateId: string };
}) {
  const { templateId } = params;
  const searchParams = useSearchParams();
  const accentColorOverride = searchParams.get("accentColor");
  const photoSizeOverride = searchParams.get("photoSize");

  const templateDefaults = TEMPLATE_DEFAULT_CUSTOMIZATION[templateId] ?? {};
  const customization: CVCustomization = {
    ...DEFAULT_CUSTOMIZATION,
    ...templateDefaults,
    ...(accentColorOverride ? { accentColor: accentColorOverride } : {}),
    spacing: "normal",
    skillStyle: "classic",
    skillColumns: 2,
  };

  const sections = photoSizeOverride
    ? SAMPLE_CV_DATA.map((section) =>
        section.section_type === "personal_details"
          ? { ...section, data: { ...section.data, photo_size: Number(photoSizeOverride) } }
          : section
      )
    : SAMPLE_CV_DATA;

  const props = { sections, customization };

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
}
