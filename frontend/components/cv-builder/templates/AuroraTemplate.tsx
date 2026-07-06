import React from "react";
import type { CVSection, CVCustomization } from "@/types";
import { DEFAULT_CUSTOMIZATION, FONT_CSS_MAP } from "@/types";
import { SectionHeading } from "../SectionHeading";
import { EditableText } from "./edit/EditableText";
import { EditableHtml } from "./edit/EditableHtml";
import { SortableSection } from "./edit/SortableSection";
import { useCVEdit } from "./edit/CVEditContext";
import { makeFieldSetter, makeEntrySetter } from "./edit/sectionHelpers";

interface Props {
  sections: CVSection[];
  customization?: CVCustomization;
}

function get(sections: CVSection[], type: string) {
  return sections.find((s) => s.section_type === type)?.data ?? {};
}

// LEFT column (same orientation as Portrait/Milestone — sidebar left, main right).
// Exported so CentrePanel.tsx can tell sidebar sections apart from main-column ones when
// rendering the sidebar as its own independently-paginated overlay — mirrors
// PortraitTemplate.tsx's PORTRAIT_SIDEBAR_TYPES / MilestoneTemplate.tsx's MILESTONE_SIDEBAR_TYPES.
export const AURORA_SIDEBAR_TYPES = new Set(["education", "skills", "soft_skills", "certificates", "languages", "interests"]);
const SIDEBAR_TYPES = AURORA_SIDEBAR_TYPES;

const DARK = "#111827";
const MID = "#374151";
const LIGHT = "#6b7280";
export const AURORA_GRAY_ZONE_COLOR = "#e2e2e2";

// Sidebar-specific text colors. The sidebar sits on a solid accentColor fill
// (not white, like every other part of the template), so it cannot reuse
// DARK/MID/LIGHT or SectionHeading's own accentColor-on-white assumption —
// SectionHeading draws its heading text IN accentColor, which on an
// accentColor background is literally the same color as what's behind it
// (zero contrast, fully invisible — confirmed by screenshot before this fix).
// Titles get full-opacity bold white for maximum contrast; body text uses a
// slightly dimmed white so titles still read as more prominent; the
// least-important meta text (dates, GPA, skill levels) is dimmer still.
const SIDEBAR_TITLE = "#ffffff";
const SIDEBAR_TEXT = "rgba(255,255,255,0.92)";
const SIDEBAR_TEXT_MUTED = "rgba(255,255,255,0.68)";
const SIDEBAR_DIVIDER = "rgba(255,255,255,0.45)";
const SIDEBAR_BULLET = "rgba(255,255,255,0.85)";

// Sidebar section heading — bold white, uppercase, letter-spaced, with a
// semi-transparent white underline. Deliberately NOT SectionHeading.tsx: that
// component always draws its "pop" color (text, underline, badge fill, etc.)
// in accentColor, which assumes a white page background behind it — on
// Aurora's colored sidebar that assumption breaks down completely (accent
// text on an accent background is invisible). Same category of exception as
// Tech/Corporate/Vega's own local heading renderers, scoped here to sidebar
// headings only; main-column headings still use SectionHeading normally
// since the main column IS white.
function SidebarHeading({ title, section, fontFamily }: { title: string; section?: CVSection; fontFamily: string }) {
  const { onFieldChange } = useCVEdit();
  const displayTitle = section?.data?._title || title;
  const titleNode = section ? (
    <EditableText value={displayTitle} onCommit={(v) => onFieldChange(section, { ...section.data, _title: v })} placeholder={title} />
  ) : displayTitle;
  return (
    <div style={{ marginBottom: 8, marginTop: 10 }}>
      <div
        className="cv-section-header"
        style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const,
          color: SIDEBAR_TITLE, borderBottom: `1.5px solid ${SIDEBAR_DIVIDER}`, paddingBottom: 5, fontFamily,
        }}
      >
        {titleNode}
      </div>
    </div>
  );
}

// Sidebar header zone constants (photo + two-tone background), shared with
// CentrePanel.tsx/generate-pdf/route.ts's per-page band injection so the
// live/PDF-painted band and this component's own non-paginated CSS
// background line up exactly. Kept in one place rather than re-derived.
export const AURORA_PHOTO_TOP = 36;
export const AURORA_PHOTO_SIZE = 125;
export const AURORA_GRAY_ZONE_HEIGHT = 120;

function getPhotoStyle(personal: any): React.CSSProperties {
  const size = personal.photo_size ?? AURORA_PHOTO_SIZE;
  const shape = personal.photo_shape ?? "circle";
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "10px" : shape === "hexagon" ? "0" : "0px";
  const clipPath = shape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : "none";
  return {
    width: size, height: size, borderRadius, clipPath, objectFit: "cover" as const,
    display: "block", boxShadow: "0 0 0 5px #ffffff", flexShrink: 0,
  };
}

function getContactIcon(type: string, fill: string): React.ReactNode {
  const s: React.CSSProperties = { display: "inline-block", verticalAlign: "middle", marginRight: 6, flexShrink: 0 };
  switch (type) {
    case "email": return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
    case "phone": return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
    case "location": return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
    case "linkedin": return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>;
    case "github": return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>;
    default: return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
  }
}

export function AuroraTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }: Props) {
  const { accentColor, fontFamily, spacing, headingStyle } = customization;
  const fontCSS = FONT_CSS_MAP[fontFamily] ?? "Arial, Helvetica, sans-serif";
  const sp = spacing === "compact" ? 0.75 : spacing === "spacious" ? 1.35 : 1.0;
  const eb: React.CSSProperties = { pageBreakInside: "avoid", breakInside: "avoid" };
  const { onFieldChange } = useCVEdit();

  const personal = get(sections, "personal_details");
  const personalSection = sections.find((s) => s.section_type === "personal_details");
  const setPersonal = personalSection ? makeFieldSetter(personalSection, onFieldChange) : () => {};
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) => (r.privacy ? r.privacy === "show" : r.show_on_cv !== false);

  const dateStyle: React.CSSProperties = { fontSize: 10.5, color: LIGHT, fontFamily: fontCSS };

  const contactItems: { type: string; text: string; onCommit: (v: string) => void }[] = [];
  if (personal.phone) contactItems.push({ type: "phone", text: personal.phone, onCommit: (v) => setPersonal("phone", v) });
  if (personal.email) contactItems.push({ type: "email", text: personal.email, onCommit: (v) => setPersonal("email", v) });
  if (personal.location) contactItems.push({ type: "location", text: personal.location, onCommit: (v) => setPersonal("location", v) });
  links.forEach((l: any, i: number) => {
    if (!l.url) return;
    const lp = (l.platform ?? "").toLowerCase();
    const type = lp.includes("linkedin") ? "linkedin" : lp.includes("github") ? "github" : "website";
    contactItems.push({
      type,
      text: l.url,
      onCommit: (v) => setPersonal("links", links.map((x: any, xi: number) => (xi === i ? { ...x, url: v } : x))),
    });
  });

  // References renders inside the main column here (an explicit, deliberate
  // deviation from Portrait/Milestone/Corporate/Vega's shared convention of a
  // full-width References grid below the two-column body — chosen for Aurora
  // specifically). It's therefore a normal main-column section, not excluded
  // from mainSections or handled as a separate trailing block.
  const sidebarSections = sections.filter((s) => SIDEBAR_TYPES.has(s.section_type));
  const mainSections = sections.filter(
    (s) => s.section_type !== "personal_details" && !SIDEBAR_TYPES.has(s.section_type)
  );

  const renderSidebarSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];
    const setEntry = makeEntrySetter(section, onFieldChange);

    switch (section.section_type) {
      case "education": {
        if (!entries.length) return null;
        const renderEntry = (entry: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(10 * sp), fontFamily: fontCSS, ...eb }} className="cv-entry">
            <div style={{ fontWeight: "bold", fontSize: 12, color: SIDEBAR_TEXT, fontFamily: fontCSS }}>
              <EditableText value={entry.degree} onCommit={(v) => setEntry(i, "degree", v)} />
            </div>
            <div style={{ fontSize: 11, color: SIDEBAR_TEXT, fontFamily: fontCSS }}>
              <EditableText value={entry.institution} onCommit={(v) => setEntry(i, "institution", v)} />
            </div>
            <div style={{ fontSize: 10.5, color: SIDEBAR_TEXT_MUTED, fontFamily: fontCSS, marginTop: 2 }}>
              <EditableText value={entry.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />
              {entry.start_date && entry.end_date ? " – " : ""}
              <EditableText value={entry.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />
            </div>
            {entry.score_type && entry.score_value && (
              <div style={{ fontSize: 10, color: SIDEBAR_TEXT_MUTED, fontFamily: fontCSS, marginTop: 1 }}>
                {entry.score_type}: <span style={{ fontWeight: 600, color: SIDEBAR_TEXT }}><EditableText value={entry.score_value} onCommit={(v) => setEntry(i, "score_value", v)} /></span>
              </div>
            )}
          </div>
        );
        return (
          <div>
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SidebarHeading section={section} title="Education" fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((entry: any, i: number) => renderEntry(entry, i + 1))}
          </div>
        );
      }

      case "skills":
      case "soft_skills":
        // Ignores skillStyle intentionally — SkillEntry.tsx hardcodes a dark
        // "#111827" text color internally with no override prop, which is
        // unreadable against the sidebar's solid accentColor fill. Same
        // rationale Corporate/Vega already document for their own sidebars:
        // a plain, light-colored bullet list instead.
        if (!entries.length) return null;
        return (
          <div>
            <SidebarHeading section={section} title={section.section_type === "skills" ? "Skills" : "Soft Skills"} fontFamily={fontCSS} />
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {entries.map((s: any, i: number) => (
                <li key={i} className="cv-entry" style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: Math.round(4 * sp), fontSize: 11.5, color: SIDEBAR_TEXT, fontFamily: fontCSS, ...eb }}>
                  <span style={{ color: SIDEBAR_BULLET, flexShrink: 0, fontSize: 8 }}>●</span>
                  <EditableText value={s.skill_name} onCommit={(v) => setEntry(i, "skill_name", v)} />
                </li>
              ))}
            </ul>
          </div>
        );

      case "certificates": {
        if (!entries.length) return null;
        const renderEntry = (c: any, i: number) => (
          <li key={i} style={{ display: "flex", gap: 6, marginBottom: Math.round(5 * sp), fontSize: 11.5, fontFamily: fontCSS, ...eb }} className="cv-entry">
            <span style={{ color: SIDEBAR_BULLET, flexShrink: 0, fontSize: 8, lineHeight: "1.6" }}>●</span>
            <span style={{ color: SIDEBAR_TEXT }}>
              {c.link ? (
                <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                  <EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} />
                </a>
              ) : (
                <EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} />
              )}
              {c.issuer && <span style={{ color: SIDEBAR_TEXT_MUTED }}> — <EditableText value={c.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></span>}
            </span>
          </li>
        );
        return (
          <div>
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SidebarHeading section={section} title="Certification" fontFamily={fontCSS} />
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {renderEntry(entries[0], 0)}
              </ul>
            </div>
            {entries.length > 1 && (
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {entries.slice(1).map((c: any, i: number) => renderEntry(c, i + 1))}
              </ul>
            )}
          </div>
        );
      }

      case "languages": {
        if (!entries.length) return null;
        const renderEntry = (l: any, i: number) => (
          <li key={i} className="cv-entry" style={{ ...eb, marginBottom: Math.round(4 * sp) }}>
            <span style={{ fontWeight: 600, color: SIDEBAR_TEXT, fontFamily: fontCSS }}><EditableText value={l.language} onCommit={(v) => setEntry(i, "language", v)} /></span>
            {l.level && <span style={{ color: SIDEBAR_TEXT_MUTED }}> ({<EditableText value={l.level} onCommit={(v) => setEntry(i, "level", v)} />})</span>}
          </li>
        );
        return (
          <div>
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SidebarHeading section={section} title="Languages" fontFamily={fontCSS} />
              <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 11.5, fontFamily: fontCSS }}>
                {renderEntry(entries[0], 0)}
              </ul>
            </div>
            {entries.length > 1 && (
              <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 11.5, fontFamily: fontCSS }}>
                {entries.slice(1).map((l: any, i: number) => renderEntry(l, i + 1))}
              </ul>
            )}
          </div>
        );
      }

      case "interests":
        if (!entries.length) return null;
        return (
          <div>
            <SidebarHeading section={section} title="Interests" fontFamily={fontCSS} />
            <div style={{ fontSize: 11.5, color: SIDEBAR_TEXT, fontFamily: fontCSS }}>
              {entries.map((item: any) => item.title).join(" · ")}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderMainSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];
    const setField = makeFieldSetter(section, onFieldChange);
    const setEntry = makeEntrySetter(section, onFieldChange);

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section">
            <SectionHeading section={section} title="Profile" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <EditableHtml html={d.summary} onCommit={(v) => setField("summary", v)} style={{ fontSize: 12, color: MID, textAlign: "justify", fontFamily: fontCSS }} />
          </div>
        );

      case "experience": {
        if (!entries.length) return null;
        const renderEntry = (entry: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(12 * sp), fontFamily: fontCSS, ...eb }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
              <div style={{ fontWeight: "bold", fontSize: 13, color: DARK, fontFamily: fontCSS }}>
                <EditableText value={entry.job_title} onCommit={(v) => setEntry(i, "job_title", v)} />
              </div>
              <div style={dateStyle}>
                <EditableText value={entry.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />
                {entry.start_date && (entry.end_date || entry.current) ? " – " : ""}
                {entry.current ? "Present" : <EditableText value={entry.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: MID, fontFamily: fontCSS, marginTop: 1 }}>
              {entry.employer_link ? (
                <a href={entry.employer_link.startsWith("http") ? entry.employer_link : `https://${entry.employer_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                  <EditableText value={entry.employer} onCommit={(v) => setEntry(i, "employer", v)} />
                </a>
              ) : (
                <EditableText value={entry.employer} onCommit={(v) => setEntry(i, "employer", v)} />
              )}
              {entry.location ? ` · ${entry.location}` : ""}
            </div>
            {entry.description && entry.description !== "<p></p>" ? (
              <EditableHtml html={entry.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 4, color: MID, fontFamily: fontCSS }} />
            ) : entry.bullets?.length > 0 ? (
              <ul style={{ margin: "4px 0 0 14px", padding: 0, listStyleType: "disc" }}>
                {entry.bullets.map((b: any, j: number) => b.text && <li key={j} style={{ fontSize: 12, marginBottom: 2, color: MID, fontFamily: fontCSS }}>{b.text}</li>)}
              </ul>
            ) : null}
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Work Experience" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((entry: any, i: number) => renderEntry(entry, i + 1))}
          </div>
        );
      }

      case "projects": {
        if (!entries.length) return null;
        const renderEntry = (p: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(8 * sp), fontFamily: fontCSS, ...eb }} className="cv-entry">
            <div style={{ fontWeight: "bold", fontSize: 12, color: DARK, fontFamily: fontCSS }}>
              {p.link ? <a href={p.link.startsWith("http") ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></a> : <EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} />}
            </div>
            {p.subtitle && <div style={{ fontSize: 11, color: LIGHT, fontStyle: "italic", fontFamily: fontCSS }}><EditableText value={p.subtitle} onCommit={(v) => setEntry(i, "subtitle", v)} /></div>}
            {p.description && p.description !== "<p></p>" && <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 2, color: MID, fontFamily: fontCSS }} />}
            {p.tech?.length > 0 && <div style={{ fontSize: 11, color: LIGHT, marginTop: 2, fontFamily: fontCSS }}>Technologies: {p.tech.join(", ")}</div>}
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Projects" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((p: any, i: number) => renderEntry(p, i + 1))}
          </div>
        );
      }

      case "courses": {
        if (!entries.length) return null;
        const renderEntry = (c: any, i: number) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
            <span>
              {c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b style={{ color: DARK }}><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b></a> : <b style={{ color: DARK }}><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b>}
              {c.institution ? <> — <EditableText value={c.institution} onCommit={(v) => setEntry(i, "institution", v)} /></> : ""}
            </span>
            <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={c.end_date || c.start_date} onCommit={(v) => setEntry(i, c.end_date ? "end_date" : "start_date", v)} /></span>
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Courses & Training" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((c: any, i: number) => renderEntry(c, i + 1))}
          </div>
        );
      }

      case "awards": {
        if (!entries.length) return null;
        const renderEntry = (a: any, i: number) => (
          <div key={i} style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span><b style={{ color: DARK }}><EditableText value={a.award_name} onCommit={(v) => setEntry(i, "award_name", v)} /></b>{a.issuer ? <> — <EditableText value={a.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></> : ""}</span>
              <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={a.date} onCommit={(v) => setEntry(i, "date", v)} /></span>
            </div>
            {a.description && a.description !== "<p></p>" && <EditableHtml html={a.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 1, color: MID, fontFamily: fontCSS }} />}
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Awards & Recognition" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((a: any, i: number) => renderEntry(a, i + 1))}
          </div>
        );
      }

      case "organizations": {
        if (!entries.length) return null;
        const renderEntry = (o: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(5 * sp), fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span><b style={{ color: DARK }}><EditableText value={o.name} onCommit={(v) => setEntry(i, "name", v)} /></b>{o.position ? <> — <EditableText value={o.position} onCommit={(v) => setEntry(i, "position", v)} /></> : ""}</span>
              <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}>
                <EditableText value={o.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />
                {o.start_date && (o.end_date || o.current_flag) ? " – " : ""}
                {o.current_flag ? "Present" : <EditableText value={o.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}
              </span>
            </div>
            {o.description && o.description !== "<p></p>" && <EditableHtml html={o.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 1, color: MID, fontFamily: fontCSS }} />}
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Memberships & Associations" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((o: any, i: number) => renderEntry(o, i + 1))}
          </div>
        );
      }

      case "publications": {
        if (!entries.length) return null;
        const renderEntry = (p: any, i: number) => (
          <div key={i} style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
            <b style={{ color: DARK }}><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></b>
            {p.publisher && <span style={{ color: LIGHT }}> · <EditableText value={p.publisher} onCommit={(v) => setEntry(i, "publisher", v)} /></span>}
            {p.date && <span style={{ color: LIGHT }}> (<EditableText value={p.date} onCommit={(v) => setEntry(i, "date", v)} />)</span>}
            {p.description && p.description !== "<p></p>" && <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 1, color: MID, fontFamily: fontCSS }} />}
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Publications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((p: any, i: number) => renderEntry(p, i + 1))}
          </div>
        );
      }

      case "declaration":
        if (!d.text || d.text === "<p></p>") return null;
        return (
          <div className="cv-section">
            <SectionHeading section={section} title="Declaration" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <EditableHtml html={d.text} onCommit={(v) => setField("text", v)} style={{ fontSize: 12, color: MID, lineHeight: 1.8, marginBottom: 8, fontFamily: fontCSS }} />
            <div style={{ display: "flex", gap: 32, fontSize: 12, fontFamily: fontCSS }}>
              {d.full_name && <span>Name: <b><EditableText value={d.full_name} onCommit={(v) => setField("full_name", v)} /></b></span>}
              {d.place && <span>Place: <b><EditableText value={d.place} onCommit={(v) => setField("place", v)} /></b></span>}
              {d.date && <span>Date: <b><EditableText value={d.date} onCommit={(v) => setField("date", v)} /></b></span>}
            </div>
            {d.signature && <div style={{ marginTop: 10, fontFamily: "'Dancing Script', cursive", fontSize: 16, color: accentColor }}><EditableText value={d.signature} onCommit={(v) => setField("signature", v)} /></div>}
          </div>
        );

      // References renders here, inside the main column, as a single-column
      // stacked list rather than the 2-column card grid every other
      // sidebar+main template (Portrait/Milestone/Corporate/Vega) uses full-
      // width for it. Deliberate for Aurora specifically: the main column
      // here is only ~490px wide (794px page − ~246px 31%-width sidebar −
      // padding), noticeably narrower than the ~700px+ full-page width those
      // other templates render References across. A 2-column grid at this
      // width would give each card only ~230px — tight for "Name, Job Title,
      // Organization, Phone:, Email:" without awkward wrapping — so a single
      // column reads more cleanly at this width instead of forcing the grid.
      case "references": {
        const entries = d.entries ?? [];
        if (!entries.length) return null;
        const setEntry = makeEntrySetter(section, onFieldChange);
        const renderEntry = (r: any, i: number) => (
          <div key={i} style={{ fontSize: 12, fontFamily: fontCSS, marginBottom: Math.round(10 * sp), ...eb }} className="cv-entry">
            <div style={{ fontWeight: "bold", color: DARK, fontFamily: fontCSS }}><EditableText value={r.name} onCommit={(v) => setEntry(i, "name", v)} /></div>
            {showDetails(r) ? (
              <>
                {(r.job_title || r.organization) && (
                  <div style={{ color: MID, fontFamily: fontCSS }}>
                    <EditableText value={r.job_title} onCommit={(v) => setEntry(i, "job_title", v)} />
                    {r.organization ? <>, <EditableText value={r.organization} onCommit={(v) => setEntry(i, "organization", v)} /></> : ""}
                  </div>
                )}
                {r.phone && <div style={{ color: LIGHT, fontFamily: fontCSS }}>Phone: <EditableText value={r.phone} onCommit={(v) => setEntry(i, "phone", v)} /></div>}
                {r.email && <div style={{ color: LIGHT, fontFamily: fontCSS }}>Email: <EditableText value={r.email} onCommit={(v) => setEntry(i, "email", v)} /></div>}
              </>
            ) : (
              <div style={{ color: LIGHT, fontStyle: "italic" }}>Available on request</div>
            )}
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Reference" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((r: any, i: number) => renderEntry(r, i + 1))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const sidebarContentPadTop = AURORA_PHOTO_TOP + AURORA_PHOTO_SIZE + Math.round(20 * sp);
  const mainPad = Math.round(28 * sp);

  return (
    <div className="aurora-outer" style={{ backgroundColor: "#fff", fontSize: 12, color: MID, lineHeight: 1.6, fontFamily: fontCSS, minHeight: "297mm" }}>
      <div style={{ display: "flex" }}>
        {/* LEFT: sidebar — two-tone (gray zone behind photo, then accentColor band) via a
            hard-stop CSS gradient. This is the non-paginated base render (thumbnails, the
            gallery iframe); CentrePanel.tsx/generate-pdf/route.ts paint an authoritative
            per-real-page band on top of this for the actual paginated preview/PDF (same
            approach as Modern's sidebar band), since neither Puppeteer's position:fixed nor
            a single continuous-flow background reliably tracks real page boundaries. */}
        <div
          className="aurora-sidebar"
          style={{
            width: "31%", flexShrink: 0, position: "relative",
            background: `linear-gradient(to bottom, ${AURORA_GRAY_ZONE_COLOR} 0px, ${AURORA_GRAY_ZONE_COLOR} ${AURORA_GRAY_ZONE_HEIGHT}px, ${accentColor} ${AURORA_GRAY_ZONE_HEIGHT}px, ${accentColor} 100%)`,
            // Carries the raw accentColor value as a CSS custom property so
            // generate-pdf/route.ts's Puppeteer script can read the exact hex
            // via getComputedStyle — a `background` gradient shorthand (unlike
            // a plain solid backgroundColor, which Modern's sidebar uses) can't
            // be read back as a single color from getComputedStyle().backgroundColor.
            ["--aurora-accent" as any]: accentColor,
          }}
        >
          {/* Photo — deliberately positioned so it straddles the gray/accent boundary
              (top portion sits against the gray zone, bottom portion against the accent
              band); the circle itself never changes color. */}
          {(personal.photo_base64 || personal.photo_url) && (
            <div style={{ position: "absolute", top: AURORA_PHOTO_TOP, left: "50%", transform: "translateX(-50%)", zIndex: 2 }}>
              <img src={personal.photo_base64 || personal.photo_url} alt="" style={getPhotoStyle(personal)} />
            </div>
          )}

          <div style={{ position: "relative", zIndex: 1, padding: `${sidebarContentPadTop}px 20px 20px` }}>
            <div style={{ marginBottom: 14 }}>
              <SidebarHeading section={personalSection} title="Contact" fontFamily={fontCSS} />
              <div style={{ fontSize: 11, color: SIDEBAR_TEXT, fontFamily: fontCSS, display: "flex", flexDirection: "column", gap: 6 }}>
                {contactItems.map((item, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center" }}>
                    {getContactIcon(item.type, SIDEBAR_TEXT)}
                    <a
                      href={item.type === "email" ? `mailto:${item.text}` : item.type === "phone" ? `tel:${item.text}` : item.text.startsWith("http") ? item.text : `https://${item.text}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      <EditableText value={item.text} onCommit={item.onCommit} />
                    </a>
                  </span>
                ))}
              </div>
            </div>

            {sidebarSections.map((section) => (
              <SortableSection key={section.id} section={section} defaultMarginBottom={14}>
                {renderSidebarSection(section)}
              </SortableSection>
            ))}
          </div>
        </div>

        {/* RIGHT: main column — name + accentColor title bar at the top (aligned with the
            sidebar's photo/gray-zone header), then the main-column sections below. */}
        <div className="aurora-main" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ paddingTop: AURORA_PHOTO_TOP, paddingLeft: 28, paddingRight: 28 }}>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: accentColor, fontFamily: fontCSS }}>
              <EditableText value={personal.full_name} onCommit={(v) => setPersonal("full_name", v)} placeholder="Your Name" />
            </div>
          </div>
          {personal.title && (
            <div style={{ backgroundColor: accentColor, marginTop: 10, padding: "9px 28px", fontSize: 11.5, color: "#ffffff", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" as const, fontFamily: fontCSS }}>
              <EditableText value={personal.title} onCommit={(v) => setPersonal("title", v)} />
            </div>
          )}

          <div style={{ padding: `${mainPad}px 28px 0` }}>
            {mainSections.map((section) => (
              <SortableSection key={section.id} section={section} defaultMarginBottom={Math.round(16 * sp)}>
                {renderMainSection(section)}
              </SortableSection>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
