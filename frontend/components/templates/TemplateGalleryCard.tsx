"use client";

import { useState } from "react";
import { Lock, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_CUSTOMIZATION, TEMPLATE_DEFAULT_CUSTOMIZATION } from "@/types";
import type { Template } from "@/lib/templates-data";
import { TemplatePreviewFrame } from "@/components/templates/TemplatePreviewFrame";

// Gallery-only live preview colors — purely client-side, never persisted or sent to the API.
const PREVIEW_COLORS = [
  { name: "Black", value: "#111827" },
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#16a34a" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Orange", value: "#ea580c" },
  { name: "Red", value: "#dc2626" },
];

export function TemplateGalleryCard({
  template,
  locked,
  actionLabel,
  actionLoading,
  onAction,
}: {
  template: Template;
  locked: boolean;
  actionLabel: string;
  actionLoading?: boolean;
  onAction: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const defaultAccent = TEMPLATE_DEFAULT_CUSTOMIZATION[template.id]?.accentColor ?? DEFAULT_CUSTOMIZATION.accentColor;
  const [previewColor, setPreviewColor] = useState(defaultAccent);

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-[#161b22] rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer",
        locked
          ? "border-[#30363d] hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-400/10"
          : "border-[#30363d] hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/10"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onAction}
    >
      {/* Badges — sit in their own strip above the preview, in normal document flow, so they
          can never overlap each other (flex + gap, no wrapping) and never sit on top of the
          CV preview content underneath (some templates place a name/title right at the very
          top of the page, which a floating overlay would cover). */}
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 bg-[#161b22]">
        {template.popular && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white whitespace-nowrap">
            Popular
          </span>
        )}
        {template.plan === "free" ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/20 border border-green-500/30 text-green-400 whitespace-nowrap">
            Free
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/20 border border-amber-400/30 text-amber-400 flex items-center gap-1 whitespace-nowrap">
            <Lock className="w-2.5 h-2.5" />
            Pro
          </span>
        )}
      </div>

      {/* Template preview — same shared frame as the hero mockup, so both stay locked to
          the real A4 aspect ratio and never crop. Keyed by color so switching swatches
          remounts it and the loading spinner reappears for the new render. */}
      <div className="relative">
        <TemplatePreviewFrame key={previewColor} templateId={template.id} accentColor={previewColor} />

        {/* Pro gating — kept light so the real design (colors, layout, photo) stays legible
            and sells itself; the lock badge + CTA pill make the gate obvious without a
            heavy blur/scrim burying the preview underneath. */}
        {locked && (
          <>
            <div className="absolute inset-0 bg-[#0d1117]/10 pointer-events-none transition-colors group-hover:bg-[#0d1117]/5" />

            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#161b22]/90 border border-amber-400/40 flex items-center justify-center shadow-md">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg transition-transform group-hover:scale-105">
              <Lock className="w-3 h-3" />
              Upgrade to Pro
            </div>
          </>
        )}

        {/* Hover overlay */}
        {!locked && hovered && (
          <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
            <div className="bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2">
              {actionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {actionLoading ? "Creating..." : actionLabel}
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
            style={{ color: defaultAccent === "#111827" ? "#6b7280" : defaultAccent }}
          >
            {template.category}
          </span>
        </div>
        <p className="text-[#8b949e] text-[11px] leading-relaxed">{template.description}</p>

        {/* Live preview color swatches — client-side only, does not affect the stored template default */}
        <div
          className="flex items-center gap-1.5 mt-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          {PREVIEW_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              aria-label={`Preview ${template.name} in ${c.name}`}
              onClick={() => setPreviewColor(c.value)}
              className="w-4 h-4 rounded-full transition-all"
              style={{
                backgroundColor: c.value,
                boxShadow:
                  previewColor === c.value
                    ? "0 0 0 2px #161b22, 0 0 0 3.5px #e6edf3"
                    : "0 0 0 1px rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
