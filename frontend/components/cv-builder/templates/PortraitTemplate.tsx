import React from "react";
import type { CVSection, CVCustomization } from "@/types";
import { DEFAULT_CUSTOMIZATION, FONT_CSS_MAP } from "@/types";
import { SectionHeading } from "../SectionHeading";
import { SkillEntry } from "./SkillEntry";
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

// Sections that live in the left column regardless of order. Exported so
// CentrePanel.tsx can tell sidebar sections apart from main-column ones when
// rendering the sidebar as its own independently-paginated overlay (see the
// isPortrait branch there) — the sidebar's own entries flow independently of
// the main column's page breaks, so CentrePanel needs to know which section
// ids belong to which column to keep each one's drag-target registration
// pointed at the correct (sidebar-overlay vs main-content) copy.
export const PORTRAIT_SIDEBAR_TYPES = new Set(["education", "skills", "soft_skills", "certificates", "languages", "interests"]);
const SIDEBAR_TYPES = PORTRAIT_SIDEBAR_TYPES;

const DARK = "#111827";
const MID = "#374151";
const LIGHT = "#6b7280";

function getPhotoStyle(personal: any, defaultSize = 92): React.CSSProperties {
  const size = personal.photo_size ?? defaultSize;
  const shape = personal.photo_shape ?? "square";
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "10px" : "0px";
  const clipPath = shape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : "none";
  return { width: size, height: size, borderRadius, clipPath, objectFit: "cover" as const, flexShrink: 0, display: "block" };
}

export function PortraitTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }: Props) {
  const { accentColor, fontFamily, spacing, headingStyle, skillStyle = "classic" } = customization;
  const fontCSS = FONT_CSS_MAP[fontFamily] ?? "Arial, Helvetica, sans-serif";
  const sp = spacing === "compact" ? 0.75 : spacing === "spacious" ? 1.35 : 1.0;
  const eb: React.CSSProperties = { pageBreakInside: "avoid", breakInside: "avoid" };
  const { onFieldChange } = useCVEdit();

  const personal = get(sections, "personal_details");
  const personalSection = sections.find((s) => s.section_type === "personal_details");
  const setPersonal = personalSection ? makeFieldSetter(personalSection, onFieldChange) : () => {};
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) => (r.privacy ? r.privacy === "show" : r.show_on_cv !== false);

  const fullName: string = personal.full_name || "";
  const splitAt = fullName.lastIndexOf(" ");
  const firstPart = splitAt === -1 ? fullName : fullName.slice(0, splitAt);
  const lastPart = splitAt === -1 ? "" : fullName.slice(splitAt + 1);

  const dateStyle: React.CSSProperties = { fontSize: 11, color: LIGHT, fontFamily: fontCSS };

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
            <div style={{ fontWeight: "bold", fontSize: 12, color: DARK, fontFamily: fontCSS }}>
              <EditableText value={entry.institution} onCommit={(v) => setEntry(i, "institution", v)} />
            </div>
            <div style={{ fontSize: 11, color: MID, fontFamily: fontCSS }}>
              <EditableText value={entry.degree} onCommit={(v) => setEntry(i, "degree", v)} />
            </div>
            <div style={{ ...dateStyle, marginTop: 2 }}>
              <EditableText value={entry.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />
              {entry.start_date && entry.end_date ? " – " : ""}
              <EditableText value={entry.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />
            </div>
            {entry.score_type && entry.score_value && (
              <div style={{ fontSize: 10, color: LIGHT, fontFamily: fontCSS, marginTop: 1 }}>
                {entry.score_type}: <span style={{ fontWeight: 600, color: MID }}><EditableText value={entry.score_value} onCommit={(v) => setEntry(i, "score_value", v)} /></span>
              </div>
            )}
          </div>
        );
        return (
          <div>
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Education" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((entry: any, i: number) => renderEntry(entry, i + 1))}
          </div>
        );
      }

      case "skills":
      case "soft_skills":
        if (!entries.length) return null;
        return (
          <div>
            <SectionHeading section={section} title={section.section_type === "skills" ? "Skills" : "Soft Skills"} accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "flex", flexDirection: "column", gap: Math.round(6 * sp) }}>
              {entries.map((s: any, i: number) => (
                <div key={i} className="cv-entry" style={{ fontFamily: fontCSS, ...eb }}>
                  <SkillEntry skillName={s.skill_name} level={s.level} skillStyle={skillStyle ?? "classic"} accentColor={accentColor} fontFamily={fontCSS} onNameCommit={(v) => setEntry(i, "skill_name", v)} />
                </div>
              ))}
            </div>
          </div>
        );

      case "certificates": {
        if (!entries.length) return null;
        const renderEntry = (c: any, i: number) => (
          <li key={i} style={{ display: "flex", gap: 6, marginBottom: Math.round(6 * sp), fontSize: 11.5, fontFamily: fontCSS, ...eb }} className="cv-entry">
            <span style={{ color: MID, flexShrink: 0 }}>•</span>
            <span style={{ color: MID }}>
              {c.link ? (
                <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                  <EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} />
                </a>
              ) : (
                <EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} />
              )}
              {c.issuer && <span style={{ color: LIGHT }}> — <EditableText value={c.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></span>}
            </span>
          </li>
        );
        return (
          <div>
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Certification" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
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
          <div key={i} className="cv-entry" style={{ ...eb }}>
            <span style={{ fontWeight: 600, color: DARK }}><EditableText value={l.language} onCommit={(v) => setEntry(i, "language", v)} /></span>
            {l.level && <span style={{ color: LIGHT }}> — <EditableText value={l.level} onCommit={(v) => setEntry(i, "level", v)} /></span>}
          </div>
        );
        return (
          <div>
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Languages" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11.5, fontFamily: fontCSS }}>
                {renderEntry(entries[0], 0)}
              </div>
            </div>
            {entries.length > 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11.5, fontFamily: fontCSS }}>
                {entries.slice(1).map((l: any, i: number) => renderEntry(l, i + 1))}
              </div>
            )}
          </div>
        );
      }

      case "interests":
        if (!entries.length) return null;
        return (
          <div>
            <SectionHeading section={section} title="Personal Interests" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ fontSize: 11.5, color: MID, fontFamily: fontCSS }}>
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
            <SectionHeading section={section} title="Summary" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <EditableHtml html={d.summary} onCommit={(v) => setField("summary", v)} style={{ fontSize: 12, color: MID, textAlign: "justify", fontFamily: fontCSS }} />
          </div>
        );

      case "experience": {
        if (!entries.length) return null;
        const renderEntry = (entry: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(12 * sp), fontFamily: fontCSS, ...eb }} className="cv-entry">
            <div style={{ fontWeight: "bold", fontSize: 13, color: DARK, fontFamily: fontCSS }}>
              <EditableText value={entry.job_title} onCommit={(v) => setEntry(i, "job_title", v)} />
              {entry.employer && (
                <>
                  {", "}
                  {entry.employer_link ? (
                    <a href={entry.employer_link.startsWith("http") ? entry.employer_link : `https://${entry.employer_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                      <EditableText value={entry.employer} onCommit={(v) => setEntry(i, "employer", v)} />
                    </a>
                  ) : (
                    <EditableText value={entry.employer} onCommit={(v) => setEntry(i, "employer", v)} />
                  )}
                </>
              )}
            </div>
            <div style={{ ...dateStyle, marginTop: 1 }}>
              <EditableText value={entry.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />
              {entry.start_date && (entry.end_date || entry.current) ? " – " : ""}
              {entry.current ? "Present" : <EditableText value={entry.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}
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
            <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b style={{ color: DARK }}><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b></a> : <b style={{ color: DARK }}><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b>}{c.institution ? <> — <EditableText value={c.institution} onCommit={(v) => setEntry(i, "institution", v)} /></> : ""}</span>
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
              <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={o.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{o.start_date && (o.end_date || o.current_flag) ? " – " : ""}{o.current_flag ? "Present" : <EditableText value={o.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}</span>
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
            <b style={{ color: DARK }}><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></b>{p.publisher && <span style={{ color: LIGHT }}> · <EditableText value={p.publisher} onCommit={(v) => setEntry(i, "publisher", v)} /></span>}{p.date && <span style={{ color: LIGHT }}> (<EditableText value={p.date} onCommit={(v) => setEntry(i, "date", v)} />)</span>}
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

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading section={section} title="References" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
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
              ))}
            </div>
          </div>
        );

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

      default:
        return null;
    }
  };

  const headerPad = Math.round(28 * sp);
  const bodyPad = Math.round(22 * sp);

  return (
    <div className="portrait-outer" style={{ backgroundColor: "#fff", fontSize: 12, color: MID, lineHeight: 1.6, fontFamily: fontCSS, minHeight: "297mm" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: `${headerPad}px 32px 18px` }}>
        {(personal.photo_base64 || personal.photo_url) && (
          <div style={{ padding: 5, border: `2px solid ${accentColor}`, flexShrink: 0 }}>
            <img src={personal.photo_base64 || personal.photo_url} alt="" style={getPhotoStyle(personal, 92)} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", lineHeight: 1.15, color: DARK, fontFamily: fontCSS }}>
            <EditableText value={firstPart} onCommit={(v) => setPersonal("full_name", lastPart ? `${v} ${lastPart}` : v)} placeholder="Your Name" />
            {lastPart && <> <EditableText value={lastPart} onCommit={(v) => setPersonal("full_name", `${firstPart} ${v}`)} style={{ color: accentColor }} /></>}
          </div>
          {personal.title && (
            <div style={{ fontSize: 13, color: LIGHT, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 5, fontFamily: fontCSS }}>
              <EditableText value={personal.title} onCommit={(v) => setPersonal("title", v)} />
            </div>
          )}
        </div>
      </div>

      <div style={{ borderBottom: `1.5px solid ${DARK}`, margin: "0 32px" }} />

      <div style={{ display: "flex", padding: `${bodyPad}px 32px`, gap: 24 }}>
        <div className="portrait-sidebar" style={{ width: "34%", flexShrink: 0, paddingRight: 22, borderRight: "1px solid #d1d5db" }}>
          <div style={{ marginBottom: 14 }}>
            <SectionHeading section={personalSection} title="Contact" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ fontSize: 11.5, color: MID, fontFamily: fontCSS, display: "flex", flexDirection: "column", gap: 4 }}>
              {personal.location && <span><EditableText value={personal.location} onCommit={(v) => setPersonal("location", v)} /></span>}
              {personal.phone && <span><a href={`tel:${personal.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.phone} onCommit={(v) => setPersonal("phone", v)} /></a></span>}
              {personal.email && <span><a href={`mailto:${personal.email}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.email} onCommit={(v) => setPersonal("email", v)} /></a></span>}
              {links.map((l: any, i: number) => l.url && (
                <span key={i}>
                  <a href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                    <EditableText value={l.url} onCommit={(v) => setPersonal("links", links.map((x: any, xi: number) => (xi === i ? { ...x, url: v } : x)))} />
                  </a>
                </span>
              ))}
              {personal.nationality && <span>Nationality: <EditableText value={personal.nationality} onCommit={(v) => setPersonal("nationality", v)} /></span>}
              {personal.visa_status && <span>Visa: <EditableText value={personal.visa_status} onCommit={(v) => setPersonal("visa_status", v)} /></span>}
            </div>
          </div>

          {sidebarSections.map((section) => (
            <SortableSection key={section.id} section={section} defaultMarginBottom={14}>
              {renderSidebarSection(section)}
            </SortableSection>
          ))}
        </div>

        <div className="portrait-main" style={{ flex: 1, minWidth: 0 }}>
          {mainSections.map((section) => (
            <SortableSection key={section.id} section={section} defaultMarginBottom={Math.round(16 * sp)}>
              {renderMainSection(section)}
            </SortableSection>
          ))}
        </div>
      </div>
    </div>
  );
}
