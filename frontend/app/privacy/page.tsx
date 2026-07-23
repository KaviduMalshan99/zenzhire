import { AlertTriangle } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: [
      "When you use ZenzHire, we collect information you provide directly, including your name, email address, password, and the content of any CVs, cover letters, or job-related documents you create or upload — this may include your work history, education, contact details, and other personal information you choose to include in your CV.",
      "We also automatically collect limited technical information such as your IP address, browser type, device information, and usage data (pages visited, features used) to help us operate and improve the service.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "We use your information to provide and maintain the service (building, storing, and exporting your CVs and cover letters), to run our AI-powered features (writing suggestions, ATS scoring), to communicate with you about your account, and to improve and secure our platform.",
      "We do not sell your personal data or CV content to third parties.",
    ],
  },
  {
    title: "3. Cookies & Tracking",
    body: [
      "We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the site is used. You can control cookies through your browser settings, though disabling them may affect core functionality like staying logged in.",
    ],
  },
  {
    title: "4. Data Sharing",
    body: [
      "We may share data with service providers who help us operate ZenzHire (such as hosting, analytics, and AI processing providers), under agreements that require them to protect your data. We may also disclose information if required by law or to protect the rights, property, or safety of ZenzHire, our users, or others.",
    ],
  },
  {
    title: "5. Data Retention",
    body: [
      "We retain your account data and CV content for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within a reasonable period, except where we are required to retain it for legal or security reasons.",
    ],
  },
  {
    title: "6. Your Rights",
    body: [
      "Depending on where you live, you may have rights to access, correct, export, or delete your personal data, and to object to or restrict certain processing. You can manage most of this directly from your account settings, or contact us to make a request.",
    ],
  },
  {
    title: "7. Account Termination",
    body: [
      "You may delete your account at any time. We may suspend or terminate accounts that violate our Terms of Service, engage in abusive behavior, or pose a security risk to the platform or other users.",
    ],
  },
  {
    title: "8. Security",
    body: [
      "We use reasonable technical and organizational measures to protect your data, including encryption in transit and access controls. No system is completely secure, and we cannot guarantee absolute security of your information.",
    ],
  },
  {
    title: "9. Children's Privacy",
    body: [
      "ZenzHire is not directed at children under 16, and we do not knowingly collect personal information from children under 16.",
    ],
  },
  {
    title: "10. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. We will notify users of material changes by posting the updated policy on this page with a new effective date.",
    ],
  },
  {
    title: "11. Contact Us",
    body: [
      "If you have questions about this Privacy Policy or how we handle your data, contact us at support@zenzhire.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <SiteHeader />

      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="text-[#8b949e] text-sm mb-8">Last updated: July 8, 2026</p>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-white font-semibold text-lg mb-3">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-[#8b949e] leading-relaxed mb-3 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
