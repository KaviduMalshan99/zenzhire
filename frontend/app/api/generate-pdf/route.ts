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
    // NOTE: deliberately no padding-top on .cv-section/.cv-entry here — that
    // used to add 8px/4px to every section and entry in the PDF only, which
    // doesn't exist in the on-screen preview (CentrePanel never applies it),
    // so section gaps in the exported PDF silently drifted from what the
    // user configured/saw. page-break-inside:avoid alone is enough to stop
    // sections/entries from splitting across a page boundary.
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
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .cv-entry {
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

    // Give continuation pages (2+) the same top breathing room the on-screen
    // preview gives them. The preview (CentrePanel) offsets page 2+ content
    // by 40px via a clip trick purely for display — page 1 gets no offset
    // there because the template's own header/root padding already is its
    // top inset (see the margin:0 comment on page.pdf() below). This mirrors
    // that same 40px, but for real here, by finding the actual chunk that
    // will start each new PDF page (same break-point logic as CentrePanel's
    // calcPageLayout) and pushing it down before Chrome paginates, so the
    // gap actually exists in the flowed document instead of just visually.
    await page.evaluate(() => {
      const A4_H = 1123;
      const CONTINUATION_TOP_GAP = 40;

      const sections = Array.from(document.querySelectorAll<HTMLElement>(".cv-section"));
      if (!sections.length) return;
      const baseTop = document.body.getBoundingClientRect().top;

      const chunks: { el: HTMLElement; top: number; bottom: number }[] = [];
      for (const sec of sections) {
        const secRect = sec.getBoundingClientRect();
        const entries = Array.from(sec.querySelectorAll<HTMLElement>(".cv-entry"));
        const isGrid =
          entries.length > 1 &&
          Math.abs(entries[0].getBoundingClientRect().top - entries[1].getBoundingClientRect().top) < 4;

        if (entries.length <= 1 || isGrid) {
          chunks.push({ el: sec, top: secRect.top - baseTop, bottom: secRect.bottom - baseTop });
        } else {
          const firstRect = entries[0].getBoundingClientRect();
          chunks.push({ el: sec, top: secRect.top - baseTop, bottom: firstRect.bottom - baseTop });
          for (let i = 1; i < entries.length; i++) {
            const r = entries[i].getBoundingClientRect();
            chunks.push({ el: entries[i], top: r.top - baseTop, bottom: r.bottom - baseTop });
          }
        }
      }

      let lastStart = 0;
      let pageBottom = A4_H;
      const breakEls: HTMLElement[] = [];
      for (const c of chunks) {
        if (c.bottom > pageBottom && c.top > lastStart + 20) {
          lastStart = c.top;
          pageBottom = c.top + A4_H;
          breakEls.push(c.el);
        }
      }

      for (const el of breakEls) {
        const current = parseFloat(getComputedStyle(el).marginTop) || 0;
        el.style.marginTop = `${current + CONTINUATION_TOP_GAP}px`;
      }
    });

    // Let the reflow from the spacing above settle before pagination.
    await new Promise((r) => setTimeout(r, 100));

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
