import { Twitter, Facebook, Linkedin , Instagram } from "lucide-react";
import type { ComponentType } from "react";
import { WhatsAppIcon } from "@/components/marketing/WhatsAppIcon";

export interface ShareLink {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

export const SITE_URL = "https://zenzhire.com";
export const SHARE_MESSAGE = "Check out ZenzHire — build a CV that actually gets you hired.";

// Share-intent URLs built from our own site URL — unlike SOCIAL_LINKS (our
// profile pages), these need no env vars since the target is always us.
export const SHARE_LINKS: ShareLink[] = [
  
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
  {
    icon: Twitter,
    label: "Share on Twitter / X",
    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_MESSAGE)}&url=${encodeURIComponent(SITE_URL)}`,
  },
];
