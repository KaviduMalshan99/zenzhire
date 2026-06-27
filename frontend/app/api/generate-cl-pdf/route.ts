import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import puppeteerCore from "puppeteer-core";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getChromePath(): string | undefined {
  const username = process.env.USERNAME || process.env.USER || "";
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].filter(Boolean) as string[];
  return candidates.find((p) => { try { return fs.existsSync(p); } catch { return false; } });
}

function contactRow(p: any, color: string): string {
  return [p?.email, p?.phone, p?.location, p?.linkedin, p?.github, p?.portfolio]
    .filter(Boolean)
    .map((t) => `<span style="margin-right:10px;font-size:10px;color:${color}">${t}</span>`)
    .join("");
}

function sidebarContacts(p: any, color: string): string {
  return [
    { val: p?.email, label: "✉" },
    { val: p?.phone, label: "☎" },
    { val: p?.location, label: "📍" },
    { val: p?.linkedin, label: "in" },
    { val: p?.github, label: "gh" },
  ].filter(x => x.val).map(x =>
    `<div style="display:flex;align-items:center;margin-bottom:4px;font-size:10px;color:${color};word-break:break-all">
      <span style="min-width:14px;margin-right:4px;font-size:10px">${x.label}</span>${x.val}
    </div>`
  ).join("");
}

function paragraphs(content: string): string {
  return (content ?? "").split("\n").filter((p: string) => p.trim())
    .map((p: string) => `<p style="margin-bottom:14px;font-size:12px;line-height:1.8;color:#374151">${p}</p>`)
    .join("");
}

function photoTag(p: any, size: number, extraStyle = ""): string {
  const src = p?.photo_base64 || p?.photo_url || "";
  if (!src) return "";
  return `<img src="${src}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;${extraStyle}" />`;
}

function buildHtml(content: string, templateId: string, accentColor: string, fontFamily: string, jobTitle: string, company: string, letterTitle: string, personal: any): string {
  const name = personal?.full_name || "Your Name";
  const jobLine = jobTitle ? `${jobTitle}${company ? ` at ${company}` : ""}` : "";
  const para = paragraphs(content);

  let body = "";

  if (templateId === "modern") {
    body = `
    <table style="width:100%;table-layout:fixed;min-height:297mm;border-collapse:collapse">
      <tr>
        <td style="width:35%;background:${accentColor};vertical-align:top;padding:28px 16px">
          ${photoTag(personal, 80, `display:block;margin:0 auto 12px;border:3px solid rgba(255,255,255,0.3)`)}
          <div style="font-size:16px;font-weight:700;color:#fff;text-align:center;margin-bottom:4px">${name}</div>
          ${personal?.title ? `<div style="font-size:11px;color:rgba(255,255,255,0.8);text-align:center;margin-bottom:16px">${personal.title}</div>` : ""}
          ${sidebarContacts(personal, "rgba(255,255,255,0.8)")}
          ${jobTitle ? `<div style="margin-top:24px;padding:10px;background:rgba(255,255,255,0.15);border-radius:6px">
            <div style="font-size:9px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Applying For</div>
            <div style="font-size:11px;font-weight:700;color:#fff">${jobTitle}</div>
            ${company ? `<div style="font-size:10px;color:rgba(255,255,255,0.8)">${company}</div>` : ""}
          </div>` : ""}
        </td>
        <td style="vertical-align:top;padding:28px 24px">${para}</td>
      </tr>
    </table>`;

  } else if (templateId === "colorful") {
    body = `
    <div style="background:${accentColor};padding:24px 32px;color:#fff;display:flex;align-items:center;justify-content:space-between">
      <div style="flex:1">
        <div style="font-size:24px;font-weight:700;margin-bottom:2px">${name}</div>
        ${personal?.title ? `<div style="font-size:13px;opacity:0.85;margin-bottom:8px">${personal.title}</div>` : ""}
        ${contactRow(personal, "rgba(255,255,255,0.85)")}
      </div>
      ${photoTag(personal, 80, `margin-left:16px;flex-shrink:0;border:3px solid rgba(255,255,255,0.4)`)}
    </div>
    <div style="padding:24px 32px">
      ${jobTitle ? `<div style="margin-bottom:16px;padding:8px 12px;background:${accentColor}15;border-left:3px solid ${accentColor};border-radius:0 4px 4px 0;font-size:12px;color:${accentColor};font-weight:600">Application for ${jobTitle}${company ? ` at ${company}` : ""}</div>` : ""}
      ${para}
    </div>`;

  } else if (templateId === "executive") {
    body = `
    <div style="padding:20px 30px;font-family:${fontFamily},Georgia,serif">
      <div style="text-align:center;margin-bottom:16px;padding-bottom:16px">
        ${photoTag(personal, 80, `display:block;margin:0 auto 12px;border:2px solid ${accentColor}`)}
        <div style="font-size:24px;font-weight:700;color:#111827;letter-spacing:0.02em;margin-bottom:4px">${name}</div>
        ${personal?.title ? `<div style="font-size:13px;color:${accentColor};font-style:italic;margin-bottom:8px">${personal.title}</div>` : ""}
        ${contactRow(personal, "#6b7280")}
      </div>
      <div style="border-top:1px solid ${accentColor};border-bottom:1px solid ${accentColor};padding:6px 0;margin-bottom:20px;text-align:center;font-size:11px;color:${accentColor};font-weight:600;letter-spacing:0.08em;text-transform:uppercase">
        ${jobTitle && company ? `Application — ${jobTitle} at ${company}` : jobTitle || company || "Cover Letter"}
      </div>
      ${para}
    </div>`;

  } else if (templateId === "bordered") {
    body = `
    <div style="padding:28px 32px;border:6px solid ${accentColor};min-height:calc(297mm - 12px)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">
        <div style="flex:1">
          <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px;flex-wrap:wrap">
            <span style="font-size:22px;font-weight:700;color:#111827">${name}</span>
            ${personal?.title ? `<span style="font-size:13px;color:${accentColor};font-style:italic">· ${personal.title}</span>` : ""}
          </div>
          ${contactRow(personal, "#6b7280")}
        </div>
        ${photoTag(personal, 70, `margin-left:16px;border:2px solid ${accentColor}40`)}
      </div>
      ${jobTitle ? `<div style="margin-bottom:16px;padding:6px 10px;border:1px solid ${accentColor}40;border-radius:4px;background:${accentColor}08;font-size:11px;color:${accentColor};font-weight:600">Re: ${jobTitle}${company ? ` — ${company}` : ""}</div>` : ""}
      ${para}
    </div>`;

  } else if (templateId === "creative") {
    body = `
    <div style="border-left:5px solid ${accentColor};padding:28px 32px 28px 40px;min-height:297mm">
      <div style="margin-bottom:8px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">
        <div style="font-size:24px;font-weight:700;color:#111827;margin-bottom:2px">${name}</div>
        ${personal?.title ? `<div style="font-size:13px;color:${accentColor};font-style:italic;margin-bottom:8px">${personal.title}</div>` : ""}
        ${contactRow(personal, "#6b7280")}
      </div>
      ${jobTitle ? `<div style="display:flex;gap:20px;margin-bottom:16px;align-items:baseline">
        <div style="width:100px;flex-shrink:0;font-size:10px;color:#6b7280">Applying for</div>
        <div style="flex:1;font-size:12px;font-weight:700;color:#111827">${jobTitle}${company ? `<span style="font-weight:400;color:${accentColor};font-style:italic"> @ ${company}</span>` : ""}</div>
      </div>` : ""}
      ${para}
    </div>`;

  } else if (templateId === "inline") {
    body = `
    <div style="padding:20px 28px;min-height:297mm">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div style="flex:1">
          <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px">
            <span style="font-size:22px;font-weight:700;color:#111827;line-height:1.1">${name}</span>
            ${personal?.title ? `<span style="font-size:13px;color:#6b7280;font-style:italic">&nbsp;·&nbsp;${personal.title}</span>` : ""}
          </div>
          ${contactRow(personal, "#6b7280")}
        </div>
        ${photoTag(personal, 70, `margin-left:20px;flex-shrink:0`)}
      </div>
      <div style="border-bottom:2px solid #111827;margin-bottom:12px"></div>
      ${jobTitle ? `<div style="margin-bottom:14px;font-size:11px;color:${accentColor};font-weight:600">Re: Application for ${jobTitle}${company ? ` at ${company}` : ""}</div>` : ""}
      ${para}
    </div>`;

  } else if (templateId === "gcc") {
    const pills = [
      personal?.nationality ? `Nationality: ${personal.nationality}` : "",
      personal?.date_of_birth ? `DOB: ${personal.date_of_birth}` : "",
      personal?.gender ? `Gender: ${personal.gender}` : "",
    ].filter(Boolean).map((t) =>
      `<span style="background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.4);border-radius:4px;padding:2px 10px;font-size:10px;display:inline-block;margin-right:8px;margin-bottom:4px">${t}</span>`
    ).join("");
    body = `
    <div style="background:${accentColor};padding:20px 16px;display:flex;align-items:center;justify-content:space-between">
      <div style="flex:1">
        <div style="font-size:26px;font-weight:700;color:#fff;letter-spacing:0.01em;line-height:1.2;margin-bottom:4px">${name}</div>
        ${personal?.title ? `<div style="font-size:13px;color:rgba(255,255,255,0.85);letter-spacing:0.03em;margin-bottom:${pills ? "6px" : "0"}">${personal.title}</div>` : ""}
        ${pills ? `<div style="margin-top:6px;display:flex;flex-wrap:wrap">${pills}</div>` : ""}
      </div>
      ${photoTag(personal, 80, `flex-shrink:0;margin-left:20px;border:3px solid rgba(255,255,255,0.6)`)}
    </div>
    <div style="background:#f0f4f8;border-bottom:1px solid #dde3ea;padding:8px 16px;display:flex;flex-wrap:wrap;gap:4px 20px;font-size:10px;color:#6b7280">
      ${contactRow(personal, "#6b7280")}
    </div>
    <div style="padding:24px 16px">
      ${jobTitle ? `<div style="margin-bottom:16px;padding:8px 12px;background:${accentColor}12;border-left:3px solid ${accentColor};border-radius:0 4px 4px 0;font-size:12px;color:${accentColor};font-weight:600">Application for ${jobTitle}${company ? ` — ${company}` : ""}</div>` : ""}
      ${para}
    </div>`;

  } else {
    // Classic (default) + minimal/professional fallback
    body = `
    <div style="padding:28px 32px;min-height:297mm">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div style="flex:1">
          <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:4px">
            ${name}${personal?.title ? `<span style="font-size:13px;color:#6b7280;font-style:italic;font-weight:400;margin-left:8px">· ${personal.title}</span>` : ""}
          </div>
          ${contactRow(personal, "#6b7280")}
        </div>
        ${photoTag(personal, 70, `margin-left:16px;border:2px solid ${accentColor}40`)}
      </div>
      <div style="border-bottom:2px solid #111827;margin-bottom:16px"></div>
      ${jobTitle ? `<div style="margin-bottom:16px;font-size:12px"><span style="font-weight:600;color:${accentColor}">Re: Application for ${jobTitle}${company ? ` at ${company}` : ""}</span></div>` : ""}
      ${para}
    </div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body { font-family: ${fontFamily}, Georgia, serif; background: #fff; font-size: 12px; line-height: 1.8; color: #374151; }
  p { margin-bottom: 14px; }
  img { display: inline-block; }
</style>
</head>
<body>${body}</body>
</html>`;
}

export async function POST(req: NextRequest) {
  let browser: Awaited<ReturnType<typeof puppeteerCore.launch>> | null = null;
  try {
    const { content, templateId, customization, jobTitle, company, letter, personal } = await req.json();
    const accentColor = customization?.accentColor ?? "#2563eb";
    const fontFamily = customization?.fontFamily ?? "Georgia";
    const letterTitle = letter?.title ?? "Cover Letter";

    const html = buildHtml(content ?? "", templateId ?? "classic", accentColor, fontFamily, jobTitle ?? "", company ?? "", letterTitle, personal ?? {});

    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      const chromePath = getChromePath();
      if (!chromePath) return NextResponse.json({ error: "Chrome not found. Set CHROME_PATH or install Chrome." }, { status: 500 });
      browser = await puppeteerCore.launch({
        executablePath: chromePath,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
      });
    } else {
      const { default: chromium } = await import("@sparticuz/chromium");
      browser = await puppeteerCore.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "0", right: "0", bottom: "8mm", left: "0" } });

    const safeName = (letter?.title ?? "cover-letter").replace(/[^\w\s-]/g, "").trim();
    return new NextResponse(new Uint8Array(pdf as Buffer), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${safeName}.pdf"` },
    });
  } catch (error) {
    console.error("Cover letter PDF error:", error);
    return NextResponse.json({ error: "PDF generation failed", details: String(error) }, { status: 500 });
  } finally {
    if (browser) { try { await browser.close(); } catch { /* ignore */ } }
  }
}
