import React from "react";
import type { CVSection, CVCustomization } from "@/types";
import { DEFAULT_CUSTOMIZATION, FONT_CSS_MAP } from "@/types";
import { HtmlContent } from "./HtmlContent";
import { SectionHeading } from "../SectionHeading";

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
    default: return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
  }
}

function get(sections: CVSection[], type: string) {
  return sections.find((s) => s.section_type === type)?.data ?? {};
}

// Sections that live in the sidebar regardless of order
const SIDEBAR_TYPES = new Set(["skills", "languages", "interests", "declaration"]);

export function ModernTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }: Props) {
  const { accentColor, fontFamily, spacing, headingStyle } = customization;
  const fontCSS = FONT_CSS_MAP[fontFamily] ?? "Arial, Helvetica, sans-serif";
  const sp = spacing === "compact" ? 0.75 : spacing === "spacious" ? 1.35 : 1.0;

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
    marginTop: 12,
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
    const mb = Math.round(14 * sp);

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Profile" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <HtmlContent html={d.summary} style={{ fontSize: 12, color: "#374151", textAlign: "justify", marginBottom: 4, fontFamily: fontCSS }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Experience" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: Math.round(8 * sp) }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, color: "#1e3a5f", fontFamily: fontCSS }}>{entry.job_title}</div>
                  <div style={dateStyleMain}>
                    {entry.start_date}
                    {entry.start_date && (entry.end_date || entry.current) ? " – " : ""}
                    {entry.current ? "Present" : entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: accentColor, fontWeight: "bold", fontFamily: fontCSS }}>
                  {entry.employer}{entry.location ? ` · ${entry.location}` : ""}
                </div>
                {entry.description && entry.description !== "<p></p>" ? (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 3, color: "#374151", fontFamily: fontCSS }} />
                ) : entry.bullets?.length > 0 ? (
                  <ul style={{ margin: "3px 0 0 14px", padding: 0, listStyleType: "disc" }}>
                    {entry.bullets.map((b: any, j: number) =>
                      b.text && <li key={j} style={{ fontSize: 12, marginBottom: 1.5, color: "#374151", fontFamily: fontCSS }}>{b.text}</li>
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
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Education" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((entry: any, i: number) => (
              <div key={i} style={{ marginBottom: Math.round(6 * sp) }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, color: "#1e3a5f", fontFamily: fontCSS }}>{entry.degree}</div>
                  <div style={dateStyleMain}>
                    {entry.start_date}{entry.start_date && entry.end_date ? " – " : ""}{entry.end_date}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: accentColor, fontFamily: fontCSS }}>{entry.institution}{entry.location ? ` · ${entry.location}` : ""}</div>
                {entry.description && entry.description !== "<p></p>" && (
                  <HtmlContent html={entry.description} style={{ fontSize: 12, marginTop: 2, color: "#374151", fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Projects" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: Math.round(6 * sp) }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontWeight: "bold", fontSize: 13, color: "#1e3a5f", fontFamily: fontCSS }}>{p.title}</span>
                  {(p.start_date || p.end_date) && (
                    <span style={dateStyleMain}>
                      {p.start_date}{p.start_date && p.end_date ? " – " : ""}{p.end_date}
                    </span>
                  )}
                </div>
                {p.subtitle && <div style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic", fontFamily: fontCSS }}>{p.subtitle}</div>}
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ fontSize: 12, marginTop: 2, color: "#374151", fontFamily: fontCSS }} />
                )}
                {p.tech?.length > 0 && (
                  <div style={{ fontSize: 11, color: accentColor, marginTop: 2, fontFamily: fontCSS }}>Tech: {p.tech.join(", ")}</div>
                )}
              </div>
            ))}
          </div>
        );

      case "certificates":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Certifications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, fontSize: 12, fontFamily: fontCSS }}>
                <span><b style={{ color: "#1e3a5f" }}>{c.certificate_name}</b>{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}>{c.date}</span>
              </div>
            ))}
          </div>
        );

      case "awards":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Awards" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((a: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b style={{ color: "#1e3a5f" }}>{a.award_name}</b>{a.issuer ? ` — ${a.issuer}` : ""}</span>
                  <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}>{a.date}</span>
                </div>
                {a.description && a.description !== "<p></p>" && (
                  <HtmlContent html={a.description} style={{ fontSize: 11, marginTop: 1, color: "#6b7280", fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "courses":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Courses & Training" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((c: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontFamily: fontCSS }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12 }}>
                  <span><b style={{ color: "#1e3a5f" }}>{c.title}</b>{c.institution ? ` — ${c.institution}` : ""}</span>
                  <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}>{c.end_date || c.start_date}</span>
                </div>
                {c.description && c.description !== "<p></p>" && (
                  <HtmlContent html={c.description} style={{ fontSize: 11, color: "#6b7280", marginTop: 1, fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "publications":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Publications" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((p: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS }} className="cv-entry">
                <span>
                  <b style={{ color: "#1e3a5f" }}>{p.title}</b>
                  {p.publisher ? ` — ${p.publisher}` : ""}
                  {p.date ? ` (${p.date})` : ""}
                </span>
                {p.description && p.description !== "<p></p>" && (
                  <HtmlContent html={p.description} style={{ marginTop: 1, color: "#6b7280", fontSize: 11, fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Organizations & Volunteering" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((o: any, i: number) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12, fontFamily: fontCSS }} className="cv-entry">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span><b style={{ color: "#1e3a5f" }}>{o.name}</b>{o.position ? ` — ${o.position}` : ""}</span>
                  <span style={{ color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {o.start_date}
                    {o.start_date && (o.end_date || o.current_flag) ? " – " : ""}
                    {o.current_flag ? "Present" : o.end_date}
                  </span>
                </div>
                {o.description && o.description !== "<p></p>" && (
                  <HtmlContent html={o.description} style={{ fontSize: 11, marginTop: 1, color: "#6b7280", fontFamily: fontCSS }} />
                )}
              </div>
            ))}
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="References" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
              {entries.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 12, marginBottom: 4, fontFamily: fontCSS }} className="cv-entry">
                  <div style={{ fontWeight: "bold", color: "#1e3a5f" }}>{r.name}</div>
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

  const sidePad = Math.round(30 * sp);
  const mainPad = Math.round(30 * sp);

  return (
    <div className="modern-outer" style={{ display: "flex", fontFamily: fontCSS, fontSize: 12, minHeight: "297mm", alignItems: "stretch" }}>
      {/* Sidebar */}
      <div className="modern-sidebar" style={{ width: "35%", backgroundColor: sidebarBg, padding: `${sidePad}px 14px`, color: "#e2e8f0", alignSelf: "stretch", position: "relative", zIndex: 1 }}>
        {(personal.photo_base64 || personal.photo_url) && (
          <img src={personal.photo_base64 || personal.photo_url} alt="" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", marginBottom: 12, border: "3px solid rgba(255,255,255,0.4)", display: "block", marginLeft: "auto", marginRight: "auto" }} />
        )}
        <div style={{ fontSize: 20, fontWeight: "bold", color: "#fff", lineHeight: 1.2, fontFamily: fontCSS, textAlign: "center" }}>
          {personal.full_name || "Your Name"}
        </div>
        {personal.title && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 3, fontFamily: fontCSS, textAlign: "center" }}>{personal.title}</div>
        )}

        <div style={sideHeading}>Contact</div>
        <div style={{ fontSize: 11, color: "#cbd5e1", fontFamily: fontCSS }}>
          {personal.email && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              {getContactIcon("email", "#cbd5e1")}
              <span>{personal.email}</span>
            </div>
          )}
          {personal.phone && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              {getContactIcon("phone", "#cbd5e1")}
              <span>{personal.phone}</span>
            </div>
          )}
          {personal.location && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              {getContactIcon("location", "#cbd5e1")}
              <span>{personal.location}</span>
            </div>
          )}
          {personal.nationality && <div style={{ marginBottom: 4 }}>{personal.nationality}</div>}
          {personal.visa_status && <div style={{ marginBottom: 4 }}>Visa: {personal.visa_status}</div>}
          {personal.gender && <div style={{ marginBottom: 4 }}>{personal.gender}</div>}
          {links.map((l: any, i: number) => l.url && (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              {getContactIcon(
                l.platform?.toLowerCase().includes("linkedin") ? "linkedin" :
                l.platform?.toLowerCase().includes("github") ? "github" : "website",
                "#cbd5e1"
              )}
              <span>{l.url}</span>
            </div>
          ))}
        </div>

        {skillEntries.length > 0 && (
          <>
            <div style={sideHeading}>Skills</div>
            <div style={{ fontSize: 11, lineHeight: 1.8, fontFamily: fontCSS }}>
              {skillEntries.map((s: any, i: number) => (
                <div key={i} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.15)", paddingBottom: 2, marginBottom: 3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#e2e8f0" }}>{s.skill_name}</span>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>{s.level}</span>
                  </div>
                  {s.subskills && s.subskills !== "<p></p>" && (
                    <HtmlContent html={s.subskills} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1, fontFamily: fontCSS }} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {langEntries.length > 0 && (
          <>
            <div style={sideHeading}>Languages</div>
            <div style={{ fontSize: 11, lineHeight: 1.8, fontFamily: fontCSS }}>
              {langEntries.map((l: any, i: number) => (
                <div key={i}>
                  <span style={{ color: "#e2e8f0", fontWeight: "bold" }}>{l.language}</span>
                  {l.level && <span style={{ color: "rgba(255,255,255,0.6)" }}> — {l.level}</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {interestEntries.length > 0 && (
          <>
            <div style={sideHeading}>Interests</div>
            <div style={{ fontSize: 11, color: "#cbd5e1", lineHeight: 1.7, fontFamily: fontCSS }}>
              {interestEntries.map((item: any, i: number) => (
                <div key={i}>{item.title}</div>
              ))}
            </div>
          </>
        )}

        {declaration.text && declaration.text !== "<p></p>" && (
          <>
            <div style={sideHeading}>Declaration</div>
            <HtmlContent html={declaration.text} style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.6, fontFamily: fontCSS }} />
            {declaration.signature && (
              <div style={{ marginTop: 6, fontFamily: "'Dancing Script', cursive", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                {declaration.signature}
              </div>
            )}
          </>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: `${mainPad}px 18px`, backgroundColor: "#fff" }}>
        {mainSections.map((section) => (
          <React.Fragment key={section.id}>{renderMainSection(section)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}
