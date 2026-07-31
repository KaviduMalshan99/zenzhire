import type { Metadata } from "next";
import { SITE_URL } from "@/lib/share-links";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker — Get an Honest CV Score | ZenzHire",
  description:
    "Scan your CV with a free ATS resume checker that gives a real, computed score across 7 layers — no inflated numbers. 5 free checks, unlimited on Pro.",
  alternates: {
    canonical: `${SITE_URL}/features/ats-checker`,
  },
  openGraph: {
    title: "Free ATS Resume Checker — Get an Honest CV Score | ZenzHire",
    description:
      "Scan your CV with a free ATS resume checker that gives a real, computed score across 7 layers — no inflated numbers. 5 free checks, unlimited on Pro.",
    url: `${SITE_URL}/features/ats-checker`,
    siteName: "ZenzHire",
    type: "website",
  },
};

export default function ATSCheckerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
