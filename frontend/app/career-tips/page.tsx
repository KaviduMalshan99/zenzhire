"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Lightbulb, ImageOff } from "lucide-react";
import { careerTipsApi } from "@/lib/api";
import type { CareerTip } from "@/types";
import { formatDate } from "@/lib/utils";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export default function CareerTipsPage() {
  const [tips, setTips] = useState<CareerTip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careerTipsApi
      .list()
      .then((res) => setTips(res.data))
      .finally(() => setLoading(false));
  }, []);

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
            <Lightbulb className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex items-center w-fit mx-auto bg-blue-600/10 border border-blue-600/20 text-blue-400 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full mb-6">
            Career Tips
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-6">
            Career Tips
          </h1>
          <p className="text-lg text-[#8b949e] leading-relaxed">
            Quick, practical advice to help you land the role — updated regularly by our team.
          </p>
        </div>
      </section>

      {/* Tips grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#30363d] bg-[#161b22] aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : tips.length === 0 ? (
          <div className="border border-dashed border-[#30363d] rounded-2xl p-16 text-center">
            <ImageOff className="w-8 h-8 text-[#484f58] mx-auto mb-3" />
            <p className="text-[#8b949e]">No career tips published yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="rounded-2xl border border-[#30363d] bg-[#161b22] overflow-hidden hover:border-blue-600/40 transition-colors"
              >
                <div className="relative w-full aspect-video bg-[#0d1117]">
                  <Image src={tip.image_url} alt={tip.caption} fill className="object-cover" unoptimized />
                </div>
                <div className="p-6">
                  <p className="text-[#c9d1d9] leading-relaxed">{tip.caption}</p>
                  <p className="text-[#484f58] text-xs mt-4">{formatDate(tip.published_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
