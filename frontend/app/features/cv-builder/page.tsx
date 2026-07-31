import Link from "next/link";
import {
  ArrowRight,
  LayoutTemplate,
  Sparkles,
  FileText,
  Download,
  Target,
  Globe,
  Check,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

const STEPS = [
  {
    icon: LayoutTemplate,
    title: "Pick a template",
    description: "Choose from 14 professional CV templates — 5 are free, no credit card required.",
  },
  {
    icon: Sparkles,
    title: "Write with Zeni AI",
    description:
      "Get AI help with bullet points, summaries, and grammar as you go. Free plan includes 3 AI assists a day.",
  },
  {
    icon: Download,
    title: "Check, download, apply",
    description:
      "Run your CV through the ATS Checker, fix what matters, then download an unlimited number of PDFs — free or Pro.",
  },
];

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: "14 professional CV templates",
    description: "5 free templates and 9 Pro designs, covering simple, modern, creative, and professional styles.",
  },
  {
    icon: Sparkles,
    title: "Zeni AI writing assistant",
    description: "AI-generated summaries, improved bullet points, and grammar fixes. 3 free uses a day, unlimited on Pro.",
  },
  {
    icon: FileText,
    title: "Matching cover letters",
    description: "Generate a cover letter that's automatically styled to match your CV template.",
  },
  {
    icon: Target,
    title: "Built-in ATS compatibility",
    description: "Every template is built to parse cleanly — pair it with our free ATS Checker to confirm your real score.",
  },
  {
    icon: Download,
    title: "Unlimited PDF downloads",
    description: "Download your CV as many times as you need, on every plan, free included.",
  },
  {
    icon: Globe,
    title: "Built for Sri Lankan and international roles",
    description: "Use it as a CV builder in Sri Lanka or abroad — including a template designed for GCC and Middle East applications.",
  },
];

const FAQS = [
  {
    q: "Is the ZenzHire CV builder really free?",
    a: "Yes. You can sign up free, build 1 CV with 5 free templates, and download unlimited PDFs at no cost. Upgrade to Pro (Rs. 3,500/month or Rs. 30,000/year) for all 14 templates, unlimited CVs, and unlimited AI help — or try the 7-Day Pro Pass for Rs. 1000.",
  },
  {
    q: "How does the AI CV builder work?",
    a: "Zeni, our AI assistant, helps you write and improve your CV as you build it — generating summaries, sharpening bullet points, and fixing grammar. The free plan includes 3 AI assists per day; Pro plans get unlimited AI help.",
  },
  {
    q: "Are ZenzHire's CV templates ATS-friendly?",
    a: "Yes, every template is built with clean, parseable formatting. To see exactly how your finished CV scores, run it through our free ATS Checker for a real, computed score and specific fixes.",
  },
  {
    q: "Can I use this CV builder for jobs outside Sri Lanka?",
    a: "Yes. ZenzHire is used for both local and international applications, including a template designed specifically for Gulf and Middle East (GCC) job applications.",
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

export default function CVBuilderFeaturePage() {
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
            <Sparkles className="w-3.5 h-3.5" />
            AI CV Builder
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Free AI CV Builder — Create a Professional CV Online
          </h1>
          <p className="text-lg text-[#8b949e] max-w-2xl mx-auto mb-9 leading-relaxed">
            ZenzHire is a free CV builder that pairs professional CV templates with an AI writing
            assistant, so you can create a curriculum vitae online in minutes — not hours. Whether
            you&apos;re applying in Sri Lanka or abroad, build a professional CV maker output that
            reads well and holds up against applicant tracking systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              Browse All 14 Templates
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#0a0e14] border-y border-[#30363d]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-3">How the CV builder works</h2>
          <p className="text-[#8b949e] text-center mb-16 max-w-lg mx-auto">
            Three steps from blank page to a finished, downloadable CV.
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

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-3">
          Everything a modern CV builder should have
        </h2>
        <p className="text-[#8b949e] text-center mb-12 max-w-lg mx-auto">
          Built as a professional CV maker for real job applications, not just a template gallery.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
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

      {/* Cross-link: ATS Checker */}
      <section className="border-y border-[#30363d] bg-[#0a0e14]">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-6">
            <Target className="w-3.5 h-3.5" />
            Free ATS Resume Checker
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Already have a CV? Check its real ATS score for free.
          </h2>
          <p className="text-[#8b949e] mb-8 max-w-xl mx-auto leading-relaxed">
            Whether you built it here or somewhere else, run your CV through our honest ATS resume
            checker to see exactly how it scores — no inflated numbers, just a real, computed result.
          </p>
          <Link
            href="/features/ats-checker"
            className="inline-flex items-center gap-2 border border-[#30363d] hover:border-blue-500/60 text-white px-8 py-3.5 rounded-md transition-colors font-medium"
          >
            Try the free ATS resume checker <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          CV builder — frequently asked questions
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
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-[#161b22] to-[#0d1117] px-6 py-16 text-center">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)", filter: "blur(70px)" }}
          />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-6">
            Build your free CV in minutes
          </h2>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-md transition-colors"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center gap-2 border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] px-10 py-4 rounded-md transition-colors"
            >
              <Check className="w-4 h-4" /> See all templates
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
