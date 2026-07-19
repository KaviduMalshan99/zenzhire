"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, ImageOff } from "lucide-react";
import { careerTipsApi } from "@/lib/api";
import type { CareerTip } from "@/types";
import { formatDate } from "@/lib/utils";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { HtmlContent } from "@/components/cv-builder/templates/HtmlContent";

export default function CareerTipDetailPage() {
  const params = useParams<{ id: string }>();
  const [tip, setTip] = useState<CareerTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = Number(params.id);
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    careerTipsApi
      .get(id)
      .then((res) => setTip(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

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
        <div
          className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)", filter: "blur(80px)" }}
        />

        <div className="relative max-w-3xl mx-auto px-6 pt-12 pb-20">
          <Link
            href="/career-tips"
            className="inline-flex items-center gap-2 text-[#8b949e] hover:text-white text-sm transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Career Tips
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 text-[#8b949e] animate-spin" />
            </div>
          ) : notFound || !tip ? (
            <div className="border border-dashed border-[#30363d] rounded-2xl p-16 text-center">
              <ImageOff className="w-8 h-8 text-[#484f58] mx-auto mb-3" />
              <p className="text-[#8b949e]">This career tip couldn&apos;t be found.</p>
            </div>
          ) : (
            <article>
              <div className="relative w-full rounded-2xl overflow-hidden border border-[#30363d] bg-[#161b22] flex items-center justify-center" style={{ maxHeight: 560 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tip.image_url}
                  alt={tip.title}
                  style={{ width: "100%", maxHeight: 560, objectFit: "contain" }}
                />
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-8 mb-3">
                {tip.title}
              </h1>
              <p className="text-[#8b949e] text-sm mb-8">{formatDate(tip.published_at)}</p>

              <HtmlContent html={tip.caption} className="career-tip-prose" />
            </article>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
