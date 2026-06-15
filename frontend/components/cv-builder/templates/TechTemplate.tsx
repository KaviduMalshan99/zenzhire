import React from "react";
import type { CVSection } from "@/types";
import { HtmlContent } from "./HtmlContent";

interface Props {
  sections: CVSection[];
}

function get(sections: CVSection[], type: string) {
  return sections.find((s) => s.section_type === type)?.data ?? {};
}

const HEADER_BG = "#0f172a";
const ACCENT = "#22d3ee";
const MONO = "Arial, Helvetica, sans-serif";

const sectionHeading = {
  display: "block" as const,
  borderLeft: `3px solid ${ACCENT}`,
  paddingLeft: 10,
  marginBottom: 10,
  marginTop: 12,
  fontSize: 10.5,
  fontWeight: "700" as const,
  color: ACCENT,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  fontFamily: "Arial, sans-serif",
  lineHeight: "1.4",
  pageBreakAfter: "avoid" as const,
  breakAfter: "avoid" as const,
};

const dateStyle = {
  fontSize: 11,
  color: "#64748b",
  fontFamily: "Arial, sans-serif",
  whiteSpace: "nowrap" as const,
  flexShrink: 0,
};

const entryStyle = {
  pageBreakInside: "avoid" as const,
  breakInside: "avoid" as const,
};

const skillChip = {
  display: "inline-block" as const,
  padding: "3px 10px",
  border: "1px solid #334155",
  borderRadius: 4,
  fontSize: 10,
  fontFamily: "Arial, sans-serif",
  color: "#e2e8f0",
  marginRight: 6,
  marginBottom: 6,
  verticalAlign: "middle" as const,
};

const linkChip = {
  display: "inline-block" as const,
  padding: "4px 12px",
  border: `1px solid ${ACCENT}`,
  borderRadius: 4,
  color: ACCENT,
  fontSize: 10,
  fontFamily: "Arial, sans-serif",
  lineHeight: "1.4",
  marginRight: 8,
  marginBottom: 6,
  verticalAlign: "middle" as const,
};

export function TechTemplate({ sections }: Props) {
  const personal = get(sections, "personal_details");
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) =>
    r.privacy ? r.privacy === "show" : r.show_on_cv !== false;

  const githubLink = links.find((l: any) => l.platform?.toLowerCase().includes("github"));
  const portfolioLink = links.find(
    (l: any) =>
      l.platform?.toLowerCase().includes("portfolio") ||
      l.platform?.toLowerCase().includes("website")
  );
  const otherLinks = links.filter((l: any) => l !== githubLink && l !== portfolioLink && l.url);

  const skillSection = sections.find((s) => s.section_type === "skills");
  const skillEntries = skillSection?.data?.entries ?? [];

  const otherSections = sections.filter(
    (s) => s.section_type !== "personal_details" && s.section_type !== "skills"
  );

  const renderSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">About</div>
            <HtmlContent html={d.summary} style={{ fontSize: 12, color: "#334155", marginBottom: 4 }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Experience</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${i === 0 ? ACCENT : "#e2e8f0"}`, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, color: "#0f172a" }}>{entry.job_title}</div>
                  <div style={dateStyle}>
                    {entry.start_date}
                    {entry.start_date && (entry.end_date || entry.current) ? " → " : ""}
                    {entry.current ? "now" : entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: ACCENT, fontFamily: "Arial, sans-serif" }}>
                  {entry.employer}{entry.location ? ` // ${entry.location}` : ""}
                </div>
                {entry.description && entry.description !== "<p></p>" ? (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 3, color: "#334155" }} />
                ) : entry.bullets?.length > 0 ? (
                  <ul style={{ margin: "4px 0 0 14px", padding: 0 }}>
                    {entry.bullets.map((b: any, j: number) =>
                      b.text && <li key={j} style={{ fontSize: 12, marginBottom: 2, color: "#334155" }}>{b.text}</li>
                    )}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Projects</div>
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 8, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontWeight: "bold", fontSize: 13, color: "#0f172a" }}>{p.title}</span>
                  {(p.start_date || p.end_date) && (
                    <span style={dateStyle}>
                      {p.start_date}{p.start_date && p.end_date ? " → " : ""}{p.end_date}
                    </span>
                  )}
                </div>
                {p.subtitle && <div style={{ fontSize: 11, color: "#64748b" }}>{p.subtitle}</div>}
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ fontSize: 12, marginTop: 2, color: "#334155" }} />
                )}
                {p.tech?.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    {p.tech.map((t: string, ti: number) => (
                      <span key={ti} style={{ ...skillChip, border: "1px solid #cbd5e1", color: "#475569", background: "#f8fafc" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
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
              <div key={i} style={{ marginBottom: 6, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13 }}>{entry.degree}</div>
                  <div style={dateStyle}>
                    {entry.start_date}{entry.start_date && entry.end_date ? " – " : ""}{entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#475569" }}>{entry.institution}{entry.location ? ` · ${entry.location}` : ""}</div>
                {entry.description && entry.description !== "<p></p>" && (
                  <HtmlContent html={entry.description} style={{ fontSize: 11, marginTop: 1, color: "#64748b" }} />
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
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12, ...entryStyle }} className="cv-entry">
                <span><b>{c.certificate_name}</b>{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: "#64748b", whiteSpace: "nowrap", flexShrink: 0 }}>{c.date}</span>
              </div>
            ))}
          </div>
        );

      case "awards":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Awards</div>
            {entries.map((a: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{a.award_name}</b>{a.issuer ? ` — ${a.issuer}` : ""}</span>
                  <span style={{ color: "#64748b", whiteSpace: "nowrap", flexShrink: 0 }}>{a.date}</span>
                </div>
                {a.description && a.description !== "<p></p>" && (
                  <HtmlContent html={a.description} style={{ fontSize: 11, marginTop: 1, color: "#64748b" }} />
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
                <span style={{ color: "#64748b", whiteSpace: "nowrap", flexShrink: 0 }}>{c.end_date || c.start_date}</span>
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
              <div key={i} style={{ marginBottom: 4, fontSize: 12, ...entryStyle }} className="cv-entry">
                <span><b>{p.title}</b>{p.publisher ? ` — ${p.publisher}` : ""}{p.date ? ` (${p.date})` : ""}</span>
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ fontSize: 11, marginTop: 1, color: "#64748b" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "languages":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Languages</div>
            <div style={{ fontSize: 12, color: "#334155" }}>
              {entries.map((l: any, i: number) => (
                <span key={i}>
                  {i > 0 && "  ·  "}
                  <b>{l.language}</b>
                  {l.level && <span style={{ color: "#64748b" }}> — {l.level}</span>}
                </span>
              ))}
            </div>
          </div>
        );

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Interests</div>
            <div>
              {entries.map((item: any, i: number) => (
                <span key={i} style={{ ...skillChip, border: "1px solid #e2e8f0", color: "#475569", background: "#f1f5f9" }}>
                  {item.title}
                </span>
              ))}
            </div>
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={sectionHeading} className="cv-section-header">Organizations</div>
            {entries.map((o: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, ...entryStyle }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b>{o.name}</b>{o.position ? ` — ${o.position}` : ""}</span>
                  <span style={{ color: "#64748b", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {o.start_date}
                    {o.start_date && (o.end_date || o.current_flag) ? " – " : ""}
                    {o.current_flag ? "Present" : o.end_date}
                  </span>
                </div>
                {o.description && o.description !== "<p></p>" && (
                  <HtmlContent html={o.description} style={{ fontSize: 11, marginTop: 1, color: "#64748b" }} />
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, ...entryStyle }} className="cv-entry">
                  <div style={{ fontWeight: "bold" }}>{r.name}</div>
                  {showDetails(r) ? (
                    <>
                      {r.job_title && <div style={{ color: "#64748b" }}>{r.job_title}</div>}
                      {r.email && <div style={{ fontSize: 11 }}>{r.email}</div>}
                    </>
                  ) : (
                    <div style={{ color: "#94a3b8", fontStyle: "italic" }}>Available on request</div>
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
            <HtmlContent html={d.text} style={{ fontSize: 12, color: "#475569", marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 32, fontSize: 12, color: "#64748b" }}>
              {d.full_name && <span>Name: <b>{d.full_name}</b></span>}
              {d.place && <span>Place: <b>{d.place}</b></span>}
              {d.date && <span>Date: <b>{d.date}</b></span>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.5, fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* Dark header */}
      <div style={{ backgroundColor: HEADER_BG, padding: "20px 24px 16px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff", letterSpacing: "-0.01em" }}>
              {personal.full_name || "Your Name"}
            </div>
            {personal.title && (
              <div style={{ fontSize: 13, color: ACCENT, marginTop: 2, fontFamily: "Arial, sans-serif" }}>{personal.title}</div>
            )}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "Arial, sans-serif", lineHeight: "1.8", textAlign: "right" }}>
            {personal.email && <div>{personal.email}</div>}
            {personal.phone && <div>{personal.phone}</div>}
            {personal.location && <div>{personal.location}</div>}
          </div>
        </div>
        {(githubLink || portfolioLink || otherLinks.length > 0) && (
          <div style={{ marginTop: 10 }}>
            {githubLink && (
              <span style={linkChip}>
                GitHub: {githubLink.url}
              </span>
            )}
            {portfolioLink && (
              <span style={{ ...linkChip, border: "1px solid #475569", color: "#94a3b8" }}>
                Portfolio: {portfolioLink.url}
              </span>
            )}
            {otherLinks.map((l: any, i: number) => (
              <span key={i} style={{ ...linkChip, border: "1px solid #374151", color: "#64748b" }}>
                {l.platform}: {l.url}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "0 24px 24px", backgroundColor: "#ffffff" }}>
        {/* Skills — always pinned near top */}
        {skillEntries.length > 0 && (
          <div className="cv-section">
            <div style={{ ...sectionHeading, marginTop: 16 }} className="cv-section-header">Skills</div>
            <div>
              {skillEntries.map((s: any, i: number) => (
                <span
                  key={i}
                  style={{
                    ...skillChip,
                    background:
                      s.level === "Expert" || s.level === "Advanced"
                        ? `${ACCENT}20`
                        : "#1e293b",
                    border:
                      s.level === "Expert" || s.level === "Advanced"
                        ? `1px solid ${ACCENT}60`
                        : "1px solid #334155",
                    color:
                      s.level === "Expert" || s.level === "Advanced"
                        ? "#0e7490"
                        : "#e2e8f0",
                  }}
                >
                  {s.skill_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Remaining sections in display_order */}
        {otherSections.map((section) => (
          <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}
