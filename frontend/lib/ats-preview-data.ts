import { SAMPLE_CV_DATA } from "@/lib/sample-cv-data";

export function buildATSPreviewData(
  realName?: string,
  targetRole?: string,
  realEmail?: string,
  realPhone?: string,
  realLinkedin?: string,
) {
  // Deep clone so we never mutate the shared template gallery sample
  const cloned = JSON.parse(JSON.stringify(SAMPLE_CV_DATA));

  // Re-assign fresh sequential ids to avoid key/order collisions in templates
  cloned.forEach((section: { id: number }, i: number) => {
    section.id = i + 1;
  });

  const personalSection = cloned.find(
    (s: { section_type: string }) => s.section_type === "personal_details"
  );

  if (personalSection) {
    if (realName && realName.trim().length > 2) {
      personalSection.data.full_name = realName.trim();
    }
    if (targetRole && targetRole.trim()) {
      personalSection.data.title = targetRole.trim();
    }
    if (realEmail) {
      personalSection.data.email = realEmail;
    }
    if (realPhone) {
      personalSection.data.phone = realPhone;
    }
    if (realLinkedin && personalSection.data.links?.length) {
      const li = personalSection.data.links.find(
        (l: { platform: string }) => l.platform?.toLowerCase().includes("linkedin")
      );
      if (li) li.url = realLinkedin;
    }
  }

  return cloned;
}
