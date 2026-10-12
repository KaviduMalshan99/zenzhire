import type { CVDocument, CVSection } from "@/types";

// The one CV PDF export, shared by the builder (CentrePanel) and the quick-start
// Ready screen. /api/generate-pdf records the pdf_downloaded event server-side,
// so every caller gets the same tracking.
export async function exportCvPdf(cv: Pick<CVDocument, "id" | "template_id">, sections: CVSection[]): Promise<void> {
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
}
