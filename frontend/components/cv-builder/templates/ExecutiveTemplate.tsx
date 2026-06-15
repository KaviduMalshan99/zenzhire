import React from "react";
import type { CVSection } from "@/types";
import { HtmlContent } from "./HtmlContent";

interface Props {
  sections: CVSection[];
}

function get(sections: CVSection[], type: string) {
  return sections.find((s) => s.section_type === type)?.data ?? {};
}

const GOLD = "#b08840";
const DARK = "#1c1c1c";

const sectionHeading: React.CSSProperties = {
  fontSize: 11,
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: GOLD,
  borderBottom: `1px solid ${GOLD}`,
  paddingBottom: 4,
  marginBottom: 8,
  marginTop: 14,
  pageBreakAfter: "avoid",
  breakAfter: "avoid",
};

const dateStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#777",
  fontStyle: "italic",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const entryBreak: React.CSSProperties = {
  pageBreakInside: "avoid",
  breakInside: "avoid",
};

export function ExecutiveTemplate({ sections }: Props) {
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
            <div style={sectionHeading} className="cv-section-header">Executive Summary</div>
            <HtmlContent html={d.summary} style={{ fontSize: 12, color: "#333", marginBottom: 4, fontStyle: "italic", textAlign: "justify" }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Professional Experience</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: 10, ...entryBreak }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 14, color: DARK }}>{entry.job_title}</div>
                  <div style={dateStyle}>
                    {entry.start_date}
                    {entry.start_date && (entry.end_date || entry.current) ? " – " : ""}
                    {entry.current ? "Present" : entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: GOLD, fontWeight: "bold" }}>
                  {entry.employer}{entry.location ? ` · ${entry.location}` : ""}
                </div>
                {entry.description && entry.description !== "<p></p>" ? (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 3, color: "#333" }} />
                ) : entry.bullets?.length > 0 ? (
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    {entry.bullets.map((b: any, j: number) =>
                      b.text && <li key={j} style={{ fontSize: 12, marginBottom: 2, color: "#333" }}>{b.text}</li>
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
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Education</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: 7, ...entryBreak }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13 }}>{entry.degree}</div>
                  <div style={dateStyle}>
                    {entry.start_date}{entry.start_date && entry.end_date ? " – " : ""}{entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: GOLD }}>{entry.institution}{entry.location ? ` · ${entry.location}` : ""}</div>
                {entry.description && entry.description !== "<p></p>" && (
                  <HtmlContent html={entry.description} style={{ fontSize: 11, marginTop: 2, fontStyle: "italic" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "skills":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Core Competencies</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
              {entries.map((s: any, i: number) => (
                <div key={i} style={{ fontSize: 12, ...entryBreak }} className="cv-entry">
                  <span style={{ fontWeight: "bold" }}>{s.skill_name}</span>
                  {s.level && <span style={{ color: "#777", fontSize: 11 }}> — {s.level}</span>}
                  {s.subskills && s.subskills !== "<p></p>" && (
                    <HtmlContent html={s.subskills} style={{ fontSize: 10, color: "#888", marginTop: 1 }} />
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
            <div style={sectionHeading} className="cv-section-header">Languages</div>
            <div style={{ display: "flex", gap: "6px 24px", flexWrap: "wrap" }}>
              {entries.map((l: any, i: number) => (
                <span key={i} style={{ fontSize: 12 }}>
                  <span style={{ fontWeight: "bold" }}>{l.language}</span>
                  {l.level && <span style={{ color: "#777" }}> — {l.level}</span>}
                </span>
              ))}
            </div>
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Key Projects & Initiatives</div>
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 6, ...entryBreak }} className="cv-entry">
                <div style={{ fontWeight: "bold", fontSize: 12 }}>
                  {p.title}
                  {p.subtitle && <span style={{ fontWeight: "normal", color: "#777", fontSize: 11 }}> — {p.subtitle}</span>}
                </div>
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ fontSize: 12, marginTop: 2, color: "#444" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "certificates":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Certifications & Licences</div>
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 12, ...entryBreak }} className="cv-entry">
                <span><b>{c.certificate_name}</b>{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}>{c.date}</span>
              </div>
            ))}
          </div>
        );

      case "awards":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Awards & Recognition</div>
            {entries.map((a: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, ...entryBreak }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{a.award_name}</b>{a.issuer ? ` — ${a.issuer}` : ""}</span>
                  <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}>{a.date}</span>
                </div>
                {a.description && a.description !== "<p></p>" && (
                  <HtmlContent html={a.description} style={{ fontSize: 11, marginTop: 1, color: "#555" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "courses":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Courses & Training</div>
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12, ...entryBreak }} className="cv-entry">
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
            <div style={sectionHeading} className="cv-section-header">Publications</div>
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, ...entryBreak }} className="cv-entry">
                <span><b>{p.title}</b></span>
                {p.publisher && <span style={{ color: "#777" }}> · {p.publisher}</span>}
                {p.date && <span style={{ color: "#999" }}> ({p.date})</span>}
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ fontSize: 11, marginTop: 1, color: "#555" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Board & Committee Memberships</div>
            {entries.map((o: any, i: number) => (
              <div key={i} style={{ marginBottom: 5, fontSize: 12, ...entryBreak }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{o.name}</b>{o.position ? ` — ${o.position}` : ""}</span>
                  <span style={{ color: "#777", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {o.start_date}
                    {o.start_date && (o.end_date || o.current_flag) ? " – " : ""}
                    {o.current_flag ? "Present" : o.end_date}
                  </span>
                </div>
                {o.description && o.description !== "<p></p>" && (
                  <HtmlContent html={o.description} style={{ fontSize: 11, marginTop: 1, color: "#555" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Interests</div>
            <div style={{ fontSize: 12 }}>{entries.map((item: any) => item.title).join(" · ")}</div>
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">References</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, ...entryBreak }} className="cv-entry">
                  <div style={{ fontWeight: "bold" }}>{r.name}</div>
                  {showDetails(r) ? (
                    <>
                      {r.job_title && <div style={{ color: "#555" }}>{r.job_title}{r.organization ? ` · ${r.organization}` : ""}</div>}
                      {r.email && <div>{r.email}</div>}
                    </>
                  ) : (
                    <div style={{ color: "#999", fontStyle: "italic" }}>Available on request</div>
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
            <div style={sectionHeading} className="cv-section-header">Declaration</div>
            <HtmlContent html={d.text} style={{ fontSize: 12, color: "#555", fontStyle: "italic", marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 32, fontSize: 12 }}>
              {d.full_name && <span>Name: <b>{d.full_name}</b></span>}
              {d.place && <span>Place: <b>{d.place}</b></span>}
              {d.date && <span>Date: <b>{d.date}</b></span>}
            </div>
            {d.signature && (
              <div style={{ marginTop: 10, fontFamily: "'Dancing Script', cursive", fontSize: 16, color: GOLD }}>
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
    <div style={{ padding: "17px 40px 40px", fontSize: 12, color: DARK, lineHeight: 1.6, fontFamily: "Georgia, 'Times New Roman', serif", backgroundColor: "#ffffff" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          {(personal.photo_base64 || personal.photo_url) && (
            <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", marginBottom: 8, border: `2px solid ${GOLD}` }} />
          )}
          <div style={{ fontSize: 28, fontWeight: "bold", color: DARK, letterSpacing: "0.02em", lineHeight: 1.1, fontFamily: "Georgia, serif" }}>
            {personal.full_name || "Your Name"}
          </div>
          {personal.title && (
            <div style={{ fontSize: 14, color: GOLD, marginTop: 3, fontWeight: "normal", letterSpacing: "0.05em" }}>
              {personal.title}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: "#555", lineHeight: 2, flexShrink: 0, maxWidth: 220 }}>
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && <div>{personal.location}</div>}
          {personal.nationality && <div>{personal.nationality}</div>}
          {personal.visa_status && <div>Visa: {personal.visa_status}</div>}
          {links.filter((l: any) => l.url).map((l: any, i: number) => (
            <div key={i}>{l.url}</div>
          ))}
        </div>
      </div>
      <div style={{ height: 2, background: `linear-gradient(to right, ${GOLD}, transparent)`, marginBottom: 14 }} />

      {/* Sections in display_order */}
      {sections.map((section) =>
        section.section_type !== "personal_details" ? (
          <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
        ) : null
      )}
    </div>
  );
}
