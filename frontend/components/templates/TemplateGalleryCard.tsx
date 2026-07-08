"use client";

import { useState } from "react";
import { Lock, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_CUSTOMIZATION, TEMPLATE_DEFAULT_CUSTOMIZATION } from "@/types";
import type { Template } from "@/lib/templates-data";

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
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const defaultAccent = TEMPLATE_DEFAULT_CUSTOMIZATION[template.id]?.accentColor ?? DEFAULT_CUSTOMIZATION.accentColor;
  const [previewColor, setPreviewColor] = useState(defaultAccent);

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-[#161b22] rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer",
        locked
          ? "border-[#30363d]"
          : "border-[#30363d] hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/10"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onAction}
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

      {/* Template preview — height is ~90% of the full-A4-page scaled height (was 380, a near-exact
          full-page match at this card width). Measured real content fill across all 13 templates
          tops out at ~88% (Timeline/creative); this trims the dead white space below that without
          clipping any template's actual text content. */}
      <div className="relative overflow-hidden bg-white" style={{ height: 280 }}>
        {!iframeLoaded && (
          <div className="absolute inset-0 bg-[#f8fafc] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#d1d5db] animate-spin" />
          </div>
        )}

        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden" }}>
          <iframe
            src={`/cv-template-preview/${template.id}?accentColor=${encodeURIComponent(previewColor)}`}
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
        {locked && (
          <div className="absolute inset-0 bg-[#161b22]/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-white text-xs font-medium">Pro Template</p>
            </div>
          </div>
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
              onClick={() => {
                setPreviewColor(c.value);
                setIframeLoaded(false);
              }}
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
