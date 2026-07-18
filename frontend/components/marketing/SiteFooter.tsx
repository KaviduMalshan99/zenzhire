import Link from "next/link";
import Image from "next/image";
import { Twitter, Linkedin, Instagram, Facebook, Send } from "lucide-react";
import { TikTokIcon } from "./TikTokIcon";
import { WhatsAppIcon } from "./WhatsAppIcon";

const SITE_URL = "https://zenzhire.com";
const SHARE_MESSAGE = "Check out ZenzHire — build a CV that actually gets you hired.";

const SHARE_LINKS = [
  {
    icon: Twitter,
    label: "Share on Twitter / X",
    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_MESSAGE)}&url=${encodeURIComponent(SITE_URL)}`,
  },
  {
    icon: Facebook,
    label: "Share on Facebook",
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`,
  },
  {
    icon: Linkedin,
    label: "Share on LinkedIn",
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`,
  },
  {
    icon: WhatsAppIcon,
    label: "Share on WhatsApp",
    href: `https://wa.me/?text=${encodeURIComponent(`${SHARE_MESSAGE} ${SITE_URL}`)}`,
  },
];

const FOLLOW_LINKS = [
  { icon: Twitter, label: "Twitter / X", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Send, label: "Telegram", href: "#" },
  { icon: TikTokIcon, label: "TikTok", href: "#" },
];

const PRODUCT_LINKS = [
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/pricing" },
  { label: "ATS Checker", href: "/features/ats-checker" },
  { label: "Cover Letters", href: "/signup" },
  { label: "Career Tips", href: "/career-tips" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Partner Program", href: "/partners" },
  { label: "Reviews", href: "/reviews" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wide mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-[#c9d1d9] hover:text-white text-sm transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#30363d] bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-10 pb-12 border-b border-[#30363d]">
          <div className="sm:col-span-2 md:col-span-2 pr-4">
            <Link href="/" className="inline-flex items-center mb-4">
              <Image src="/logo.png" alt="ZenzHire" width={150} height={34} className="h-7 w-auto" />
            </Link>
            <p className="text-[#8b949e] text-sm leading-relaxed max-w-xs">
              AI-powered career intelligence — build a CV that actually gets you hired.
            </p>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        {/* Share + Follow */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-10 border-b border-[#30363d]">
          <div>
            <h3 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wide mb-4">
              Share ZenzHire
            </h3>
            <div className="flex items-center gap-3">
              {SHARE_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="group w-9 h-9 rounded-full bg-[#161b22] border border-[#30363d] hover:border-blue-500/60 flex items-center justify-center transition-colors"
                >
                  <s.icon className="w-4 h-4 text-[#8b949e] group-hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wide mb-4">
              Follow us
            </h3>
            <div className="flex items-center gap-3">
              {FOLLOW_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="group w-9 h-9 rounded-full bg-[#161b22] border border-[#30363d] hover:border-blue-500/60 flex items-center justify-center transition-colors"
                >
                  <s.icon className="w-4 h-4 text-[#8b949e] group-hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-[#484f58] text-sm text-center sm:text-left">
            © 2026 Centival Software Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-[#8b949e]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
