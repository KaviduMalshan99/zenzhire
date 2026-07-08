import Link from "next/link";
import { ArrowRight, Handshake } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(37,99,235,0.20), transparent)",
          }}
        />
        <div className="relative max-w-2xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-600/20 mb-6">
            <Handshake className="w-7 h-7 text-blue-500" />
          </div>
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-6">
            Coming Soon
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-6">
            Partner Program
          </h1>
          <p className="text-lg text-[#8b949e] leading-relaxed mb-10">
            We&apos;re building a partner program for career coaches, universities,
            and communities who want to bring ZenzHire to the people they help.
            Details are coming soon — check back later.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#30363d] hover:border-blue-500/60 text-white px-8 py-3.5 rounded-md transition-colors font-medium"
          >
            Get notified <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
