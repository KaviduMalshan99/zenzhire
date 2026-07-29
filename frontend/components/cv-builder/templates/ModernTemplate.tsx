import React from "react";
import type { CVSection, CVCustomization } from "@/types";
import { DEFAULT_CUSTOMIZATION, FONT_CSS_MAP } from "@/types";
import { HtmlContent } from "./HtmlContent";
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

function getContactIcon(type: string, fill: string): React.ReactNode {
  const s: React.CSSProperties = { display: "inline-block", verticalAlign: "middle", marginRight: 5, flexShrink: 0 };
  switch (type) {
    case "email": return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
    case "phone": return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/></svg>;
    case "location": return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>;
    case "linkedin": return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    case "github": return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
    case "gender": return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/></svg>;
    default: return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
  }
}

function get(sections: CVSection[], type: string) {
  return sections.find((s) => s.section_type === type)?.data ?? {};
}

// Sections that live in the sidebar regardless of order
const SIDEBAR_TYPES = new Set(["skills", "soft_skills", "languages", "interests", "declaration"]);

function getPhotoStyle(personal: any, defaultSize = 80): React.CSSProperties {
  const size = personal.photo_size ?? defaultSize;
  const shape = personal.photo_shape ?? "circle";
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "12px" : "0px";
  const clipPath = shape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : "none";
  return { width: size, height: size, borderRadius, clipPath, objectFit: "cover" as const, flexShrink: 0 };
}

export function ModernTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }: Props) {
  const { accentColor, fontFamily, lineHeight, sectionSpacing, headingStyle } = customization;
  const fontCSS = FONT_CSS_MAP[fontFamily] ?? "Arial, Helvetica, sans-serif";
  // Derived from sectionSpacing (real audited default 14), replacing the old
  // compact/normal/spacious multiplier -- every Math.round(N * sp) formula
  // below still scales proportionally off the single sectionSpacing scalar.
  const sp = sectionSpacing / 14;
  const { onFieldChange } = useCVEdit();
  // Sidebar section headings (Contact + the skills/soft_skills/languages/
  // interests/declaration exception sections) were always hardcoded to a
  // flat 12px gap, completely ignoring the old compact/normal/spacious
  // preset. Rather than making them identical to the main column (which
  // would collapse Modern's intentionally tighter sidebar rhythm), 12px is
  // treated as a ratio of the main baseline (12/14 ≈ 0.857) and scaled by
  // the same `sp` -- Math.round(12 * sp) reproduces exactly 12 at the real
  // default (sectionSpacing: 14) and scales proportionally from there.

  // Sidebar uses a darkened version of accent as background
  const sidebarBg = accentColor;

  const sideHeading = {
    fontSize: 10,
    fontWeight: "bold" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.65)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    paddingBottom: 3,
    marginBottom: 6,
    marginTop: Math.round(12 * sp),
    fontFamily: fontCSS,
  };

  const dateStyleMain = {
    fontSize: 11,
    color: "#6b7280",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    fontFamily: fontCSS,
  };

  const personal = get(sections, "personal_details");
  const personalSection = sections.find((s) => s.section_type === "personal_details");
  const setPersonal = personalSection ? makeFieldSetter(personalSection, onFieldChange) : () => {};
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) =>
    r.privacy ? r.privacy === "show" : r.show_on_cv !== false;

  const skillsSection = sections.find((s) => s.section_type === "skills");
  const softSkillsSection = sections.find((s) => s.section_type === "soft_skills");
  const langSection = sections.find((s) => s.section_type === "languages");
  const interestsSection = sections.find((s) => s.section_type === "interests");
  const declarationSection = sections.find((s) => s.section_type === "declaration");
  const skillEntries = skillsSection?.data?.entries ?? [];
  const softSkillEntries = softSkillsSection?.data?.entries ?? [];
  const langEntries = langSection?.data?.entries ?? [];
  const interestEntries = interestsSection?.data?.entries ?? [];
  const declaration = get(sections, "declaration");
  const setSkillEntry = skillsSection ? makeEntrySetter(skillsSection, onFieldChange) : () => {};
  const setSoftSkillEntry = softSkillsSection ? makeEntrySetter(softSkillsSection, onFieldChange) : () => {};
  const setLangEntry = langSection ? makeEntrySetter(langSection, onFieldChange) : () => {};
  const setInterestEntry = interestsSection ? makeEntrySetter(interestsSection, onFieldChange) : () => {};
  const setDeclaration = declarationSection ? makeFieldSetter(declarationSection, onFieldChange) : () => {};

  const mainSections = sections.filter(
    (s) => s.section_type !== "personal_details" && !SIDEBAR_TYPES.has(s.section_type)
  );

  const renderMainSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];
    const mb = sectionSpacing;
    const setField = makeFieldSetter(section, onFieldChange);
    const setEntry = makeEntrySetter(section, onFieldChange);

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading section={section} title="Profile" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <EditableHtml html={d.summary} onCommit={(v) => setField("summary", v)} style={{ fontSize: 12, color: "#374151", textAlign: "justify", marginBottom: 4, fontFamily: fontCSS, lineHeight }} />
          </div>
        );

      case "experience": {
        if (!entries.length) return null;
        const renderEntry = (entry: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(8 * sp) }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
              <div style={{ fontWeight: "bold", fontSize: 13, color: "#1e3a5f", fontFamily: fontCSS }}><EditableText value={entry.job_title} onCommit={(v) => setEntry(i, "job_title", v)} /></div>
              <div style={dateStyleMain}>
                <EditableText value={entry.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />
                {entry.start_date && (entry.end_date || entry.current) ? " – " : ""}
                {entry.current ? "Present" : <EditableText value={entry.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}
              </div>
            </div>
            <div style={{ fontSize: 12, color: accentColor, fontWeight: "bold", fontFamily: fontCSS }}>
              {entry.employer_link ? <a href={entry.employer_link.startsWith("http") ? entry.employer_link : `https://${entry.employer_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={entry.employer} onCommit={(v) => setEntry(i, "employer", v)} /></a> : <EditableText value={entry.employer} onCommit={(v) => setEntry(i, "employer", v)} />}{entry.location ? ` · ${entry.location}` : ""}
            </div>
            {entry.description && entry.description !== "<p></p>" ? (
              <EditableHtml html={entry.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 3, color: "#374151", fontFamily: fontCSS, lineHeight }} />
            ) : entry.bullets?.length > 0 ? (
              <ul style={{ margin: "3px 0 0 14px", padding: 0, listStyleType: "disc" }}>
                {entry.bullets.map((b: any, j: number) =>
                  b.text && <li key={j} style={{ fontSize: 12, marginBottom: 1.5, color: "#374151", fontFamily: fontCSS, lineHeight }}>{b.text}</li>
                )}
              </ul>
            ) : null}
          </div>
        );
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Experience" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((entry: any, i: number) => renderEntry(entry, i + 1))}
          </div>
        );
      }

      case "education": {
        if (!entries.length) return null;
        const renderEntry = (entry: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(6 * sp) }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div style={{ fontWeight: "bold", fontSize: 13, color: "#1e3a5f", fontFamily: fontCSS }}><EditableText value={entry.degree} onCommit={(v) => setEntry(i, "degree", v)} /></div>
              <div style={dateStyleMain}>
                <EditableText value={entry.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{entry.start_date && entry.end_date ? " – " : ""}<EditableText value={entry.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: accentColor, fontFamily: fontCSS }}>{entry.institution_link ? <a href={entry.institution_link.startsWith("http") ? entry.institution_link : `https://${entry.institution_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={entry.institution} onCommit={(v) => setEntry(i, "institution", v)} /></a> : <EditableText value={entry.institution} onCommit={(v) => setEntry(i, "institution", v)} />}{entry.location ? ` · ${entry.location}` : ""}</div>
            {entry.score_type && entry.score_value && (
              <div style={{ fontSize: 11, color: "#6b7280", fontFamily: fontCSS, marginTop: 1 }}>
                {entry.score_type}:{" "}<span style={{ fontWeight: 600, color: "#374151" }}><EditableText value={entry.score_value} onCommit={(v) => setEntry(i, "score_value", v)} /></span>
              </div>
            )}
            {entry.description && entry.description !== "<p></p>" && (
              <EditableHtml html={entry.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 2, color: "#374151", fontFamily: fontCSS, lineHeight }} />
            )}
          </div>
        );
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Education" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((entry: any, i: number) => renderEntry(entry, i + 1))}
          </div>
        );
      }

      case "projects": {
        if (!entries.length) return null;
        const renderEntry = (p: any, i: number) => (
          <div key={i} style={{ marginBottom: Math.round(6 * sp) }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ fontWeight: "bold", fontSize: 13, color: "#1e3a5f", fontFamily: fontCSS }}>{p.link ? <a href={p.link.startsWith("http") ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></a> : <EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} />}</span>
              {(p.start_date || p.end_date) && (
                <span style={dateStyleMain}>
                  <EditableText value={p.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />{p.start_date && p.end_date ? " – " : ""}<EditableText value={p.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />
                </span>
              )}
            </div>
            {p.subtitle && <div style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic", fontFamily: fontCSS }}><EditableText value={p.subtitle} onCommit={(v) => setEntry(i, "subtitle", v)} /></div>}
            {p.description && p.description !== "<p></p>" && (
              <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 12, marginTop: 2, color: "#374151", fontFamily: fontCSS, lineHeight }} />
            )}
            {p.tech?.length > 0 && (
              <div style={{ fontSize: 11, color: accentColor, marginTop: 2, fontFamily: fontCSS }}>Tech: {p.tech.join(", ")}</div>
            )}
          </div>
        );
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
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
          <div key={i} className="cv-entry" style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12, fontFamily: fontCSS }}>
            <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b style={{ color: "#1e3a5f" }}><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b></a> : <b style={{ color: "#1e3a5f" }}><EditableText value={c.certificate_name} onCommit={(v) => setEntry(i, "certificate_name", v)} /></b>}{c.issuer ? <> — <EditableText value={c.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></> : ""}</span>
            <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={c.date} onCommit={(v) => setEntry(i, "date", v)} /></span>
          </div>
        );
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
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
          <div key={i} style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span><b style={{ color: "#1e3a5f" }}><EditableText value={a.award_name} onCommit={(v) => setEntry(i, "award_name", v)} /></b>{a.issuer ? <> — <EditableText value={a.issuer} onCommit={(v) => setEntry(i, "issuer", v)} /></> : ""}</span>
              <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={a.date} onCommit={(v) => setEntry(i, "date", v)} /></span>
            </div>
            {a.description && a.description !== "<p></p>" && (
              <EditableHtml html={a.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 1, color: "#6b7280", fontFamily: fontCSS, lineHeight }} />
            )}
          </div>
        );
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Awards" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((a: any, i: number) => renderEntry(a, i + 1))}
          </div>
        );
      }

      case "courses": {
        if (!entries.length) return null;
        const renderEntry = (c: any, i: number) => (
          <div key={i} style={{ marginBottom: 4, fontFamily: fontCSS }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12 }}>
              <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b style={{ color: "#1e3a5f" }}><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b></a> : <b style={{ color: "#1e3a5f" }}><EditableText value={c.title} onCommit={(v) => setEntry(i, "title", v)} /></b>}{c.institution ? <> — <EditableText value={c.institution} onCommit={(v) => setEntry(i, "institution", v)} /></> : ""}</span>
              <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}><EditableText value={c.end_date || c.start_date} onCommit={(v) => setEntry(i, c.end_date ? "end_date" : "start_date", v)} /></span>
            </div>
            {c.description && c.description !== "<p></p>" && (
              <EditableHtml html={c.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, color: "#6b7280", marginTop: 1, fontFamily: fontCSS, lineHeight }} />
            )}
          </div>
        );
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
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
          <div key={i} style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS }} className="cv-entry">
            <span>
              <b style={{ color: "#1e3a5f" }}><EditableText value={p.title} onCommit={(v) => setEntry(i, "title", v)} /></b>
              {p.publisher ? <> — <EditableText value={p.publisher} onCommit={(v) => setEntry(i, "publisher", v)} /></> : ""}
              {p.date ? <> (<EditableText value={p.date} onCommit={(v) => setEntry(i, "date", v)} />)</> : ""}
            </span>
            {p.description && p.description !== "<p></p>" && (
              <EditableHtml html={p.description} onCommit={(v) => setEntry(i, "description", v)} style={{ marginTop: 1, color: "#6b7280", fontSize: 11, fontFamily: fontCSS, lineHeight }} />
            )}
          </div>
        );
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
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
          <div key={i} style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS }} className="cv-entry">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span><b style={{ color: "#1e3a5f" }}><EditableText value={o.name} onCommit={(v) => setEntry(i, "name", v)} /></b>{o.position ? <> — <EditableText value={o.position} onCommit={(v) => setEntry(i, "position", v)} /></> : ""}</span>
              <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}>
                <EditableText value={o.start_date} onCommit={(v) => setEntry(i, "start_date", v)} />
                {o.start_date && (o.end_date || o.current_flag) ? " – " : ""}
                {o.current_flag ? "Present" : <EditableText value={o.end_date} onCommit={(v) => setEntry(i, "end_date", v)} />}
              </span>
            </div>
            {o.description && o.description !== "<p></p>" && (
              <EditableHtml html={o.description} onCommit={(v) => setEntry(i, "description", v)} style={{ fontSize: 11, marginTop: 1, color: "#6b7280", fontFamily: fontCSS, lineHeight }} />
            )}
          </div>
        );
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <div className="cv-heading-group" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <SectionHeading section={section} title="Organizations & Volunteering" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
              {renderEntry(entries[0], 0)}
            </div>
            {entries.slice(1).map((o: any, i: number) => renderEntry(o, i + 1))}
          </div>
        );
      }

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading section={section} title="References" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, marginBottom: 4, fontFamily: fontCSS }} className="cv-entry">
                  <div style={{ fontWeight: "bold", color: "#1e3a5f" }}><EditableText value={r.name} onCommit={(v) => setEntry(i, "name", v)} /></div>
                  {showDetails(r) ? (
                    <>
                      {r.job_title && <div style={{ color: "#555" }}><EditableText value={r.job_title} onCommit={(v) => setEntry(i, "job_title", v)} />{r.organization ? <> · <EditableText value={r.organization} onCommit={(v) => setEntry(i, "organization", v)} /></> : ""}</div>}
                      {r.email && <div style={{ color: "#555" }}><EditableText value={r.email} onCommit={(v) => setEntry(i, "email", v)} /></div>}
                      {r.phone && <div style={{ color: "#555" }}><EditableText value={r.phone} onCommit={(v) => setEntry(i, "phone", v)} /></div>}
                    </>
                  ) : (
                    <div style={{ color: "#999", fontStyle: "italic" }}>Available on request</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const sidePad = Math.round(30 * sp);
  const mainPad = Math.round(30 * sp);

  const skillsContent = skillsSection && skillEntries.length > 0 ? (
    <>
      <div style={{ ...sideHeading }}>
        <EditableText value={skillsSection?.data?._title || "Technical Skills"} onCommit={(v) => skillsSection && onFieldChange(skillsSection, { ...skillsSection.data, _title: v })} placeholder="Technical Skills" />
      </div>
      <div style={{ fontSize: 11, lineHeight: 1.8, fontFamily: fontCSS }}>
        {skillEntries.map((s: any, i: number) => (
          <div key={i} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.15)", paddingBottom: 2, marginBottom: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#e2e8f0" }}><EditableText value={s.skill_name} onCommit={(v) => setSkillEntry(i, "skill_name", v)} /></span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>{s.level}</span>
            </div>
            {s.subskills && s.subskills !== "<p></p>" && (
              <HtmlContent html={s.subskills} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1, fontFamily: fontCSS }} />
            )}
          </div>
        ))}
      </div>
    </>
  ) : null;

  const softSkillsContent = softSkillsSection && softSkillEntries.length > 0 ? (
    <>
      <div style={{ ...sideHeading }}>
        <EditableText value={softSkillsSection?.data?._title || "Soft Skills"} onCommit={(v) => softSkillsSection && onFieldChange(softSkillsSection, { ...softSkillsSection.data, _title: v })} placeholder="Soft Skills" />
      </div>
      <div style={{ fontSize: 11, lineHeight: 1.8, fontFamily: fontCSS }}>
        {softSkillEntries.map((s: any, i: number) => (
          <div key={i} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.15)", paddingBottom: 2, marginBottom: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#e2e8f0" }}><EditableText value={s.skill_name} onCommit={(v) => setSoftSkillEntry(i, "skill_name", v)} /></span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>{s.level}</span>
            </div>
            {s.subskills && s.subskills !== "<p></p>" && (
              <HtmlContent html={s.subskills} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1, fontFamily: fontCSS }} />
            )}
          </div>
        ))}
      </div>
    </>
  ) : null;

  const langContent = langSection && langEntries.length > 0 ? (
    <>
      <div style={{ ...sideHeading }}>
        <EditableText value={langSection?.data?._title || "Languages"} onCommit={(v) => langSection && onFieldChange(langSection, { ...langSection.data, _title: v })} placeholder="Languages" />
      </div>
      <div style={{ fontSize: 11, lineHeight: 1.8, fontFamily: fontCSS }}>
        {langEntries.map((l: any, i: number) => (
          <div key={i}>
            <span style={{ color: "#e2e8f0", fontWeight: "bold" }}><EditableText value={l.language} onCommit={(v) => setLangEntry(i, "language", v)} /></span>
            {l.level && <span style={{ color: "rgba(255,255,255,0.6)" }}> — <EditableText value={l.level} onCommit={(v) => setLangEntry(i, "level", v)} /></span>}
          </div>
        ))}
      </div>
    </>
  ) : null;

  const interestsContent = interestsSection && interestEntries.length > 0 ? (
    <>
      <div style={{ ...sideHeading }}>
        <EditableText value={interestsSection?.data?._title || "Interests"} onCommit={(v) => interestsSection && onFieldChange(interestsSection, { ...interestsSection.data, _title: v })} placeholder="Interests" />
      </div>
      <div style={{ fontSize: 11, color: "#cbd5e1", lineHeight: 1.7, fontFamily: fontCSS }}>
        {interestEntries.map((item: any, i: number) => (
          <div key={i}><EditableText value={item.title} onCommit={(v) => setInterestEntry(i, "title", v)} /></div>
        ))}
      </div>
    </>
  ) : null;

  const declarationContent = declarationSection && declaration.text && declaration.text !== "<p></p>" ? (
    <>
      <div style={{ ...sideHeading }}>
        <EditableText value={declarationSection?.data?._title || "Declaration"} onCommit={(v) => declarationSection && onFieldChange(declarationSection, { ...declarationSection.data, _title: v })} placeholder="Declaration" />
      </div>
      <EditableHtml html={declaration.text} onCommit={(v) => setDeclaration("text", v)} style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.6, fontFamily: fontCSS }} />
      {declaration.signature && (
        <div style={{ marginTop: 6, fontFamily: "'Dancing Script', cursive", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          <EditableText value={declaration.signature} onCommit={(v) => setDeclaration("signature", v)} />
        </div>
      )}
    </>
  ) : null;

  return (
    <div className="modern-outer" style={{ display: "flex", fontFamily: fontCSS, fontSize: 12, minHeight: "297mm", alignItems: "stretch", lineHeight: 1.5 }}>
      {/* Sidebar */}
      <div className="modern-sidebar" style={{ width: "35%", backgroundColor: sidebarBg, padding: `${sidePad}px 14px`, color: "#e2e8f0", alignSelf: "stretch", position: "relative", zIndex: 1 }}>
        {(personal.photo_base64 || personal.photo_url) && (
          <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ ...getPhotoStyle(personal, 100), marginBottom: 12, border: "3px solid rgba(255,255,255,0.4)", display: "block", marginLeft: "auto", marginRight: "auto" }} />
        )}
        <div style={{ fontSize: 20, fontWeight: "bold", color: "#fff", lineHeight: 1.2, fontFamily: fontCSS, textAlign: "center" }}>
          <EditableText value={personal.full_name} onCommit={(v) => setPersonal("full_name", v)} placeholder="Your Name" />
        </div>
        {personal.title && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 3, fontFamily: fontCSS, textAlign: "center" }}><EditableText value={personal.title} onCommit={(v) => setPersonal("title", v)} /></div>
        )}

        <div style={sideHeading}>Contact</div>
        <div style={{ fontSize: 11, color: "#cbd5e1", fontFamily: fontCSS }}>
          {personal.email && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              {getContactIcon("email", "#cbd5e1")}
              <a href={`mailto:${personal.email}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.email} onCommit={(v) => setPersonal("email", v)} /></a>
            </div>
          )}
          {personal.phone && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              {getContactIcon("phone", "#cbd5e1")}
              <a href={`tel:${personal.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><EditableText value={personal.phone} onCommit={(v) => setPersonal("phone", v)} /></a>
            </div>
          )}
          {personal.location && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              {getContactIcon("location", "#cbd5e1")}
              <span><EditableText value={personal.location} onCommit={(v) => setPersonal("location", v)} /></span>
            </div>
          )}
          {personal.nationality && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              {getContactIcon("info", "#cbd5e1")}
              <span><EditableText value={personal.nationality} onCommit={(v) => setPersonal("nationality", v)} /></span>
            </div>
          )}
          {personal.visa_status && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              {getContactIcon("info", "#cbd5e1")}
              <span>Visa: <EditableText value={personal.visa_status} onCommit={(v) => setPersonal("visa_status", v)} /></span>
            </div>
          )}
          {personal.gender && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              {getContactIcon("gender", "#cbd5e1")}
              <span><EditableText value={personal.gender} onCommit={(v) => setPersonal("gender", v)} /></span>
            </div>
          )}
          {links.map((l: any, i: number) => l.url && (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              {getContactIcon(
                l.platform?.toLowerCase().includes("linkedin") ? "linkedin" :
                l.platform?.toLowerCase().includes("github") ? "github" : "website",
                "#cbd5e1"
              )}
              <a href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                <EditableText value={l.url} onCommit={(v) => setPersonal("links", links.map((x: any, xi: number) => (xi === i ? { ...x, url: v } : x)))} />
              </a>
            </div>
          ))}
        </div>

        {skillsContent && (
          <SortableSection section={skillsSection!} defaultMarginBottom={Math.round(12 * sp)} defaultLineHeight={1.8}>
            {skillsContent}
          </SortableSection>
        )}

        {softSkillsContent && (
          <SortableSection section={softSkillsSection!} defaultMarginBottom={Math.round(12 * sp)} defaultLineHeight={1.8}>
            {softSkillsContent}
          </SortableSection>
        )}

        {langContent && (
          <SortableSection section={langSection!} defaultMarginBottom={Math.round(12 * sp)} defaultLineHeight={1.8}>
            {langContent}
          </SortableSection>
        )}

        {interestsContent && (
          <SortableSection section={interestsSection!} defaultMarginBottom={Math.round(12 * sp)} defaultLineHeight={1.7}>
            {interestsContent}
          </SortableSection>
        )}

        {declarationContent && (
          <SortableSection section={declarationSection!} defaultMarginBottom={Math.round(12 * sp)} defaultLineHeight={1.6}>
            {declarationContent}
          </SortableSection>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: `${mainPad}px 18px`, backgroundColor: "#fff" }}>
        {mainSections.map((section) => (
          <SortableSection key={section.id} section={section} defaultMarginBottom={sectionSpacing}>
            {renderMainSection(section)}
          </SortableSection>
        ))}
      </div>
    </div>
  );
}
