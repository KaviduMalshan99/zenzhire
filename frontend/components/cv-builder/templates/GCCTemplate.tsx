import React from "react";
import type { CVSection, CVCustomization } from "@/types";
import { DEFAULT_CUSTOMIZATION, FONT_CSS_MAP } from "@/types";
import { HtmlContent } from "./HtmlContent";
import { SectionHeading } from "../SectionHeading";
import { SkillEntry } from "./SkillEntry";

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

  const personal = get(sections, "personal_details");
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) => r.privacy ? r.privacy === "show" : r.show_on_cv !== false;

  const dateStyle: React.CSSProperties = { fontSize: 11, color: LIGHT, whiteSpace: "nowrap", flexShrink: 0, fontFamily: fontCSS };

  const renderSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Career Objective" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <HtmlContent html={d.summary} style={{ fontSize: 12, color: MID, marginBottom: 4, textAlign: "justify", fontFamily: fontCSS }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Work Experience" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: mb, fontFamily: fontCSS, ...eb }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, color: accentColor, fontFamily: fontCSS }}>{entry.job_title}</div>
                  <div style={dateStyle}>{entry.start_date}{entry.start_date && (entry.end_date || entry.current) ? " – " : ""}{entry.current ? "Present" : entry.end_date}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: "bold", fontFamily: fontCSS, color: MID }}>{entry.employer_link ? <a href={entry.employer_link.startsWith("http") ? entry.employer_link : `https://${entry.employer_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{entry.employer}</a> : entry.employer}{entry.location ? ` · ${entry.location}` : ""}</div>
                {entry.description && entry.description !== "<p></p>" ? (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 3, color: MID, fontFamily: fontCSS }} />
                ) : entry.bullets?.length > 0 ? (
                  <ul style={{ margin: "3px 0 0 14px", padding: 0, listStyleType: "disc" }}>
                    {entry.bullets.map((b: any, j: number) => b.text && <li key={j} style={{ fontSize: 12, marginBottom: 2, color: MID, fontFamily: fontCSS }}>{b.text}</li>)}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        );

      case "education":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Education & Qualifications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: Math.round(7 * sp), fontFamily: fontCSS, ...eb }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, color: accentColor, fontFamily: fontCSS }}>{entry.degree}</div>
                  <div style={dateStyle}>{entry.start_date}{entry.start_date && entry.end_date ? " – " : ""}{entry.end_date}</div>
                </div>
                <div style={{ fontSize: 12, fontFamily: fontCSS, color: MID }}>{entry.institution_link ? <a href={entry.institution_link.startsWith("http") ? entry.institution_link : `https://${entry.institution_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{entry.institution}</a> : entry.institution}{entry.location ? ` · ${entry.location}` : ""}</div>
                {entry.score_type && entry.score_value && (
                  <div style={{ fontSize: 11, color: "#6b7280", fontFamily: fontCSS, marginTop: 1 }}>
                    {entry.score_type}:{" "}<span style={{ fontWeight: 600, color: MID }}>{entry.score_value}</span>
                  </div>
                )}
                {entry.description && entry.description !== "<p></p>" && <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 2, color: MID, fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "skills": {
        if (!entries.length) return null;
        const cols = skillColumns ?? 2;
        const gridCols = cols === 1 ? "1fr" : cols === 3 ? "1fr 1fr 1fr" : "1fr 1fr";
        const finalCols = gridCols;
        return (
          <div className="cv-section">
            <SectionHeading title="Skills & Competencies" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: finalCols, gap: `${Math.round(8 * sp)}px ${Math.round(20 * sp)}px` }}>
              {entries.map((s: any, i: number) => (
                <div key={i} className="cv-entry" style={{ fontFamily: fontCSS, ...eb }}>
                  <SkillEntry skillName={s.skill_name} level={s.level} skillStyle={skillStyle ?? "classic"} accentColor={accentColor} fontFamily={fontCSS} />
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
            <SectionHeading title="Languages" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
              {entries.map((l: any, i: number) => (
                <span key={i} style={{ fontSize: 12, fontFamily: fontCSS }}><b>{l.language}</b>{l.level && <span style={{ color: LIGHT }}> — {l.level}</span>}</span>
              ))}
            </div>
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Projects" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: Math.round(6 * sp), fontFamily: fontCSS, ...eb }} className="cv-entry">
                <div style={{ fontWeight: "bold", fontSize: 12, color: accentColor, fontFamily: fontCSS }}>{p.link ? <a href={p.link.startsWith("http") ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{p.title}</a> : p.title}</div>
                {p.subtitle && <div style={{ fontSize: 11, color: LIGHT, fontStyle: "italic", fontFamily: fontCSS }}>{p.subtitle}</div>}
                {p.description && p.description !== "<p></p>" && <HtmlContent html={p.description} style={{ fontSize: 12, marginTop: 2, color: MID, fontFamily: fontCSS }} />}
                {p.tech?.length > 0 && <div style={{ fontSize: 11, color: MID, marginTop: 1, fontFamily: fontCSS }}>Technologies: {p.tech.join(", ")}</div>}
              </div>
            ))}
          </div>
        );

      case "certificates":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Certifications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
                <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b>{c.certificate_name}</b></a> : <b>{c.certificate_name}</b>}{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}>{c.no_expiry ? `${c.date} (No expiry)` : c.date}</span>
              </div>
            ))}
          </div>
        );

      case "awards":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Awards & Recognition" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((a: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{a.award_name}</b>{a.issuer ? ` — ${a.issuer}` : ""}</span>
                  <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}>{a.date}</span>
                </div>
                {a.description && a.description !== "<p></p>" && <HtmlContent html={a.description} style={{ fontSize: 12, marginTop: 1, color: MID, fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "courses":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Courses & Training" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
                <span>{c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}><b>{c.title}</b></a> : <b>{c.title}</b>}{c.institution ? ` — ${c.institution}` : ""}</span>
                <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}>{c.end_date || c.start_date}</span>
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Memberships & Associations" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((o: any, i: number) => (
              <div key={i} style={{ marginBottom: Math.round(5 * sp), fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{o.name}</b>{o.position ? ` — ${o.position}` : ""}</span>
                  <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}>{o.start_date}{o.start_date && (o.end_date || o.current_flag) ? " – " : ""}{o.current_flag ? "Present" : o.end_date}</span>
                </div>
                {o.description && o.description !== "<p></p>" && <HtmlContent html={o.description} style={{ fontSize: 12, marginTop: 1, color: MID, fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Personal Interests" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ fontSize: 12, fontFamily: fontCSS }}>{entries.map((item: any) => item.title).join(" · ")}</div>
          </div>
        );

      case "publications":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Publications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
                <b>{p.title}</b>{p.publisher && <span style={{ color: LIGHT }}> · {p.publisher}</span>}{p.date && <span style={{ color: LIGHT }}> ({p.date})</span>}
                {p.description && p.description !== "<p></p>" && <HtmlContent html={p.description} style={{ fontSize: 11, marginTop: 1, color: MID, fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="References" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, fontFamily: fontCSS, ...eb }} className="cv-entry">
                  <div style={{ fontWeight: "bold", color: accentColor, fontFamily: fontCSS }}>{r.name}</div>
                  {showDetails(r) ? (
                    <>{r.job_title && <div style={{ color: MID, fontFamily: fontCSS }}>{r.job_title}{r.organization ? `, ${r.organization}` : ""}</div>}{r.email && <div style={{ fontFamily: fontCSS }}>{r.email}</div>}{r.phone && <div style={{ fontFamily: fontCSS }}>{r.phone}</div>}</>
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
            <SectionHeading title="Declaration" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ border: "1px solid #d1d9e0", borderRadius: 4, padding: "10px 14px", backgroundColor: "#fafbfc" }}>
              <HtmlContent html={d.text} style={{ fontSize: 12, color: MID, lineHeight: 1.8, marginBottom: 8, fontFamily: fontCSS }} />
              <div style={{ display: "flex", gap: 32, fontSize: 12, fontFamily: fontCSS }}>
                {d.full_name && <span>Name: <b>{d.full_name}</b></span>}
                {d.place && <span>Place: <b>{d.place}</b></span>}
                {d.date && <span>Date: <b>{d.date}</b></span>}
              </div>
              {d.signature && <div style={{ marginTop: 10, fontFamily: "'Dancing Script', cursive", fontSize: 16, color: accentColor }}>{d.signature}</div>}
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
          <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff", letterSpacing: "0.01em", lineHeight: 1.2, fontFamily: fontCSS }}>{personal.full_name || "Your Name"}</div>
          {personal.title && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4, letterSpacing: "0.03em", fontFamily: fontCSS }}>{personal.title}</div>}
          <div style={{ marginTop: Math.round(6 * sp), display: "flex", flexWrap: "wrap", gap: "6px 8px", alignItems: "center" }}>
            {personal.nationality && <span style={badgeStyle}>Nationality: {personal.nationality}</span>}
            {personal.visa_status && <span style={badgeStyle}>Visa: {personal.visa_status}</span>}
            {personal.date_of_birth && <span style={badgeStyle}>DOB: {personal.date_of_birth}</span>}
            {personal.gender && <span style={badgeStyle}>Gender: {personal.gender}</span>}
            {personal.marital_status && <span style={badgeStyle}>Marital: {personal.marital_status}</span>}
            {personal.religion && <span style={badgeStyle}>Religion: {personal.religion}</span>}
            {personal.nic && <span style={badgeStyle}>NIC: {personal.nic}</span>}
            {personal.driving_license && <span style={badgeStyle}>License: {personal.driving_license}</span>}
          </div>
        </div>
        {(personal.photo_base64 || personal.photo_url) && (
          <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ ...getPhotoStyle(personal, 80), border: "3px solid rgba(255,255,255,0.6)", marginLeft: 20 }} />
        )}
      </div>

      <div style={{ backgroundColor: "#f0f4f8", borderBottom: "1px solid #dde3ea", padding: `${Math.round(8 * sp)}px 16px`, display: "flex", flexWrap: "wrap", gap: "4px 20px", fontSize: 10, color: LIGHT, fontFamily: fontCSS }}>
        {personal.email && <span><a href={`mailto:${personal.email}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{personal.email}</a></span>}
        {personal.phone && <span><a href={`tel:${personal.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{personal.phone}</a></span>}
        {personal.location && <span>{personal.location}</span>}
        {links.filter((l: any) => l.url).map((l: any, i: number) => <span key={i}><a href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{l.url}</a></span>)}
      </div>

      <div style={{ padding: `0 16px` }}>
        {sections.map((section) =>
          section.section_type !== "personal_details" ? (
            <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
          ) : null
        )}
      </div>
    </div>
  );
}
