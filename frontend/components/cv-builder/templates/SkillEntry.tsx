import React from "react";
import { EditableText } from "./edit/EditableText";

interface Props {
  skillName: string;
  level?: string;
  skillStyle: "classic" | "progressbar" | "dotrating" | "percentage" | "starrating" | "nameonly" | "chips";
  accentColor: string;
  fontFamily: string;
  onNameCommit?: (value: string) => void;
}

function levelToPercent(level: string): number {
  const l = (level ?? "").toLowerCase();
  if (l.includes("native")) return 100;
  if (l.includes("expert") || l.includes("fluent") || l === "c2") return 90;
  if (l.includes("advanced") || l === "c1") return 75;
  if (l.includes("professional") || l === "b2") return 65;
  if (l.includes("intermediate") || l === "b1") return 50;
  if (l.includes("basic") || l === "a2" || l === "a1") return 25;
  if (l.includes("beginner")) return 15;
  return 60;
}

function levelToDots(level: string): number {
  const l = (level ?? "").toLowerCase();
  if (l.includes("native") || l.includes("expert") || l === "c2") return 5;
  if (l.includes("fluent") || l.includes("advanced") || l === "c1") return 4;
  if (l.includes("professional") || l.includes("intermediate") || l === "b2" || l === "b1") return 3;
  if (l.includes("basic") || l === "a2") return 2;
  if (l.includes("beginner") || l === "a1") return 1;
  return 3;
}

function levelToStars(level: string): number {
  return levelToDots(level);
}

export function SkillEntry({ skillName, level, skillStyle, accentColor, fontFamily, onNameCommit }: Props) {
  const baseStyle: React.CSSProperties = { fontFamily, fontSize: 12, color: "#111827" };
  const Name = ({ style }: { style?: React.CSSProperties }) =>
    onNameCommit ? (
      <EditableText value={skillName} onCommit={onNameCommit} as="span" style={style} />
    ) : (
      <span style={style}>{skillName}</span>
    );

  if (skillStyle === "chips") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 11px",
          borderRadius: 999,
          backgroundColor: accentColor + "15",
          border: `1px solid ${accentColor}40`,
          fontFamily,
          maxWidth: "100%",
        }}
      >
        <Name style={{ fontWeight: 600, fontSize: 11, color: "#111827" }} />
        {level && (
          <span style={{ fontSize: 10, color: accentColor, fontWeight: 500, whiteSpace: "nowrap" }}>
            · {level}
          </span>
        )}
      </div>
    );
  }

  if (skillStyle === "nameonly") {
    return (
      <div style={{ ...baseStyle, fontWeight: 500 }}><Name /></div>
    );
  }

  if (skillStyle === "progressbar") {
    if (!level) return <div style={{ ...baseStyle, fontWeight: 600, fontSize: 11 }}><Name /></div>;
    const pct = levelToPercent(level);
    return (
      <div style={baseStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
          <Name style={{ fontWeight: 600, fontSize: 11 }} />
          <span style={{ fontSize: 10, color: "#6b7280" }}>{level}</span>
        </div>
        <div style={{ height: 4, backgroundColor: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: 4, width: `${pct}%`, backgroundColor: accentColor, borderRadius: 2, WebkitPrintColorAdjust: "exact" } as React.CSSProperties} />
        </div>
      </div>
    );
  }

  if (skillStyle === "percentage") {
    const pct = level ? levelToPercent(level) : null;
    return (
      <div style={{ ...baseStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Name style={{ fontWeight: 600, fontSize: 11 }} />
        {pct !== null && <span style={{ fontSize: 11, color: accentColor, fontWeight: 700 }}>{pct}%</span>}
      </div>
    );
  }

  if (skillStyle === "dotrating") {
    if (!level) return <Name style={{ fontSize: 11, color: "#111827", fontWeight: 600, fontFamily }} />;
    const dots = levelToDots(level);
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily, width: "100%" }}>
        <Name style={{ fontSize: 11, color: "#111827", fontWeight: 600, marginRight: 4 }} />
        <span style={{ flexShrink: 0 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} style={{ color: i <= dots ? accentColor : "#e5e7eb", fontSize: 11, marginLeft: 1 }}>●</span>
          ))}
        </span>
      </div>
    );
  }

  if (skillStyle === "starrating") {
    if (!level) return <Name style={{ fontSize: 11, color: "#111827", fontWeight: 600, fontFamily }} />;
    const stars = levelToStars(level);
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily, width: "100%" }}>
        <Name style={{ fontSize: 11, color: "#111827", fontWeight: 600, marginRight: 4 }} />
        <span style={{ flexShrink: 0 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} style={{ color: i <= stars ? accentColor : "#e5e7eb", fontSize: 12 }}>★</span>
          ))}
        </span>
      </div>
    );
  }

  // classic (default): name bold + level text right-aligned
  return (
    <div style={{ ...baseStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Name style={{ fontWeight: 600, fontSize: 11 }} />
      {level && <span style={{ fontSize: 10, color: "#6b7280" }}>{level}</span>}
    </div>
  );
}
