import { Twitter, Linkedin, Instagram, Facebook } from "lucide-react";
import type { ComponentType } from "react";
import { TikTokIcon } from "@/components/marketing/TikTokIcon";
import { WhatsAppIcon } from "@/components/marketing/WhatsAppIcon";

export interface SocialLink {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

// Single source of truth for the site's own social profile links. Set the
// NEXT_PUBLIC_*_URL vars in .env(.local) — any left empty are hidden rather
// than rendered as dead links.
const CANDIDATES: { icon: ComponentType<{ className?: string }>; label: string; href?: string }[] = [
  { icon: Facebook, label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL },
  { icon: Instagram, label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
  { icon: Linkedin, label: "LinkedIn", href: process.env.NEXT_PUBLIC_LINKEDIN_URL },
  { icon: TikTokIcon, label: "TikTok", href: process.env.NEXT_PUBLIC_TIKTOK_URL },
  { icon: Twitter, label: "Twitter / X", href: process.env.NEXT_PUBLIC_TWITTER_URL },
  { icon: WhatsAppIcon, label: "WhatsApp", href: process.env.NEXT_PUBLIC_WHATSAPP_URL },
];

export const SOCIAL_LINKS: SocialLink[] = CANDIDATES.filter(
  (l): l is SocialLink => !!l.href && l.href.trim().length > 0
);
