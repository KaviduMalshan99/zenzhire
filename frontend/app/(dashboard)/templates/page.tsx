"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { CVDocument } from "@/types";
import { DEFAULT_CUSTOMIZATION, TEMPLATE_DEFAULT_CUSTOMIZATION } from "@/types";
import { Lock, Loader2, Sparkles, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    category: "simple",
    plan: "free",
    popular: true,
    description: "Clean and traditional. Perfect for corporate and professional roles.",
    accentColor: "#111827",
  },
  {
    id: "academic",
    name: "Inline",
    category: "simple",
    plan: "free",
    popular: false,
    description: "Elegant inline layout with icon contacts. Great for any industry.",
    accentColor: "#2563eb",
  },
  {
    id: "minimal",
    name: "Colorful",
    category: "creative",
    plan: "free",
    popular: true,
    description: "Bold color banner header. Makes your CV stand out from the crowd.",
    accentColor: "#e11d48",
  },
  {
    id: "modern",
    name: "Modern",
    category: "modern",
    plan: "pro",
    popular: true,
    description: "Two-column layout with colored sidebar. Contemporary and stylish.",
    accentColor: "#2563eb",
  },
  {
    id: "tech",
    name: "Bordered",
    category: "modern",
    plan: "pro",
    popular: false,
    description: "Elegant border frame design. Professional and distinctive.",
    accentColor: "#2563eb",
  },
  {
    id: "creative",
    name: "Timeline",
    category: "creative",
    plan: "pro",
    popular: false,
    description: "Left accent line with timeline layout. Perfect for creatives.",
    accentColor: "#7c3aed",
  },
  {
    id: "executive",
    name: "Executive",
    category: "professional",
    plan: "pro",
    popular: false,
    description: "Sophisticated centered layout. Ideal for senior professionals.",
    accentColor: "#111827",
  },
  {
    id: "gcc",
    name: "GCC",
    category: "professional",
    plan: "pro",
    popular: false,
    description: "Dark header design tailored for Gulf and Middle East applications.",
    accentColor: "#2563eb",
  },
] as const;

type Template = typeof TEMPLATES[number];

const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "simple", label: "Simple" },
  { id: "modern", label: "Modern" },
  { id: "creative", label: "Creative" },
  { id: "professional", label: "Professional" },
];

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

function TemplateCard({
  template,
  isPro,
  onSelect,
  creating,
}: {
  template: Template;
  isPro: boolean;
  onSelect: () => void;
  creating: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const isLocked = template.plan === "pro" && !isPro;

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-[#161b22] rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer",
        isLocked
          ? "border-[#30363d]"
          : "border-[#30363d] hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/10"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-1.5">
        {template.popular && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white">
            Popular
          </span>
        )}
        {template.plan === "free" ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/20 border border-green-500/30 text-green-400">
            Free
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/20 border border-amber-400/30 text-amber-400 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            Pro
          </span>
        )}
      </div>

      {/* Template preview */}
      <div className="relative overflow-hidden bg-white" style={{ height: 380 }}>
        {!iframeLoaded && (
          <div className="absolute inset-0 bg-[#f8fafc] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#d1d5db] animate-spin" />
          </div>
        )}

        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden" }}>
          <iframe
            src={`/cv-template-preview/${template.id}`}
            style={{
              width: "794px",
              height: "1122px",
              border: "none",
              transformOrigin: "top left",
              pointerEvents: "none",
              opacity: iframeLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
            onLoad={(e) => {
              const container = e.currentTarget.parentElement?.parentElement;
              if (container) {
                const scale = container.offsetWidth / 794;
                e.currentTarget.style.transform = `scale(${scale})`;
              }
              setIframeLoaded(true);
            }}
          />
        </div>

        {/* Pro lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-[#161b22]/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-white text-xs font-medium">Pro Template</p>
            </div>
          </div>
        )}

        {/* Hover overlay for free/unlocked templates */}
        {!isLocked && hovered && (
          <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
            <div className="bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2">
              {creating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {creating ? "Creating..." : "Use Template"}
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[#e6edf3] font-semibold text-sm">{template.name}</h3>
          <span
            className="text-[10px] font-medium capitalize"
            style={{ color: template.accentColor === "#111827" ? "#6b7280" : template.accentColor }}
          >
            {template.category}
          </span>
        </div>
        <p className="text-[#8b949e] text-[11px] leading-relaxed">{template.description}</p>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isPro = user?.plan === "pro";

  const [activeCategory, setActiveCategory] = useState("all");
  const [creating, setCreating] = useState<string | null>(null);
  const [proModal, setProModal] = useState<string | null>(null);

  const filtered = TEMPLATES.filter(
    (t) => activeCategory === "all" || t.category === activeCategory
  );

  const handleSelect = async (template: Template) => {
    if (template.plan === "pro" && !isPro) {
      setProModal(template.name);
      return;
    }
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
    } catch {
      alert("Failed to create CV. Please try again.");
    } finally {
      setCreating(null);
    }
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
        <div
          className="grid grid-cols-4 gap-6"
        >
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isPro={isPro ?? false}
              onSelect={() => handleSelect(template)}
              creating={creating === template.id}
            />
          ))}
        </div>
      </div>

      {proModal && (
        <ProUpgradeModal templateName={proModal} onClose={() => setProModal(null)} />
      )}
    </div>
  );
}
