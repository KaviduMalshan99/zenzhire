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

export function ExecutiveTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }: Props) {
  const { accentColor, fontFamily, spacing, headerStyle, headingStyle, skillStyle = "classic", skillColumns = 2 } = customization;
  const fontCSS = FONT_CSS_MAP[fontFamily] ?? "Georgia, 'Times New Roman', serif";
  const sp = spacing === "compact" ? 0.75 : spacing === "spacious" ? 1.35 : 1.0;
  const mb = Math.round(14 * sp);
  const eb: React.CSSProperties = { pageBreakInside: "avoid", breakInside: "avoid" };

  const personal = get(sections, "personal_details");
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) =>
    r.privacy ? r.privacy === "show" : r.show_on_cv !== false;

  const DARK = "#1c1c1c";
  const dateStyle: React.CSSProperties = { fontSize: 11, color: "#777", fontStyle: "italic", whiteSpace: "nowrap", flexShrink: 0, fontFamily: fontCSS };

  const renderSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Executive Summary" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <HtmlContent html={d.summary} style={{ fontSize: 12, color: "#333", marginBottom: 4, fontStyle: "italic", textAlign: "justify", fontFamily: fontCSS }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Professional Experience" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((e: any, i: number) => (
              <div key={i} style={{ marginBottom: mb, ...eb }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 14, color: DARK, fontFamily: fontCSS }}>{e.job_title}</div>
                  <div style={dateStyle}>{e.start_date}{e.start_date && (e.end_date || e.current) ? " – " : ""}{e.current ? "Present" : e.end_date}</div>
                </div>
                <div style={{ fontSize: 12, color: accentColor, fontWeight: "bold", fontFamily: fontCSS }}>{e.employer}{e.location ? ` · ${e.location}` : ""}</div>
                {e.description && e.description !== "<p></p>" ? (
                  <HtmlContent html={e.description} style={{ fontSize: 12, marginTop: 3, color: "#333", fontFamily: fontCSS }} />
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
          <div className="cv-section">
            <SectionHeading title="Education" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((e: any, i: number) => (
              <div key={i} style={{ marginBottom: Math.round(7 * sp), ...eb }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, fontFamily: fontCSS }}>{e.degree}</div>
                  <div style={dateStyle}>{e.start_date}{e.start_date && e.end_date ? " – " : ""}{e.end_date}</div>
                </div>
                <div style={{ fontSize: 12, color: accentColor, fontFamily: fontCSS }}>{e.institution}{e.location ? ` · ${e.location}` : ""}</div>
                {e.description && e.description !== "<p></p>" && <HtmlContent html={e.description} style={{ fontSize: 11, marginTop: 2, fontStyle: "italic", fontFamily: fontCSS }} />}
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
            <SectionHeading title="Core Competencies" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: finalCols, gap: `${Math.round(8 * sp)}px ${Math.round(20 * sp)}px` }}>
              {entries.map((s: any, i: number) => (
                <div key={i} className="cv-entry" style={{ ...eb, fontFamily: fontCSS }}>
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
            <div style={{ display: "flex", gap: "6px 24px", flexWrap: "wrap" }}>
              {entries.map((l: any, i: number) => (
                <span key={i} style={{ fontSize: 12, fontFamily: fontCSS }}><span style={{ fontWeight: "bold" }}>{l.language}</span>{l.level && <span style={{ color: "#777" }}> — {l.level}</span>}</span>
              ))}
            </div>
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Key Projects & Initiatives" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: Math.round(6 * sp), ...eb, fontFamily: fontCSS }} className="cv-entry">
                <div style={{ fontWeight: "bold", fontSize: 12, fontFamily: fontCSS }}>{p.title}{p.subtitle && <span style={{ fontWeight: "normal", color: "#777", fontSize: 11 }}> — {p.subtitle}</span>}</div>
                {p.description && p.description !== "<p></p>" && <HtmlContent html={p.description} style={{ fontSize: 12, marginTop: 2, color: "#444", fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "certificates":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Certifications & Licences" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                <span><b>{c.certificate_name}</b>{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}>{c.no_expiry ? `${c.date} (No expiry)` : c.date}</span>
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
              <div key={i} style={{ marginBottom: 4, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{a.award_name}</b>{a.issuer ? ` — ${a.issuer}` : ""}</span>
                  <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}>{a.date}</span>
                </div>
                {a.description && a.description !== "<p></p>" && <HtmlContent html={a.description} style={{ fontSize: 11, marginTop: 1, color: "#555", fontFamily: fontCSS }} />}
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
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                <span><b>{c.title}</b>{c.institution ? ` — ${c.institution}` : ""}</span>
                <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}>{c.end_date || c.start_date}</span>
              </div>
            ))}
          </div>
        );

      case "publications":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Publications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                <span><b>{p.title}</b></span>{p.publisher && <span style={{ color: "#777" }}> · {p.publisher}</span>}{p.date && <span style={{ color: "#999" }}> ({p.date})</span>}
                {p.description && p.description !== "<p></p>" && <HtmlContent html={p.description} style={{ fontSize: 11, marginTop: 1, color: "#555", fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Board & Committee Memberships" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((o: any, i: number) => (
              <div key={i} style={{ marginBottom: 5, fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{o.name}</b>{o.position ? ` — ${o.position}` : ""}</span>
                  <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}>{o.start_date}{o.start_date && (o.end_date || o.current_flag) ? " – " : ""}{o.current_flag ? "Present" : o.end_date}</span>
                </div>
                {o.description && o.description !== "<p></p>" && <HtmlContent html={o.description} style={{ fontSize: 11, marginTop: 1, color: "#555", fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="Interests" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ fontSize: 12, fontFamily: fontCSS }}>{entries.map((item: any) => item.title).join(" · ")}</div>
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <SectionHeading title="References" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, ...eb, fontFamily: fontCSS }} className="cv-entry">
                  <div style={{ fontWeight: "bold" }}>{r.name}</div>
                  {showDetails(r) ? (
                    <>{r.job_title && <div style={{ color: "#555" }}>{r.job_title}{r.organization ? ` · ${r.organization}` : ""}</div>}{r.email && <div>{r.email}</div>}</>
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
            <SectionHeading title="Declaration" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <HtmlContent html={d.text} style={{ fontSize: 12, color: "#555", fontStyle: "italic", marginBottom: 8, fontFamily: fontCSS }} />
            <div style={{ display: "flex", gap: 32, fontSize: 12, fontFamily: fontCSS }}>
              {d.full_name && <span>Name: <b>{d.full_name}</b></span>}
              {d.place && <span>Place: <b>{d.place}</b></span>}
              {d.date && <span>Date: <b>{d.date}</b></span>}
            </div>
            {d.signature && <div style={{ marginTop: 10, fontFamily: "'Dancing Script', cursive", fontSize: 16, color: accentColor }}>{d.signature}</div>}
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
            <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", marginBottom: 8, border: `2px solid ${accentColor}` }} />
          )}
          <div style={{ fontSize: 28, fontWeight: "bold", color: DARK, letterSpacing: "0.02em", lineHeight: 1.1, fontFamily: fontCSS }}>{personal.full_name || "Your Name"}</div>
          {personal.title && <div style={{ fontSize: 14, color: accentColor, marginTop: 3, fontWeight: "normal", letterSpacing: "0.05em", fontFamily: fontCSS }}>{personal.title}</div>}
          <div style={{ fontSize: 11, color: "#555", marginTop: 6, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 16px", fontFamily: fontCSS }}>
            {personal.email && <span>{personal.email}</span>}{personal.phone && <span>{personal.phone}</span>}{personal.location && <span>{personal.location}</span>}
            {links.filter((l: any) => l.url).map((l: any, i: number) => <span key={i}>{l.url}</span>)}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            {(personal.photo_base64 || personal.photo_url) && (
              <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", marginBottom: 8, border: `2px solid ${accentColor}` }} />
            )}
            <div style={{ fontSize: 28, fontWeight: "bold", color: DARK, letterSpacing: "0.02em", lineHeight: 1.1, fontFamily: fontCSS }}>{personal.full_name || "Your Name"}</div>
            {personal.title && <div style={{ fontSize: 14, color: accentColor, marginTop: 3, fontWeight: "normal", letterSpacing: "0.05em", fontFamily: fontCSS }}>{personal.title}</div>}
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#555", lineHeight: 2, flexShrink: 0, maxWidth: 220, fontFamily: fontCSS }}>
            {personal.email && <div>{personal.email}</div>}{personal.phone && <div>{personal.phone}</div>}{personal.location && <div>{personal.location}</div>}
            {personal.nationality && <div>{personal.nationality}</div>}{personal.visa_status && <div>Visa: {personal.visa_status}</div>}
            {links.filter((l: any) => l.url).map((l: any, i: number) => <div key={i}>{l.url}</div>)}
          </div>
        </div>
      )}
      <div style={{ height: 2, background: `linear-gradient(to right, ${accentColor}, transparent)`, marginBottom: Math.round(14 * sp) }} />

      {sections.map((section) =>
        section.section_type !== "personal_details" ? (
          <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
        ) : null
      )}
    </div>
  );
}
