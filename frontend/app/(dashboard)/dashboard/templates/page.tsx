"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { CVDocument } from "@/types";
import { DEFAULT_CUSTOMIZATION, TEMPLATE_DEFAULT_CUSTOMIZATION } from "@/types";
import { CAREER_MENTOR_ENABLED } from "@/lib/feature-flags";
import { PlanLimitDialog } from "@/components/shared/PlanLimitDialog";
import { Lock, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEMPLATES, CATEGORIES, type Template } from "@/lib/templates-data";
import { TemplateGalleryCard } from "@/components/templates/TemplateGalleryCard";

function ProUpgradeModal({
  templateName,
  onClose,
}: {
  templateName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-[#161b22] border border-[#30363d] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b949e] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-amber-400" />
        </div>

        <h2 className="text-white text-xl font-bold text-center mb-2">Pro Template</h2>
        <p className="text-[#8b949e] text-sm text-center mb-6">
          <span className="text-white font-medium">{templateName}</span>
          {" "}is available on the Pro plan. Upgrade to unlock all premium templates and features.
        </p>

        <div className="bg-[#0d1117] rounded-xl p-4 mb-6 space-y-2">
          {[
            "5 premium CV templates",
            "Unlimited AI improvements",
            "Advanced CV score insights",
            "Custom accent colors",
            "Premium fonts",
            "Priority support",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-[#e6edf3] text-xs">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/pricing")}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-black font-semibold text-sm mb-3 hover:opacity-90 transition-opacity"
        >
          Upgrade to Pro
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#8b949e] text-sm transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isPro = user?.is_pro ?? false;

  const [activeCategory, setActiveCategory] = useState("all");
  const [proModal, setProModal] = useState<string | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  const filtered = TEMPLATES.filter(
    (t) => activeCategory === "all" || t.category === activeCategory
  ).sort((a, b) => (a.plan === b.plan ? 0 : a.plan === "free" ? -1 : 1));

  const handleSelect = async (template: Template) => {
    if (template.plan === "pro" && !isPro) {
      setProModal(template.name);
      return;
    }

    if (!CAREER_MENTOR_ENABLED) {
      setCreating(template.id);
      try {
        const templateDefaults = TEMPLATE_DEFAULT_CUSTOMIZATION[template.id] ?? {};
        const res = await api.post<CVDocument>("/cv/", {
          title: "My CV",
          template_id: template.id,
          customization: {
            ...DEFAULT_CUSTOMIZATION,
            ...templateDefaults,
            spacing: "normal",
            skillStyle: "classic",
            skillColumns: 2,
          },
        });
        router.push(`/cv-builder/${res.data.id}`);
      } catch (err: any) {
        setLimitMessage(err?.response?.data?.detail || "Failed to create CV. Please try again.");
      } finally {
        setCreating(null);
      }
      return;
    }

    router.push(`/cv-builder/onboarding?template=${template.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Page header */}
      <div className="px-8 pt-10 pb-8 text-center border-b border-[#30363d]">
        <h1 className="text-3xl font-bold text-white mb-3">Choose Your Template</h1>
        <p className="text-[#8b949e] text-sm max-w-lg mx-auto">
          Start with a professionally designed template. All templates are fully
          customizable with your own colors and fonts.
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
      <div className="px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((template) => (
            <TemplateGalleryCard
              key={template.id}
              template={template}
              locked={template.plan === "pro" && !isPro}
              actionLabel="Use Template"
              actionLoading={creating === template.id}
              onAction={() => handleSelect(template)}
            />
          ))}
        </div>
      </div>

      {proModal && (
        <ProUpgradeModal templateName={proModal} onClose={() => setProModal(null)} />
      )}

      <PlanLimitDialog message={limitMessage} onClose={() => setLimitMessage(null)} />
    </div>
  );
}
