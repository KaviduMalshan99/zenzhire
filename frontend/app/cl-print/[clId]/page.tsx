"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CoverLetterPreview } from "@/app/(dashboard)/cover-letter/[id]/CoverLetterPreview";
import type { CoverLetter, CoverLetterCustomization, CLPersonalDetails } from "@/types";
import { DEFAULT_CL_CUSTOMIZATION } from "@/types";

const EMPTY_PERSONAL: CLPersonalDetails = {
  full_name: "", title: "", email: "", phone: "",
  location: "", linkedin: "", github: "", portfolio: "",
};

export default function CLPrintPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clId = params.clId as string;
  const token = searchParams.get("token");

  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [content, setContent] = useState("");
  const [templateId, setTemplateId] = useState("classic");
  const [customization, setCustomization] = useState<CoverLetterCustomization>(DEFAULT_CL_CUSTOMIZATION);
  const [personal, setPersonal] = useState<CLPersonalDetails>(EMPTY_PERSONAL);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
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
        const headers = { Authorization: `Bearer ${authToken}` };

        const clRes = await fetch(`${apiUrl}/api/v1/cover-letter/${clId}`, { headers });
        if (!clRes.ok) throw new Error(`HTTP ${clRes.status}`);
        const cl = await clRes.json();

        setLetter(cl);
        setContent(cl.content || "");
        setTemplateId(cl.template_id || "classic");
        setCustomization({
          ...DEFAULT_CL_CUSTOMIZATION,
          ...(cl.customization && Object.keys(cl.customization).length > 0 ? cl.customization : {}),
        });

        if (cl.cv_id) {
          const cvRes = await fetch(`${apiUrl}/api/v1/cv/${cl.cv_id}`, { headers });
          if (cvRes.ok) {
            const cv = await cvRes.json();
            const personalSection = (cv.sections || []).find(
              (s: any) => s.section_type === "personal_details"
            );
            if (personalSection) {
              const d = personalSection.data ?? {};
              const links: any[] = d.links ?? [];
              const linkedin = links.find((l: any) => l.platform?.toLowerCase().includes("linkedin"))?.url ?? "";
              const github = links.find((l: any) => l.platform?.toLowerCase().includes("github"))?.url ?? "";
              const portfolio = links.find((l: any) => !l.platform?.toLowerCase().includes("linkedin") && !l.platform?.toLowerCase().includes("github"))?.url ?? "";
              setPersonal({
                full_name: d.full_name ?? "",
                title: d.title ?? "",
                email: d.email ?? "",
                phone: d.phone ?? "",
                location: d.location ?? "",
                linkedin,
                github,
                portfolio,
                photo_base64: d.photo_base64,
                photo_url: d.photo_url,
              });
            }
          }
        }

        setReady(true);
      } catch (e) {
        setError(String(e));
      }
    }
    if (clId) load();
  }, [clId, token]);

  if (error) {
    return (
      <div style={{ color: "red", padding: 20, fontFamily: "Arial, sans-serif" }}>
        Error loading cover letter: {error}
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ padding: 20, color: "#111", fontFamily: "Arial, sans-serif" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0, backgroundColor: "white" }}>
      <CoverLetterPreview
        content={content}
        templateId={templateId}
        customization={customization}
        jobTitle={letter?.job_title ?? ""}
        company={letter?.company ?? ""}
        letter={letter}
        personal={personal}
      />
    </div>
  );
}
