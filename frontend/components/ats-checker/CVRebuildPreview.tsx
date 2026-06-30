"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { buildATSPreviewData } from "@/lib/ats-preview-data";
import { ClassicTemplate } from "@/components/cv-builder/templates/ClassicTemplate";
import { MinimalTemplate } from "@/components/cv-builder/templates/MinimalTemplate";
import { ExecutiveTemplate } from "@/components/cv-builder/templates/ExecutiveTemplate";
import { AcademicTemplate } from "@/components/cv-builder/templates/AcademicTemplate";
import { DEFAULT_CUSTOMIZATION } from "@/types";
import type { CVSection, CVCustomization } from "@/types";

// A4: 210mm × 297mm  →  height = width × (297/210)
const CARD_W = 220;
const CARD_H = Math.round(CARD_W * (297 / 210)); // 311px
const SCALE = CARD_W / 794;                       // ≈ 0.277

const TEMPLATES: Array<{
  Component: React.ComponentType<{ sections: CVSection[]; customization?: CVCustomization }>;
  label: string;
  customization: CVCustomization;
}> = [
  {
    Component: ClassicTemplate,
    label: "Classic",
    customization: { ...DEFAULT_CUSTOMIZATION, accentColor: "#111827" },
  },
  {
    Component: MinimalTemplate,
    label: "Colorful",
    customization: { ...DEFAULT_CUSTOMIZATION, accentColor: "#e11d48", fontFamily: "Lato" },
  },
  {
    Component: ExecutiveTemplate,
    label: "Executive",
    customization: {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#111827",
      fontFamily: "Georgia",
      headerStyle: "twocolumn",
    },
  },
  {
    Component: AcademicTemplate,
    label: "Academic",
    customization: {
      ...DEFAULT_CUSTOMIZATION,
      accentColor: "#2563eb",
      fontFamily: "Georgia",
    },
  },
];

interface TemplateBoxProps {
  Component: React.ComponentType<{ sections: CVSection[]; customization?: CVCustomization }>;
  customization: CVCustomization;
  previewData: CVSection[];
  isPro: boolean;
  label: string;
}

function TemplateBox({ Component, customization, previewData, isPro, label }: TemplateBoxProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ width: CARD_W, flexShrink: 0 }}>
      {/* Fixed-size card: width = CARD_W matches scale(794 × SCALE) exactly */}
      <div
        style={{
          position: "relative",
          width: CARD_W,
          height: CARD_H,
          overflow: "hidden",
          borderRadius: 8,
          border: "1px solid #30363d",
          background: "#fff",
        }}
      >
        {/* Spinner until first paint */}
        {!loaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Template rendered at real 794px width then scaled to CARD_W */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 794,
            height: 1122,
            transform: `scale(${SCALE})`,
            transformOrigin: "top left",
            filter: isPro ? "none" : "blur(5px)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <Component sections={previewData} customization={customization} />
        </div>

        {/* Lock overlay for free users */}
        {!isPro && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(22,27,34,0.4)",
            }}
          >
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center mb-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-white text-[10px] font-medium bg-[#161b22] px-2.5 py-1 rounded-full">
              Unlock with Pro
            </p>
          </div>
        )}
      </div>
      <p className="text-center text-[#8b949e] text-[11px] mt-2">{label}</p>
    </div>
  );
}

interface Props {
  detectedName?: string | null;
  detectedEmail?: string | null;
  detectedPhone?: string | null;
  detectedLinkedin?: string | null;
  targetRole?: string | null;
  currentScore: number;
  projectedScore: number;
  isPro: boolean;
}

export function CVRebuildPreview({
  detectedName,
  detectedEmail,
  detectedPhone,
  detectedLinkedin,
  targetRole,
  currentScore,
  projectedScore,
  isPro,
}: Props) {
  const previewData = buildATSPreviewData(
    detectedName ?? undefined,
    targetRole ?? undefined,
    detectedEmail ?? undefined,
    detectedPhone ?? undefined,
    detectedLinkedin ?? undefined,
  );

  return (
    <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/30 rounded-lg p-5 mt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-semibold text-sm">
          ✨ Your CV, Rebuilt with ZenzHire
        </h3>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-red-400 font-bold">{Math.round(currentScore)}</span>
          <span className="text-[#8b949e]">→</span>
          <span className="text-green-400 font-bold">{Math.round(projectedScore)}</span>
        </div>
      </div>
      <p className="text-[#8b949e] text-xs mb-4">
        A preview of how a clean, ATS-optimized ZenzHire template could improve your CV&apos;s score.
      </p>

      {/* 4-template horizontal scroll row */}
      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
        {TEMPLATES.map(({ Component, label, customization }) => (
          <TemplateBox
            key={label}
            Component={Component}
            label={label}
            customization={customization}
            previewData={previewData}
            isPro={isPro}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <a
          href="/templates"
          className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
        >
          ✨ Update with ZenzHire
        </a>
        <a
          href="/templates"
          className="flex-1 text-center border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] text-sm font-medium py-2.5 rounded-md transition-colors"
        >
          🎨 Browse Templates
        </a>
      </div>

      <p className="text-[10px] text-[#484f58] mt-3 text-center">
        Preview uses a sample layout to illustrate improvement potential. Build your real CV with
        your full content in the CV Builder.
      </p>
    </div>
  );
}
