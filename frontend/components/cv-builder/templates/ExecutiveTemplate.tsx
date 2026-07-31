import React from "react";
import type { CVSection, CVCustomization } from "@/types";
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

function getContactIcon(type: string, fill: string): React.ReactNode {
  const s: React.CSSProperties = { display: "inline-block", verticalAlign: "middle", marginRight: 4 };
  switch (type) {
    case "email":
      return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
    case "phone":
      return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
    case "location":
      return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
    case "linkedin":
      return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>;
    case "github":
      return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>;
    default:
      return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
  }
}

function linkIconType(l: any): string {
  const lp = (l.platform ?? "").toLowerCase();
  return lp.includes("linkedin") ? "linkedin" : lp.includes("github") ? "github" : "website";
}

export function ExecutiveTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }: Props) {
  const { accentColor, fontFamily, lineHeight, sectionSpacing, headerStyle, headingStyle, skillStyle = "classic", skillColumns = 2 } = customization;
  const fontCSS = FONT_CSS_MAP[fontFamily] ?? "Georgia, 'Times New Roman', serif";
  // Derived from sectionSpacing (real audited default 14), replacing the old
  // compact/normal/spacious multiplier -- every Math.round(N * sp) formula
  // below still scales proportionally off the single sectionSpacing scalar.
  const sp = sectionSpacing / 14;
  const mb = sectionSpacing;
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
    const setField = makeFieldSetter(section, onFieldChange);
    const setEntry = makeEntrySetter(section, onFieldChange);

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section">
            <SectionHeading section={section} title="Executive Summary" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <EditableHtml html={d.summary} onCommit={(v) => setField("summary", v)} style={{ fontSize: 12, color: "#333", marginBottom: 4, fontStyle: "italic", textAlign: "justify", fontFamily: fontCSS, lineHeight }} />
          </div>
        );

      case "experience": {
        if (!entries.length) return null;
        const renderEntry = (e: any, i: number) => (
          <div key={i} style={{ marginBottom: mb, ...eb }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
              <div style={{ fontWeight: "bold", fontSize: 14, color: DARK, fontFamily: fontCSS }}><EditableText value={e.job_title} onCommit={(v) => setEntry(i, "job_title", v)} /></div>
              <div style={dateStyle}><EditableText value={e.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{e.start_date && (e.end_date || e.current) ? " – " : ""}{e.current ? "Present" : <EditableText value={e.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}</div>
            </div>
            <div style={{ fontSize: 12, color: accentColor, fontWeight: "bold", fontFamily: fontCSS }}>{e.employer_link ? <a href={e.employer_link.startsWith("http") ? e.employer_link : `https://${e.employer_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={e.employer} onCommit={(v) => setEntry(i, "employer", v)} /></a> : <EditableText value={e.employer} onCommit={(v) => setEntry(i, "employer", v)} />}{e.location ? ` · ${e.location}` : ""}</div>
            {e.description && e.description !== "<p></p>" ? (
              <EditableHtml html={e.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 3, color: "#333", fontFamily: fontCSS, lineHeight }} />
            ) : e.bullets?.length > 0 ? (
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                {e.bullets.map((b: any, j: number) => b.text && <li key={j} style={{ fontSize: 12, marginBottom: 2, color: "#333", fontFamily: fontCSS, lineHeight }}>{b.text}</li>)}
              </ul>
            ) : null}
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Professional Experience" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((e: any, i: number) => renderEntry(e, i + 1))}
          </div>
        );
      }

      case "education": {
        if (!entries.length) return null;
        const renderEntry = (e: any, i: number) => (
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
            {e.description && e.description !== "<p></p>" && <EditableHtml html={e.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 2, fontStyle: "italic", fontFamily: fontCSS, lineHeight }} />}
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Education" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((e: any, i: number) => renderEntry(e, i + 1))}
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
          <div className="cv-section">
            <SectionHeading section={section} title="Languages" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "flex", gap: "6px 24px", flexWrap: "wrap" }}>
              {entries.map((l: any, i: number) => (
                <span key={i} style={{ fontSize: 12, fontFamily: fontCSS }}><span style={{ fontWeight: "bold" }}><EditableText value={l.language} onCommit={(v) => setEntry(i, "language", v)} /></span>{l.level && <span style={{ color: "#777" }}> — <EditableText value={l.level} onCommit={(v) => setEntry(i, "level", v)} /></span>}</span>
              ))}
            </div>
          </div>
        );

      case "projects": {
        if (!entries.length) return null;
        const renderEntry = (p: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(6 * sp), ...eb, fontFamily: fontCSS }} className="cv-entry">
            <div style={{ fontWeight: "bold", fontSize: 12, fontFamily: fontCSS }}>{p.link ? <a href={p.link.startsWith("http") ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></a> : <EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} />}{p.subtitle && <span style={{ fontWeight: "normal", color: "#777", fontSize: 11 }}> — <EditableText value={p.subtitle} onCommit={(v) => setEntry(i, "subtitle", v)} /></span>}</div>
            {p.description && p.description !== "<p></p>" && <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 2, color: "#444", fontFamily: fontCSS, lineHeight }} />}
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Key Projects & Initiatives" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((p: any, i: number) => renderEntry(p, i + 1))}
          </div>
        );
      }

      case "certificates": {
        if (!entries.length) return null;
        const renderEntry = (c: any, i: number) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
            <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b></a> : <b><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b>}{c.issuer ? <> — <EditableText value={c.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></> : ""}</span>
            <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}>{c.no_expiry ? <><EditableText value={c.date} onCommit={(v) => setEntry(i, "date", v)} /> (No expiry)</> : <EditableText value={c.date} onCommit={(v) => setEntry(i, "date", v)} />}</span>
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Certifications & Licences" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((c: any, i: number) => renderEntry(c, i + 1))}
          </div>
        );
      }

      case "awards": {
        if (!entries.length) return null;
        const renderEntry = (a: any, i: number) => (
          <div key={i} style={{ marginBottom: 4, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span><b><EditableText value={a.award_name} onCommit={(v) => setEntry(i, "award_name", v)} /></b>{a.issuer ? <> — <EditableText value={a.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></> : ""}</span>
              <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={a.date} onCommit={(v) => setEntry(i, "date", v)} /></span>
            </div>
            {a.description && a.description !== "<p></p>" && <EditableHtml html={a.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 1, color: "#555", fontFamily: fontCSS, lineHeight }} />}
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
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
            <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b></a> : <b><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b>}{c.institution ? <> — <EditableText value={c.institution} onCommit={(v) => setEntry(i, "institution", v)} /></> : ""}</span>
            <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={c.end_date || c.start_date} onCommit={(v) => setEntry(i, c.end_date ? "end_date" : "start_date", v)} /></span>
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

      case "publications": {
        if (!entries.length) return null;
        const renderEntry = (p: any, i: number) => (
          <div key={i} style={{ marginBottom: 4, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
            <span><b><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></b></span>{p.publisher && <span style={{ color: "#777" }}> · <EditableText value={p.publisher} onCommit={(v) => setEntry(i, "publisher", v)} /></span>}{p.date && <span style={{ color: "#999" }}> (<EditableText value={p.date} onCommit={(v) => setEntry(i, "date", v)} />)</span>}
            {p.description && p.description !== "<p></p>" && <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 1, color: "#555", fontFamily: fontCSS, lineHeight }} />}
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

      case "organizations": {
        if (!entries.length) return null;
        const renderEntry = (o: any, i: number) => (
          <div key={i} style={{ marginBottom: 5, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span><b><EditableText value={o.name} onCommit={(v) => setEntry(i, "name", v)} /></b>{o.position ? <> — <EditableText value={o.position} onCommit={(v) => setEntry(i, "position", v)} /></> : ""}</span>
              <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={o.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{o.start_date && (o.end_date || o.current_flag) ? " – " : ""}{o.current_flag ? "Present" : <EditableText value={o.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}</span>
            </div>
            {o.description && o.description !== "<p></p>" && <EditableHtml html={o.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 1, color: "#555", fontFamily: fontCSS, lineHeight }} />}
          </div>
        );
        return (
          <div className="cv-section">
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Board & Committee Memberships" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
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
            <SectionHeading section={section} title="Interests" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ fontSize: 12, fontFamily: fontCSS }}>{entries.map((item: any) => item.title).join(" · ")}</div>
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
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
          <div className="cv-section">
            <SectionHeading section={section} title="Declaration" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <EditableHtml html={d.text} onCommit={(v) => setField("text", v)} style={{ fontSize: 12, color: "#555", fontStyle: "italic", marginBottom: 8, fontFamily: fontCSS, lineHeight }} />
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
            <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ ...getPhotoStyle(personal, 70), display: "block", margin: "0 auto 8px", border: `2px solid ${accentColor}` }} />
          )}
          <div style={{ fontSize: 28, fontWeight: "bold", color: DARK, letterSpacing: "0.02em", lineHeight: 1.1, fontFamily: fontCSS }}><EditableText value={personal.full_name} onCommit={(v) => setPersonal("full_name", v)} placeholder="Your Name" /></div>
          {personal.title && <div style={{ fontSize: 14, color: accentColor, marginTop: 3, fontWeight: "normal", letterSpacing: "0.05em", fontFamily: fontCSS }}><EditableText value={personal.title} onCommit={(v) => setPersonal("title", v)} /></div>}
          <div style={{ fontSize: 11, color: "#555", marginTop: 6, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 16px", fontFamily: fontCSS }}>
            {personal.email && <span style={{ display: "inline-flex", alignItems: "center" }}>{getContactIcon("email", "#555")}<a href={`mailto:${personal.email}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.email} onCommit={(v) => setPersonal("email", v)} /></a></span>}{personal.phone && <span style={{ display: "inline-flex", alignItems: "center" }}>{getContactIcon("phone", "#555")}<a href={`tel:${personal.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.phone} onCommit={(v) => setPersonal("phone", v)} /></a></span>}{personal.location && <span style={{ display: "inline-flex", alignItems: "center" }}>{getContactIcon("location", "#555")}<EditableText value={personal.location} onCommit={(v) => setPersonal("location", v)} /></span>}
            {links.map((l: any, i: number) => l.url && <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>{getContactIcon(linkIconType(l), "#555")}<a href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={l.url} onCommit={(v) => setPersonal("links", links.map((x: any, xi: number) => (xi === i ? { ...x, url: v } : x)))} /></a></span>)}
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
            {personal.email && <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>{getContactIcon("email", "#555")}<a href={`mailto:${personal.email}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.email} onCommit={(v) => setPersonal("email", v)} /></a></div>}{personal.phone && <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>{getContactIcon("phone", "#555")}<a href={`tel:${personal.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.phone} onCommit={(v) => setPersonal("phone", v)} /></a></div>}{personal.location && <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>{getContactIcon("location", "#555")}<EditableText value={personal.location} onCommit={(v) => setPersonal("location", v)} /></div>}
            {personal.nationality && <div><EditableText value={personal.nationality} onCommit={(v) => setPersonal("nationality", v)} /></div>}{personal.visa_status && <div>Visa: <EditableText value={personal.visa_status} onCommit={(v) => setPersonal("visa_status", v)} /></div>}
            {links.map((l: any, i: number) => l.url && <div key={i} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>{getContactIcon(linkIconType(l), "#555")}<a href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={l.url} onCommit={(v) => setPersonal("links", links.map((x: any, xi: number) => (xi === i ? { ...x, url: v } : x)))} /></a></div>)}
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
