import React from "react";
import type { CVSection } from "@/types";
import { HtmlContent } from "./HtmlContent";

interface Props {
  sections: CVSection[];
}

function get(sections: CVSection[], type: string) {
  return sections.find((s) => s.section_type === type)?.data ?? {};
}

const NAVY = "#1e3a5f";
const GOLD = "#c9a84c";
const MID = "#374151";
const LIGHT = "#6b7280";

const sectionHeading = {
  fontSize: 11,
  fontWeight: "bold" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: NAVY,
  borderBottom: `2px solid ${GOLD}`,
  paddingBottom: 4,
  marginBottom: 8,
  marginTop: 14,
  pageBreakAfter: "avoid" as const,
  breakAfter: "avoid" as const,
};

const dateStyle = {
  fontSize: 11,
  color: LIGHT,
  whiteSpace: "nowrap" as const,
  flexShrink: 0,
};

const entryStyle = {
  pageBreakInside: "avoid" as const,
  breakInside: "avoid" as const,
};

export function GCCTemplate({ sections }: Props) {
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
            <div style={sectionHeading} className="cv-section-header">Career Objective</div>
            <HtmlContent html={d.summary} style={{ fontSize: 12, color: MID, marginBottom: 4, textAlign: "justify" }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Work Experience</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: 10, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, color: NAVY }}>{entry.job_title}</div>
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
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 3, color: MID }} />
                ) : entry.bullets?.length > 0 ? (
                  <ul style={{ margin: "3px 0 0 14px", padding: 0, listStyleType: "disc" }}>
                    {entry.bullets.map((b: any, j: number) =>
                      b.text && <li key={j} style={{ fontSize: 12, marginBottom: 2, color: MID }}>{b.text}</li>
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
            <div style={sectionHeading} className="cv-section-header">Education & Qualifications</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: 7, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, color: NAVY }}>{entry.degree}</div>
                  <div style={dateStyle}>
                    {entry.start_date}{entry.start_date && entry.end_date ? " – " : ""}{entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: GOLD }}>{entry.institution}{entry.location ? ` · ${entry.location}` : ""}</div>
                {entry.description && entry.description !== "<p></p>" && (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 2, color: MID }} />
                )}
              </div>
            ))}
          </div>
        );

      case "skills":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Skills & Competencies</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
              {entries.map((s: any, i: number) => (
                <div key={i} style={{ fontSize: 12, padding: "2px 0", ...entryStyle }} className="cv-entry">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{s.skill_name}</span>
                    {s.level && <span style={{ color: NAVY, fontSize: 11 }}>{s.level}</span>}
                  </div>
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
            <div style={sectionHeading} className="cv-section-header">Languages</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
              {entries.map((l: any, i: number) => (
                <span key={i} style={{ fontSize: 12 }}>
                  <b>{l.language}</b>{l.level && <span style={{ color: LIGHT }}> — {l.level}</span>}
                </span>
              ))}
            </div>
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Projects</div>
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 6, ...entryStyle }} className="cv-entry">
                <div style={{ fontWeight: "bold", fontSize: 12, color: NAVY }}>{p.title}</div>
                {p.subtitle && <div style={{ fontSize: 11, color: LIGHT, fontStyle: "italic" }}>{p.subtitle}</div>}
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ fontSize: 12, marginTop: 2, color: MID }} />
                )}
                {p.tech?.length > 0 && (
                  <div style={{ fontSize: 11, color: GOLD, marginTop: 1 }}>Technologies: {p.tech.join(", ")}</div>
                )}
              </div>
            ))}
          </div>
        );

      case "certificates":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Certifications</div>
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 12, ...entryStyle }} className="cv-entry">
                <span><b>{c.certificate_name}</b>{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}>{c.no_expiry ? `${c.date} (No expiry)` : c.date}</span>
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
              <div key={i} style={{ marginBottom: 4, fontSize: 12, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{a.award_name}</b>{a.issuer ? ` — ${a.issuer}` : ""}</span>
                  <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}>{a.date}</span>
                </div>
                {a.description && a.description !== "<p></p>" && (
                  <HtmlContent html={a.description} style={{ fontSize: 12, marginTop: 1, color: MID }} />
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
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12, ...entryStyle }} className="cv-entry">
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
            <div style={sectionHeading} className="cv-section-header">Memberships & Associations</div>
            {entries.map((o: any, i: number) => (
              <div key={i} style={{ marginBottom: 5, fontSize: 12, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{o.name}</b>{o.position ? ` — ${o.position}` : ""}</span>
                  <span style={{ color: LIGHT, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {o.start_date}
                    {o.start_date && (o.end_date || o.current_flag) ? " – " : ""}
                    {o.current_flag ? "Present" : o.end_date}
                  </span>
                </div>
                {o.description && o.description !== "<p></p>" && (
                  <HtmlContent html={o.description} style={{ fontSize: 12, marginTop: 1, color: MID }} />
                )}
              </div>
            ))}
          </div>
        );

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Personal Interests</div>
            <div style={{ fontSize: 12 }}>{entries.map((item: any) => item.title).join(" · ")}</div>
          </div>
        );

      case "publications":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Publications</div>
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, ...entryStyle }} className="cv-entry">
                <b>{p.title}</b>
                {p.publisher && <span style={{ color: LIGHT }}> · {p.publisher}</span>}
                {p.date && <span style={{ color: LIGHT }}> ({p.date})</span>}
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ fontSize: 11, marginTop: 1, color: MID }} />
                )}
              </div>
            ))}
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">References</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, ...entryStyle }} className="cv-entry">
                  <div style={{ fontWeight: "bold", color: NAVY }}>{r.name}</div>
                  {showDetails(r) ? (
                    <>
                      {r.job_title && <div style={{ color: MID }}>{r.job_title}{r.organization ? `, ${r.organization}` : ""}</div>}
                      {r.email && <div>{r.email}</div>}
                      {r.phone && <div>{r.phone}</div>}
                    </>
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
            <div style={{ ...sectionHeading, marginTop: 20, borderBottom: `2px solid ${NAVY}` }} className="cv-section-header">Declaration</div>
            <div style={{ border: "1px solid #d1d9e0", borderRadius: 4, padding: "10px 14px", backgroundColor: "#fafbfc" }}>
              <HtmlContent html={d.text} style={{ fontSize: 12, color: MID, lineHeight: 1.8, marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 32, fontSize: 12 }}>
                {d.full_name && <span>Name: <b>{d.full_name}</b></span>}
                {d.place && <span>Place: <b>{d.place}</b></span>}
                {d.date && <span>Date: <b>{d.date}</b></span>}
              </div>
              {d.signature && (
                <div style={{ marginTop: 10, fontFamily: "'Dancing Script', cursive", fontSize: 16, color: NAVY }}>
                  {d.signature}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "0 0 24px", fontSize: 12, color: MID, lineHeight: 1.6, fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: NAVY, padding: "20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff", letterSpacing: "0.01em", lineHeight: 1.2 }}>
            {personal.full_name || "Your Name"}
          </div>
          {personal.title && (
            <div style={{ fontSize: 13, color: GOLD, marginTop: 4, letterSpacing: "0.03em" }}>{personal.title}</div>
          )}
          <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
            {personal.nationality && (
              <span style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 4, padding: "2px 10px", fontSize: 10, display: "inline-block" }}>
                Nationality: {personal.nationality}
              </span>
            )}
            {personal.visa_status && (
              <span style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 4, padding: "2px 10px", fontSize: 10, display: "inline-block" }}>
                Visa: {personal.visa_status}
              </span>
            )}
            {personal.date_of_birth && (
              <span style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 4, padding: "2px 10px", fontSize: 10, display: "inline-block", marginTop: 6 }}>
                DOB: {personal.date_of_birth}
              </span>
            )}
            {personal.gender && (
              <span style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 4, padding: "2px 10px", fontSize: 10, display: "inline-block" }}>
                Gender: {personal.gender}
              </span>
            )}
          </div>
        </div>
        {(personal.photo_base64 || personal.photo_url) ? (
          <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: `3px solid ${GOLD}`, flexShrink: 0, marginLeft: 20 }} />
        ) : null}
      </div>

      {/* Contact bar */}
      <div style={{ backgroundColor: "#f0f4f8", borderBottom: "1px solid #dde3ea", padding: "8px 16px", display: "flex", flexWrap: "wrap", gap: "4px 20px", fontSize: 10, color: LIGHT }}>
        {personal.email && <span>{personal.email}</span>}
        {personal.phone && <span>{personal.phone}</span>}
        {personal.location && <span>{personal.location}</span>}
        {links.filter((l: any) => l.url).map((l: any, i: number) => (
          <span key={i}>{l.url}</span>
        ))}
      </div>

      {/* Sections in display_order */}
      <div style={{ padding: "0 16px" }}>
        {sections.map((section) =>
          section.section_type !== "personal_details" ? (
            <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
          ) : null
        )}
      </div>
    </div>
  );
}
