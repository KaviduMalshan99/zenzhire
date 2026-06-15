import React from "react";
import type { CVSection } from "@/types";
import { HtmlContent } from "./HtmlContent";

interface Props {
  sections: CVSection[];
}

function get(sections: CVSection[], type: string) {
  return sections.find((s) => s.section_type === type)?.data ?? {};
}

const SERIF = 'Georgia, "Times New Roman", serif';

const headingStyle: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#111827",
  borderBottom: "1.5px solid #111827",
  paddingBottom: 4,
  marginBottom: 12,
  marginTop: 20,
  pageBreakAfter: "avoid",
  breakAfter: "avoid",
};

const dateStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#374151",
  fontFamily: SERIF,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const entryBreak: React.CSSProperties = {
  pageBreakInside: "avoid",
  breakInside: "avoid",
};

export function MinimalTemplate({ sections }: Props) {
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
            <div className="cv-section-header" style={headingStyle}>Profile</div>
            <HtmlContent
              html={d.summary}
              style={{
                fontSize: 12,
                color: "#111827",
                fontFamily: SERIF,
                textAlign: "justify",
                lineHeight: 1.6,
              }}
            />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Experience</div>
            {entries.map((entry: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 14, ...entryBreak }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#111827", fontFamily: SERIF }}>
                    {entry.job_title}
                  </div>
                  <div style={dateStyle}>
                    {entry.start_date}
                    {entry.start_date && (entry.end_date || entry.current) ? " – " : ""}
                    {entry.current ? "Present" : entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "#374151", fontStyle: "italic", fontFamily: SERIF }}>
                  {entry.employer}{entry.location ? ` · ${entry.location}` : ""}
                </div>
                {entry.description && entry.description !== "<p></p>" ? (
                  <HtmlContent
                    html={entry.description}
                    style={{ fontSize: 12, marginTop: 3, color: "#111827", fontFamily: SERIF }}
                  />
                ) : entry.bullets?.length > 0 ? (
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    {entry.bullets.map((b: any, j: number) =>
                      b.text && (
                        <li key={j} style={{ fontSize: 12, marginBottom: 2, color: "#111827", fontFamily: SERIF }}>
                          {b.text}
                        </li>
                      )
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
              <div key={i} className="cv-entry" style={{ marginBottom: 14, ...entryBreak }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#111827", fontFamily: SERIF }}>
                    {entry.degree}
                  </div>
                  <div style={dateStyle}>
                    {entry.start_date}{entry.start_date && entry.end_date ? " – " : ""}{entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "#374151", fontStyle: "italic", fontFamily: SERIF }}>
                  {entry.institution}{entry.location ? ` · ${entry.location}` : ""}
                </div>
                {entry.description && entry.description !== "<p></p>" && (
                  <HtmlContent
                    html={entry.description}
                    style={{ fontSize: 12, marginTop: 2, color: "#4b5563", fontFamily: SERIF }}
                  />
                )}
              </div>
            ))}
          </div>
        );

      case "skills":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20, ...entryBreak }}>
            <div className="cv-section-header" style={headingStyle}>Skills</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 16px", fontFamily: SERIF }}>
              {entries.map((s: any, i: number) => (
                <div key={i} className="cv-entry" style={{ fontSize: 12, color: "#111827", paddingBottom: 2, ...entryBreak }}>
                  {s.skill_name}
                  {s.level && <span style={{ color: "#4b5563", fontSize: 11 }}> — {s.level}</span>}
                  {s.subskills && s.subskills !== "<p></p>" && (
                    <HtmlContent html={s.subskills} style={{ fontSize: 10, color: "#4b5563", marginTop: 1 }} />
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
            <div style={{ display: "flex", gap: "4px 24px", flexWrap: "wrap", fontFamily: SERIF }}>
              {entries.map((l: any, i: number) => (
                <span key={i} style={{ fontSize: 12, color: "#111827" }}>
                  <span style={{ fontWeight: 700 }}>{l.language}</span>
                  {l.level && <span style={{ color: "#4b5563" }}> — {l.level}</span>}
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
              <div key={i} className="cv-entry" style={{ marginBottom: 14, ...entryBreak }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#111827", fontFamily: SERIF }}>
                    {p.title}
                    {p.subtitle && (
                      <span style={{ fontWeight: 400, color: "#4b5563", fontSize: 12 }}> — {p.subtitle}</span>
                    )}
                  </div>
                  {(p.start_date || p.end_date) && (
                    <span style={dateStyle}>
                      {p.start_date}{p.start_date && p.end_date ? " – " : ""}{p.end_date}
                    </span>
                  )}
                </div>
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent
                    html={p.description}
                    style={{ fontSize: 12, color: "#111827", marginTop: 2, fontFamily: SERIF }}
                  />
                )}
                {p.tech?.length > 0 && (
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2, fontFamily: SERIF }}>
                    {p.tech.join(" · ")}
                  </div>
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
              <div key={i} className="cv-entry" style={{ marginBottom: 5, fontFamily: SERIF, ...entryBreak }}>
                <span style={{ fontSize: 12, color: "#111827" }}><b>{p.title}</b></span>
                {p.publisher && <span style={{ fontSize: 11, color: "#374151" }}> · {p.publisher}</span>}
                {p.date && <span style={{ fontSize: 11, color: "#4b5563" }}> ({p.date})</span>}
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent
                    html={p.description}
                    style={{ fontSize: 11, marginTop: 2, color: "#4b5563", fontFamily: SERIF }}
                  />
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
              <div
                key={i}
                className="cv-entry"
                style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12, marginBottom: 4, fontFamily: SERIF, color: "#111827", ...entryBreak }}
              >
                <span>{c.certificate_name}{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: "#374151", fontSize: 11, whiteSpace: "nowrap", flexShrink: 0 }}>{c.date}</span>
              </div>
            ))}
          </div>
        );

      case "awards":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Awards</div>
            {entries.map((a: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 6, fontFamily: SERIF, ...entryBreak }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>{a.award_name}</span>
                {a.issuer && <span style={{ fontSize: 11, color: "#374151" }}> — {a.issuer}</span>}
                {a.date && <span style={{ fontSize: 11, color: "#4b5563" }}> ({a.date})</span>}
                {a.description && a.description !== "<p></p>" && (
                  <HtmlContent
                    html={a.description}
                    style={{ fontSize: 11, marginTop: 2, color: "#4b5563", fontFamily: SERIF }}
                  />
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
              <div key={i} className="cv-entry" style={{ marginBottom: 4, ...entryBreak }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12, fontFamily: SERIF, color: "#111827" }}>
                  <span><b>{c.title}</b>{c.institution ? ` — ${c.institution}` : ""}</span>
                  <span style={{ color: "#374151", whiteSpace: "nowrap", flexShrink: 0, fontSize: 11 }}>{c.end_date || c.start_date}</span>
                </div>
                {c.description && c.description !== "<p></p>" && (
                  <HtmlContent html={c.description} style={{ fontSize: 11, color: "#4b5563", marginTop: 1, fontFamily: SERIF }} />
                )}
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>Organizations</div>
            {entries.map((o: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 6, fontFamily: SERIF, ...entryBreak }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>{o.name}</span>
                  <span style={dateStyle}>
                    {o.start_date}
                    {o.start_date && (o.end_date || o.current_flag) ? " – " : ""}
                    {o.current_flag ? "Present" : o.end_date}
                  </span>
                </div>
                {o.position && <div style={{ fontSize: 11, color: "#374151", fontStyle: "italic", fontFamily: SERIF }}>{o.position}</div>}
                {o.description && o.description !== "<p></p>" && (
                  <HtmlContent
                    html={o.description}
                    style={{ fontSize: 11, marginTop: 2, color: "#4b5563", fontFamily: SERIF }}
                  />
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
            <div style={{ fontSize: 12, color: "#111827", fontFamily: SERIF }}>
              {entries.map((item: any) => item.title).join(" · ")}
            </div>
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: 20 }}>
            <div className="cv-section-header" style={headingStyle}>References</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontFamily: SERIF }}>
              {entries.map((r: any, i: number) => (
                <div key={i} className="cv-entry" style={{ fontSize: 12, color: "#111827", ...entryBreak }}>
                  <div style={{ fontWeight: 700 }}>{r.name}</div>
                  {showDetails(r) ? (
                    <>
                      {r.job_title && (
                        <div style={{ color: "#374151" }}>
                          {r.job_title}{r.organization ? `, ${r.organization}` : ""}
                        </div>
                      )}
                      {r.email && <div style={{ color: "#4b5563" }}>{r.email}</div>}
                      {r.phone && <div style={{ color: "#4b5563" }}>{r.phone}</div>}
                    </>
                  ) : (
                    <div style={{ color: "#4b5563", fontStyle: "italic" }}>Available on request</div>
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
            <HtmlContent
              html={d.text}
              style={{ fontSize: 12, color: "#374151", marginBottom: 8, fontFamily: SERIF }}
            />
            {d.signature && (
              <div style={{ fontSize: 22, fontFamily: "'Dancing Script', cursive", color: "#111827", marginTop: 12, borderBottom: "1px solid #d1d5db", paddingBottom: 4, display: "inline-block" }}>
                {d.signature}
              </div>
            )}
            <div style={{ display: "flex", gap: 28, marginTop: d.signature ? 8 : 0, fontSize: 11, color: "#374151", fontFamily: SERIF }}>
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

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.nationality,
    ...links.filter((l: any) => l.url).map((l: any) => `${l.platform}: ${l.url}`),
  ].filter(Boolean);

  return (
    <div
      style={{
        padding: "28px 35px",
        fontFamily: SERIF,
        fontSize: 12,
        color: "#111827",
        lineHeight: 1.6,
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      {/* Header — left aligned */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#111827", fontFamily: SERIF, letterSpacing: "-0.01em", lineHeight: 1.1, textAlign: "left" }}>
          {personal.full_name || "Your Name"}
        </div>
        {personal.title && (
          <div style={{ fontSize: 15, color: "#374151", fontFamily: SERIF, marginTop: 4, textAlign: "left" }}>
            {personal.title}
          </div>
        )}
        {contactItems.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              gap: "0 6px",
              marginTop: 10,
              fontSize: 11.5,
              color: "#374151",
              fontFamily: SERIF,
            }}
          >
            {contactItems.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: "#d1d5db" }}>·</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <div style={{ borderTop: "1px solid #d1d5db", marginTop: 14 }} />
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
