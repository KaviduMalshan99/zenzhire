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

const MID = "#374151";
const LIGHT = "#6b7280";

function getPhotoStyle(personal: any, defaultSize = 80): React.CSSProperties {
  const size = personal.photo_size ?? defaultSize;
  const shape = personal.photo_shape ?? "circle";
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "12px" : "0px";
  const clipPath = shape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : "none";
  return { width: size, height: size, borderRadius, clipPath, objectFit: "cover" as const, flexShrink: 0 };
}

export function GCCTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }: Props) {
  const { accentColor, fontFamily, spacing, headingStyle, skillStyle = "classic", skillColumns = 2 } = customization;
  const fontCSS = FONT_CSS_MAP[fontFamily] ?? "Arial, Helvetica, sans-serif";
  const sp = spacing === "compact" ? 0.75 : spacing === "spacious" ? 1.35 : 1.0;
  const mb = Math.round(10 * sp);
  const eb: React.CSSProperties = { pageBreakInside: "avoid", breakInside: "avoid" };
  const { onFieldChange } = useCVEdit();

  const personal = get(sections, "personal_details");
  const personalSection = sections.find((s) => s.section_type === "personal_details");
  const setPersonal = personalSection ? makeFieldSetter(personalSection, onFieldChange) : () => {};
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) => r.privacy ? r.privacy === "show" : r.show_on_cv !== false;

  const dateStyle: React.CSSProperties = { fontSize: 11, color: LIGHT, whiteSpace: "nowrap", flexShrink: 0, fontFamily: fontCSS };

  const renderSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];
    const setField = makeFieldSetter(section, onFieldChange);
    const setEntry = makeEntrySetter(section, onFieldChange);

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section">
            <SectionHeading section={section} title="Career Objective" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <EditableHtml html={d.summary} onCommit={(v) => setField("summary", v)} style={{ fontSize: 12, color: MID, marginBottom: 4, textAlign: "justify", fontFamily: fontCSS }} />
          </div>
        );

      case "experience": {
        if (!entries.length) return null;
        const renderEntry = (entry: any, i: number) => (
          <div key={i} style={{ marginBottom: mb, fontFamily: fontCSS, ...eb }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
              <div style={{ fontWeight: "bold", fontSize: 13, color: accentColor, fontFamily: fontCSS }}><EditableText value={entry.job_title} onCommit={(v) => setEntry(i, "job_title", v)} /></div>
              <div style={dateStyle}><EditableText value={entry.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{entry.start_date && (entry.end_date || entry.current) ? " – " : ""}{entry.current ? "Present" : <EditableText value={entry.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: "bold", fontFamily: fontCSS, color: MID }}>{entry.employer_link ? <a href={entry.employer_link.startsWith("http") ? entry.employer_link : `https://${entry.employer_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={entry.employer} onCommit={(v) => setEntry(i, "employer", v)} /></a> : <EditableText value={entry.employer} onCommit={(v) => setEntry(i, "employer", v)} />}{entry.location ? ` · ${entry.location}` : ""}</div>
            {entry.description && entry.description !== "<p></p>" ? (
              <EditableHtml html={entry.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 3, color: MID, fontFamily: fontCSS }} />
            ) : entry.bullets?.length > 0 ? (
              <ul style={{ margin: "3px 0 0 14px", padding: 0, listStyleType: "disc" }}>
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

      case "education": {
        if (!entries.length) return null;
        const renderEntry = (entry: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(7 * sp), fontFamily: fontCSS, ...eb }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div style={{ fontWeight: "bold", fontSize: 13, color: accentColor, fontFamily: fontCSS }}><EditableText value={entry.degree} onCommit={(v) => setEntry(i, "degree", v)} /></div>
              <div style={dateStyle}><EditableText value={entry.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{entry.start_date && entry.end_date ? " – " : ""}<EditableText value={entry.end_date} onCommit={(v) => setEntry(i, "end_date", v)} /></div>
            </div>
            <div style={{ fontSize: 12, fontFamily: fontCSS, color: MID }}>{entry.institution_link ? <a href={entry.institution_link.startsWith("http") ? entry.institution_link : `https://${entry.institution_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={entry.institution} onCommit={(v) => setEntry(i, "institution", v)} /></a> : <EditableText value={entry.institution} onCommit={(v) => setEntry(i, "institution", v)} />}{entry.location ? ` · ${entry.location}` : ""}</div>
            {entry.score_type && entry.score_value && (
              <div style={{ fontSize: 11, color: "#6b7280", fontFamily: fontCSS, marginTop: 1 }}>
                {entry.score_type}:{" "}<span style={{ fontWeight: 600, color: MID }}><EditableText value={entry.score_value} onCommit={(v) => setEntry(i, "score_value", v)} /></span>
              </div>
            )}
            {entry.description && entry.description !== "<p></p>" && <EditableHtml html={entry.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 2, color: MID, fontFamily: fontCSS }} />}
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Education & Qualifications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((entry: any, i: number) => renderEntry(entry, i + 1))}
          </div>
        );
      }

      case "skills":
      case "soft_skills": {
        if (!entries.length) return null;
        const cols = skillColumns ?? 2;
        const gridCols = cols === 1 ? "1fr" : cols === 3 ? "1fr 1fr 1fr" : "1fr 1fr";
        const finalCols = gridCols;
        return (
          <div className="cv-section">
            <SectionHeading section={section} title={section.section_type === "skills" ? "Technical Skills" : "Soft Skills"} accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: finalCols, gap: `${Math.round(8 * sp)}px ${Math.round(20 * sp)}px` }}>
              {entries.map((s: any, i: number) => (
                <div key={i} className="cv-entry" style={{ fontFamily: fontCSS, ...eb }}>
                  <SkillEntry skillName={s.skill_name} level={s.level} skillStyle={skillStyle ?? "classic"} accentColor={accentColor} fontFamily={fontCSS} onNameCommit={(v) => setEntry(i, "skill_name", v)} />
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "languages":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading section={section} title="Languages" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
              {entries.map((l: any, i: number) => (
                <span key={i} style={{ fontSize: 12, fontFamily: fontCSS }}><b><EditableText value={l.language} onCommit={(v) => setEntry(i, "language", v)} /></b>{l.level && <span style={{ color: LIGHT }}> — <EditableText value={l.level} onCommit={(v) => setEntry(i, "level", v)} /></span>}</span>
              ))}
            </div>
          </div>
        );

      case "projects": {
        if (!entries.length) return null;
        const renderEntry = (p: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(6 * sp), fontFamily: fontCSS, ...eb }} className="cv-entry">
            <div style={{ fontWeight: "bold", fontSize: 12, color: accentColor, fontFamily: fontCSS }}>{p.link ? <a href={p.link.startsWith("http") ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></a> : <EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} />}</div>
            {p.subtitle && <div style={{ fontSize: 11, color: LIGHT, fontStyle: "italic", fontFamily: fontCSS }}><EditableText value={p.subtitle} onCommit={(v) => setEntry(i, "subtitle", v)} /></div>}
            {p.description && p.description !== "<p></p>" && <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 2, color: MID, fontFamily: fontCSS }} />}
            {p.tech?.length > 0 && <div style={{ fontSize: 11, color: MID, marginTop: 1, fontFamily: fontCSS }}>Technologies: {p.tech.join(", ")}</div>}
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

      case "certificates": {
        if (!entries.length) return null;
        const renderEntry = (c: any, i: number) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
            <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b></a> : <b><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b>}{c.issuer ? <> — <EditableText value={c.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></> : ""}</span>
            <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}>{c.no_expiry ? <><EditableText value={c.date} onCommit={(v) => setEntry(i, "date", v)} /> (No expiry)</> : <EditableText value={c.date} onCommit={(v) => setEntry(i, "date", v)} />}</span>
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Certifications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
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
              <span><b><EditableText value={a.award_name} onCommit={(v) => setEntry(i, "award_name", v)} /></b>{a.issuer ? <> — <EditableText value={a.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></> : ""}</span>
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

      case "courses": {
        if (!entries.length) return null;
        const renderEntry = (c: any, i: number) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
            <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b></a> : <b><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b>}{c.institution ? <> — <EditableText value={c.institution} onCommit={(v) => setEntry(i, "institution", v)} /></> : ""}</span>
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

      case "organizations": {
        if (!entries.length) return null;
        const renderEntry = (o: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(5 * sp), fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span><b><EditableText value={o.name} onCommit={(v) => setEntry(i, "name", v)} /></b>{o.position ? <> — <EditableText value={o.position} onCommit={(v) => setEntry(i, "position", v)} /></> : ""}</span>
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

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading section={section} title="Personal Interests" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ fontSize: 12, fontFamily: fontCSS }}>{entries.map((item: any) => item.title).join(" · ")}</div>
          </div>
        );

      case "publications": {
        if (!entries.length) return null;
        const renderEntry = (p: any, i: number) => (
          <div key={i} style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
            <b><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></b>{p.publisher && <span style={{ color: LIGHT }}> · <EditableText value={p.publisher} onCommit={(v) => setEntry(i, "publisher", v)} /></span>}{p.date && <span style={{ color: LIGHT }}> (<EditableText value={p.date} onCommit={(v) => setEntry(i, "date", v)} />)</span>}
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
                  <div style={{ fontWeight: "bold", color: accentColor, fontFamily: fontCSS }}><EditableText value={r.name} onCommit={(v) => setEntry(i, "name", v)} /></div>
                  {showDetails(r) ? (
                    <>{r.job_title && <div style={{ color: MID, fontFamily: fontCSS }}><EditableText value={r.job_title} onCommit={(v) => setEntry(i, "job_title", v)} />{r.organization ? <>, <EditableText value={r.organization} onCommit={(v) => setEntry(i, "organization", v)} /></> : ""}</div>}{r.email && <div style={{ fontFamily: fontCSS }}><EditableText value={r.email} onCommit={(v) => setEntry(i, "email", v)} /></div>}{r.phone && <div style={{ fontFamily: fontCSS }}><EditableText value={r.phone} onCommit={(v) => setEntry(i, "phone", v)} /></div>}</>
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
            <div style={{ border: "1px solid #d1d9e0", borderRadius: 4, padding: "10px 14px", backgroundColor: "#fafbfc" }}>
              <EditableHtml html={d.text} onCommit={(v) => setField("text", v)} style={{ fontSize: 12, color: MID, lineHeight: 1.8, marginBottom: 8, fontFamily: fontCSS }} />
              <div style={{ display: "flex", gap: 32, fontSize: 12, fontFamily: fontCSS }}>
                {d.full_name && <span>Name: <b><EditableText value={d.full_name} onCommit={(v) => setField("full_name", v)} /></b></span>}
                {d.place && <span>Place: <b><EditableText value={d.place} onCommit={(v) => setField("place", v)} /></b></span>}
                {d.date && <span>Date: <b><EditableText value={d.date} onCommit={(v) => setField("date", v)} /></b></span>}
              </div>
              {d.signature && <div style={{ marginTop: 10, fontFamily: "'Dancing Script', cursive", fontSize: 16, color: accentColor }}><EditableText value={d.signature} onCommit={(v) => setField("signature", v)} /></div>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const headerPad = Math.round(20 * sp);

  const badgeStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 4,
    padding: "3px 10px",
    fontSize: 10,
    fontFamily: fontCSS,
    display: "inline-flex",
    alignItems: "center",
    height: 22,
    whiteSpace: "nowrap",
    lineHeight: 1,
  };

  return (
    <div style={{ paddingBottom: Math.round(24 * sp), fontSize: 12, color: MID, lineHeight: 1.6, fontFamily: fontCSS }}>
      <div style={{ backgroundColor: accentColor, padding: `${headerPad}px 16px`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff", letterSpacing: "0.01em", lineHeight: 1.2, fontFamily: fontCSS }}><EditableText value={personal.full_name} onCommit={(v) => setPersonal("full_name", v)} placeholder="Your Name" /></div>
          {personal.title && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4, letterSpacing: "0.03em", fontFamily: fontCSS }}><EditableText value={personal.title} onCommit={(v) => setPersonal("title", v)} /></div>}
          <div style={{ marginTop: Math.round(6 * sp), display: "flex", flexWrap: "wrap", gap: "6px 8px", alignItems: "center" }}>
            {personal.nationality && <span style={badgeStyle}>Nationality: <EditableText value={personal.nationality} onCommit={(v) => setPersonal("nationality", v)} /></span>}
            {personal.visa_status && <span style={badgeStyle}>Visa: <EditableText value={personal.visa_status} onCommit={(v) => setPersonal("visa_status", v)} /></span>}
            {personal.date_of_birth && <span style={badgeStyle}>DOB: <EditableText value={personal.date_of_birth} onCommit={(v) => setPersonal("date_of_birth", v)} /></span>}
            {personal.gender && <span style={badgeStyle}>Gender: <EditableText value={personal.gender} onCommit={(v) => setPersonal("gender", v)} /></span>}
            {personal.marital_status && <span style={badgeStyle}>Marital: <EditableText value={personal.marital_status} onCommit={(v) => setPersonal("marital_status", v)} /></span>}
            {personal.religion && <span style={badgeStyle}>Religion: <EditableText value={personal.religion} onCommit={(v) => setPersonal("religion", v)} /></span>}
            {personal.nic && <span style={badgeStyle}>NIC: <EditableText value={personal.nic} onCommit={(v) => setPersonal("nic", v)} /></span>}
            {personal.driving_license && <span style={badgeStyle}>License: <EditableText value={personal.driving_license} onCommit={(v) => setPersonal("driving_license", v)} /></span>}
          </div>
        </div>
        {(personal.photo_base64 || personal.photo_url) && (
          <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ ...getPhotoStyle(personal, 80), border: "3px solid rgba(255,255,255,0.6)", marginLeft: 20 }} />
        )}
      </div>

      <div style={{ backgroundColor: "#f0f4f8", borderBottom: "1px solid #dde3ea", padding: `${Math.round(8 * sp)}px 16px`, display: "flex", flexWrap: "wrap", gap: "4px 20px", fontSize: 10, color: LIGHT, fontFamily: fontCSS }}>
        {personal.email && <span><a href={`mailto:${personal.email}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.email} onCommit={(v) => setPersonal("email", v)} /></a></span>}
        {personal.phone && <span><a href={`tel:${personal.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.phone} onCommit={(v) => setPersonal("phone", v)} /></a></span>}
        {personal.location && <span><EditableText value={personal.location} onCommit={(v) => setPersonal("location", v)} /></span>}
        {links.map((l: any, i: number) => l.url && <span key={i}><a href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={l.url} onCommit={(v) => setPersonal("links", links.map((x: any, xi: number) => (xi === i ? { ...x, url: v } : x)))} /></a></span>)}
      </div>

      <div style={{ padding: `0 16px` }}>
        {sections.map((section) =>
          section.section_type !== "personal_details" ? (
            <SortableSection key={section.id} section={section} defaultMarginBottom={mb}>
              {renderSection(section)}
            </SortableSection>
          ) : null
        )}
      </div>
    </div>
  );
}
