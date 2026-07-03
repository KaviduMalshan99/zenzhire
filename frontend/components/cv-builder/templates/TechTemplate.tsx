import React from "react";
import type { CVSection, CVCustomization, SectionLayout } from "@/types";
import { DEFAULT_CUSTOMIZATION, FONT_CSS_MAP } from "@/types";
import { HtmlContent } from "./HtmlContent";
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

function levelToPercent(level: string): string {
  const l = (level ?? "").toLowerCase();
  if (l.includes("native")) return "100%";
  if (l.includes("fluent") || l === "c2") return "90%";
  if (l === "c1") return "80%";
  if (l.includes("professional") || l === "b2") return "70%";
  if (l === "b1") return "60%";
  if (l === "a2") return "40%";
  if (l.includes("basic") || l === "a1") return "25%";
  return "60%";
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

const SECTION_ICONS: Record<string, string> = {
  profile_summary: "❋",
  experience: "◈",
  education: "✦",
  skills: "◉",
  soft_skills: "♥",
  languages: "◎",
  projects: "◆",
  certificates: "★",
  awards: "✧",
  courses: "▸",
  publications: "⊕",
  organizations: "⊞",
  interests: "♦",
  references: "◇",
  declaration: "◻",
};

interface SHProps { title: string; stype: string; section?: CVSection; accent: string; font: string; sp: number }
function SH({ title, stype, section, accent, font, sp }: SHProps) {
  const { onFieldChange } = useCVEdit();
  const icon = SECTION_ICONS[stype] || "•";
  const displayTitle = section?.data?._title || title;
  const titleNode = section ? (
    <EditableText value={displayTitle} onCommit={(v) => onFieldChange(section, { ...section.data, _title: v })} placeholder={title} />
  ) : (
    displayTitle
  );
  return (
    <div className="cv-section-header" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: Math.round(20 * sp), marginBottom: 14 }}>
      <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 12px", backgroundColor: accent + "15", borderRadius: 20, border: `1px solid ${accent}40` }}>
        <span style={{ color: accent, fontSize: 12 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: accent, fontFamily: font }}>{titleNode}</span>
      </div>
      <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
    </div>
  );
}

function getPhotoStyle(personal: any, defaultSize = 80): React.CSSProperties {
  const size = personal.photo_size ?? defaultSize;
  const shape = personal.photo_shape ?? "circle";
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "12px" : "0px";
  const clipPath = shape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : "none";
  return { width: size, height: size, borderRadius, clipPath, objectFit: "cover" as const, flexShrink: 0 };
}

export function TechTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }: Props) {
  const { accentColor, fontFamily, spacing, skillStyle = "classic", skillColumns = 2 } = customization;
  const fontCSS = FONT_CSS_MAP[fontFamily] ?? "Arial, Helvetica, sans-serif";
  const sp = spacing === "compact" ? 0.75 : spacing === "spacious" ? 1.35 : 1.0;
  const eb: React.CSSProperties = { pageBreakInside: "avoid", breakInside: "avoid" };
  const { onFieldChange } = useCVEdit();

  const personal = get(sections, "personal_details");
  const personalSection = sections.find((s) => s.section_type === "personal_details");
  const setPersonal = personalSection ? makeFieldSetter(personalSection, onFieldChange) : () => {};
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) => r.privacy ? r.privacy === "show" : r.show_on_cv !== false;
  const hasPhoto = !!(personal.photo_base64 || personal.photo_url);

  const contactItems: { type: string; text: string; onCommit: (v: string) => void }[] = [];
  if (personal.email) contactItems.push({ type: "email", text: personal.email, onCommit: (v) => setPersonal("email", v) });
  if (personal.phone) contactItems.push({ type: "phone", text: personal.phone, onCommit: (v) => setPersonal("phone", v) });
  if (personal.location) contactItems.push({ type: "location", text: personal.location, onCommit: (v) => setPersonal("location", v) });
  if (personal.nationality) contactItems.push({ type: "nationality", text: personal.nationality, onCommit: (v) => setPersonal("nationality", v) });
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

  const sh = (title: string, stype: string, section?: CVSection) => (
    <SH title={title} stype={stype} section={section} accent={accentColor} font={fontCSS} sp={sp} />
  );

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
            {sh("Profile", "profile_summary", section)}
            <EditableHtml html={d.summary} onCommit={(v) => setField("summary", v)} style={{ fontSize: 11, color: "#374151", fontFamily: fontCSS, lineHeight: 1.65 }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {sh("Experience", "experience", section)}
            {entries.map((e: any, i: number) => (
              <div key={i} className="cv-entry" style={{ display: "flex", gap: 16, marginBottom: Math.round(14 * sp), ...eb }}>
                <div style={{ width: 110, flexShrink: 0, fontSize: 10, color: "#6b7280", fontFamily: fontCSS, lineHeight: 1.5 }}>
                  <div><EditableText value={e.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{e.start_date && (e.end_date || e.current) ? " – " : ""}{e.current ? "Present" : <EditableText value={e.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}</div>
                  {e.location && <div style={{ color: "#9ca3af", marginTop: 2 }}>{e.location}</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: fontCSS }}><EditableText value={e.job_title} onCommit={(v) => setEntry(i, "job_title", v)} /></div>
                  {e.employer && <div style={{ fontSize: 11, color: accentColor, fontStyle: "italic", fontFamily: fontCSS }}>{e.employer_link ? <a href={e.employer_link.startsWith("http") ? e.employer_link : `https://${e.employer_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={e.employer} onCommit={(v) => setEntry(i, "employer", v)} /></a> : <EditableText value={e.employer} onCommit={(v) => setEntry(i, "employer", v)} />}</div>}
                  {e.description && e.description !== "<p></p>" ? (
                    <EditableHtml html={e.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 3, color: "#374151", fontFamily: fontCSS }} />
                  ) : e.bullets?.length > 0 ? (
                    <ul style={{ margin: "4px 0 0 14px", padding: 0 }}>
                      {e.bullets.map((b: any, j: number) => b.text && (
                        <li key={j} style={{ fontSize: 11, marginBottom: 3, color: "#374151", fontFamily: fontCSS }}>{b.text}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        );

      case "education":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {sh("Education", "education", section)}
            {entries.map((e: any, i: number) => (
              <div key={i} className="cv-entry" style={{ display: "flex", gap: 16, marginBottom: Math.round(12 * sp), ...eb }}>
                <div style={{ width: 110, flexShrink: 0, fontSize: 10, color: "#6b7280", fontFamily: fontCSS, lineHeight: 1.5 }}>
                  <div><EditableText value={e.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{e.start_date && e.end_date ? " – " : ""}<EditableText value={e.end_date} onCommit={(v) => setEntry(i, "end_date", v)} /></div>
                  {e.location && <div style={{ color: "#9ca3af", marginTop: 2 }}>{e.location}</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: fontCSS }}><EditableText value={e.degree} onCommit={(v) => setEntry(i, "degree", v)} /></div>
                  {e.institution && <div style={{ fontSize: 11, color: accentColor, fontStyle: "italic", fontFamily: fontCSS }}>{e.institution_link ? <a href={e.institution_link.startsWith("http") ? e.institution_link : `https://${e.institution_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={e.institution} onCommit={(v) => setEntry(i, "institution", v)} /></a> : <EditableText value={e.institution} onCommit={(v) => setEntry(i, "institution", v)} />}</div>}
                  {e.score_type && e.score_value && (
                    <div style={{ fontSize: 10, color: "#6b7280", fontFamily: fontCSS, marginTop: 1 }}>
                      {e.score_type}:{" "}<span style={{ fontWeight: 600, color: "#374151" }}><EditableText value={e.score_value} onCommit={(v) => setEntry(i, "score_value", v)} /></span>
                    </div>
                  )}
                  {e.description && e.description !== "<p></p>" && (
                    <EditableHtml html={e.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 2, color: "#374151", fontFamily: fontCSS }} />
                  )}
                </div>
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
          <div className="cv-section" style={{ ...eb, marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {section.section_type === "skills" ? sh("Technical Skills", "skills", section) : sh("Soft Skills", "soft_skills", section)}
            <div style={{ display: "grid", gridTemplateColumns: finalCols, gap: `${Math.round(5 * sp)}px ${Math.round(16 * sp)}px`, fontFamily: fontCSS }}>
              {entries.map((s: any, i: number) => (
                <div key={i} className="cv-entry" style={{ ...eb }}>
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
            {sh("Languages", "languages", section)}
            {entries.map((l: any, i: number) => (
              <div key={i} className="cv-entry" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: Math.round(8 * sp), ...eb }}>
                <span style={{ width: 80, fontSize: 11, color: "#374151", fontWeight: 600, flexShrink: 0, fontFamily: fontCSS }}><EditableText value={l.language} onCommit={(v) => setEntry(i, "language", v)} /></span>
                <div style={{ flex: 1, height: 4, backgroundColor: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: 4, borderRadius: 2, backgroundColor: accentColor, width: levelToPercent(l.level ?? "") }} />
                </div>
                <span style={{ fontSize: 10, color: "#9ca3af", width: 70, textAlign: "right" as const, flexShrink: 0, fontFamily: fontCSS }}><EditableText value={l.level} onCommit={(v) => setEntry(i, "level", v)} /></span>
              </div>
            ))}
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {sh("Projects", "projects", section)}
            {entries.map((p: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: Math.round(12 * sp), ...eb }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: fontCSS }}>
                  {p.link ? <a href={p.link.startsWith("http") ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></a> : <EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} />}{p.subtitle && <span style={{ fontWeight: 400, color: "#6b7280", fontSize: 11 }}> — <EditableText value={p.subtitle} onCommit={(v) => setEntry(i, "subtitle", v)} /></span>}
                </div>
                {p.description && p.description !== "<p></p>" && (
                  <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 3, color: "#374151", fontFamily: fontCSS }} />
                )}
                {p.tech?.length > 0 && (
                  <div style={{ fontSize: 10, color: accentColor, fontFamily: fontCSS, marginTop: 4 }}>{p.tech.join(" · ")}</div>
                )}
              </div>
            ))}
          </div>
        );

      case "certificates":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {sh("Certifications", "certificates", section)}
            {entries.map((c: any, i: number) => (
              <div key={i} className="cv-entry" style={{ fontSize: 11, marginBottom: 5, fontFamily: fontCSS, ...eb }}>
                • {c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b></a> : <b><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b>}
                {c.issuer && <span style={{ color: "#6b7280" }}> — <EditableText value={c.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></span>}
                {c.date && <span style={{ color: "#9ca3af" }}> (<EditableText value={c.date} onCommit={(v) => setEntry(i, "date", v)} />{c.no_expiry ? ", no expiry" : ""})</span>}
              </div>
            ))}
          </div>
        );

      case "awards":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {sh("Awards", "awards", section)}
            {entries.map((a: any, i: number) => (
              <div key={i} className="cv-entry" style={{ fontSize: 11, marginBottom: 5, fontFamily: fontCSS, ...eb }}>
                • <b><EditableText value={a.award_name} onCommit={(v) => setEntry(i, "award_name", v)} /></b>
                {a.issuer && <span style={{ color: "#6b7280" }}> — <EditableText value={a.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></span>}
                {a.date && <span style={{ color: "#9ca3af" }}> (<EditableText value={a.date} onCommit={(v) => setEntry(i, "date", v)} />)</span>}
                {a.description && a.description !== "<p></p>" && (
                  <EditableHtml html={a.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 10, color: "#6b7280", marginTop: 1, marginLeft: 10, fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "courses":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {sh("Courses & Training", "courses", section)}
            {entries.map((c: any, i: number) => (
              <div key={i} className="cv-entry" style={{ fontSize: 11, marginBottom: 5, fontFamily: fontCSS, ...eb }}>
                • {c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b></a> : <b><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b>}
                {c.institution && <span style={{ color: "#6b7280" }}> — <EditableText value={c.institution} onCommit={(v) => setEntry(i, "institution", v)} /></span>}
                {(c.end_date || c.start_date) && <span style={{ color: "#9ca3af" }}> (<EditableText value={c.end_date || c.start_date} onCommit={(v) => setEntry(i, c.end_date ? "end_date" : "start_date", v)} />)</span>}
              </div>
            ))}
          </div>
        );

      case "publications":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {sh("Publications", "publications", section)}
            {entries.map((p: any, i: number) => (
              <div key={i} className="cv-entry" style={{ fontSize: 11, marginBottom: 5, fontFamily: fontCSS, ...eb }}>
                • <b><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></b>
                {p.publisher && <span style={{ color: "#6b7280" }}> — <EditableText value={p.publisher} onCommit={(v) => setEntry(i, "publisher", v)} /></span>}
                {p.date && <span style={{ color: "#9ca3af" }}> (<EditableText value={p.date} onCommit={(v) => setEntry(i, "date", v)} />)</span>}
                {p.description && p.description !== "<p></p>" && (
                  <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 10, color: "#6b7280", marginTop: 1, marginLeft: 10, fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {sh("Organizations", "organizations", section)}
            {entries.map((o: any, i: number) => (
              <div key={i} className="cv-entry" style={{ fontSize: 11, marginBottom: 6, fontFamily: fontCSS, ...eb }}>
                • <b><EditableText value={o.name} onCommit={(v) => setEntry(i, "name", v)} /></b>
                {o.position && <span style={{ color: "#6b7280" }}> — <EditableText value={o.position} onCommit={(v) => setEntry(i, "position", v)} /></span>}
                {(o.start_date || o.end_date || o.current_flag) && (
                  <span style={{ color: "#9ca3af" }}>
                    {" "}(<EditableText value={o.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{o.start_date && (o.end_date || o.current_flag) ? " – " : ""}{o.current_flag ? "Present" : <EditableText value={o.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />})
                  </span>
                )}
                {o.description && o.description !== "<p></p>" && (
                  <EditableHtml html={o.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 10, color: "#6b7280", marginTop: 1, marginLeft: 10, fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ ...eb, marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {sh("Interests", "interests", section)}
            <div style={{ fontSize: 11, color: "#374151", fontFamily: fontCSS }}>
              {entries.map((item: any) => item.title).join("  ·  ")}
            </div>
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {sh("References", "references", section)}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: `6px ${Math.round(24 * sp)}px`, fontFamily: fontCSS }}>
              {entries.map((r: any, i: number) => (
                <div key={i} className="cv-entry" style={{ fontSize: 11, color: "#111827", ...eb }}>
                  <div style={{ fontWeight: 700 }}><EditableText value={r.name} onCommit={(v) => setEntry(i, "name", v)} /></div>
                  {showDetails(r) ? (
                    <>
                      {r.job_title && <div style={{ color: "#6b7280" }}><EditableText value={r.job_title} onCommit={(v) => setEntry(i, "job_title", v)} />{r.organization ? <>, <EditableText value={r.organization} onCommit={(v) => setEntry(i, "organization", v)} /></> : ""}</div>}
                      {r.email && <div style={{ color: accentColor, fontSize: 10 }}><EditableText value={r.email} onCommit={(v) => setEntry(i, "email", v)} /></div>}
                      {r.phone && <div style={{ color: "#6b7280", fontSize: 10 }}><EditableText value={r.phone} onCommit={(v) => setEntry(i, "phone", v)} /></div>}
                    </>
                  ) : (
                    <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Available on request</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "declaration":
        if (!d.text || d.text === "<p></p>") return null;
        return (
          <div className="cv-section" style={{ marginBottom: layout.marginBottom, lineHeight: layout.lineHeight }}>
            {sh("Declaration", "declaration", section)}
            <EditableHtml html={d.text} onCommit={(v) => setField("text", v)} style={{ fontSize: 11, color: "#374151", fontStyle: "italic", marginBottom: 8, fontFamily: fontCSS }} />
            {d.signature && (
              <div style={{ fontSize: 20, fontFamily: "'Dancing Script', cursive", color: "#111827", borderBottom: "1px solid #d1d5db", paddingBottom: 4, display: "inline-block", marginTop: 8 }}>
                <EditableText value={d.signature} onCommit={(v) => setField("signature", v)} />
              </div>
            )}
            <div style={{ display: "flex", gap: 24, marginTop: d.signature ? 8 : 0, fontSize: 10, color: "#6b7280", fontFamily: fontCSS }}>
              {d.full_name && <span>Name: <b><EditableText value={d.full_name} onCommit={(v) => setField("full_name", v)} /></b></span>}
              {d.place && <span>Place: <b><EditableText value={d.place} onCommit={(v) => setField("place", v)} /></b></span>}
              {d.date && <span>Date: <b><EditableText value={d.date} onCommit={(v) => setField("date", v)} /></b></span>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: fontCSS, color: "#111827", position: "relative", outline: `6px solid ${accentColor}`, outlineOffset: "-6px" }}>
      <div style={{ paddingTop: "20px", paddingBottom: "20px", paddingLeft: "32px", paddingRight: "32px" }}>
      {/* Header */}
      <div style={{ padding: "10px 0 24px 0", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {hasPhoto && (
            <img
              src={personal.photo_base64 || personal.photo_url}
              alt=""
              style={{ ...getPhotoStyle(personal, 100), border: `3px solid ${accentColor}60` }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 6, marginBottom: contactItems.length > 0 ? 8 : 0 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: "#111827", fontFamily: fontCSS, lineHeight: 1.2 }}>
                <EditableText value={personal.full_name} onCommit={(v) => setPersonal("full_name", v)} placeholder="Your Name" />
              </span>
              {personal.title && (
                <>
                  <span style={{ color: "#9ca3af", fontSize: 16, fontFamily: fontCSS }}> · </span>
                  <span style={{ fontSize: 15, color: accentColor, fontStyle: "italic", fontFamily: fontCSS }}><EditableText value={personal.title} onCommit={(v) => setPersonal("title", v)} /></span>
                </>
              )}
            </div>
            {contactItems.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                {contactItems.map((item, i) => (
                  <span key={i} style={{ fontSize: 10, color: "#6b7280", fontFamily: fontCSS }}>
                    {getContactIcon(item.type, accentColor)}<a href={item.type === "email" ? `mailto:${item.text}` : item.type === "phone" ? `tel:${item.text}` : item.text.startsWith("http") ? item.text : `https://${item.text}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={item.text} onCommit={item.onCommit} /></a>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div>
        {sections.map((section) =>
          section.section_type !== "personal_details" ? (
            <SortableSection key={section.id} section={section} defaultMarginBottom={Math.round(14 * sp)}>
              {renderSection(section)}
            </SortableSection>
          ) : null
        )}
      </div>
      </div>{/* end inner padding wrapper */}
    </div>
  );
}
