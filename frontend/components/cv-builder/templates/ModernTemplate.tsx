import React from "react";
import type { CVSection } from "@/types";
import { HtmlContent } from "./HtmlContent";

interface Props {
  sections: CVSection[];
}

function get(sections: CVSection[], type: string) {
  return sections.find((s) => s.section_type === type)?.data ?? {};
}

const SIDEBAR_BG = "#1e3a5f";
const ACCENT = "#3b82f6";

const sideHeading = {
  fontSize: 10,
  fontWeight: "bold" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "#93c5fd",
  borderBottom: "1px solid #2d5a8e",
  paddingBottom: 3,
  marginBottom: 6,
  marginTop: 12,
};

const mainHeading = {
  fontSize: 11,
  fontWeight: "bold" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: SIDEBAR_BG,
  borderBottom: `1.5px solid ${ACCENT}`,
  paddingBottom: 3,
  marginBottom: 6,
  marginTop: 10,
  pageBreakAfter: "avoid" as const,
  breakAfter: "avoid" as const,
};

const dateStyleMain = {
  fontSize: 11,
  color: "#6b7280",
  whiteSpace: "nowrap" as const,
  flexShrink: 0,
};

// Sections that live in the sidebar regardless of order
const SIDEBAR_TYPES = new Set(["skills", "languages", "interests", "declaration"]);

export function ModernTemplate({ sections }: Props) {
  const personal = get(sections, "personal_details");
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) =>
    r.privacy ? r.privacy === "show" : r.show_on_cv !== false;

  const skillEntries = sections.find((s) => s.section_type === "skills")?.data?.entries ?? [];
  const langEntries = sections.find((s) => s.section_type === "languages")?.data?.entries ?? [];
  const interestEntries = sections.find((s) => s.section_type === "interests")?.data?.entries ?? [];
  const declaration = get(sections, "declaration");

  const mainSections = sections.filter(
    (s) => s.section_type !== "personal_details" && !SIDEBAR_TYPES.has(s.section_type)
  );

  const renderMainSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section">
            <div style={mainHeading}>Profile</div>
            <HtmlContent html={d.summary} style={{ fontSize: 12, color: "#374151", textAlign: "justify", marginBottom: 4 }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={mainHeading}>Experience</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: 8 }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, color: SIDEBAR_BG }}>{entry.job_title}</div>
                  <div style={dateStyleMain}>
                    {entry.start_date}
                    {entry.start_date && (entry.end_date || entry.current) ? " – " : ""}
                    {entry.current ? "Present" : entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: ACCENT, fontWeight: "bold" }}>
                  {entry.employer}{entry.location ? ` · ${entry.location}` : ""}
                </div>
                {entry.description && entry.description !== "<p></p>" ? (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 3, color: "#374151" }} />
                ) : entry.bullets?.length > 0 ? (
                  <ul style={{ margin: "3px 0 0 14px", padding: 0, listStyleType: "disc" }}>
                    {entry.bullets.map((b: any, j: number) =>
                      b.text && <li key={j} style={{ fontSize: 12, marginBottom: 1.5, color: "#374151" }}>{b.text}</li>
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
            <div style={mainHeading}>Education</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: 6 }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, color: SIDEBAR_BG }}>{entry.degree}</div>
                  <div style={dateStyleMain}>
                    {entry.start_date}{entry.start_date && entry.end_date ? " – " : ""}{entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: ACCENT }}>{entry.institution}{entry.location ? ` · ${entry.location}` : ""}</div>
                {entry.description && entry.description !== "<p></p>" && (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 2, color: "#374151" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={mainHeading}>Projects</div>
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 6 }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontWeight: "bold", fontSize: 13, color: SIDEBAR_BG }}>{p.title}</span>
                  {(p.start_date || p.end_date) && (
                    <span style={dateStyleMain}>
                      {p.start_date}{p.start_date && p.end_date ? " – " : ""}{p.end_date}
                    </span>
                  )}
                </div>
                {p.subtitle && <div style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>{p.subtitle}</div>}
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ fontSize: 12, marginTop: 2, color: "#374151" }} />
                )}
                {p.tech?.length > 0 && (
                  <div style={{ fontSize: 11, color: ACCENT, marginTop: 2 }}>Tech: {p.tech.join(", ")}</div>
                )}
              </div>
            ))}
          </div>
        );

      case "certificates":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={mainHeading}>Certifications</div>
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12 }}>
                <span><b style={{ color: SIDEBAR_BG }}>{c.certificate_name}</b>{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}>{c.date}</span>
              </div>
            ))}
          </div>
        );

      case "awards":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={mainHeading}>Awards</div>
            {entries.map((a: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12 }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b style={{ color: SIDEBAR_BG }}>{a.award_name}</b>{a.issuer ? ` — ${a.issuer}` : ""}</span>
                  <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}>{a.date}</span>
                </div>
                {a.description && a.description !== "<p></p>" && (
                  <HtmlContent html={a.description} style={{ fontSize: 11, marginTop: 1, color: "#6b7280" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "courses":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={mainHeading}>Courses & Training</div>
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ marginBottom: 4 }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12 }}>
                  <span><b style={{ color: SIDEBAR_BG }}>{c.title}</b>{c.institution ? ` — ${c.institution}` : ""}</span>
                  <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}>{c.end_date || c.start_date}</span>
                </div>
                {c.description && c.description !== "<p></p>" && (
                  <HtmlContent html={c.description} style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }} />
                )}
              </div>
            ))}
          </div>
        );

      case "publications":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={mainHeading}>Publications</div>
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12 }} className="cv-entry">
                <span>
                  <b style={{ color: SIDEBAR_BG }}>{p.title}</b>
                  {p.publisher ? ` — ${p.publisher}` : ""}
                  {p.date ? ` (${p.date})` : ""}
                </span>
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ marginTop: 1, color: "#6b7280", fontSize: 11 }} />
                )}
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={mainHeading}>Organizations & Volunteering</div>
            {entries.map((o: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12 }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b style={{ color: SIDEBAR_BG }}>{o.name}</b>{o.position ? ` — ${o.position}` : ""}</span>
                  <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {o.start_date}
                    {o.start_date && (o.end_date || o.current_flag) ? " – " : ""}
                    {o.current_flag ? "Present" : o.end_date}
                  </span>
                </div>
                {o.description && o.description !== "<p></p>" && (
                  <HtmlContent html={o.description} style={{ fontSize: 11, marginTop: 1, color: "#6b7280" }} />
                )}
              </div>
            ))}
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section">
            <div style={mainHeading}>References</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, marginBottom: 4 }} className="cv-entry">
                  <div style={{ fontWeight: "bold", color: SIDEBAR_BG }}>{r.name}</div>
                  {showDetails(r) ? (
                    <>
                      {r.job_title && <div style={{ color: "#555" }}>{r.job_title}{r.organization ? ` · ${r.organization}` : ""}</div>}
                      {r.email && <div>{r.email}</div>}
                      {r.phone && <div>{r.phone}</div>}
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

  return (
    <div style={{ display: "flex", minHeight: "100%", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 12 }}>
      {/* Sidebar — fixed sections */}
      <div style={{ width: "30%", backgroundColor: SIDEBAR_BG, padding: "24px 14px", color: "#e2e8f0" }}>
        {(personal.photo_base64 || personal.photo_url) && (
          <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 10, border: "2px solid #3b82f6" }} />
        )}
        <div style={{ fontSize: 20, fontWeight: "bold", color: "#fff", lineHeight: 1.2 }}>
          {personal.full_name || "Your Name"}
        </div>
        {personal.title && (
          <div style={{ fontSize: 12, color: "#93c5fd", marginTop: 3 }}>{personal.title}</div>
        )}

        <div style={sideHeading}>Contact</div>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: "#cbd5e1" }}>
          {personal.email && <div>✉ {personal.email}</div>}
          {personal.phone && <div>✆ {personal.phone}</div>}
          {personal.location && <div>⌖ {personal.location}</div>}
          {personal.nationality && <div>{personal.nationality}</div>}
          {personal.visa_status && <div>Visa: {personal.visa_status}</div>}
          {personal.gender && <div>{personal.gender}</div>}
          {links.map((l: any, i: number) => l.url && (
            <div key={i}>
              {l.platform?.toLowerCase().includes("linkedin") ? "in " : l.platform?.toLowerCase().includes("github") ? "gh " : "🌐 "}
              {l.url}
            </div>
          ))}
        </div>

        {skillEntries.length > 0 && (
          <>
            <div style={sideHeading}>Skills</div>
            <div style={{ fontSize: 11, lineHeight: 1.8 }}>
              {skillEntries.map((s: any, i: number) => (
                <div key={i} style={{ borderBottom: "0.5px solid #2d5a8e", paddingBottom: 2, marginBottom: 3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#e2e8f0" }}>{s.skill_name}</span>
                    <span style={{ color: "#93c5fd", fontSize: 10 }}>{s.level}</span>
                  </div>
                  {s.subskills && s.subskills !== "<p></p>" && (
                    <HtmlContent html={s.subskills} style={{ fontSize: 10, color: "#93c5fd", opacity: 0.8, marginTop: 1 }} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {langEntries.length > 0 && (
          <>
            <div style={sideHeading}>Languages</div>
            <div style={{ fontSize: 11, lineHeight: 1.8 }}>
              {langEntries.map((l: any, i: number) => (
                <div key={i}>
                  <span style={{ color: "#e2e8f0", fontWeight: "bold" }}>{l.language}</span>
                  {l.level && <span style={{ color: "#93c5fd" }}> — {l.level}</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {interestEntries.length > 0 && (
          <>
            <div style={sideHeading}>Interests</div>
            <div style={{ fontSize: 11, color: "#cbd5e1", lineHeight: 1.7 }}>
              {interestEntries.map((item: any, i: number) => (
                <div key={i}>{item.title}</div>
              ))}
            </div>
          </>
        )}

        {declaration.text && declaration.text !== "<p></p>" && (
          <>
            <div style={sideHeading}>Declaration</div>
            <HtmlContent html={declaration.text} style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.6 }} />
            {declaration.signature && (
              <div style={{ marginTop: 6, fontFamily: "'Dancing Script', cursive", fontSize: 13, color: "#93c5fd" }}>
                {declaration.signature}
              </div>
            )}
          </>
        )}
      </div>

      {/* Main content — sections in display_order */}
      <div style={{ flex: 1, padding: "24px 18px", backgroundColor: "#fff" }}>
        {mainSections.map((section) => (
          <React.Fragment key={section.id}>{renderMainSection(section)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}
