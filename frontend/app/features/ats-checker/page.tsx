import Link from "next/link";
import {
  ArrowRight,
  Target,
  Shield,
  AlignLeft,
  Key,
  Sparkles,
  BookOpen,
  User,
  Brain,
  Check,
  X,
  ShieldCheck,
  LayoutTemplate,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

const STEPS = [
  {
    icon: Target,
    title: "Upload or paste your CV",
    description: "Upload a PDF or paste your CV text directly — no account setup needed to see how it works.",
  },
  {
    icon: Brain,
    title: "Real 7-layer analysis",
    description: "Every check actually runs and is computed from your CV's real content — nothing is guessed.",
  },
  {
    icon: ShieldCheck,
    title: "Get your honest score",
    description: "See your real ATS score plus specific, actionable fixes — not vague, generic advice.",
  },
];

const LAYERS = [
  { icon: Shield, label: "ATS Compatibility Check", description: "Formatting and structure that applicant tracking systems can actually parse." },
  { icon: AlignLeft, label: "Sections & Structure", description: "Checks your CV has the sections recruiters and ATS software expect to find." },
  { icon: Key, label: "Keyword & Skill Matching", description: "Compares your CV's keywords against your target role or job description." },
  { icon: Sparkles, label: "Content Quality Analysis", description: "Looks at how clearly your experience and achievements are written." },
  { icon: BookOpen, label: "Language & Grammar", description: "Flags grammar and language issues that hurt readability." },
  { icon: User, label: "Professional Data Check", description: "Confirms your contact details and core profile data are complete." },
  { icon: Brain, label: "AI Recruiter Simulation", description: "An AI pass that reads your CV the way a recruiter would." },
];

const TYPICAL_ATS_ITEMS = [
  "Always shows a high score to keep you happy",
  "Hides when a check fails to run",
  "Vague, generic suggestions",
];

const ZENZHIRE_ITEMS = [
  "Real computation — every score is calculated, never guessed",
  "If a check fails, we tell you — not a fake “all clear”",
  "Specific, actionable feedback tied to your actual CV",
];

const FAQS = [
  {
    q: "Is the ATS resume checker free?",
    a: "Yes. Every account gets 5 free ATS checks total (a lifetime limit, not per day). Pro plans (Rs. 3,500/month, Rs. 30,000/year, or the Rs. 1000 7-Day Pass) get unlimited checks.",
  },
  {
    q: "What is an ATS and why does my CV score matter?",
    a: "An ATS (Applicant Tracking System) is software many employers use to filter CVs before a human ever sees them. If your CV isn't formatted or written in a way the ATS can parse, it can be rejected automatically — regardless of how qualified you are.",
  },
  {
    q: "Is the score actually honest, or is it inflated like other checkers?",
    a: "It's a real, computed score across 7 analysis layers — ATS compatibility, structure, keyword matching, content quality, grammar, professional data, and an AI recruiter simulation. If a check can't run, we say so instead of hiding it behind a fake high score.",
  },
  {
    q: "Can I check a CV I didn't build with ZenzHire?",
    a: "Yes. Upload any CV as a PDF or paste its text in directly — you don't need to have built it with our CV builder to check its ATS score.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default function ATSCheckerFeaturePage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(37,99,235,0.20), transparent)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 md:pt-24 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs sm:text-sm px-4 py-1.5 rounded-full mb-7">
            <Target className="w-3.5 h-3.5" />
            Free ATS Resume Checker
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Free ATS Resume Checker — Get an Honest CV Score
          </h1>
          <p className="text-lg text-[#8b949e] max-w-2xl mx-auto mb-9 leading-relaxed">
            Run a free ATS check and CV score checker scan on your resume before you apply. ZenzHire's
            ATS-friendly CV analysis computes a real score from your actual CV — not a number designed
            to make you feel good.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-md transition-colors"
            >
              Check My CV Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/features/cv-builder"
              className="inline-flex items-center justify-center gap-2 border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] px-8 py-3.5 rounded-md transition-colors"
            >
              Build a CV First
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#0a0e14] border-y border-[#30363d]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-3">How the ATS checker works</h2>
          <p className="text-[#8b949e] text-center mb-16 max-w-lg mx-auto">
            A real resume scan, not a guess dressed up as a score.
          </p>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div
              className="hidden md:block absolute h-px bg-gradient-to-r from-blue-600/40 via-blue-600/40 to-blue-600/40"
              style={{ top: 32, left: "16.6667%", right: "16.6667%" }}
            />
            {STEPS.map((step) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div
                  className="relative z-10 w-16 h-16 rounded-full bg-[#161b22] border border-blue-600/40 flex items-center justify-center mb-5"
                  style={{ boxShadow: "0 0 0 6px #0a0e14" }}
                >
                  <step.icon className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-[#8b949e] text-sm leading-relaxed max-w-[240px]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 layers */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-3">
          What the 7-layer ATS analysis checks
        </h2>
        <p className="text-[#8b949e] text-center mb-12 max-w-lg mx-auto">
          Every layer actually runs against your CV — this is a real resume scan, not a single generic pass.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LAYERS.map((l) => (
            <div
              key={l.label}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-blue-600/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
                <l.icon className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">{l.label}</h3>
              <p className="text-[#8b949e] text-sm leading-relaxed">{l.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Honesty comparison */}
      <section className="border-y border-[#30363d] bg-[#0a0e14]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <ShieldCheck className="w-8 h-8 text-blue-500 mx-auto mb-5" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white max-w-2xl mx-auto">
              Most ATS checkers tell you what you want to hear. We don&apos;t.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-7">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-red-400 font-semibold text-sm uppercase tracking-wide">
                  Typical ATS Checkers
                </h3>
              </div>
              <ul className="space-y-4">
                {TYPICAL_ATS_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-red-400/80 flex-shrink-0 mt-0.5" />
                    <span className="text-[#8b949e] text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-600/[0.06] p-7">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-blue-400 font-semibold text-sm uppercase tracking-wide">ZenzHire</h3>
              </div>
              <ul className="space-y-4">
                {ZENZHIRE_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[#e6edf3] text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center text-[#8b949e] text-sm mt-8">
            Because a CV that scores 95% but gets rejected helps no one.
          </p>
        </div>
      </section>

      {/* Cross-link: CV Builder */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-6">
          <LayoutTemplate className="w-3.5 h-3.5" />
          Free AI CV Builder
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Need a CV before you check it?
        </h2>
        <p className="text-[#8b949e] mb-8 max-w-xl mx-auto leading-relaxed">
          Build a professional CV from scratch with our free AI CV builder — 14 templates, an AI
          writing assistant, and matching cover letters, all in one place.
        </p>
        <Link
          href="/features/cv-builder"
          className="inline-flex items-center gap-2 border border-[#30363d] hover:border-blue-500/60 text-white px-8 py-3.5 rounded-md transition-colors font-medium"
        >
          Explore the AI CV builder <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#30363d] bg-[#0a0e14]">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            ATS checker — frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group border border-[#30363d] rounded-lg bg-[#161b22] px-5 py-4 open:pb-4"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-white font-semibold text-sm sm:text-base">
                  {faq.q}
                  <span className="text-[#8b949e] text-lg leading-none group-open:rotate-45 transition-transform flex-shrink-0">
                    +
                  </span>
                </summary>
                <p className="text-[#8b949e] text-sm leading-relaxed mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-[#161b22] to-[#0d1117] px-6 py-16 text-center">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)", filter: "blur(70px)" }}
          />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-6">
            Get your honest ATS score in minutes
          </h2>
          <Link
            href="/signup"
            className="relative inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-md transition-colors"
          >
            Check My CV Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
