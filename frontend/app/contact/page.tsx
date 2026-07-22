"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MessageCircle,
  Phone,
  Send,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { contactApi } from "@/lib/api";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SOCIAL_LINKS } from "@/lib/social-links";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Telegram has no profile-link env var (not part of the centralized social
// set) so it stays as a static placeholder alongside the dynamic ones.
const SOCIALS = [...SOCIAL_LINKS, { icon: Send, label: "Telegram", href: "#" }];

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!message.trim()) next.message = "Message is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    try {
      await contactApi.submit({ name: name.trim(), email: email.trim(), message: message.trim() });
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setErrors({});
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong sending your message. Please try again.");
    }
  };

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
        <div className="relative max-w-2xl mx-auto px-6 pt-16 pb-14 md:pt-24 md:pb-16 text-center">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-2xl bg-blue-600/10 border border-blue-600/20 mb-6">
            <MessageCircle className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex items-center w-fit mx-auto bg-blue-600/10 border border-blue-600/20 text-blue-400 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full mb-6">
            Get In Touch
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-6">
            Contact Us
          </h1>
          <p className="text-lg text-[#8b949e] leading-relaxed">
            Questions, feedback, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Form + contact info */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
          {/* Form */}
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-8">
            {status === "success" ? (
              <div className="flex flex-col items-center text-center py-10">
                <div className="w-12 h-12 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-white font-semibold text-lg mb-2">Message sent</h2>
                <p className="text-[#8b949e] text-sm">
                  Thanks — we&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-5">
                  <label htmlFor="name" className="block text-sm font-medium text-[#c9d1d9] mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-md px-4 py-2.5 text-white text-sm placeholder:text-[#484f58] outline-none transition-colors"
                    placeholder="Your name"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block text-sm font-medium text-[#c9d1d9] mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-md px-4 py-2.5 text-white text-sm placeholder:text-[#484f58] outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-[#c9d1d9] mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-md px-4 py-2.5 text-white text-sm placeholder:text-[#484f58] outline-none transition-colors resize-none"
                    placeholder="How can we help?"
                  />
                  {errors.message && <p className="text-red-400 text-xs mt-1.5">{errors.message}</p>}
                </div>

                {status === "error" && (
                  <div className="flex items-start gap-2.5 bg-red-500/[0.06] border border-red-500/20 rounded-md px-4 py-3 mb-5">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-md transition-colors w-full sm:w-auto"
                >
                  {status === "submitting" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Direct contact info */}
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-8 flex flex-col gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Email us directly</h3>
              <a
                href="mailto:support@zenzhire.com"
                className="inline-flex items-center gap-3 text-[#c9d1d9] hover:text-blue-400 transition-colors text-sm"
              >
                <span className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-400" />
                </span>
                support@zenzhire.com
              </a>
              <a
                href="tel:+94787820078"
                className="inline-flex items-center gap-3 text-[#c9d1d9] hover:text-blue-400 transition-colors text-sm mt-4"
              >
                <span className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-blue-400" />
                </span>
                +94 78 782 0078
              </a>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Follow us</h3>
              <div className="flex items-center gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="group w-9 h-9 rounded-full bg-[#0d1117] border border-[#30363d] hover:border-blue-500/60 flex items-center justify-center transition-colors"
                  >
                    <s.icon className="w-4 h-4 text-[#8b949e] group-hover:text-blue-400 transition-colors" />
                  </a>
                ))}
              </div>
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
