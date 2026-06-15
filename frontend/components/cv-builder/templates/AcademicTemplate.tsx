import React from "react";
import type { CVSection } from "@/types";
import { HtmlContent } from "./HtmlContent";

interface Props {
  sections: CVSection[];
}

function get(sections: CVSection[], type: string) {
  return sections.find((s) => s.section_type === type)?.data ?? {};
}

const DARK = "#1a1a1a";
const MID = "#374151";
const LIGHT = "#6b7280";

const heading = {
  fontSize: 11,
  fontWeight: "bold" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: DARK,
  borderBottom: `1.5px solid ${DARK}`,
  paddingBottom: 4,
  marginBottom: 8,
  marginTop: 14,
  fontFamily: "Georgia, 'Times New Roman', serif",
  pageBreakAfter: "avoid" as const,
  breakAfter: "avoid" as const,
};

const dateStyle = {
  fontSize: 11,
  color: LIGHT,
  fontFamily: "Arial, sans-serif",
  whiteSpace: "nowrap" as const,
  flexShrink: 0,
};

const entryStyle = {
  pageBreakInside: "avoid" as const,
  breakInside: "avoid" as const,
};

export function AcademicTemplate({ sections }: Props) {
  const personal = get(sections, "personal_details");
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) =>
    r.privacy ? r.privacy === "show" : r.show_on_cv !== false;

  const renderSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Profile</div>
            <HtmlContent html={d.summary} style={{ fontSize: 12, color: MID, lineHeight: 1.7 }} />
          </div>
        );

      case "publications":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Publications</div>
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 8, paddingLeft: 16, textIndent: -16, fontSize: 12, ...entryStyle }} className="cv-entry">
                <span style={{ color: LIGHT, fontSize: 11 }}>[{i + 1}] </span>
                {p.title && <span><b>{p.title}.</b> </span>}
                {p.publisher && <span style={{ fontStyle: "italic" }}>{p.publisher}. </span>}
                {p.date && <span style={{ color: LIGHT }}>{p.date}.</span>}
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ marginTop: 2, fontSize: 11, color: LIGHT, fontStyle: "italic" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "education":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Education</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: 10, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 14 }}>{entry.degree}</div>
                  <div style={dateStyle}>
                    {entry.start_date}{entry.start_date && entry.end_date ? " – " : ""}{entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontStyle: "italic", color: MID }}>
                  {entry.institution}{entry.location ? `, ${entry.location}` : ""}
                </div>
                {entry.description && entry.description !== "<p></p>" && (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 3, color: MID }} />
                )}
              </div>
            ))}
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Experience</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: 10, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 14 }}>{entry.job_title}</div>
                  <div style={dateStyle}>
                    {entry.start_date}
                    {entry.start_date && (entry.end_date || entry.current) ? " – " : ""}
                    {entry.current ? "Present" : entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontStyle: "italic", color: MID }}>
                  {entry.employer}{entry.location ? `, ${entry.location}` : ""}
                </div>
                {entry.description && entry.description !== "<p></p>" ? (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 3, color: MID }} />
                ) : entry.bullets?.length > 0 ? (
                  <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                    {entry.bullets.map((b: any, j: number) =>
                      b.text && <li key={j} style={{ fontSize: 12, marginBottom: 2, color: MID }}>{b.text}</li>
                    )}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        );

      case "awards":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Awards</div>
            {entries.map((a: any, i: number) => (
              <div key={i} style={{ marginBottom: 6, fontSize: 12, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{a.award_name}</b>{a.issuer ? `, ${a.issuer}` : ""}</span>
                  <span style={{ color: LIGHT, fontFamily: "Arial, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>{a.date}</span>
                </div>
                {a.description && a.description !== "<p></p>" && (
                  <HtmlContent html={a.description} style={{ marginTop: 2, fontSize: 11, color: MID, fontStyle: "italic" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Projects</div>
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 8, ...entryStyle }} className="cv-entry">
                <div style={{ fontWeight: "bold", fontSize: 13 }}>
                  {p.title}
                  {p.subtitle && <span style={{ fontWeight: "normal", fontStyle: "italic", color: MID }}> — {p.subtitle}</span>}
                </div>
                {(p.start_date || p.end_date) && (
                  <div style={{ fontSize: 11, color: LIGHT, fontFamily: "Arial, sans-serif" }}>
                    {p.start_date}{p.start_date && p.end_date ? " – " : ""}{p.end_date}
                  </div>
                )}
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ fontSize: 12, marginTop: 2, color: MID }} />
                )}
              </div>
            ))}
          </div>
        );

      case "skills":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Skills</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 24px", fontFamily: "Arial, sans-serif" }}>
              {entries.map((s: any, i: number) => (
                <div key={i} style={{ fontSize: 12, paddingBottom: 2, ...entryStyle }} className="cv-entry">
                  {s.skill_name}{s.level && <span style={{ color: LIGHT }}> ({s.level})</span>}
                  {s.subskills && s.subskills !== "<p></p>" && (
                    <HtmlContent html={s.subskills} style={{ fontSize: 10, color: LIGHT, marginTop: 1 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "languages":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Languages</div>
            <div style={{ display: "flex", gap: "4px 24px", flexWrap: "wrap", fontFamily: "Arial, sans-serif" }}>
              {entries.map((l: any, i: number) => (
                <span key={i} style={{ fontSize: 12 }}>
                  <b>{l.language}</b>{l.level && <span style={{ color: LIGHT }}> — {l.level}</span>}
                </span>
              ))}
            </div>
          </div>
        );

      case "certificates":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Certifications</div>
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 12, fontFamily: "Arial, sans-serif", ...entryStyle }} className="cv-entry">
                <span><b>{c.certificate_name}</b>{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}>{c.date}</span>
              </div>
            ))}
          </div>
        );

      case "courses":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Courses</div>
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 12, fontFamily: "Arial, sans-serif", ...entryStyle }} className="cv-entry">
                <span><b>{c.title}</b>{c.institution ? ` — ${c.institution}` : ""}</span>
                <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}>{c.end_date || c.start_date}</span>
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Memberships</div>
            {entries.map((o: any, i: number) => (
              <div key={i} style={{ marginBottom: 5, fontSize: 12, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{o.name}</b>{o.position ? ` — ${o.position}` : ""}</span>
                  <span style={{ color: LIGHT, fontFamily: "Arial, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {o.start_date}
                    {o.start_date && (o.end_date || o.current_flag) ? " – " : ""}
                    {o.current_flag ? "Present" : o.end_date}
                  </span>
                </div>
                {o.description && o.description !== "<p></p>" && (
                  <HtmlContent html={o.description} style={{ fontSize: 11, marginTop: 2, color: MID, fontStyle: "italic" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">Interests</div>
            <div style={{ fontSize: 12, color: MID }}>
              {entries.map((item: any) => item.title).join(" · ")}
            </div>
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={heading} className="cv-section-header">References</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontFamily: "Arial, sans-serif" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, ...entryStyle }} className="cv-entry">
                  <div style={{ fontWeight: "bold" }}>{r.name}</div>
                  {showDetails(r) ? (
                    <>
                      {r.job_title && <div style={{ fontStyle: "italic", color: MID }}>{r.job_title}{r.organization ? `, ${r.organization}` : ""}</div>}
                      {r.email && <div style={{ color: LIGHT, fontSize: 11 }}>{r.email}</div>}
                      {r.phone && <div style={{ color: LIGHT, fontSize: 11 }}>{r.phone}</div>}
                    </>
                  ) : (
                    <div style={{ color: LIGHT, fontStyle: "italic" }}>Available upon request</div>
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
            <div style={heading} className="cv-section-header">Declaration</div>
            <HtmlContent html={d.text} style={{ fontSize: 12, color: MID, fontStyle: "italic", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 32, fontSize: 12, fontFamily: "Arial, sans-serif" }}>
              {d.full_name && <span>Name: <b>{d.full_name}</b></span>}
              {d.place && <span>Place: <b>{d.place}</b></span>}
              {d.date && <span>Date: <b>{d.date}</b></span>}
            </div>
            {d.signature && (
              <div style={{ marginTop: 10, fontSize: 16, fontFamily: "'Dancing Script', cursive", color: DARK }}>
                {d.signature}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "20px 28px", fontSize: 12, color: DARK, lineHeight: 1.7, fontFamily: "Georgia, 'Times New Roman', serif", backgroundColor: "#ffffff" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16, borderBottom: "1px solid #ccc", paddingBottom: 14 }}>
        <div style={{ fontSize: 26, fontWeight: "bold", color: DARK, letterSpacing: "0.01em" }}>
          {personal.full_name || "Your Name"}
        </div>
        {personal.title && (
          <div style={{ fontSize: 14, color: MID, marginTop: 3, fontStyle: "italic" }}>{personal.title}</div>
        )}
        <div style={{ marginTop: 8, fontSize: 11, color: LIGHT, lineHeight: 1.8, fontFamily: "Arial, sans-serif" }}>
          {[personal.email, personal.phone, personal.location, personal.nationality].filter(Boolean).join("  ·  ")}
        </div>
        {links.filter((l: any) => l.url).length > 0 && (
          <div style={{ fontSize: 11, color: LIGHT, fontFamily: "Arial, sans-serif" }}>
            {links.filter((l: any) => l.url).map((l: any) => `${l.platform}: ${l.url}`).join("  ·  ")}
          </div>
        )}
      </div>

      {/* Sections in display_order */}
      {sections.map((section) =>
        section.section_type !== "personal_details" ? (
          <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
        ) : null
      )}
    </div>
  );
}
