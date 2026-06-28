import { ClassicTemplate } from "@/components/cv-builder/templates/ClassicTemplate";
import { ModernTemplate } from "@/components/cv-builder/templates/ModernTemplate";
import { MinimalTemplate } from "@/components/cv-builder/templates/MinimalTemplate";
import { ExecutiveTemplate } from "@/components/cv-builder/templates/ExecutiveTemplate";
import { TechTemplate } from "@/components/cv-builder/templates/TechTemplate";
import { CreativeTemplate } from "@/components/cv-builder/templates/CreativeTemplate";
import { AcademicTemplate } from "@/components/cv-builder/templates/AcademicTemplate";
import { GCCTemplate } from "@/components/cv-builder/templates/GCCTemplate";
import { DEFAULT_CUSTOMIZATION, TEMPLATE_DEFAULT_CUSTOMIZATION } from "@/types";
import type { CVCustomization } from "@/types";
import { SAMPLE_CV_DATA } from "@/lib/sample-cv-data";


export default function TemplatePreviewPage({
  params,
}: {
  params: { templateId: string };
}) {
  const { templateId } = params;

  const templateDefaults = TEMPLATE_DEFAULT_CUSTOMIZATION[templateId] ?? {};
  const customization: CVCustomization = {
    ...DEFAULT_CUSTOMIZATION,
    ...templateDefaults,
    spacing: "normal",
    skillStyle: "classic",
    skillColumns: 2,
  };

  const props = { sections: SAMPLE_CV_DATA, customization };

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
}
