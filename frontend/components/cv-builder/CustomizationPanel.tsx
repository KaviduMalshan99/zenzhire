"use client";

import { Lock } from "lucide-react";
import type { CVCustomization } from "@/types";
import { FONT_CSS_MAP } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  customization: CVCustomization;
  onChange: (c: CVCustomization) => void;
  isPro: boolean;
}

const PRESET_COLORS = [
  { value: "#2563eb", label: "Blue" },
  { value: "#16a34a", label: "Green" },
  { value: "#7c3aed", label: "Purple" },
  { value: "#dc2626", label: "Red" },
  { value: "#ea580c", label: "Orange" },
  { value: "#0891b2", label: "Teal" },
  { value: "#111827", label: "Black" },
  { value: "#b45309", label: "Gold" },
];

const FONT_OPTIONS = [
  { value: "Arial", description: "Clean, best for ATS", pro: false },
  { value: "Georgia", description: "Classic, professional", pro: false },
  { value: "Roboto", description: "Modern, tech", pro: true },
  { value: "Playfair Display", description: "Elegant, executive", pro: true },
  { value: "Lato", description: "Friendly, creative", pro: true },
];

const SPACING_OPTIONS = [
  { value: "compact" as const, label: "Compact" },
  { value: "normal" as const, label: "Normal" },
  { value: "spacious" as const, label: "Spacious" },
];

const HEADER_STYLE_OPTIONS = [
  { value: "left" as const, label: "Left", desc: "Name left aligned" },
  { value: "centered" as const, label: "Centered", desc: "Name centered" },
  { value: "twocolumn" as const, label: "Two Column", desc: "Name left, contact right" },
];

const SKILL_STYLE_OPTIONS = [
  { value: "classic" as const, label: "Classic", preview: "Python  ●●●●○" },
  { value: "progressbar" as const, label: "Progress Bar", preview: "Python ████░" },
  { value: "dotrating" as const, label: "Dot Rating", preview: "Python ●●●●○" },
  { value: "percentage" as const, label: "Percentage", preview: "Python  85%" },
  { value: "starrating" as const, label: "Star Rating", preview: "Python ★★★★☆" },
  { value: "nameonly" as const, label: "Name Only", preview: "Python" },
];

const SKILL_COLUMN_OPTIONS = [
  { value: 1 as const, label: "1 Col" },
  { value: 2 as const, label: "2 Cols" },
  { value: 3 as const, label: "3 Cols" },
];

const HEADING_STYLE_OPTIONS = [
  { value: "fullline" as const, label: "Full Line", preview: "EXPERIENCE ────" },
  { value: "underline" as const, label: "Underline", preview: "EXPERIENCE" },
  { value: "boxed" as const, label: "Boxed", preview: "■ EXPERIENCE" },
  { value: "doubleline" as const, label: "Double Line", preview: "══ EXPERIENCE ══" },
  { value: "leftbar" as const, label: "Left Bar", preview: "▌ EXPERIENCE" },
  { value: "dotted" as const, label: "Dotted", preview: "EXPERIENCE ·······" },
  { value: "accentbadge" as const, label: "Accent Badge", preview: "■ EXPERIENCE ■" },
  { value: "centerlines" as const, label: "Center Lines", preview: "── EXPERIENCE ──" },
  { value: "plain" as const, label: "Plain", preview: "Experience" },
];

function SectionLabel({ label, pro }: { label: string; pro?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-[#8b949e] text-[10px] uppercase tracking-wide font-medium">{label}</span>
      {pro && (
        <span className="text-[9px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full font-medium">
          PRO
        </span>
      )}
    </div>
  );
}

function ProOverlay({ children, isPro }: { children: React.ReactNode; isPro: boolean }) {
  if (isPro) return <>{children}</>;
  return (
    <div className="relative">
      <div className="pointer-events-none opacity-35 select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <Lock className="w-3.5 h-3.5 text-[#8b949e]" />
        <a
          href="/pricing"
          className="text-[10px] text-blue-400 hover:text-blue-300 underline underline-offset-2"
        >
          Upgrade to Pro
        </a>
      </div>
    </div>
  );
}

function set<K extends keyof CVCustomization>(
  customization: CVCustomization,
  onChange: (c: CVCustomization) => void,
  key: K,
  value: CVCustomization[K],
) {
  onChange({ ...customization, [key]: value });
}

export function CustomizationPanel({ customization, onChange, isPro }: Props) {
  const upd = <K extends keyof CVCustomization>(key: K, value: CVCustomization[K]) =>
    set(customization, onChange, key, value);

  return (
    <div className="flex flex-col gap-5 p-4">

      {/* ── Accent Color ───────────────────────────────────────────── */}
      <div>
        <SectionLabel label="Accent Color" />
        <div className="flex gap-1.5 flex-wrap mb-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => upd("accentColor", c.value)}
              title={c.label}
              style={{ backgroundColor: c.value }}
              className={cn(
                "w-6 h-6 rounded-full transition-all flex-shrink-0",
                customization.accentColor === c.value
                  ? "ring-2 ring-white ring-offset-1 ring-offset-[#161b22]"
                  : "hover:scale-110"
              )}
            />
          ))}
        </div>

        {isPro ? (
          <div className="flex items-center gap-2 mt-1">
            <label className="text-[10px] text-[#8b949e]">Custom</label>
            <input
              type="color"
              value={customization.accentColor}
              onChange={(e) => upd("accentColor", e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1 opacity-40">
            <Lock className="w-3 h-3 text-[#8b949e]" />
            <label className="text-[10px] text-[#8b949e]">Custom color</label>
            <span className="text-[9px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">PRO</span>
          </div>
        )}
      </div>

      {/* ── Font Family ─────────────────────────────────────────────── */}
      <div>
        <SectionLabel label="Font" />
        <div className="flex flex-col gap-1">
          {FONT_OPTIONS.map((f) => {
            const locked = f.pro && !isPro;
            const active = customization.fontFamily === f.value;
            const css = FONT_CSS_MAP[f.value] ?? "Arial, Helvetica, sans-serif";
            return (
              <button
                key={f.value}
                onClick={() => !locked && upd("fontFamily", f.value)}
                disabled={locked}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md border text-left transition-all",
                  active
                    ? "border-blue-500 bg-blue-600/10"
                    : locked
                    ? "border-[#21262d] opacity-50 cursor-not-allowed"
                    : "border-[#30363d] hover:border-[#8b949e] cursor-pointer"
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className={cn("text-xs font-medium", active ? "text-blue-400" : locked ? "text-[#484f58]" : "text-[#e6edf3]")}
                    style={{ fontFamily: css }}
                  >
                    {f.value}
                  </span>
                  <span className={cn("text-[10px]", locked ? "text-[#30363d]" : "text-[#8b949e]")}>
                    {f.description}
                  </span>
                </div>
                {locked && <Lock className="w-3 h-3 text-[#484f58] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Spacing ─────────────────────────────────────────────────── */}
      <div>
        <SectionLabel label="Content Spacing" />
        <div className="flex gap-1">
          {SPACING_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => upd("spacing", s.value)}
              className={cn(
                "flex-1 py-1.5 rounded-md text-[10px] font-medium border transition-all",
                customization.spacing === s.value
                  ? "border-blue-500 bg-blue-600/10 text-blue-400"
                  : "border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-[#e6edf3]"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Header Style (PRO) ──────────────────────────────────────── */}
      <div>
        <SectionLabel label="Header Layout" pro />
        <ProOverlay isPro={isPro}>
          <div className="flex flex-col gap-1">
            {HEADER_STYLE_OPTIONS.map((h) => (
              <button
                key={h.value}
                onClick={() => isPro && upd("headerStyle", h.value)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md border text-left transition-all",
                  customization.headerStyle === h.value
                    ? "border-blue-500 bg-blue-600/10"
                    : "border-[#30363d] hover:border-[#8b949e]"
                )}
              >
                <div>
                  <div className={cn("text-xs font-medium", customization.headerStyle === h.value ? "text-blue-400" : "text-[#e6edf3]")}>
                    {h.label}
                  </div>
                  <div className="text-[10px] text-[#8b949e]">{h.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </ProOverlay>
      </div>

      {/* ── Heading Style (PRO) ─────────────────────────────────────── */}
      <div>
        <SectionLabel label="Section Headings" pro />
        <ProOverlay isPro={isPro}>
          <div className="grid grid-cols-2 gap-1">
            {HEADING_STYLE_OPTIONS.map((h) => (
              <button
                key={h.value}
                onClick={() => isPro && upd("headingStyle", h.value)}
                className={cn(
                  "flex flex-col gap-1 px-2.5 py-2 rounded-md border text-left transition-all",
                  customization.headingStyle === h.value
                    ? "border-blue-500 bg-blue-600/10"
                    : "border-[#30363d] hover:border-[#8b949e]"
                )}
              >
                <span className={cn("text-[10px] font-medium", customization.headingStyle === h.value ? "text-blue-400" : "text-[#e6edf3]")}>
                  {h.label}
                </span>
                <span className="text-[9px] text-[#8b949e] font-mono truncate">{h.preview}</span>
              </button>
            ))}
          </div>
        </ProOverlay>
      </div>

      {/* ── Skill Style (PRO) ───────────────────────────────────────── */}
      <div>
        <SectionLabel label="Skill Style" pro />
        <ProOverlay isPro={isPro}>
          <div className="grid grid-cols-2 gap-1">
            {SKILL_STYLE_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => isPro && upd("skillStyle", s.value as any)}
                className={cn(
                  "flex flex-col gap-1 px-2.5 py-2 rounded-md border text-left transition-all",
                  customization.skillStyle === s.value
                    ? "border-blue-500 bg-blue-600/10"
                    : "border-[#30363d] hover:border-[#8b949e]"
                )}
              >
                <span className={cn("text-[10px] font-medium", customization.skillStyle === s.value ? "text-blue-400" : "text-[#e6edf3]")}>
                  {s.label}
                </span>
                <span className="text-[9px] text-[#8b949e] font-mono truncate">{s.preview}</span>
              </button>
            ))}
          </div>
        </ProOverlay>
      </div>

      {/* ── Skill Columns (PRO) ─────────────────────────────────────── */}
      <div>
        <SectionLabel label="Skill Columns" pro />
        <ProOverlay isPro={isPro}>
          <div className="flex gap-1">
            {SKILL_COLUMN_OPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => isPro && upd("skillColumns", c.value as any)}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-[10px] font-medium border transition-all",
                  customization.skillColumns === c.value
                    ? "border-blue-500 bg-blue-600/10 text-blue-400"
                    : "border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-[#e6edf3]"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </ProOverlay>
      </div>

    </div>
  );
}
