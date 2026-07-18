import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  LayoutTemplate,
  Target,
  Sparkles,
  FileText,
  Quote,
  Building2,
  Eye,
  Compass,
  Briefcase,
  ShieldCheck,
  Brain,
  Globe,
  TrendingUp,
  Award,
  Linkedin,
  Facebook,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { WhatsAppIcon } from "@/components/marketing/WhatsAppIcon";

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

const VALUES = [
  {
    icon: Briefcase,
    title: "Career First",
    description: "Every decision should improve the user's career, not just their CV.",
  },
  {
    icon: ShieldCheck,
    title: "Trust",
    description: "Always provide honest, reliable, and transparent guidance.",
  },
  {
    icon: Brain,
    title: "Intelligence",
    description: "Use AI to simplify complex career decisions while keeping people in control.",
  },
  {
    icon: Globe,
    title: "Inclusivity",
    description: "Support every profession, every experience level, and every country.",
  },
  {
    icon: TrendingUp,
    title: "Growth",
    description: "Help users continuously improve, not just complete a document.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Deliver premium quality in every interaction.",
  },
];

const COMPANY_LINKS = [
  { icon: Globe, label: "Website", href: "https://zenzhire.com" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: WhatsAppIcon, label: "WhatsApp", href: "#" },
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
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-14 md:pt-24 md:pb-16 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-6 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-5">
              About Us
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#c9d1d9] leading-[1.25] tracking-tight mb-6">
              Built by people who&apos;ve been on both sides of hiring.
            </h2>
            <p className="text-lg text-[#8b949e] leading-relaxed max-w-xl mx-auto lg:mx-0">
              ZenzHire is an AI-powered Career Intelligence Platform that helps students
              and professionals create outstanding CVs, optimize them for ATS, generate
              cover letters, and receive personalized career guidance through an
              intelligent Career Mentor.
            </p>
          </div>

          {/* Zeni: mascot visual, mirrors the soft blue glow treatment used elsewhere on this page */}
          <div className="relative mx-auto lg:mx-0 w-[220px] sm:w-[260px] lg:w-[300px]">
            <div
              className="pointer-events-none absolute inset-0 scale-125 rounded-full opacity-40"
              style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(50px)" }}
            />
            <Image
              src="/zeniai.png"
              alt="Zeni, the ZenzHire mascot"
              width={587}
              height={949}
              className="relative w-full h-auto drop-shadow-[0_20px_45px_rgba(37,99,235,0.35)]"
              priority
            />
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="border-t border-[#30363d] bg-[#0a0e14]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">Vision</h3>
              <p className="text-[#8b949e] leading-relaxed">
                To become the world&apos;s most trusted Career Intelligence Platform,
                helping millions of people discover opportunities, build exceptional
                careers, and achieve professional success through artificial
                intelligence.
              </p>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-5">
                <Compass className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">Mission</h3>
              <p className="text-[#8b949e] leading-relaxed">
                Empower every professional to build a stronger career through
                intelligent guidance, professional documents, and AI-powered career
                development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div
          className="pointer-events-none absolute top-4 right-6 hidden lg:block w-20 opacity-90"
          aria-hidden="true"
        >
          <div
            className="pointer-events-none absolute inset-0 scale-150 rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(30px)" }}
          />
          <Image
            src="/zeniai.png"
            alt=""
            width={587}
            height={949}
            className="relative w-full h-auto drop-shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
          />
        </div>
        <h2 className="text-3xl font-bold text-white text-center mb-3">What we value</h2>
        <p className="text-[#8b949e] text-center mb-12 max-w-lg mx-auto">
          The principles behind every feature we ship.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-blue-600/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
                <v.icon className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">{v.title}</h3>
              <p className="text-[#8b949e] text-sm leading-relaxed">{v.description}</p>
            </div>
          ))}
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
            <p className="text-[#8b949e] leading-relaxed mb-6">
              ZenzHire is built and operated by Centival Software Solutions, a
              software development company focused on building products that solve
              real problems.
            </p>
            <div className="flex items-center justify-center gap-3">
              {COMPANY_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  aria-label={l.label}
                  className="group w-9 h-9 rounded-full bg-[#0d1117] border border-[#30363d] hover:border-blue-500/60 flex items-center justify-center transition-colors"
                >
                  <l.icon className="w-4 h-4 text-[#8b949e] group-hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
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
