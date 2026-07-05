import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import puppeteerCore from "puppeteer-core";
import { PAGE_HEIGHT_A4, computePageBreaks } from "@/lib/pagination";

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

    // cv-print/[cvId]/page.tsx exposes the resolved template on window once
    // it knows it — read it so Classic, Modern, Minimal, and Executive (the
    // templates migrated so far onto the shared-function pipeline) can use
    // it below while every other template keeps going through the legacy
    // pipeline it always has. NOTE: Academic already has the .cv-heading-group
    // wrapper wired into its own component (AcademicTemplate.tsx) but was
    // never added to this branch condition — that's a pre-existing gap, not
    // something this Executive-only change touches.
    const templateId = await page.evaluate(
      () => (window as unknown as { __CV_TEMPLATE_ID__?: string }).__CV_TEMPLATE_ID__
    );

    if (templateId === "classic" || templateId === "modern" || templateId === "minimal" || templateId === "executive") {
      // ── Classic, Modern, Minimal & Executive: shared-pagination pipeline ─
      // Force print-color-adjust so Chrome doesn't strip backgrounds/colors.
      // Unlike the legacy pipeline below, .cv-section does NOT get
      // page-break-inside:avoid — a long section (e.g. Experience, Projects)
      // must be allowed to split between entries, matching what the live
      // preview's calcPageLayout() has always intended. Only .cv-entry and
      // .cv-heading-group (the true atomic units — an entry, or a heading
      // glued to its first entry) are protected from splitting; explicit
      // break-before:page is applied below at exactly the points
      // computePageBreaks() decides, instead of hoping Chrome's own
      // avoid-based fragmentation independently lands on the same answer.
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
          .cv-entry {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .cv-heading-group {
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

      // Measure chunks in-page (mirrors extractPageChunks() in
      // lib/pagination.ts — page.evaluate() can only exchange plain JSON
      // with the page, so this DOM-reading step can't literally import
      // that function, but the actual decision below does).
      const chunkMeasurements = await page.evaluate(() => {
        const root = document.body;
        const sections = Array.from(root.querySelectorAll<HTMLElement>(".cv-section"));
        const baseTop = root.getBoundingClientRect().top;
        const chunks: { top: number; bottom: number }[] = [];
        let idx = 0;

        for (const sec of sections) {
          const secRect = sec.getBoundingClientRect();
          const entries = Array.from(sec.querySelectorAll<HTMLElement>(".cv-entry"));
          const isGrid =
            entries.length > 1 &&
            Math.abs(entries[0].getBoundingClientRect().top - entries[1].getBoundingClientRect().top) < 4;

          if (entries.length <= 1 || isGrid) {
            sec.setAttribute("data-chunk-index", String(idx++));
            chunks.push({ top: secRect.top - baseTop, bottom: secRect.bottom - baseTop });
          } else {
            sec.setAttribute("data-chunk-index", String(idx++));
            const firstRect = entries[0].getBoundingClientRect();
            chunks.push({ top: secRect.top - baseTop, bottom: firstRect.bottom - baseTop });
            for (let i = 1; i < entries.length; i++) {
              entries[i].setAttribute("data-chunk-index", String(idx++));
              const r = entries[i].getBoundingClientRect();
              chunks.push({ top: r.top - baseTop, bottom: r.bottom - baseTop });
            }
          }
        }
        return chunks;
      });

      // The same shared, pure decision function the live preview uses —
      // called here as a normal import, not passed into page.evaluate(), so
      // there's no function-serialization concern: it's plain data in, plain
      // data out.
      const { breakChunkIndex, starts } = computePageBreaks(chunkMeasurements, PAGE_HEIGHT_A4);

      // Apply the decision: force an explicit page break at exactly the
      // chosen elements (tagged above), and give continuation pages the
      // same 40px top breathing room the on-screen preview's page 2+ cards
      // get via its clip trick — now placed reliably, since we know exactly
      // which element starts each new page rather than guessing.
      const CONTINUATION_TOP_GAP = 40;
      await page.evaluate(
        (breakIndices: number[], gap: number) => {
          for (const idx of breakIndices) {
            const el = document.querySelector<HTMLElement>(`[data-chunk-index="${idx}"]`);
            if (!el) continue;
            el.style.breakBefore = "page";
            el.style.pageBreakBefore = "always";
            const current = parseFloat(getComputedStyle(el).marginTop) || 0;
            el.style.marginTop = `${current + gap}px`;
          }
        },
        breakChunkIndex,
        CONTINUATION_TOP_GAP
      );

      // Let the reflow from the spacing above settle before pagination.
      await new Promise((r) => setTimeout(r, 100));

      // ── Modern's sidebar color band ─────────────────────────────────────
      // Modern's .modern-sidebar colors itself via CSS flexbox
      // (align-items:stretch), which tracks correctly in normal on-screen
      // rendering but is NOT reliable once Chrome paginates the flex row for
      // print: Chromium's print-fragmentation support for flex/grid
      // containers is known to be unreliable, so the sidebar's own
      // background can end short of a physical page, leaving it white.
      // Instead of trusting flex-stretch (or a position:fixed div, which
      // depends on Puppeteer's page.pdf() correctly repeating fixed
      // elements per page — also not guaranteed), paint one explicit,
      // absolutely-positioned band per page, sized to exactly PAGE_HEIGHT_A4
      // and stacked at exact multiples of it — the same coordinate space
      // Chrome slices physical pages at, so alignment is guaranteed
      // regardless of how the flex layout itself fragments.
      if (templateId === "modern") {
        await page.evaluate(
          (pageCount: number, pageHeight: number) => {
            const sidebar = document.querySelector<HTMLElement>(".modern-sidebar");
            if (!sidebar) return;
            const color = getComputedStyle(sidebar).backgroundColor;
            const outer = document.querySelector<HTMLElement>(".modern-outer");
            if (outer) outer.style.position = "relative";
            for (let i = 0; i < pageCount; i++) {
              const band = document.createElement("div");
              band.setAttribute("data-modern-sidebar-band", String(i));
              band.style.position = "absolute";
              band.style.top = `${i * pageHeight}px`;
              band.style.left = "0";
              band.style.width = "35%";
              band.style.height = `${pageHeight}px`;
              band.style.backgroundColor = color;
              band.style.zIndex = "0";
              band.style.pointerEvents = "none";
              outer?.insertBefore(band, outer.firstChild);
            }
          },
          starts.length,
          PAGE_HEIGHT_A4
        );
      }
    } else {
      // ── Every other template: unchanged legacy pipeline ────────────────
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
    }

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
