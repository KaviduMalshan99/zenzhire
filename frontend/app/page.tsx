import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  LayoutTemplate,
  Target,
  Sparkles,
  FileText,
  Check,
  X,
  Download,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { TemplateCarousel } from "@/components/marketing/TemplateCarousel";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

const VALUE_PROPS = [
  {
    icon: LayoutTemplate,
    title: "13 Professional Templates",
    description: "Free and Pro designs for every industry.",
  },
  {
    icon: Target,
    title: "Real ATS Scoring",
    description: "7-layer analysis, no inflated scores, no false promises.",
  },
  {
    icon: Sparkles,
    title: "AI Writing Assistant",
    description: "Improve bullets, fix grammar, generate summaries instantly.",
  },
  {
    icon: FileText,
    title: "Matching Cover Letters",
    description: "Auto-styled to match your CV.",
  },
];

const STEPS = [
  {
    icon: LayoutTemplate,
    title: "Choose a Template",
    description: "Pick from 13 professional designs, free or Pro.",
  },
  {
    icon: Sparkles,
    title: "Build with AI",
    description: "Get real-time writing help, smarter bullets, and instant improvements.",
  },
  {
    icon: Download,
    title: "Check & Download",
    description: "See your honest ATS score, fix what matters, download your PDF.",
  },
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

const ATS_INDICATORS = [
  { label: "Keyword Match", status: "pass" as const },
  { label: "Formatting", status: "pass" as const },
  { label: "Grammar", status: "warn" as const },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
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
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-20 grid lg:grid-cols-2 gap-14 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs sm:text-sm px-4 py-1.5 rounded-full mb-7">
              <Sparkles className="w-3.5 h-3.5" />
              AI-powered CV building &amp; honest ATS scoring
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-white leading-[1.1] tracking-tight mb-6">
              Build a CV that actually gets you{" "}
              <span className="text-blue-500">hired</span> — not just downloaded.
            </h1>
            <p className="text-lg text-[#8b949e] max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed">
              ZenzHire combines AI-powered CV building, honest ATS scoring, and smart
              cover letters — all in one platform built to get real results, not
              empty promises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-md transition-colors"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center justify-center gap-2 border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] px-8 py-3.5 rounded-md transition-colors"
              >
                See Templates
              </Link>
            </div>
          </div>

          {/* Visual: two live template preview mockups, stacked. Composed at a fixed 480x520 "design size"
              then scaled down as a single unit on narrow viewports (Tailwind's responsive scale utilities)
              so the whole composition shrinks together — the outer box's own width/height shrink to match,
              which is what actually prevents mobile overflow (transform alone doesn't affect layout size). */}
          <div className="relative mx-auto w-[270px] h-[293px] sm:w-[480px] sm:h-[520px]">
          <div className="absolute top-0 left-0 origin-top-left scale-[0.5625] sm:scale-100" style={{ width: 480, height: 520 }}>
            {/* Soft blue glow blobs — resume.io-style layered depth, on-brand blue only */}
            <div
              className="pointer-events-none absolute -top-16 -right-10 w-[520px] h-[520px] rounded-full opacity-50"
              style={{ background: "radial-gradient(circle, #3b82f6 0%, #2563eb 40%, transparent 72%)", filter: "blur(85px)" }}
            />
            <div
              className="pointer-events-none absolute -bottom-14 -left-10 w-[340px] h-[340px] rounded-full opacity-25"
              style={{ background: "radial-gradient(circle, #1d4ed8 0%, transparent 70%)", filter: "blur(70px)" }}
            />

            {/* Back mockup: Nova (single-column, blue accent) — dimmed + softer shadow so depth reads clearly behind the front card. Cropped to where content + footer bar actually end. Single rotate only, no skew. */}
            <div
              className="absolute"
              style={{ top: 16, left: 4, zIndex: 0, transform: "rotate(-5deg)" }}
            >
              <div
                className="rounded-xl border border-[#30363d] bg-[#161b22] p-3 opacity-75"
                style={{ boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)" }}
              >
                <div className="flex items-center gap-1.5 px-1 pb-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#30363d]" />
                  <span className="w-2 h-2 rounded-full bg-[#30363d]" />
                  <span className="w-2 h-2 rounded-full bg-[#30363d]" />
                </div>
                <div className="relative overflow-hidden rounded-lg bg-white" style={{ width: 258, height: 281 }}>
                  <iframe
                    src={`/cv-template-preview/nova?accentColor=${encodeURIComponent("#2563eb")}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "794px",
                      height: "1122px",
                      border: "none",
                      transformOrigin: "top left",
                      transform: `scale(${258 / 794})`,
                      pointerEvents: "none",
                    }}
                    tabIndex={-1}
                    title="Nova template preview"
                  />
                  {/* Subtle dim overlay so the eye is drawn to the front card as the main one */}
                  <div className="pointer-events-none absolute inset-0 bg-[#0d1117]/15" />
                </div>
              </div>
            </div>

            {/* Front mockup group: Aurora (sidebar layout, black accent) + its attached floating badges — kept perfectly upright as the clear "main" card */}
            <div className="absolute" style={{ top: 44, left: 128, zIndex: 10 }}>
              <div
                className="relative rounded-xl border border-[#30363d] bg-[#161b22] p-3.5"
                style={{ boxShadow: "0 30px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)" }}
              >
                <div className="flex items-center gap-1.5 px-1 pb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#30363d]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#30363d]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#30363d]" />
                </div>
                {/* Cropped to where Aurora's sidebar/main content actually ends — no dead white space */}
                <div className="relative overflow-hidden rounded-lg bg-white" style={{ width: 320, height: 306 }}>
                  <iframe
                    src={`/cv-template-preview/aurora?accentColor=${encodeURIComponent("#111827")}&photoSize=150`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "794px",
                      height: "1122px",
                      border: "none",
                      transformOrigin: "top left",
                      transform: `scale(${320 / 794})`,
                      pointerEvents: "none",
                    }}
                    tabIndex={-1}
                    title="Aurora template preview"
                  />
                </div>
              </div>

              {/* Floating: icon-only Grammarly-style circular badge — pinned deliberately to the front card's top-right corner */}
              <div
                className="absolute w-11 h-11 rounded-full bg-blue-600 items-center justify-center hidden sm:flex ring-4 ring-[#0d1117]"
                style={{ top: -20, right: -20, boxShadow: "0 8px 20px rgba(37,99,235,0.55)" }}
              >
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>

              {/* Floating: ATS score badge — anchored to the front card's bottom-left corner, clear of the card edge */}
              <div
                className="absolute bg-[#161b22] border border-blue-500/30 rounded-xl px-4 py-3 hidden sm:flex items-center gap-3"
                style={{
                  bottom: -28,
                  left: -32,
                  boxShadow: "0 0 0 1px rgba(37,99,235,0.15), 0 16px 32px rgba(0,0,0,0.5)",
                }}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/25 to-blue-600/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4.5 h-4.5 text-blue-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold leading-none">87 / 100</div>
                  <div className="text-[#8b949e] text-[11px] mt-1">ATS Score</div>
                </div>
              </div>

              {/* Floating: AI writing suggestion card — anchored to the front card's bottom-right corner, mirroring the ATS badge on the opposite side. Positioned below the card (not out to the side) so it stays within the composition's own bounds instead of depending on viewport width. */}
              <div
                className="absolute bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3.5 hidden lg:flex items-start gap-3 w-[205px]"
                style={{ bottom: -34, right: -28, boxShadow: "0 16px 32px rgba(0,0,0,0.5)" }}
              >
                <div className="w-6 h-6 rounded-full bg-blue-600/15 border border-blue-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-[12px] text-[#c9d1d9] leading-snug">
                  <span className="text-blue-400 font-medium">AI Suggestion:</span>{" "}
                  Add a measurable result to this bullet.
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Trust / honesty callout — two-column comparison */}
      <section className="border-y border-[#30363d] bg-[#0a0e14]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <ShieldCheck className="w-8 h-8 text-blue-500 mx-auto mb-5" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white max-w-2xl mx-auto">
              Most ATS checkers tell you what you want to hear. We don&apos;t.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Typical ATS checkers */}
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

            {/* ZenzHire */}
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

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Everything you need to get hired</h2>
        <p className="text-[#8b949e] text-center mb-12 max-w-lg mx-auto">
          One platform, from first draft to final download.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUE_PROPS.map((f) => (
            <div
              key={f.title}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-blue-600/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-[#8b949e] text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#0a0e14] border-y border-[#30363d]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-3">How it works</h2>
          <p className="text-[#8b949e] text-center mb-16 max-w-lg mx-auto">
            Three steps from blank page to a CV that works.
          </p>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Connecting line — desktop only, spans icon-center to icon-center */}
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
                <p className="text-[#8b949e] text-sm leading-relaxed max-w-[220px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template showcase */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Templates for every industry</h2>
            <p className="text-[#8b949e] max-w-lg">
              13 professionally designed layouts. Free and Pro, fully customizable.
            </p>
          </div>
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium text-sm whitespace-nowrap transition-colors"
          >
            Browse all 13 templates <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <TemplateCarousel />
      </section>

      {/* ATS teaser */}
      <section className="border-y border-[#30363d] bg-[#0a0e14]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-7">
                <Target className="w-3.5 h-3.5" />
                Real ATS Scoring
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Know exactly where your CV stands — no sugarcoating.
              </h2>
              <p className="text-[#8b949e] mb-9 leading-relaxed">
                A 7-layer analysis checks formatting, keyword match, structure, and more.
                You get a clear score and specific fixes, not a number designed to make
                you feel good and keep you coming back.
              </p>
              <Link
                href="/features/ats-checker"
                className="inline-flex items-center gap-2 border border-[#30363d] hover:border-blue-500/60 text-white px-8 py-3.5 rounded-md transition-colors font-medium"
              >
                Learn how ATS scoring works <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Visual: score gauge + indicator breakdown */}
            <div className="flex justify-center md:justify-end">
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 w-full max-w-sm">
                <div className="relative flex flex-col items-center mb-2">
                  <svg viewBox="0 0 200 108" className="w-full max-w-[220px]">
                    <path
                      d="M10 100 A90 90 0 0 1 190 100"
                      fill="none"
                      stroke="#30363d"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 100 A90 90 0 0 1 190 100"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray="282.7"
                      strokeDashoffset={282.7 * (1 - 72 / 100)}
                    />
                  </svg>
                  <div className="absolute bottom-0 text-center">
                    <div className="text-4xl font-bold text-white leading-none">
                      72<span className="text-lg text-[#8b949e] font-medium">/100</span>
                    </div>
                    <div className="text-[#8b949e] text-xs mt-1.5">ATS Score</div>
                  </div>
                </div>
                <div className="space-y-3 pt-5 border-t border-[#30363d]">
                  {ATS_INDICATORS.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-[#c9d1d9]">{item.label}</span>
                      {item.status === "pass" ? (
                        <span className="inline-flex items-center gap-1.5 text-blue-400 font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                          <AlertTriangle className="w-4 h-4" /> Review
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
