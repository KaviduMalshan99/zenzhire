import { AlertTriangle } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By accessing or using ZenzHire, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the service.",
    ],
  },
  {
    title: "2. Description of Service",
    body: [
      "ZenzHire is a CV-building platform that provides templates, an AI writing assistant, ATS compatibility scoring, and cover letter generation. Features available to you may depend on whether you are on a Free or Pro plan.",
    ],
  },
  {
    title: "3. Accounts",
    body: [
      "You must provide accurate information when creating an account and are responsible for maintaining the confidentiality of your login credentials. You are responsible for all activity that occurs under your account.",
    ],
  },
  {
    title: "4. Your Content",
    body: [
      "You retain ownership of the CVs, cover letters, and other content you create or upload to ZenzHire. By using the service, you grant us a limited license to store, process, and display that content solely for the purpose of providing the service to you (for example, rendering your CV or running ATS analysis).",
      "You are responsible for the accuracy of the information in your CVs and cover letters — ZenzHire's AI suggestions and ATS scores are tools to help you, not guarantees of employment outcomes.",
    ],
  },
  {
    title: "5. Subscriptions & Payments",
    body: [
      "Pro plans (Monthly, Yearly, or the 7-Day Pass) are billed as described at checkout. Subscriptions renew automatically unless cancelled before the renewal date. You can cancel at any time, and cancellation will take effect at the end of the current billing period. The 7-Day Pass is a one-time purchase and does not auto-renew.",
    ],
  },
  {
    title: "6. Acceptable Use",
    body: [
      "You agree not to misuse the service — including attempting to bypass usage limits, uploading malicious files, scraping or reverse-engineering the platform, or using ZenzHire to create fraudulent or misleading documents.",
    ],
  },
  {
    title: "7. Termination",
    body: [
      "You may stop using ZenzHire and delete your account at any time. We may suspend or terminate your access if you violate these Terms, misuse the service, or if required by law.",
    ],
  },
  {
    title: "8. Disclaimers",
    body: [
      "ZenzHire is provided \"as is\" without warranties of any kind. We do not guarantee that using our service will result in job offers, interviews, or any specific employment outcome. ATS scores and AI-generated suggestions are estimates based on automated analysis and may not reflect how every employer or applicant tracking system will evaluate your CV.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, ZenzHire and Centival Software Solutions shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service, including lost job opportunities or lost income.",
    ],
  },
  {
    title: "10. Changes to These Terms",
    body: [
      "We may update these Terms from time to time. Continued use of ZenzHire after changes take effect constitutes acceptance of the updated Terms.",
    ],
  },
  {
    title: "11. Contact Us",
    body: [
      "If you have questions about these Terms, contact us at support@zenzhire.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <SiteHeader />

      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Terms of Service</h1>
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
