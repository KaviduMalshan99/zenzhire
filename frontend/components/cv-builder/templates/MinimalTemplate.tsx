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

function levelToDots(level: string): number {
  const l = (level ?? "").toLowerCase();
  if (l.includes("native") || l.includes("fluent") || l === "c2") return 5;
  if (l.includes("professional") || l === "c1" || l === "b2") return 4;
  if (l === "b1") return 3;
  if (l === "a2" || l.includes("basic")) return 2;
  if (l === "a1") return 1;
  return 3;
}

function DotRating({ count, color }: { count: number; color: string }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ display: "inline-block", color: i <= count ? color : "#e5e7eb", fontSize: 13, marginRight: 1 }}>
          &#9679;
        </span>
      ))}
    </>
  );
}

function getContactIcon(type: string, fill: string): React.ReactNode {
  const s: React.CSSProperties = { display: "inline-block", verticalAlign: "middle", marginRight: 5 };
  switch (type) {
    case "email":
      return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
    case "phone":
      return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
    case "location":
      return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
    case "linkedin":
      return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>;
    case "github":
      return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>;
    default:
      return <svg style={s} width="12" height="12" viewBox="0 0 24 24" fill={fill}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
  }
}

export function MinimalTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }: Props) {
  const { accentColor, fontFamily, spacing, headingStyle, skillStyle = "classic", skillColumns = 2 } = customization;
  const fontCSS = FONT_CSS_MAP[fontFamily] ?? "Arial, Helvetica, sans-serif";
  const sp = spacing === "compact" ? 0.75 : spacing === "spacious" ? 1.35 : 1.0;
  const mb = Math.round(14 * sp);
  const entryMb = Math.round(10 * sp);

  const personal = get(sections, "personal_details");
  const links: any[] = personal.links ?? [];
  const showDetails = (r: any) => (r.privacy ? r.privacy === "show" : r.show_on_cv !== false);
  const eb: React.CSSProperties = { pageBreakInside: "avoid", breakInside: "avoid" };
  const dateStyle: React.CSSProperties = { fontSize: 11, color: "#374151", whiteSpace: "nowrap", flexShrink: 0, fontFamily: fontCSS };

  const contactItems: { type: string; text: string }[] = [];
  if (personal.email) contactItems.push({ type: "email", text: personal.email });
  if (personal.phone) contactItems.push({ type: "phone", text: personal.phone });
  if (personal.location) contactItems.push({ type: "location", text: personal.location });
  if (personal.nationality) contactItems.push({ type: "nationality", text: personal.nationality });
  links.filter((l: any) => l.url).forEach((l: any) => {
    const lp = (l.platform ?? "").toLowerCase();
    const type = lp.includes("linkedin") ? "linkedin" : lp.includes("github") ? "github" : "website";
    contactItems.push({ type, text: l.url });
  });

  const hasPhoto = !!(personal.photo_base64 || personal.photo_url);

  const renderSection = (section: CVSection) => {
    const d = section.data;
    const entries = d.entries ?? [];

    switch (section.section_type) {
      case "profile_summary":
        if (!d.summary || d.summary === "<p></p>") return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Profile" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <HtmlContent html={d.summary} style={{ fontSize: 12, color: "#111827", fontFamily: fontCSS, textAlign: "justify", lineHeight: 1.6 }} />
          </div>
        );

      case "experience":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Experience" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((e: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: entryMb, ...eb }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", fontFamily: fontCSS }}>{e.job_title}</div>
                  <div style={dateStyle}>{e.start_date}{e.start_date && (e.end_date || e.current) ? " – " : ""}{e.current ? "Present" : e.end_date}</div>
                </div>
                <div style={{ fontSize: 12, color: "#374151", fontStyle: "italic", fontFamily: fontCSS }}>{e.employer}{e.location ? ` · ${e.location}` : ""}</div>
                {e.description && e.description !== "<p></p>" ? (
                  <HtmlContent html={e.description} style={{ fontSize: 12, marginTop: 3, color: "#111827", fontFamily: fontCSS }} />
                ) : e.bullets?.length > 0 ? (
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    {e.bullets.map((b: any, j: number) => b.text && <li key={j} style={{ fontSize: 12, marginBottom: 2, color: "#111827", fontFamily: fontCSS }}>{b.text}</li>)}
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
            {entries.map((e: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: entryMb, ...eb }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", fontFamily: fontCSS }}>{e.degree}</div>
                  <div style={dateStyle}>{e.start_date}{e.start_date && e.end_date ? " – " : ""}{e.end_date}</div>
                </div>
                <div style={{ fontSize: 12, color: "#374151", fontStyle: "italic", fontFamily: fontCSS }}>{e.institution}{e.location ? ` · ${e.location}` : ""}</div>
                {e.description && e.description !== "<p></p>" && (
                  <HtmlContent html={e.description} style={{ fontSize: 12, marginTop: 2, color: "#4b5563", fontFamily: fontCSS }} />
                )}
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
          <div className="cv-section" style={{ marginBottom: mb, ...eb }}>
            <SectionHeading title="Skills" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: finalCols, gap: `${Math.round(6 * sp)}px ${Math.round(16 * sp)}px` }}>
              {entries.map((s: any, i: number) => (
                <div key={i} className="cv-entry" style={{ ...eb }}>
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
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Languages" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "flex", gap: "8px 32px", flexWrap: "wrap", fontFamily: fontCSS }}>
              {entries.map((l: any, i: number) => (
                <div key={i} className="cv-entry" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", fontFamily: fontCSS }}>{l.language}</span>
                  <DotRating count={levelToDots(l.level ?? "")} color={accentColor} />
                </div>
              ))}
            </div>
          </div>
        );

      case "projects":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Projects" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((p: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: entryMb, ...eb }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", fontFamily: fontCSS }}>
                    {p.title}{p.subtitle && <span style={{ fontWeight: 400, color: "#4b5563", fontSize: 12 }}> — {p.subtitle}</span>}
                  </div>
                  {(p.start_date || p.end_date) && <span style={dateStyle}>{p.start_date}{p.start_date && p.end_date ? " – " : ""}{p.end_date}</span>}
                </div>
                {p.description && p.description !== "<p></p>" && <HtmlContent html={p.description} style={{ fontSize: 12, color: "#111827", marginTop: 2, fontFamily: fontCSS }} />}
                {p.tech?.length > 0 && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2, fontFamily: fontCSS }}>{p.tech.join(" · ")}</div>}
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
              <div key={i} className="cv-entry" style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12, marginBottom: 4, fontFamily: fontCSS, color: "#111827", ...eb }}>
                <span>{c.certificate_name}{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: "#374151", fontSize: 11, whiteSpace: "nowrap", flexShrink: 0 }}>{c.no_expiry ? `${c.date} (No expiry)` : c.date}</span>
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
              <div key={i} className="cv-entry" style={{ marginBottom: 6, fontFamily: fontCSS, ...eb }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>{a.award_name}</span>
                {a.issuer && <span style={{ fontSize: 11, color: "#374151" }}> — {a.issuer}</span>}
                {a.date && <span style={{ fontSize: 11, color: "#4b5563" }}> ({a.date})</span>}
                {a.description && a.description !== "<p></p>" && <HtmlContent html={a.description} style={{ fontSize: 11, marginTop: 2, color: "#4b5563", fontFamily: fontCSS }} />}
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
              <div key={i} className="cv-entry" style={{ marginBottom: 4, ...eb }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12, fontFamily: fontCSS, color: "#111827" }}>
                  <span><b>{c.title}</b>{c.institution ? ` — ${c.institution}` : ""}</span>
                  <span style={{ color: "#374151", whiteSpace: "nowrap", flexShrink: 0, fontSize: 11 }}>{c.end_date || c.start_date}</span>
                </div>
                {c.description && c.description !== "<p></p>" && <HtmlContent html={c.description} style={{ fontSize: 11, color: "#4b5563", marginTop: 1, fontFamily: fontCSS }} />}
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
              <div key={i} className="cv-entry" style={{ marginBottom: 5, fontFamily: fontCSS, ...eb }}>
                <span style={{ fontSize: 12, color: "#111827" }}><b>{p.title}</b></span>
                {p.publisher && <span style={{ fontSize: 11, color: "#374151" }}> · {p.publisher}</span>}
                {p.date && <span style={{ fontSize: 11, color: "#4b5563" }}> ({p.date})</span>}
                {p.description && p.description !== "<p></p>" && <HtmlContent html={p.description} style={{ fontSize: 11, marginTop: 2, color: "#4b5563", fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "organizations":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Organizations" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            {entries.map((o: any, i: number) => (
              <div key={i} className="cv-entry" style={{ marginBottom: 6, fontFamily: fontCSS, ...eb }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>{o.name}</span>
                  <span style={dateStyle}>{o.start_date}{o.start_date && (o.end_date || o.current_flag) ? " – " : ""}{o.current_flag ? "Present" : o.end_date}</span>
                </div>
                {o.position && <div style={{ fontSize: 11, color: "#374151", fontStyle: "italic", fontFamily: fontCSS }}>{o.position}</div>}
                {o.description && o.description !== "<p></p>" && <HtmlContent html={o.description} style={{ fontSize: 11, marginTop: 2, color: "#4b5563", fontFamily: fontCSS }} />}
              </div>
            ))}
          </div>
        );

      case "interests":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Interests" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ fontSize: 12, color: "#111827", fontFamily: fontCSS }}>{entries.map((item: any) => item.title).join(" · ")}</div>
          </div>
        );

      case "references":
        if (!entries.length) return null;
        return (
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="References" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: `6px ${Math.round(24 * sp)}px`, fontFamily: fontCSS }}>
              {entries.map((r: any, i: number) => (
                <div key={i} className="cv-entry" style={{ fontSize: 12, color: "#111827", ...eb }}>
                  <div style={{ fontWeight: 700 }}>{r.name}</div>
                  {showDetails(r) ? (
                    <>
                      {r.job_title && <div style={{ color: "#374151" }}>{r.job_title}{r.organization ? `, ${r.organization}` : ""}</div>}
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
          <div className="cv-section" style={{ marginBottom: mb }}>
            <SectionHeading title="Declaration" accentColor={accentColor} headingStyle={headingStyle} fontFamily={fontCSS} />
            <HtmlContent html={d.text} style={{ fontSize: 12, color: "#374151", marginBottom: 8, fontFamily: fontCSS }} />
            {d.signature && (
              <div style={{ fontSize: 22, fontFamily: "'Dancing Script', cursive", color: "#111827", marginTop: 12, borderBottom: "1px solid #d1d5db", paddingBottom: 4, display: "inline-block" }}>{d.signature}</div>
            )}
            <div style={{ display: "flex", gap: 28, marginTop: d.signature ? 8 : 0, fontSize: 11, color: "#374151", fontFamily: fontCSS }}>
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
    <div style={{ fontFamily: fontCSS, fontSize: 12, color: "#111827", lineHeight: 1.6, backgroundColor: "#ffffff", boxSizing: "border-box" }}>
      {/* Colored header */}
      <div style={{ backgroundColor: accentColor, padding: "24px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          {hasPhoto && (
            <img
              src={personal.photo_base64 || personal.photo_url}
              alt=""
              style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "3px solid rgba(255,255,255,0.5)" }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", fontFamily: fontCSS, lineHeight: 1.15 }}>
              {personal.full_name || "Your Name"}
            </div>
            {personal.title && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontFamily: fontCSS, marginTop: 4 }}>{personal.title}</div>
            )}
            {contactItems.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8 }}>
                {contactItems.map((item, i) => (
                  <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", fontFamily: fontCSS }}>
                    {getContactIcon(item.type, "white")}{item.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 32px" }}>
        {sections.map((section) =>
          section.section_type !== "personal_details" ? (
            <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
          ) : null
        )}
      </div>
    </div>
  );
}
