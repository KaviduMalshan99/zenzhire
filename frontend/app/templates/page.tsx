"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TEMPLATES, CATEGORIES } from "@/lib/templates-data";
import { TemplateGalleryCard } from "@/components/templates/TemplateGalleryCard";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export default function PublicTemplatesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = TEMPLATES.filter(
    (t) => activeCategory === "all" || t.category === activeCategory
  ).sort((a, b) => (a.plan === b.plan ? 0 : a.plan === "free" ? -1 : 1));

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <SiteHeader />

      {/* Page header */}
      <div className="px-6 pt-16 pb-10 text-center border-b border-[#30363d]">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Templates for every industry</h1>
        <p className="text-[#8b949e] text-sm max-w-lg mx-auto">
          14 professionally designed layouts. Free and Pro, fully customizable.
        </p>

        {/* Category filters */}
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                activeCategory === cat.id
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-white"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Free/Pro count */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-[#484f58] text-xs">
            {filtered.filter((t) => t.plan === "free").length} free
          </span>
          <span className="text-[#484f58] text-xs">•</span>
          <span className="text-[#484f58] text-xs">
            {filtered.filter((t) => t.plan === "pro").length} pro
          </span>
        </div>
      </div>

      {/* Template grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((template) => (
            <TemplateGalleryCard
              key={template.id}
              template={template}
              locked={template.plan === "pro"}
              actionLabel="Get Started Free"
              onAction={() => router.push("/signup")}
            />
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
