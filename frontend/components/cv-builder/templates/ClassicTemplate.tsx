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

const dateStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#374151",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

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

export function ClassicTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }: Props) {
  const { accentColor, fontFamily, spacing, headerStyle, headingStyle, skillStyle = "classic", skillColumns = 2 } = customization;
  const fontCSS = FONT_CSS_MAP[fontFamily] ?? "Arial, Helvetica, sans-serif";
  const sp = spacing === "compact" ? 0.50 : spacing === "spacious" ? 0.72 : 0.60;
  const { onFieldChange } = useCVEdit();

  const personal = get(sections, "personal_details");
  const personalSection = sections.find((s) => s.section_type === "personal_details");
  const setPersonal = personalSection ? makeFieldSetter(personalSection, onFieldChange) : () => {};
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) =>
    r.privacy ? r.privacy === "show" : r.show_on_cv !== false;

  const contactItems: { type: string; text: string; onCommit: (v: string) => void }[] = [];
  if (personal.email) contactItems.push({ type: "email", text: personal.email, onCommit: (v) => setPersonal("email", v) });
  if (personal.phone) contactItems.push({ type: "phone", text: personal.phone, onCommit: (v) => setPersonal("phone", v) });
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

  const headerAlign =
    headerStyle === "left" ? "left" : headerStyle === "twocolumn" ? undefined : "center";

  const renderSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];
    const layout: SectionLayout = d._layout ?? {};
    const mb = layout.marginBottom ?? Math.round(14 * sp);
    const entryMb = Math.round(14 * sp);
    const setField = makeFieldSetter(section, onFieldChange);
    const setEntry = makeEntrySetter(section, onFieldChange);

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Profile Summary" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <EditableHtml html={d.summary} onCommit={(v) => setField("summary", v)} style={{ fontSize: 12, color: "#333", textAlign: "justify", fontFamily: fontCSS }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Experience" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((entry: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: entryMb }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 14.5, color: "#111827", fontFamily: fontCSS }}>
                    <EditableText value={entry.job_title} onCommit={(v) => setEntry(i, "job_title", v)} />
                  </div>
                  <div style={dateStyle}>
                    <EditableText value={entry.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />
                    {entry.start_date && (entry.end_date || entry.current) ? " – " : ""}
                    {entry.current ? "Present" : <EditableText value={entry.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "#374151", fontStyle: "italic", fontFamily: fontCSS }}>
                  {entry.employer_link ? <a href={entry.employer_link.startsWith("http") ? entry.employer_link : `https://${entry.employer_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={entry.employer} onCommit={(v) => setEntry(i, "employer", v)} /></a> : <EditableText value={entry.employer} onCommit={(v) => setEntry(i, "employer", v)} />}{entry.location ? ` · ${entry.location}` : ""}
                </div>
                {entry.description && entry.description !== "<p></p>" ? (
                  <EditableHtml html={entry.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 3, fontFamily: fontCSS }} />
                ) : entry.bullets?.length > 0 ? (
                  <ul style={{ margin: "2px 0 2px 14px", padding: 0, listStyleType: "disc" }}>
                    {entry.bullets.map((b: any, j: number) =>
                      b.text && <li key={j} style={{ fontSize: 12, marginBottom: 1, fontFamily: fontCSS }}>{b.text}</li>
                    )}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        );

      case "education":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Education" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((entry: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: entryMb }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 15, color: "#111827", fontFamily: fontCSS }}>
                    <EditableText value={entry.degree} onCommit={(v) => setEntry(i, "degree", v)} />
                  </div>
                  <div style={dateStyle}>
                    <EditableText value={entry.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{entry.start_date && entry.end_date ? " – " : ""}<EditableText value={entry.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "#374151", fontStyle: "italic", fontFamily: fontCSS }}>
                  {entry.institution_link ? <a href={entry.institution_link.startsWith("http") ? entry.institution_link : `https://${entry.institution_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={entry.institution} onCommit={(v) => setEntry(i, "institution", v)} /></a> : <EditableText value={entry.institution} onCommit={(v) => setEntry(i, "institution", v)} />}{entry.location ? ` · ${entry.location}` : ""}
                </div>
                {entry.score_type && entry.score_value && (
                  <div style={{ fontSize: 11, color: "#6b7280", fontFamily: fontCSS, marginTop: 1 }}>
                    {entry.score_type}:{" "}<span style={{ fontWeight: 600, color: "#374151" }}><EditableText value={entry.score_value} onCommit={(v) => setEntry(i, "score_value", v)} /></span>
                  </div>
                )}
                {entry.description && entry.description !== "<p></p>" && (
                  <EditableHtml html={entry.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 2, color: "#444", fontFamily: fontCSS }} />
                )}
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
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title={section.section_type === "skills" ? "Technical Skills" : "Soft Skills"} accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: finalCols, gap: `${Math.round(8 * sp)}px ${Math.round(20 * sp)}px` }}>
              {entries.map((s: any, i: number) => (
                <div key={i} className="cv-entry" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
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
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Languages" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
              {entries.map((l: any, i: number) => (
                <span key={i} style={{ fontSize: 12, color: "#333", fontFamily: fontCSS }}>
                  <span style={{ fontWeight: 700 }}><EditableText value={l.language} onCommit={(v) => setEntry(i, "language", v)} /></span>
                  {l.level && <span style={{ color: "#888" }}> · <EditableText value={l.level} onCommit={(v) => setEntry(i, "level", v)} /></span>}
                </span>
              ))}
            </div>
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Projects" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((p: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: entryMb }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontWeight: "bold", fontSize: 15, color: "#111827", fontFamily: fontCSS }}>{p.link ? <a href={p.link.startsWith("http") ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></a> : <EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} />}</span>
                  {(p.start_date || p.end_date) && (
                    <span style={dateStyle}>
                      <EditableText value={p.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{p.start_date && p.end_date ? " – " : ""}<EditableText value={p.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />
                    </span>
                  )}
                </div>
                {p.subtitle && <div style={{ fontSize: 12, fontStyle: "italic", color: "#374151", fontFamily: fontCSS }}><EditableText value={p.subtitle} onCommit={(v) => setEntry(i, "subtitle", v)} /></div>}
                {p.description && p.description !== "<p></p>" && (
                  <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 2, fontFamily: fontCSS }} />
                )}
                {p.tech?.length > 0 && (
                  <div style={{ fontSize: 11, color: "#111827", marginTop: 2, fontFamily: fontCSS }}>Tech: {p.tech.join(", ")}</div>
                )}
              </div>
            ))}
          </div>
        );

      case "certificates":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Certifications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((c: any, i: number) => (
              <div key={i} className="cv-entry" style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 12, fontFamily: fontCSS }}>
                <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b></a> : <b><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b>}{c.issuer ? <> — <EditableText value={c.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></> : ""}</span>
                <span style={{ color: "#374151", whiteSpace: "nowrap", flexShrink: 0 }}>{c.no_expiry ? <><EditableText value={c.date} onCommit={(v) => setEntry(i, "date", v)} /> (No expiry)</> : <EditableText value={c.date} onCommit={(v) => setEntry(i, "date", v)} />}</span>
              </div>
            ))}
          </div>
        );

      case "awards":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Awards & Achievements" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((a: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 6, fontSize: 12, fontFamily: fontCSS }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b><EditableText value={a.award_name} onCommit={(v) => setEntry(i, "award_name", v)} /></b>{a.issuer ? <> — <EditableText value={a.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></> : ""}</span>
                  <span style={{ color: "#374151", whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={a.date} onCommit={(v) => setEntry(i, "date", v)} /></span>
                </div>
                {a.description && a.description !== "<p></p>" && (
                  <EditableHtml html={a.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 1, color: "#444", fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "courses":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Courses & Training" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((c: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12, fontFamily: fontCSS }}>
                  <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b></a> : <b><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b>}{c.institution ? <> — <EditableText value={c.institution} onCommit={(v) => setEntry(i, "institution", v)} /></> : ""}</span>
                  <span style={{ color: "#374151", whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={c.end_date || c.start_date} onCommit={(v) => setEntry(i, c.end_date ? "end_date" : "start_date", v)} /></span>
                </div>
                {c.description && c.description !== "<p></p>" && (
                  <EditableHtml html={c.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, color: "#444", marginTop: 1, fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "publications":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Publications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((p: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS }}>
                <span>
                  <b><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></b>
                  {p.publisher ? <> — <EditableText value={p.publisher} onCommit={(v) => setEntry(i, "publisher", v)} /></> : ""}
                  {p.date ? <> (<EditableText value={p.date} onCommit={(v) => setEntry(i, "date", v)} />)</> : ""}
                </span>
                {p.description && p.description !== "<p></p>" && (
                  <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ marginTop: 1, color: "#444", fontSize: 11, fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Organizations & Volunteering" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((o: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b><EditableText value={o.name} onCommit={(v) => setEntry(i, "name", v)} /></b>{o.position ? <> — <EditableText value={o.position} onCommit={(v) => setEntry(i, "position", v)} /></> : ""}</span>
                  <span style={{ color: "#374151", whiteSpace: "nowrap", flexShrink: 0 }}>
                    <EditableText value={o.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />
                    {o.start_date && (o.end_date || o.current_flag) ? " – " : ""}
                    {o.current_flag ? "Present" : <EditableText value={o.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}
                  </span>
                </div>
                {o.description && o.description !== "<p></p>" && (
                  <EditableHtml html={o.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 1, color: "#444", fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Interests" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 12, fontFamily: fontCSS }}>
              {entries.map((item: any, i: number) => (
                <EditableText key={i} value={item.title} onCommit={(v) => setEntry(i, "title", v)} />
              ))}
            </div>
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="References" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} className="cv-entry" style={{ fontSize: 12, marginBottom: 4, fontFamily: fontCSS }}>
                  <div style={{ fontWeight: "bold" }}><EditableText value={r.name} onCommit={(v) => setEntry(i, "name", v)} /></div>
                  {showDetails(r) ? (
                    <>
                      {r.job_title && <div style={{ color: "#555" }}><EditableText value={r.job_title} onCommit={(v) => setEntry(i, "job_title", v)} />{r.organization ? <> · <EditableText value={r.organization} onCommit={(v) => setEntry(i, "organization", v)} /></> : ""}</div>}
                      {r.email && <div><EditableText value={r.email} onCommit={(v) => setEntry(i, "email", v)} /></div>}
                      {r.phone && <div><EditableText value={r.phone} onCommit={(v) => setEntry(i, "phone", v)} /></div>}
                    </>
                  ) : (
                    <div style={{ color: "#666", fontStyle: "italic" }}>Available on request</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "declaration":
        if (!d.text || d.text === "<p></p>") return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb, lineHeight: layout.lineHeight }}>
            <SectionHeading section={section} title="Declaration" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <EditableHtml html={d.text} onCommit={(v) => setField("text", v)} style={{ fontSize: 12, color: "#444", marginBottom: 8, fontFamily: fontCSS }} />
            {d.signature && (
              <div style={{ marginTop: 24, fontFamily: "'Dancing Script', cursive", fontSize: 24, color: "#374151", borderBottom: "1px solid #ccc", paddingBottom: 4, display: "inline-block" }}>
                <EditableText value={d.signature} onCommit={(v) => setField("signature", v)} />
              </div>
            )}
            <div style={{ display: "flex", gap: 40, marginTop: d.signature ? 8 : 0 }}>
              {d.full_name && <div style={{ fontSize: 12, fontFamily: fontCSS }}>Name: <b><EditableText value={d.full_name} onCommit={(v) => setField("full_name", v)} /></b></div>}
              {d.place && <div style={{ fontSize: 12, fontFamily: fontCSS }}>Place: <b><EditableText value={d.place} onCommit={(v) => setField("place", v)} /></b></div>}
              {d.date && <div style={{ fontSize: 12, fontFamily: fontCSS }}>Date: <b><EditableText value={d.date} onCommit={(v) => setField("date", v)} /></b></div>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const pad = 28;
  const padX = 32;

  return (
    <div
      style={{
        padding: `${pad}px ${padX}px`,
        fontFamily: fontCSS,
        fontSize: 12,
        color: "#1a1a1a",
        lineHeight: 1.5,
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      {headerStyle === "twocolumn" ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 20 }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: "bold", color: "#111827", letterSpacing: "0.02em", fontFamily: fontCSS }}>
              <EditableText value={personal.full_name} onCommit={(v) => setPersonal("full_name", v)} placeholder="Your Name" />
            </div>
            {personal.title && (
              <div style={{ fontSize: 15, color: "#374151", marginTop: 2, fontFamily: fontCSS }}><EditableText value={personal.title} onCommit={(v) => setPersonal("title", v)} /></div>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: "#444", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
            {contactItems.map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                {getContactIcon(item.type, "#444")}
                <a href={item.type === "email" ? `mailto:${item.text}` : item.type === "phone" ? `tel:${item.text}` : item.text.startsWith("http") ? item.text : `https://${item.text}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={item.text} onCommit={item.onCommit} /></a>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: headerAlign, marginBottom: 14 }}>
          <div style={{ fontSize: 30, fontWeight: "bold", color: "#111827", letterSpacing: "0.02em", fontFamily: fontCSS }}>
            <EditableText value={personal.full_name} onCommit={(v) => setPersonal("full_name", v)} placeholder="Your Name" />
          </div>
          {personal.title && (
            <div style={{ fontSize: 15, color: "#374151", marginTop: 2, fontFamily: fontCSS }}><EditableText value={personal.title} onCommit={(v) => setPersonal("title", v)} /></div>
          )}
          <div style={{ fontSize: 11.5, color: "#444", marginTop: 6, display: "flex", justifyContent: headerStyle === "left" ? "flex-start" : "center", flexWrap: "wrap", gap: "4px 14px", fontFamily: fontCSS, alignItems: "center" }}>
            {contactItems.map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                {getContactIcon(item.type, "#444")}
                <a href={item.type === "email" ? `mailto:${item.text}` : item.type === "phone" ? `tel:${item.text}` : item.text.startsWith("http") ? item.text : `https://${item.text}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={item.text} onCommit={item.onCommit} /></a>
              </span>
            ))}
          </div>
          {(personal.nationality || personal.visa_status || personal.gender) && (
            <div style={{ fontSize: 10, color: "#888", marginTop: 3, display: "flex", justifyContent: headerStyle === "left" ? "flex-start" : "center", flexWrap: "wrap", gap: "0 14px", fontFamily: fontCSS }}>
              {personal.nationality && <span>Nationality: <EditableText value={personal.nationality} onCommit={(v) => setPersonal("nationality", v)} /></span>}
              {personal.visa_status && <span>Visa: <EditableText value={personal.visa_status} onCommit={(v) => setPersonal("visa_status", v)} /></span>}
              {personal.gender && <span>Gender: <EditableText value={personal.gender} onCommit={(v) => setPersonal("gender", v)} /></span>}
            </div>
          )}
        </div>
      )}
      <div style={{ borderTop: "2px solid #374151", marginBottom: Math.round(14 * sp) }} />

      {/* Sections */}
      {sections.map((section) =>
        section.section_type !== "personal_details" ? (
          <SortableSection key={section.id} section={section} defaultMarginBottom={Math.round(14 * sp)}>
            {renderSection(section)}
          </SortableSection>
        ) : null
      )}
    </div>
  );
}
