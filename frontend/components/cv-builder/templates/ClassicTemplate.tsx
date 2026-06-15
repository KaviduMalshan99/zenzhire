import React from "react";
import type { CVSection } from "@/types";
import { HtmlContent } from "./HtmlContent";

interface Props {
  sections: CVSection[];
}

function get(sections: CVSection[], type: string) {
  return sections.find((s) => s.section_type === type)?.data ?? {};
}

const headingStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#2563eb",
  borderBottom: "1.5px solid #2563eb",
  paddingBottom: 5,
  marginBottom: 12,
  marginTop: 20,
};

const dateStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#666",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

export function ClassicTemplate({ sections }: Props) {
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
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Profile Summary</div>
            <HtmlContent html={d.summary} style={{ fontSize: 12, color: "#333", textAlign: "justify" }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Experience</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 14.5, color: "#1e3a5f" }}>{entry.job_title}</div>
                  <div style={dateStyle}>
                    {entry.start_date}
                    {entry.start_date && (entry.end_date || entry.current) ? " – " : ""}
                    {entry.current ? "Present" : entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "#555", fontStyle: "italic" }}>
                  {entry.employer}{entry.location ? ` · ${entry.location}` : ""}
                </div>
                {entry.description && entry.description !== "<p></p>" ? (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 3 }} />
                ) : entry.bullets?.length > 0 ? (
                  <ul style={{ margin: "3px 0 0 14px", padding: 0, listStyleType: "disc" }}>
                    {entry.bullets.map((b: any, j: number) =>
                      b.text && <li key={j} style={{ fontSize: 12, marginBottom: 2 }}>{b.text}</li>
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
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Education</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 15, color: "#1e3a5f" }}>{entry.degree}</div>
                  <div style={dateStyle}>
                    {entry.start_date}{entry.start_date && entry.end_date ? " – " : ""}{entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "#555", fontStyle: "italic" }}>
                  {entry.institution}{entry.location ? ` · ${entry.location}` : ""}
                </div>
                {entry.description && entry.description !== "<p></p>" && (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 2, color: "#444" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "skills":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Skills</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
              {entries.map((s: any, i: number) => (
                <div key={i} className="cv-entry" style={{ padding: "2px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ fontWeight: "bold" }}>{s.skill_name}</span>
                    {s.level && <span style={{ color: "#888", fontSize: 11 }}>{s.level}</span>}
                  </div>
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
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Languages</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
              {entries.map((l: any, i: number) => (
                <span key={i} style={{ fontSize: 12, color: "#333" }}>
                  <span style={{ fontWeight: 700 }}>{l.language}</span>
                  {l.level && <span style={{ color: "#888" }}> · {l.level}</span>}
                </span>
              ))}
            </div>
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Projects</div>
            {entries.map((p: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontWeight: "bold", fontSize: 15, color: "#1e3a5f" }}>{p.title}</span>
                  {(p.start_date || p.end_date) && (
                    <span style={dateStyle}>
                      {p.start_date}{p.start_date && p.end_date ? " – " : ""}{p.end_date}
                    </span>
                  )}
                </div>
                {p.subtitle && <div style={{ fontSize: 12, fontStyle: "italic", color: "#555" }}>{p.subtitle}</div>}
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ fontSize: 12, marginTop: 2 }} />
                )}
                {p.tech?.length > 0 && (
                  <div style={{ fontSize: 11, color: "#2563eb", marginTop: 2 }}>Tech: {p.tech.join(", ")}</div>
                )}
              </div>
            ))}
          </div>
        );

      case "certificates":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Certifications</div>
            {entries.map((c: any, i: number) => (
              <div key={i} className="cv-entry" style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 12 }}>
                <span><b>{c.certificate_name}</b>{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: "#666", whiteSpace: "nowrap", flexShrink: 0 }}>{c.no_expiry ? `${c.date} (No expiry)` : c.date}</span>
              </div>
            ))}
          </div>
        );

      case "awards":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Awards & Achievements</div>
            {entries.map((a: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 6, fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{a.award_name}</b>{a.issuer ? ` — ${a.issuer}` : ""}</span>
                  <span style={{ color: "#666", whiteSpace: "nowrap", flexShrink: 0 }}>{a.date}</span>
                </div>
                {a.description && a.description !== "<p></p>" && (
                  <HtmlContent html={a.description} style={{ fontSize: 12, marginTop: 1, color: "#444" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "courses":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Courses & Training</div>
            {entries.map((c: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12 }}>
                  <span><b>{c.title}</b>{c.institution ? ` — ${c.institution}` : ""}</span>
                  <span style={{ color: "#666", whiteSpace: "nowrap", flexShrink: 0 }}>{c.end_date || c.start_date}</span>
                </div>
                {c.description && c.description !== "<p></p>" && (
                  <HtmlContent html={c.description} style={{ fontSize: 11, color: "#444", marginTop: 1 }} />
                )}
              </div>
            ))}
          </div>
        );

      case "publications":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Publications</div>
            {entries.map((p: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 4, fontSize: 12 }}>
                <span>
                  <b>{p.title}</b>
                  {p.publisher ? ` — ${p.publisher}` : ""}
                  {p.date ? ` (${p.date})` : ""}
                </span>
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ marginTop: 1, color: "#444", fontSize: 11 }} />
                )}
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Organizations & Volunteering</div>
            {entries.map((o: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 4, fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{o.name}</b>{o.position ? ` — ${o.position}` : ""}</span>
                  <span style={{ color: "#666", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {o.start_date}
                    {o.start_date && (o.end_date || o.current_flag) ? " – " : ""}
                    {o.current_flag ? "Present" : o.end_date}
                  </span>
                </div>
                {o.description && o.description !== "<p></p>" && (
                  <HtmlContent html={o.description} style={{ fontSize: 11, marginTop: 1, color: "#444" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Interests</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 12 }}>
              {entries.map((item: any, i: number) => (
                <span key={i}>{item.title}</span>
              ))}
            </div>
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>References</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} className="cv-entry" style={{ fontSize: 12, marginBottom: 4 }}>
                  <div style={{ fontWeight: "bold" }}>{r.name}</div>
                  {showDetails(r) ? (
                    <>
                      {r.job_title && <div style={{ color: "#555" }}>{r.job_title}{r.organization ? ` · ${r.organization}` : ""}</div>}
                      {r.email && <div>{r.email}</div>}
                      {r.phone && <div>{r.phone}</div>}
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
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Declaration</div>
            <HtmlContent html={d.text} style={{ fontSize: 12, color: "#444", marginBottom: 8 }} />
            {d.signature && (
              <div style={{ marginTop: 24, fontFamily: "'Dancing Script', cursive", fontSize: 24, color: "#1e3a5f", borderBottom: "1px solid #ccc", paddingBottom: 4, display: "inline-block" }}>
                {d.signature}
              </div>
            )}
            <div style={{ display: "flex", gap: 40, marginTop: d.signature ? 8 : 0 }}>
              {d.full_name && <div style={{ fontSize: 12 }}>Name: <b>{d.full_name}</b></div>}
              {d.place && <div style={{ fontSize: 12 }}>Place: <b>{d.place}</b></div>}
              {d.date && <div style={{ fontSize: 12 }}>Date: <b>{d.date}</b></div>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        padding: "40px 45px",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 12,
        color: "#1a1a1a",
        lineHeight: 1.5,
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 30, fontWeight: "bold", color: "#1e3a5f", letterSpacing: "0.02em" }}>
          {personal.full_name || "Your Name"}
        </div>
        {personal.title && (
          <div style={{ fontSize: 15, color: "#555", marginTop: 2 }}>{personal.title}</div>
        )}
        <div style={{ fontSize: 11.5, color: "#444", marginTop: 6, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 16px" }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {links.map((l: any, i: number) => l.url && <span key={i}>{l.platform}: {l.url}</span>)}
        </div>
        {(personal.nationality || personal.visa_status || personal.gender) && (
          <div style={{ fontSize: 10, color: "#888", marginTop: 3, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 14px" }}>
            {personal.nationality && <span>Nationality: {personal.nationality}</span>}
            {personal.visa_status && <span>Visa: {personal.visa_status}</span>}
            {personal.gender && <span>Gender: {personal.gender}</span>}
          </div>
        )}
        <div style={{ borderTop: "2px solid #2563eb", marginTop: 10 }} />
      </div>

      {/* Sections */}
      {sections.map((section) =>
        section.section_type !== "personal_details" ? (
          <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
        ) : null
      )}
    </div>
  );
}
