import Link from "next/link";
import { ArrowRight, Zap, Target, FileText, BarChart3, CheckCircle } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI CV Builder",
    description: "Create professional CVs with guided forms. Export as polished PDFs instantly.",
  },
  {
    icon: Target,
    title: "ATS Analyzer",
    description: "Upload your CV and get an ATS compatibility score with actionable feedback.",
  },
  {
    icon: Zap,
    title: "Keyword Matching",
    description: "Paste a job description and discover missing keywords that cost you interviews.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Track your CV score improvements over time across multiple applications.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["3 ATS checks per month", "1 CV builder save", "Basic feedback", "PDF export"],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    features: [
      "Unlimited ATS checks",
      "Unlimited CV saves",
      "Detailed AI feedback",
      "Keyword gap analysis",
      "Priority support",
    ],
    cta: "Start Pro",
    href: "/signup?plan=pro",
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Navbar */}
      <nav className="border-b border-[#30363d] sticky top-0 z-50 bg-[#0d1117]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-500 w-6 h-6" />
            <span className="text-xl font-bold text-white">ZenzHire</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[#8b949e] hover:text-white transition-colors text-sm">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-8">
          <Zap className="w-3.5 h-3.5" />
          AI-powered career intelligence
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          Land more interviews
          <br />
          <span className="text-blue-500">with smarter CVs</span>
        </h1>
        <p className="text-lg text-[#8b949e] max-w-2xl mx-auto mb-10">
          ZenzHire uses Claude AI to analyze your CV against job descriptions, score ATS compatibility,
          and give you the exact fixes that get you past the bots and in front of hiring managers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-md transition-colors"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] px-8 py-3.5 rounded-md transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Everything you need to get hired</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-blue-600/40 transition-colors">
              <f.icon className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-[#8b949e] text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-[#8b949e] text-center mb-12">Start free. Upgrade when you need more.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg p-8 border ${
                plan.highlighted
                  ? "bg-blue-600/10 border-blue-600 ring-1 ring-blue-600/30"
                  : "bg-[#161b22] border-[#30363d]"
              }`}
            >
              {plan.highlighted && (
                <div className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-4">Most Popular</div>
              )}
              <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-[#8b949e]">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-[#e6edf3]">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-md font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border border-[#30363d] hover:border-[#8b949e] text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-500 w-5 h-5" />
            <span className="text-white font-bold">ZenzHire</span>
          </div>
          <p className="text-[#8b949e] text-sm">© 2026 ZenzHire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
