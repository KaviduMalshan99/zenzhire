import React from "react";
import type { CVSection } from "@/types";
import { EditableText } from "./templates/edit/EditableText";
import { useCVEdit } from "./templates/edit/CVEditContext";

interface Props {
  title: string;
  /** When provided, the heading text becomes editable and the override is stored in section.data._title. */
  section?: CVSection;
  accentColor: string;
  headingStyle: "fullline" | "underline" | "boxed" | "plain" | "doubleline" | "leftbar" | "dotted" | "accentbadge" | "centerlines";
  fontFamily: string;
}

export function SectionHeading({ title, section, accentColor, headingStyle, fontFamily }: Props) {
  const { onFieldChange } = useCVEdit();
  const displayTitle = section?.data?._title || title;
  const titleNode = section ? (
    <EditableText
      value={displayTitle}
      onCommit={(v) => onFieldChange(section, { ...section.data, _title: v })}
      placeholder={title}
    />
  ) : (
    displayTitle
  );
  if (headingStyle === "underline") {
    return (
      <div style={{ marginBottom: 8, marginTop: 10, pageBreakAfter: "avoid", breakAfter: "avoid" }}>
        <div
          className="cv-section-header"
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: accentColor,
            borderBottom: `1.5px solid ${accentColor}`,
            paddingBottom: 4,
            fontFamily,
          }}
        >
          {titleNode}
        </div>
      </div>
    );
  }

  if (headingStyle === "boxed") {
    return (
      <div style={{ marginBottom: 8, marginTop: 10, pageBreakAfter: "avoid", breakAfter: "avoid" }}>
        <div
          className="cv-section-header"
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#ffffff",
            backgroundColor: accentColor,
            padding: "7px 10px 3px 10px",
            lineHeight: "1",
            display: "inline-block",
            borderRadius: 4,
            fontFamily,
          }}
        >
          {titleNode}
        </div>
      </div>
    );
  }

  if (headingStyle === "plain") {
    return (
      <div style={{ marginBottom: 8, marginTop: 10, pageBreakAfter: "avoid", breakAfter: "avoid" }}>
        <div
          className="cv-section-header"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#111827",
            fontFamily,
          }}
        >
          {titleNode}
        </div>
      </div>
    );
  }

  if (headingStyle === "doubleline") {
    return (
      <div style={{ marginBottom: 8, marginTop: 10, pageBreakAfter: "avoid", breakAfter: "avoid" }}>
        <div style={{ borderTop: `1.5px solid ${accentColor}`, marginBottom: 4 }} />
        <div className="cv-section-header" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accentColor, textAlign: "center", padding: "3px 0", fontFamily }}>
          {titleNode}
        </div>
        <div style={{ borderTop: `1.5px solid ${accentColor}`, marginTop: 4 }} />
      </div>
    );
  }

  if (headingStyle === "leftbar") {
    return (
      <div style={{ marginBottom: 8, marginTop: 10, pageBreakAfter: "avoid", breakAfter: "avoid" }}>
        <div className="cv-section-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 16, backgroundColor: accentColor, borderRadius: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accentColor, fontFamily }}>
            {titleNode}
          </span>
        </div>
      </div>
    );
  }

  if (headingStyle === "dotted") {
    return (
      <div style={{ marginBottom: 8, marginTop: 10, pageBreakAfter: "avoid", breakAfter: "avoid" }}>
        <div className="cv-section-header" style={{ display: "table", width: "100%" }}>
          <div style={{ display: "table-cell", whiteSpace: "nowrap", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accentColor, fontFamily, paddingRight: 8, verticalAlign: "bottom", lineHeight: "1.4" }}>
            {titleNode}
          </div>
          <div style={{ display: "table-cell", verticalAlign: "bottom", paddingBottom: "4px", width: "100%" }}>
            <div style={{ borderBottom: `1.5px dotted ${accentColor}`, width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (headingStyle === "accentbadge") {
    return (
      <div style={{ marginBottom: 8, marginTop: 10, pageBreakAfter: "avoid", breakAfter: "avoid" }}>
        <div className="cv-section-header" style={{ backgroundColor: accentColor, padding: "5px 10px", textAlign: "center", borderRadius: 4, width: "100%", boxSizing: "border-box" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffffff", fontFamily }}>
            {titleNode}
          </span>
        </div>
      </div>
    );
  }

  if (headingStyle === "centerlines") {
    return (
      <div style={{ marginBottom: 8, marginTop: 10, pageBreakAfter: "avoid", breakAfter: "avoid" }}>
        <div className="cv-section-header" style={{ display: "table", width: "100%" }}>
          <div style={{ display: "table-cell", verticalAlign: "middle", paddingBottom: "2px", width: "50%" }}>
            <div style={{ height: "1.5px", backgroundColor: accentColor, width: "100%" }} />
          </div>
          <div style={{ display: "table-cell", whiteSpace: "nowrap", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accentColor, fontFamily, textAlign: "center", padding: "0 10px", verticalAlign: "middle" }}>
            {titleNode}
          </div>
          <div style={{ display: "table-cell", verticalAlign: "middle", paddingBottom: "2px", width: "50%" }}>
            <div style={{ height: "1.5px", backgroundColor: accentColor, width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  // fullline (default) — display:table/table-cell renders identically in both
  // browser and html2canvas; flexbox alignItems:center drifts in html2canvas
  return (
    <div style={{ marginBottom: 8, marginTop: 10, pageBreakAfter: "avoid", breakAfter: "avoid" }}>
      <div
        className="cv-section-header"
        style={{ display: "table", width: "100%" }}
      >
        <div
          style={{
            display: "table-cell",
            whiteSpace: "nowrap",
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: accentColor,
            fontFamily,
            paddingRight: 10,
            verticalAlign: "bottom",
            lineHeight: "1.4",
          }}
        >
          {titleNode}
        </div>
        <div style={{ display: "table-cell", verticalAlign: "bottom", paddingBottom: "5px", width: "100%" }}>
          <div style={{ height: "1.5px", backgroundColor: accentColor, width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
