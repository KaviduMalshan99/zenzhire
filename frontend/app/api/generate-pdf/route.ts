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

  return candidates.find((p) => {
    try { return fs.existsSync(p); } catch { return false; }
  });
}

export async function POST(request: NextRequest) {
  let browser: Awaited<ReturnType<typeof puppeteerCore.launch>> | null = null;

  try {
    const { cvId, token, fileName } = await request.json();
    if (!cvId || !token) {
      return NextResponse.json({ error: "Missing cvId or token" }, { status: 400 });
    }

    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const printUrl = `${baseUrl}/cv-print/${cvId}?token=${encodeURIComponent(token)}`;

    console.log("Starting PDF generation for CV:", cvId);
    console.log("Print URL:", printUrl);

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      const chromePath = getChromePath();
      if (!chromePath) {
        return NextResponse.json(
          { error: "Chrome not found. Install Chrome or set CHROME_PATH environment variable." },
          { status: 500 }
        );
      }
      console.log("Using Chrome at:", chromePath);
      browser = await puppeteerCore.launch({
        executablePath: chromePath,
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });
    } else {
      const { default: chromium } = await import("@sparticuz/chromium");
      browser = await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    const page = await browser.newPage();

    // Forward browser console to server terminal
    page.on("console", (msg) => console.log("[Browser]", msg.type(), msg.text()));
    page.on("pageerror", (err) => console.error("[Browser error]", err.message));

    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    // Force screen media so @media print doesn't suppress template content.
    // Without this, Chrome's PDF renderer switches to print mode and strips
    // inline styles, backgrounds, and colors from the templates.
    await page.emulateMediaType("screen");

    await page.goto(printUrl, { waitUntil: "networkidle0", timeout: 30000 });

    console.log("Page title after goto:", await page.title());
    console.log("Page content length after goto:", (await page.content()).length);

    // Wait for the print page to signal it's ready via a DOM marker
    await page.waitForSelector("#cv-ready-marker", { timeout: 15000 });

    console.log("CV ready marker found — fonts loading...");

    // Wait for fonts to finish loading
    await page.evaluateHandle(() => document.fonts.ready);

    // Force print-color-adjust so Chrome doesn't strip backgrounds/colors.
    // Also add padding-top to every section/entry so whichever section lands
    // first on page 2+ always has built-in breathing room from the border.
    await page.addStyleTag({
      content: `
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        html, body {
          background: #ffffff !important;
          color: #111827 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .cv-section {
          padding-top: 8px !important;
        }
        .cv-entry {
          padding-top: 4px !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .cv-section-header {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        h1, h2, h3, h4 {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
      `,
    });

    // Wait for style injection + any final paint
    await new Promise((r) => setTimeout(r, 500));

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      // Every template already bakes its own visual inset into its root
      // padding, matching the zero-padding page card used in the on-screen
      // preview — adding a page-level margin here on top of that double-counts
      // the inset and makes the PDF's usable content area per page smaller
      // than the preview's, so page breaks land in different places.
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      displayHeaderFooter: false,
    });

    console.log("PDF generated, size:", (pdf as Buffer).length, "bytes");

    const safeFileName = (fileName || "cv-zenzhire").replace(/[^\w\s-]/g, "").trim();

    return new NextResponse(new Uint8Array(pdf as Buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Puppeteer PDF error:", error);
    return NextResponse.json(
      { error: "PDF generation failed", details: String(error) },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try { await browser.close(); } catch (_) { /* ignore */ }
    }
  }
}
