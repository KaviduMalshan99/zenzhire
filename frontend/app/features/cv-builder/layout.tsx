import type { Metadata } from "next";
import { SITE_URL } from "@/lib/share-links";

export const metadata: Metadata = {
  title: "Free AI CV Builder Online — Professional CV Maker | ZenzHire",
  description:
    "Build a professional CV online free with ZenzHire's AI CV builder. 14 templates (5 free), an AI writing assistant, matching cover letters, and unlimited PDF downloads.",
  alternates: {
    canonical: `${SITE_URL}/features/cv-builder`,
  },
  openGraph: {
    title: "Free AI CV Builder Online — Professional CV Maker | ZenzHire",
    description:
      "Build a professional CV online free with ZenzHire's AI CV builder. 14 templates (5 free), an AI writing assistant, matching cover letters, and unlimited PDF downloads.",
    url: `${SITE_URL}/features/cv-builder`,
    siteName: "ZenzHire",
    type: "website",
  },
};

export default function CVBuilderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
