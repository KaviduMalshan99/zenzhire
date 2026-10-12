import type { CVSection } from "@/types";

// Plain-text version of a CV for the ATS checker ("Send to ATS" in the builder,
// "Check ATS score" on the quick-start Ready screen).
const LEADING_BULLET_RE = /^[•\-*►▸▪◦‣⋅]\s*/;

// Rich-text "description" fields are HTML (RichTextEditor); list items become "• " lines.
function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(
    html.replace(/<li[^>]*>/gi, "<li>• ").replace(/<\/(p|li|div)>/gi, "\n$&"),
    "text/html",
  );
  return (doc.body.textContent ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

export function extractCVText(sections: CVSection[]): string {
  const lines: string[] = [];
  for (const s of sections) {
    if (!s.is_visible) continue;
    const d = s.data;
    switch (s.section_type) {
      case "personal_details": {
        if (d.full_name) lines.push(d.full_name);
        if (d.title) lines.push(d.title);
        const contacts = [d.email, d.phone, d.location].filter(Boolean);
        if (contacts.length) lines.push(contacts.join(" | "));
        const links = (d.links ?? []).filter((l: any) => l.url);
        if (links.length) {
          lines.push(links.map((l: any) => `${l.platform}: ${l.url}`).join(" | "));
        }
        break;
      }
      case "profile_summary":
        if (d.summary) { lines.push("\nPROFILE SUMMARY"); lines.push(d.summary); }
        break;
      case "experience":
        if (d.entries?.length) {
          lines.push("\nEXPERIENCE");
          for (const e of d.entries) {
            lines.push(`${e.job_title} at ${e.employer}${e.location ? `, ${e.location}` : ""} (${e.start_date} - ${e.current ? "Present" : e.end_date})`);
            for (const b of (e.bullets ?? [])) {
              if (!b.text) continue;
              // Don't double-prepend a bullet marker if the stored text already has one
              // (defends against already-saved CVs from before the AI-response fix).
              lines.push(LEADING_BULLET_RE.test(b.text) ? b.text : `• ${b.text}`);
            }
            if (e.description) lines.push(htmlToText(e.description));
          }
        }
        break;
      case "education":
        if (d.entries?.length) {
          lines.push("\nEDUCATION");
          for (const e of d.entries) {
            lines.push(`${e.degree} - ${e.institution}${e.location ? `, ${e.location}` : ""} (${e.start_date} - ${e.end_date})`);
            if (e.description) lines.push(e.description);
          }
        }
        break;
      case "skills":
        if (d.entries?.length) {
          lines.push("\nSKILLS");
          lines.push(d.entries.map((s: any) => `${s.skill_name}${s.level ? ` (${s.level})` : ""}`).join(", "));
        }
        break;
      case "languages":
        if (d.entries?.length) {
          lines.push("\nLANGUAGES");
          lines.push(d.entries.map((l: any) => `${l.language}${l.level ? ` - ${l.level}` : ""}`).join(", "));
        }
        break;
      case "projects":
        if (d.entries?.length) {
          lines.push("\nPROJECTS");
          for (const p of d.entries) {
            lines.push(`${p.title}${p.subtitle ? ` - ${p.subtitle}` : ""}`);
            if (p.description) lines.push(htmlToText(p.description));
            if (p.tech?.length) lines.push(`Technologies: ${p.tech.join(", ")}`);
          }
        }
        break;
      case "certificates":
        if (d.entries?.length) {
          lines.push("\nCERTIFICATIONS");
          lines.push(d.entries.map((c: any) => `${c.certificate_name}${c.issuer ? ` - ${c.issuer}` : ""}`).join(", "));
        }
        break;
      case "publications":
        if (d.entries?.length) {
          lines.push("\nPUBLICATIONS");
          for (const p of d.entries) {
            lines.push(`${p.title}${p.publisher ? ` - ${p.publisher}` : ""}${p.date ? ` (${p.date})` : ""}`);
          }
        }
        break;
    }
  }
  return lines.join("\n");
}
