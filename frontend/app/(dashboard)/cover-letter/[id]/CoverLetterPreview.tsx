import React from "react";
import type { CoverLetter, CoverLetterCustomization, CLPersonalDetails } from "@/types";

interface Props {
  content: string;
  templateId: string;
  customization: CoverLetterCustomization;
  jobTitle: string;
  company: string;
  letter: CoverLetter | null;
  personal: CLPersonalDetails;
}

function Icon({ type, fill }: { type: string; fill: string }) {
  const s: React.CSSProperties = { display: "inline-block", verticalAlign: "middle", marginRight: 4, flexShrink: 0 };
  if (type === "email") return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
  if (type === "phone") return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
  if (type === "location") return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
  if (type === "linkedin") return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>;
  if (type === "github") return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>;
  return <svg style={s} width="11" height="11" viewBox="0 0 24 24" fill={fill}><circle cx="12" cy="12" r="10"/></svg>;
}

function ContactRow({ personal, color = "#6b7280" }: { personal: CLPersonalDetails; color?: string }) {
  const items: { type: string; text: string }[] = [];
  if (personal.email) items.push({ type: "email", text: personal.email });
  if (personal.phone) items.push({ type: "phone", text: personal.phone });
  if (personal.location) items.push({ type: "location", text: personal.location });
  if (personal.linkedin) items.push({ type: "linkedin", text: personal.linkedin });
  if (personal.github) items.push({ type: "github", text: personal.github });
  if (personal.portfolio) items.push({ type: "website", text: personal.portfolio });
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", rowGap: 2, fontSize: 10, color }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", marginRight: 10 }}>
          <Icon type={item.type} fill={color} />
          {item.text}
        </span>
      ))}
    </div>
  );
}

function Body({ content, fontFamily }: { content: string; fontFamily: string }) {
  if (!content) {
    return (
      <p style={{ color: "#9ca3af", fontStyle: "italic", fontSize: 12, lineHeight: 1.8, fontFamily }}>
        Your cover letter will appear here. Click &ldquo;Generate Cover Letter&rdquo; in the right panel to get started.
      </p>
    );
  }
  return (
    <>
      {content.split("\n").filter(p => p.trim()).map((p, i) => (
        <p key={i} style={{ marginBottom: 14, fontSize: 12, lineHeight: 1.8, color: "#374151", fontFamily }}>{p}</p>
      ))}
    </>
  );
}

export function CoverLetterPreview({ content, templateId, customization, jobTitle, company, letter, personal }: Props) {
  const { accentColor, fontFamily } = customization;
  const photoSrc = personal.photo_base64 || personal.photo_url || "";
  const hasPhoto = !!photoSrc;
  const name = personal.full_name || "Your Name";

  // ── 1. CLASSIC ──────────────────────────────────────────────────────────────
  if (templateId === "classic") {
    return (
      <div style={{ fontFamily, padding: "28px 32px", minHeight: "297mm", backgroundColor: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#111827", fontFamily }}>{name}</span>
              {personal.title && (
                <span style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic", fontFamily }}>· {personal.title}</span>
              )}
            </div>
            <div style={{ marginTop: 6 }}><ContactRow personal={personal} color="#6b7280" /></div>
          </div>
          {hasPhoto && <img src={photoSrc} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", marginLeft: 16, border: `2px solid ${accentColor}40` }} />}
        </div>
        <div style={{ borderBottom: "2px solid #111827", marginBottom: 16 }} />
        {(jobTitle || company) && (
          <div style={{ marginBottom: 16, fontSize: 12, fontFamily }}>
            <span style={{ fontWeight: 600, color: accentColor }}>Re: Application for {jobTitle}{company && ` at ${company}`}</span>
          </div>
        )}
        <Body content={content} fontFamily={fontFamily} />
      </div>
    );
  }

  // ── 2. MODERN ───────────────────────────────────────────────────────────────
  if (templateId === "modern") {
    return (
      <div style={{ fontFamily, minHeight: "297mm", backgroundColor: "#ffffff", display: "flex" }}>
        <div style={{ width: "35%", backgroundColor: accentColor, padding: "28px 16px", color: "#fff", flexShrink: 0 }}>
          {hasPhoto && <img src={photoSrc} alt="" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", marginBottom: 12, border: "3px solid rgba(255,255,255,0.3)", display: "block", marginLeft: "auto", marginRight: "auto" }} />}
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 4, fontFamily }}>{name}</div>
          {personal.title && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 16, fontFamily }}>{personal.title}</div>}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}>
            {[
              { type: "email", val: personal.email },
              { type: "phone", val: personal.phone },
              { type: "location", val: personal.location },
              { type: "linkedin", val: personal.linkedin },
              { type: "github", val: personal.github },
            ].filter(x => x.val).map((x, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <Icon type={x.type} fill="rgba(255,255,255,0.8)" />
                <span style={{ fontSize: 10, wordBreak: "break-all" }}>{x.val}</span>
              </div>
            ))}
          </div>
          {(jobTitle || company) && (
            <div style={{ marginTop: 24, padding: 10, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 6 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Applying For</div>
              {jobTitle && <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily }}>{jobTitle}</div>}
              {company && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontFamily }}>{company}</div>}
            </div>
          )}
        </div>
        <div style={{ flex: 1, padding: "28px 24px" }}>
          <Body content={content} fontFamily={fontFamily} />
        </div>
      </div>
    );
  }

  // ── 3. COLORFUL ─────────────────────────────────────────────────────────────
  if (templateId === "colorful") {
    return (
      <div style={{ fontFamily, minHeight: "297mm", backgroundColor: "#ffffff" }}>
        <div style={{ backgroundColor: accentColor, padding: "24px 32px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 2, fontFamily }}>{name}</div>
            {personal.title && <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8, fontFamily }}>{personal.title}</div>}
            <ContactRow personal={personal} color="rgba(255,255,255,0.85)" />
          </div>
          {hasPhoto && <img src={photoSrc} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginLeft: 16, border: "3px solid rgba(255,255,255,0.4)", flexShrink: 0 }} />}
        </div>
        <div style={{ padding: "24px 32px" }}>
          {(jobTitle || company) && (
            <div style={{ marginBottom: 16, padding: "8px 12px", backgroundColor: `${accentColor}15`, borderLeft: `3px solid ${accentColor}`, borderRadius: "0 4px 4px 0", fontSize: 12, color: accentColor, fontWeight: 600 }}>
              Application for {jobTitle}{company && ` at ${company}`}
            </div>
          )}
          <Body content={content} fontFamily={fontFamily} />
        </div>
      </div>
    );
  }

  // ── 4. EXECUTIVE ────────────────────────────────────────────────────────────
  if (templateId === "executive") {
    return (
      <div style={{ fontFamily, padding: "20px 30px", minHeight: "297mm", backgroundColor: "#ffffff" }}>
        <div style={{ textAlign: "center", marginBottom: 16, paddingBottom: 16 }}>
          {hasPhoto && <img src={photoSrc} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px", border: `2px solid ${accentColor}`, display: "block" }} />}
          <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", fontFamily, letterSpacing: "0.02em", marginBottom: 4 }}>{name}</div>
          {personal.title && <div style={{ fontSize: 13, color: accentColor, fontStyle: "italic", marginBottom: 8, fontFamily }}>{personal.title}</div>}
          <div style={{ display: "flex", justifyContent: "center" }}><ContactRow personal={personal} color="#6b7280" /></div>
        </div>
        <div style={{ borderTop: `1px solid ${accentColor}`, borderBottom: `1px solid ${accentColor}`, padding: "6px 0", marginBottom: 20, textAlign: "center", fontSize: 11, color: accentColor, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {jobTitle && company ? `Application — ${jobTitle} at ${company}` : jobTitle || company || "Cover Letter"}
        </div>
        <Body content={content} fontFamily={fontFamily} />
      </div>
    );
  }

  // ── 5. BORDERED ─────────────────────────────────────────────────────────────
  if (templateId === "bordered") {
    return (
      <div style={{ fontFamily, minHeight: "297mm", backgroundColor: "#ffffff", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, border: `6px solid ${accentColor}`, pointerEvents: "none", zIndex: 1 }} />
        <div style={{ padding: "28px 32px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#111827", fontFamily }}>{name}</span>
                {personal.title && <span style={{ fontSize: 13, color: accentColor, fontStyle: "italic", fontFamily }}>· {personal.title}</span>}
              </div>
              <ContactRow personal={personal} color="#6b7280" />
            </div>
            {hasPhoto && <img src={photoSrc} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", marginLeft: 16, border: `2px solid ${accentColor}40` }} />}
          </div>
          {(jobTitle || company) && (
            <div style={{ marginBottom: 16, padding: "6px 10px", border: `1px solid ${accentColor}40`, borderRadius: 4, backgroundColor: `${accentColor}08`, fontSize: 11, color: accentColor, fontWeight: 600 }}>
              Re: {jobTitle}{company && ` — ${company}`}
            </div>
          )}
          <Body content={content} fontFamily={fontFamily} />
        </div>
      </div>
    );
  }

  // ── 6. CREATIVE ─────────────────────────────────────────────────────────────
  if (templateId === "creative") {
    return (
      <div style={{ fontFamily, minHeight: "297mm", backgroundColor: "#ffffff", borderLeft: `5px solid ${accentColor}` }}>
        <div style={{ padding: "28px 32px 28px 40px" }}>
          <div style={{ marginBottom: 8, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", fontFamily, marginBottom: 2 }}>{name}</div>
            {personal.title && <div style={{ fontSize: 13, color: accentColor, fontStyle: "italic", marginBottom: 8, fontFamily }}>{personal.title}</div>}
            <ContactRow personal={personal} color="#6b7280" />
          </div>
          {(jobTitle || company) && (
            <div style={{ display: "flex", gap: 20, marginBottom: 16, alignItems: "baseline" }}>
              <div style={{ width: 100, flexShrink: 0, fontSize: 10, color: "#6b7280" }}>Applying for</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#111827", fontFamily }}>
                {jobTitle}
                {company && <span style={{ fontWeight: 400, color: accentColor, fontStyle: "italic" }}> @ {company}</span>}
              </div>
            </div>
          )}
          <Body content={content} fontFamily={fontFamily} />
        </div>
      </div>
    );
  }

  // ── 7. INLINE ───────────────────────────────────────────────────────────────
  if (templateId === "inline") {
    return (
      <div style={{ fontFamily, padding: "20px 28px", minHeight: "297mm", backgroundColor: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#111827", fontFamily, lineHeight: 1.1 }}>{name}</span>
              {personal.title && <span style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic", fontFamily }}>&nbsp;·&nbsp;{personal.title}</span>}
            </div>
            <ContactRow personal={personal} color="#6b7280" />
          </div>
          {hasPhoto && <img src={photoSrc} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", marginLeft: 20, flexShrink: 0 }} />}
        </div>
        <div style={{ borderBottom: "2px solid #111827", marginBottom: 12 }} />
        {(jobTitle || company) && (
          <div style={{ marginBottom: 14, fontSize: 11, color: accentColor, fontWeight: 600 }}>
            Re: Application for {jobTitle}{company && ` at ${company}`}
          </div>
        )}
        <Body content={content} fontFamily={fontFamily} />
      </div>
    );
  }

  // ── 8. GCC ──────────────────────────────────────────────────────────────────
  if (templateId === "gcc") {
    const pills = [
      personal.nationality ? `Nationality: ${personal.nationality}` : null,
      personal.date_of_birth ? `DOB: ${personal.date_of_birth}` : null,
      personal.gender ? `Gender: ${personal.gender}` : null,
    ].filter(Boolean) as string[];
    return (
      <div style={{ fontFamily, minHeight: "297mm", backgroundColor: "#ffffff" }}>
        {/* Header — accent color background matching GCC CV */}
        <div style={{ backgroundColor: accentColor, padding: "20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#ffffff", letterSpacing: "0.01em", lineHeight: 1.2, fontFamily }}>
              {personal.full_name || "Your Name"}
            </div>
            {personal.title && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4, letterSpacing: "0.03em", fontFamily }}>
                {personal.title}
              </div>
            )}
            {pills.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                {pills.map((pill, i) => (
                  <span key={i} style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 4, padding: "2px 10px", fontSize: 10, display: "inline-block", fontFamily }}>
                    {pill}
                  </span>
                ))}
              </div>
            )}
          </div>
          {hasPhoto && (
            <img src={photoSrc} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.6)", flexShrink: 0, marginLeft: 20 }} />
          )}
        </div>
        {/* Contact row — #f0f4f8 background matching GCC CV */}
        <div style={{ backgroundColor: "#f0f4f8", borderBottom: "1px solid #dde3ea", padding: "8px 16px", display: "flex", flexWrap: "wrap", gap: "4px 20px", fontSize: 10, color: "#6b7280", fontFamily }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
          {personal.github && <span>{personal.github}</span>}
          {personal.portfolio && <span>{personal.portfolio}</span>}
        </div>
        {/* Content — no accent bar, matching GCC CV */}
        <div style={{ padding: "24px 16px" }}>
          {(jobTitle || company) && (
            <div style={{ marginBottom: 16, padding: "8px 12px", backgroundColor: `${accentColor}12`, borderLeft: `3px solid ${accentColor}`, borderRadius: "0 4px 4px 0", fontSize: 12, color: accentColor, fontWeight: 600, fontFamily }}>
              Application for {jobTitle}{company && ` — ${company}`}
            </div>
          )}
          <Body content={content} fontFamily={fontFamily} />
        </div>
      </div>
    );
  }

  return null;
}
