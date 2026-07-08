"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

type Billing = "monthly" | "yearly";

const FEATURES: Array<{
  label: string;
  free: string;
  pro: string;
  freeLocked?: boolean;
}> = [
  { label: "PDF Downloads", free: "Unlimited", pro: "Unlimited" },
  { label: "Templates", free: "4 free templates", pro: "All 13 templates" },
  { label: "AI Assistant", free: "5 uses/day", pro: "Unlimited" },
  { label: "ATS Checks", free: "5 total", pro: "Unlimited" },
  { label: "CV Score", free: "Basic score only", pro: "Full 8 sub-scores + history", freeLocked: true },
  { label: "Auto Fix", free: "Locked", pro: "Included", freeLocked: true },
  { label: "Cover Letters", free: "1", pro: "Unlimited" },
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes, Monthly and Yearly plans can be cancelled anytime, no long-term commitment.",
  },
  {
    q: "Does the 7-Day Pass auto-renew?",
    a: "No, it's a one-time purchase that expires automatically after 7 days. You will not be charged again.",
  },
  {
    q: "What happens to my CVs if I downgrade?",
    a: "Your CVs and data stay saved; Pro-only templates and features become locked again until you upgrade.",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("yearly");

  const proPrice = billing === "monthly" ? "$9.99" : "$6.67";
  const proPeriod = billing === "monthly" ? "/month" : "/month";

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <SiteHeader />

      {/* Page header */}
      <div className="px-6 pt-16 pb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Simple, honest pricing
        </h1>
        <p className="text-[#8b949e] text-sm max-w-lg mx-auto mb-8">
          Start free. Upgrade when you need more.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 bg-[#161b22] border border-[#30363d] rounded-full p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "px-5 py-1.5 rounded-full text-sm font-medium transition-all",
              billing === "monthly"
                ? "bg-blue-600 text-white"
                : "text-[#8b949e] hover:text-white"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={cn(
              "px-5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
              billing === "yearly"
                ? "bg-blue-600 text-white"
                : "text-[#8b949e] hover:text-white"
            )}
          >
            Yearly
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                billing === "yearly"
                  ? "bg-white/20 text-white"
                  : "bg-blue-600/15 text-blue-400"
              )}
            >
              Save 33%
            </span>
          </button>
        </div>
      </div>

      {/* Main comparison */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-8 flex flex-col">
            <h2 className="text-white font-semibold text-lg mb-1">Free</h2>
            <p className="text-[#8b949e] text-sm mb-6">Truly free forever</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-[#8b949e] text-sm">/month</span>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 border border-[#30363d] hover:border-[#8b949e] text-white font-medium px-6 py-3 rounded-md transition-colors mb-8"
            >
              Get Started Free
            </Link>
            <ul className="space-y-4">
              {FEATURES.map((f) => (
                <li key={f.label} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-[#8b949e]">{f.label}</span>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 font-medium text-right",
                      f.freeLocked ? "text-[#484f58]" : "text-[#c9d1d9]"
                    )}
                  >
                    {f.freeLocked && <Lock className="w-3.5 h-3.5" />}
                    {f.free}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border border-blue-500/40 bg-gradient-to-b from-blue-600/[0.08] to-[#161b22] p-8 flex flex-col">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              POPULAR
            </span>
            <h2 className="text-white font-semibold text-lg mb-1">Pro</h2>
            <p className="text-[#8b949e] text-sm mb-6">For serious job seekers</p>
            <div className="mb-1">
              <span className="text-4xl font-bold text-white">{proPrice}</span>
              <span className="text-[#8b949e] text-sm">{proPeriod}</span>
            </div>
            <p className="text-[#8b949e] text-xs mb-6 h-4">
              {billing === "yearly" ? "$79.99/year, billed yearly" : " "}
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md transition-colors mb-8"
            >
              Upgrade to Pro <ArrowRight className="w-4 h-4" />
            </Link>
            <ul className="space-y-4">
              {FEATURES.map((f) => (
                <li key={f.label} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-[#8b949e]">{f.label}</span>
                  <span className="flex items-center gap-1.5 font-medium text-white text-right">
                    <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    {f.pro}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 7-Day Pass callout */}
        <div className="mt-8 rounded-xl border border-[#30363d] bg-[#161b22]/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-center sm:text-left">
            <p className="text-[#8b949e] text-xs font-medium uppercase tracking-wide mb-1.5">
              Need it just for a week?
            </p>
            <h3 className="text-white font-semibold mb-1.5">
              7-Day Pro Pass — $2.99, one-time
            </h3>
            <p className="text-[#8b949e] text-sm">
              Full Pro access for 7 days. No subscription, no auto-renewal, expires
              automatically.
            </p>
          </div>
          <Link
            href="/signup"
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 border border-[#30363d] hover:border-blue-500/60 text-white font-medium px-6 py-3 rounded-md transition-colors whitespace-nowrap"
          >
            Get 7-Day Access
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="border-t border-[#30363d] bg-[#0a0e14]">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border-b border-[#30363d] pb-6 last:border-b-0">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-[#8b949e] text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-[#161b22] to-[#0d1117] px-6 py-16 text-center">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)", filter: "blur(70px)" }}
          />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to build a CV that works?
          </h2>
          <Link
            href="/signup"
            className="relative inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-md transition-colors"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
