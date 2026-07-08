import Link from "next/link";
import { ArrowRight, LayoutTemplate, Target, Sparkles, FileText, Quote, Building2 } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

const WHAT_WE_BUILT = [
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

export default function AboutPage() {
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
        <div
          className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-14 md:pt-24 md:pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-6">
            Built by people who&apos;ve been on both sides of hiring.
          </h1>
          <p className="text-lg text-[#8b949e] leading-relaxed">
            ZenzHire is built by Centival Software Solutions, a software development
            company focused on building products that solve real problems — starting
            with one of the most frustrating parts of job hunting: not knowing if your
            CV even gets seen.
          </p>
        </div>
      </section>

      {/* Mission / story */}
      <section className="border-y border-[#30363d] bg-[#0a0e14]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-[220px_1fr] gap-8 md:gap-14 items-start">
            <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-5 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center flex-shrink-0">
                <Quote className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                Why ZenzHire exists
              </h2>
            </div>
            <div className="space-y-4 text-center md:text-left">
              <p className="text-[#c9d1d9] text-lg leading-relaxed">
                Most CV tools show you a high score to keep you happy. We built
                ZenzHire to do the opposite — give real, honest feedback backed by
                actual computation, not guesses designed to make you feel good.
              </p>
              <p className="text-[#8b949e] leading-relaxed">
                A CV that scores 95% but gets rejected helps no one. We&apos;d rather
                tell you what&apos;s actually wrong and how to fix it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What we built */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-3">What we built</h2>
        <p className="text-[#8b949e] text-center mb-12 max-w-lg mx-auto">
          One platform, from first draft to final download.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHAT_WE_BUILT.map((f) => (
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

      {/* Company */}
      <section className="border-t border-[#30363d] bg-[#0a0e14]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto rounded-2xl border border-blue-500/20 bg-[#161b22] p-8 sm:p-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 mb-5">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Built by Centival Software Solutions
            </h2>
            <p className="text-[#8b949e] leading-relaxed">
              ZenzHire is built and operated by Centival Software Solutions, a
              software development company.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
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
