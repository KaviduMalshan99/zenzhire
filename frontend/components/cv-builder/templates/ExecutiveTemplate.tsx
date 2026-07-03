import React from "react";
import type { CVSection, CVCustomization, SectionLayout } from "@/types";
import { DEFAULT_CUSTOMIZATION, FONT_CSS_MAP } from "@/types";
import { HtmlContent } from "./HtmlContent";
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

function getPhotoStyle(personal: any, defaultSize = 80): React.CSSProperties {
  const size = personal.photo_size ?? defaultSize;
  const shape = personal.photo_shape ?? "circle";
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "12px" : "0px";
  const clipPath = shape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : "none";
  return { width: size, height: size, borderRadius, clipPath, objectFit: "cover" as const, flexShrink: 0 };
}

export function ExecutiveTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }: Props) {
  const { accentColor, fontFamily, spacing, headerStyle, headingStyle, skillStyle = "classic", skillColumns = 2 } = customization;
  const fontCSS = FONT_CSS_MAP[fontFamily] ?? "Georgia, 'Times New Roman', serif";
  const sp = spacing === "compact" ? 0.75 : spacing === "spacious" ? 1.35 : 1.0;
  const mb = Math.round(14 * sp);
  const eb: React.CSSProperties = { pageBreakInside: "avoid", breakInside: "avoid" };
  const { onFieldChange } = useCVEdit();

  const personal = get(sections, "personal_details");
  const personalSection = sections.find((s) => s.section_type === "personal_details");
  const setPersonal = personalSection ? makeFieldSetter(personalSection, onFieldChange) : () => {};
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) =>
    r.privacy ? r.privacy === "show" : r.show_on_cv !== false;

  const DARK = "#1c1c1c";
  const dateStyle: React.CSSProperties = { fontSize: 11, color: "#777", fontStyle: "italic", whiteSpace: "nowrap", flexShrink: 0, fontFamily: fontCSS };

  const renderSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];
    const layout: SectionLayout = d._layout ?? {};
    const setField = makeFieldSetter(section, onFieldChange);
    const setEntry = makeEntrySetter(section, onFieldChange);

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Executive Summary" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <EditableHtml html={d.summary} onCommit={(v) => setField("summary", v)} style={{ fontSize: 12, color: "#333", marginBottom: 4, fontStyle: "italic", textAlign: "justify", fontFamily: fontCSS }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Professional Experience" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((e: any, i: number) => (
              <div key={i} style={{ marginBottom: mb, ...eb }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 14, color: DARK, fontFamily: fontCSS }}><EditableText value={e.job_title} onCommit={(v) => setEntry(i, "job_title", v)} /></div>
                  <div style={dateStyle}><EditableText value={e.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{e.start_date && (e.end_date || e.current) ? " – " : ""}{e.current ? "Present" : <EditableText value={e.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}</div>
                </div>
                <div style={{ fontSize: 12, color: accentColor, fontWeight: "bold", fontFamily: fontCSS }}>{e.employer_link ? <a href={e.employer_link.startsWith("http") ? e.employer_link : `https://${e.employer_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={e.employer} onCommit={(v) => setEntry(i, "employer", v)} /></a> : <EditableText value={e.employer} onCommit={(v) => setEntry(i, "employer", v)} />}{e.location ? ` · ${e.location}` : ""}</div>
                {e.description && e.description !== "<p></p>" ? (
                  <EditableHtml html={e.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 3, color: "#333", fontFamily: fontCSS }} />
                ) : e.bullets?.length > 0 ? (
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    {e.bullets.map((b: any, j: number) => b.text && <li key={j} style={{ fontSize: 12, marginBottom: 2, color: "#333", fontFamily: fontCSS }}>{b.text}</li>)}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        );

      case "education":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Education" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((e: any, i: number) => (
              <div key={i} style={{ marginBottom: Math.round(7 * sp), ...eb }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, fontFamily: fontCSS }}><EditableText value={e.degree} onCommit={(v) => setEntry(i, "degree", v)} /></div>
                  <div style={dateStyle}><EditableText value={e.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{e.start_date && e.end_date ? " – " : ""}<EditableText value={e.end_date} onCommit={(v) => setEntry(i, "end_date", v)} /></div>
                </div>
                <div style={{ fontSize: 12, color: accentColor, fontFamily: fontCSS }}>{e.institution_link ? <a href={e.institution_link.startsWith("http") ? e.institution_link : `https://${e.institution_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={e.institution} onCommit={(v) => setEntry(i, "institution", v)} /></a> : <EditableText value={e.institution} onCommit={(v) => setEntry(i, "institution", v)} />}{e.location ? ` · ${e.location}` : ""}</div>
                {e.score_type && e.score_value && (
                  <div style={{ fontSize: 11, color: "#6b7280", fontFamily: fontCSS, marginTop: 1 }}>
                    {e.score_type}:{" "}<span style={{ fontWeight: 600, color: "#374151" }}><EditableText value={e.score_value} onCommit={(v) => setEntry(i, "score_value", v)} /></span>
                  </div>
                )}
                {e.description && e.description !== "<p></p>" && <EditableHtml html={e.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 2, fontStyle: "italic", fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "skills":
      case "soft_skills": {
        if (!entries.length) return null;
        const cols = skillColumns ?? 2;
        const gridCols = cols === 1 ? "1fr" : cols === 3 ? "1fr 1fr 1fr" : "1fr 1fr";
        const finalCols = gridCols;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title={section.section_type === "skills" ? "Technical Skills" : "Soft Skills"} accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: finalCols, gap: `${Math.round(8 * sp)}px ${Math.round(20 * sp)}px` }}>
              {entries.map((s: any, i: number) => (
                <div key={i} className="cv-entry" style={{ ...eb, fontFamily: fontCSS }}>
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
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Languages" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "flex", gap: "6px 24px", flexWrap: "wrap" }}>
              {entries.map((l: any, i: number) => (
                <span key={i} style={{ fontSize: 12, fontFamily: fontCSS }}><span style={{ fontWeight: "bold" }}><EditableText value={l.language} onCommit={(v) => setEntry(i, "language", v)} /></span>{l.level && <span style={{ color: "#777" }}> — <EditableText value={l.level} onCommit={(v) => setEntry(i, "level", v)} /></span>}</span>
              ))}
            </div>
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Key Projects & Initiatives" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: Math.round(6 * sp), ...eb, fontFamily: fontCSS }} className="cv-entry">
                <div style={{ fontWeight: "bold", fontSize: 12, fontFamily: fontCSS }}>{p.link ? <a href={p.link.startsWith("http") ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></a> : <EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} />}{p.subtitle && <span style={{ fontWeight: "normal", color: "#777", fontSize: 11 }}> — <EditableText value={p.subtitle} onCommit={(v) => setEntry(i, "subtitle", v)} /></span>}</div>
                {p.description && p.description !== "<p></p>" && <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 2, color: "#444", fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "certificates":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Certifications & Licences" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b></a> : <b><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b>}{c.issuer ? <> — <EditableText value={c.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></> : ""}</span>
                <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}>{c.no_expiry ? <><EditableText value={c.date} onCommit={(v) => setEntry(i, "date", v)} /> (No expiry)</> : <EditableText value={c.date} onCommit={(v) => setEntry(i, "date", v)} />}</span>
              </div>
            ))}
          </div>
        );

      case "awards":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Awards & Recognition" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((a: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b><EditableText value={a.award_name} onCommit={(v) => setEntry(i, "award_name", v)} /></b>{a.issuer ? <> — <EditableText value={a.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></> : ""}</span>
                  <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={a.date} onCommit={(v) => setEntry(i, "date", v)} /></span>
                </div>
                {a.description && a.description !== "<p></p>" && <EditableHtml html={a.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 1, color: "#555", fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "courses":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Courses & Training" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b></a> : <b><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b>}{c.institution ? <> — <EditableText value={c.institution} onCommit={(v) => setEntry(i, "institution", v)} /></> : ""}</span>
                <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={c.end_date || c.start_date} onCommit={(v) => setEntry(i, c.end_date ? "end_date" : "start_date", v)} /></span>
              </div>
            ))}
          </div>
        );

      case "publications":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Publications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                <span><b><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></b></span>{p.publisher && <span style={{ color: "#777" }}> · <EditableText value={p.publisher} onCommit={(v) => setEntry(i, "publisher", v)} /></span>}{p.date && <span style={{ color: "#999" }}> (<EditableText value={p.date} onCommit={(v) => setEntry(i, "date", v)} />)</span>}
                {p.description && p.description !== "<p></p>" && <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 1, color: "#555", fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Board & Committee Memberships" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((o: any, i: number) => (
              <div key={i} style={{ marginBottom: 5, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b><EditableText value={o.name} onCommit={(v) => setEntry(i, "name", v)} /></b>{o.position ? <> — <EditableText value={o.position} onCommit={(v) => setEntry(i, "position", v)} /></> : ""}</span>
                  <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={o.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{o.start_date && (o.end_date || o.current_flag) ? " – " : ""}{o.current_flag ? "Present" : <EditableText value={o.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}</span>
                </div>
                {o.description && o.description !== "<p></p>" && <EditableHtml html={o.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 1, color: "#555", fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Interests" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ fontSize: 12, fontFamily: fontCSS }}>{entries.map((item: any) => item.title).join(" · ")}</div>
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="References" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                  <div style={{ fontWeight: "bold" }}><EditableText value={r.name} onCommit={(v) => setEntry(i, "name", v)} /></div>
                  {showDetails(r) ? (
                    <>{r.job_title && <div style={{ color: "#555" }}><EditableText value={r.job_title} onCommit={(v) => setEntry(i, "job_title", v)} />{r.organization ? <> · <EditableText value={r.organization} onCommit={(v) => setEntry(i, "organization", v)} /></> : ""}</div>}{r.email && <div><EditableText value={r.email} onCommit={(v) => setEntry(i, "email", v)} /></div>}</>
                  ) : <div style={{ color: "#999", fontStyle: "italic" }}>Available on request</div>}
                </div>
              ))}
            </div>
          </div>
        );

      case "declaration":
        if (!d.text || d.text === "<p></p>") return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Declaration" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <EditableHtml html={d.text} onCommit={(v) => setField("text", v)} style={{ fontSize: 12, color: "#555", fontStyle: "italic", marginBottom: 8, fontFamily: fontCSS }} />
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

  return (
    <div style={{ padding: "20px 30px", fontSize: 12, color: DARK, lineHeight: 1.6, fontFamily: fontCSS, backgroundColor: "#ffffff" }}>
      {/* Header */}
      {headerStyle === "centered" ? (
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          {(personal.photo_base64 || personal.photo_url) && (
            <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ ...getPhotoStyle(personal, 70), marginBottom: 8, border: `2px solid ${accentColor}` }} />
          )}
          <div style={{ fontSize: 28, fontWeight: "bold", color: DARK, letterSpacing: "0.02em", lineHeight: 1.1, fontFamily: fontCSS }}><EditableText value={personal.full_name} onCommit={(v) => setPersonal("full_name", v)} placeholder="Your Name" /></div>
          {personal.title && <div style={{ fontSize: 14, color: accentColor, marginTop: 3, fontWeight: "normal", letterSpacing: "0.05em", fontFamily: fontCSS }}><EditableText value={personal.title} onCommit={(v) => setPersonal("title", v)} /></div>}
          <div style={{ fontSize: 11, color: "#555", marginTop: 6, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 16px", fontFamily: fontCSS }}>
            {personal.email && <span><a href={`mailto:${personal.email}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.email} onCommit={(v) => setPersonal("email", v)} /></a></span>}{personal.phone && <span><a href={`tel:${personal.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.phone} onCommit={(v) => setPersonal("phone", v)} /></a></span>}{personal.location && <span><EditableText value={personal.location} onCommit={(v) => setPersonal("location", v)} /></span>}
            {links.map((l: any, i: number) => l.url && <span key={i}><a href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={l.url} onCommit={(v) => setPersonal("links", links.map((x: any, xi: number) => (xi === i ? { ...x, url: v } : x)))} /></a></span>)}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            {(personal.photo_base64 || personal.photo_url) && (
              <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ ...getPhotoStyle(personal, 70), marginBottom: 8, border: `2px solid ${accentColor}` }} />
            )}
            <div style={{ fontSize: 28, fontWeight: "bold", color: DARK, letterSpacing: "0.02em", lineHeight: 1.1, fontFamily: fontCSS }}><EditableText value={personal.full_name} onCommit={(v) => setPersonal("full_name", v)} placeholder="Your Name" /></div>
            {personal.title && <div style={{ fontSize: 14, color: accentColor, marginTop: 3, fontWeight: "normal", letterSpacing: "0.05em", fontFamily: fontCSS }}><EditableText value={personal.title} onCommit={(v) => setPersonal("title", v)} /></div>}
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#555", lineHeight: 2, flexShrink: 0, maxWidth: 220, fontFamily: fontCSS }}>
            {personal.email && <div><a href={`mailto:${personal.email}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.email} onCommit={(v) => setPersonal("email", v)} /></a></div>}{personal.phone && <div><a href={`tel:${personal.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.phone} onCommit={(v) => setPersonal("phone", v)} /></a></div>}{personal.location && <div><EditableText value={personal.location} onCommit={(v) => setPersonal("location", v)} /></div>}
            {personal.nationality && <div><EditableText value={personal.nationality} onCommit={(v) => setPersonal("nationality", v)} /></div>}{personal.visa_status && <div>Visa: <EditableText value={personal.visa_status} onCommit={(v) => setPersonal("visa_status", v)} /></div>}
            {links.map((l: any, i: number) => l.url && <div key={i}><a href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={l.url} onCommit={(v) => setPersonal("links", links.map((x: any, xi: number) => (xi === i ? { ...x, url: v } : x)))} /></a></div>)}
          </div>
        </div>
      )}
      <div style={{ height: 2, background: `linear-gradient(to right, ${accentColor}, transparent)`, marginBottom: Math.round(14 * sp) }} />

      {sections.map((section) =>
        section.section_type !== "personal_details" ? (
          <SortableSection key={section.id} section={section} defaultMarginBottom={mb}>
            {renderSection(section)}
          </SortableSection>
        ) : null
      )}
    </div>
  );
}
