import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import puppeteerCore from "puppeteer-core";
import { PAGE_HEIGHT_A4, CONTINUATION_TOP_GAP, computePageBreaks } from "@/lib/pagination";

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
    // it knows it — read it so Classic, Academic, Modern, Minimal, Executive,
    // Tech, Creative, GCC, Portrait, Milestone, Corporate, Vega, and Aurora
    // (the templates migrated onto the shared-function pipeline) can use it
    // below while every other template keeps going through the legacy
    // pipeline it always has. Academic's own component (AcademicTemplate.tsx)
    // already had the .cv-heading-group wrapper wired in but was never added
    // to this branch condition — a pre-existing gap that meant it was
    // silently still running the legacy pipeline's own (also gap-unaware)
    // inline break logic below. Closed here as part of fixing the shared
    // miscalculation once instead of finding it again the next time a
    // template gets audited.
    const templateId = await page.evaluate(
      () => (window as unknown as { __CV_TEMPLATE_ID__?: string }).__CV_TEMPLATE_ID__
    );

    if (templateId === "classic" || templateId === "academic" || templateId === "modern" || templateId === "minimal" || templateId === "executive" || templateId === "tech" || templateId === "creative" || templateId === "gcc" || templateId === "portrait" || templateId === "milestone" || templateId === "corporate" || templateId === "vega" || templateId === "aurora" || templateId === "nova") {
      // ── Classic, Academic, Modern, Minimal, Executive, Tech, Creative, GCC, Portrait, Milestone, Corporate, Vega, Aurora & Nova: shared-pagination pipeline ─
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
      // data out. computePageBreaks() itself now reserves CONTINUATION_TOP_GAP
      // out of every continuation page's budget (see its own comment) — this
      // used to be applied only as a post-decision marginTop injection below,
      // which meant the decision above thought a full pageHeight was
      // available on every continuation page when only
      // (pageHeight - CONTINUATION_TOP_GAP) actually was. That silently
      // overpacked continuation pages close to the boundary, surfacing as an
      // unplanned extra physical page on Executive's LONG fixture and on Tech
      // under normal spacing — not template-specific bugs, just this one
      // shared miscalculation showing up wherever content happened to land
      // in that reserved 40px.
      const { breakChunkIndex, starts } = computePageBreaks(chunkMeasurements, PAGE_HEIGHT_A4);

      // Apply the decision: force an explicit page break at exactly the
      // chosen elements (tagged above), and give continuation pages the
      // same top breathing room the on-screen preview's page 2+ cards get
      // via its clip trick — now placed reliably, since we know exactly
      // which element starts each new page rather than guessing.
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

      // ── Tech's border frame ──────────────────────────────────────────────
      // .tech-outer draws its border frame via a single CSS outline around
      // the entire multi-page-tall flow document, so — same problem as
      // Modern's sidebar band — only the very top and bottom edges land on a
      // real page; middle pages get no frame at all. Paint one absolutely-
      // positioned bordered box per real page, sized to exactly
      // PAGE_HEIGHT_A4 and stacked at exact multiples of it, instead of
      // trusting a position:fixed overlay (which depends on Puppeteer's
      // page.pdf() correctly repeating fixed elements per page — not
      // guaranteed, and the reason this used to live in
      // cv-print/[cvId]/page.tsx as a position:fixed div).
      //
      // This position math only holds if starts.length (computePageBreaks()'s
      // predicted page count) exactly matches the real physical page count —
      // testing originally caught a case where it didn't, traced to
      // computePageBreaks() not reserving CONTINUATION_TOP_GAP on
      // continuation pages (now fixed at the source in lib/pagination.ts,
      // see its own comment) rather than anything Tech-specific.
      if (templateId === "tech") {
        await page.evaluate(
          (pageCount: number, pageHeight: number) => {
            const outer = document.querySelector<HTMLElement>(".tech-outer");
            if (!outer) return;
            const accent = getComputedStyle(outer).outlineColor;
            outer.style.position = "relative";
            // .tech-outer's own height is driven only by its in-flow
            // children (position:absolute frames below don't count towards
            // it, per CSS auto-height rules), so the last frame — which must
            // reach all the way to the true bottom of the final physical
            // page — overflows past .tech-outer's own box. That overflow
            // renders fine on screen (overflow:visible is the default) but
            // gets silently clipped during Chrome's print/PDF rasterization
            // pass, cutting the last page's border off wherever the real
            // content happened to end. Explicitly grow the container so the
            // frames are fully in-bounds instead of relying on overflow.
            outer.style.minHeight = `${pageCount * pageHeight}px`;
            for (let i = 0; i < pageCount; i++) {
              const frame = document.createElement("div");
              frame.setAttribute("data-tech-border-frame", String(i));
              frame.style.position = "absolute";
              frame.style.top = `${i * pageHeight}px`;
              frame.style.left = "0";
              frame.style.width = "100%";
              frame.style.height = `${pageHeight}px`;
              frame.style.border = `8px solid ${accent}`;
              frame.style.boxSizing = "border-box";
              frame.style.pointerEvents = "none";
              frame.style.zIndex = "10";
              outer.appendChild(frame);
            }
          },
          starts.length,
          PAGE_HEIGHT_A4
        );
      }

      // ── Creative's left accent line ──────────────────────────────────────
      // CreativeTemplate.tsx draws its own accent as one absolutely-positioned
      // strip spanning the full (auto) height of the continuous document —
      // fine for a single physical page, but same category of problem as
      // Modern's sidebar band and Tech's border frame once this flows across
      // several: there's no guarantee Chrome's print pagination keeps a
      // single box's background painted on every physical page it crosses.
      // Hide the template's own strip and paint one absolutely-positioned
      // strip per real page instead, sized to exactly PAGE_HEIGHT_A4 and
      // stacked at exact multiples of it.
      if (templateId === "creative") {
        await page.evaluate(
          (pageCount: number, pageHeight: number) => {
            const outer = document.querySelector<HTMLElement>(".creative-outer");
            if (!outer) return;
            const line = outer.querySelector<HTMLElement>("[data-creative-accent-line]");
            const color = line ? getComputedStyle(line).backgroundColor : "#7c3aed";
            if (line) line.style.display = "none";
            outer.style.position = "relative";
            outer.style.minHeight = `${pageCount * pageHeight}px`;
            for (let i = 0; i < pageCount; i++) {
              const strip = document.createElement("div");
              strip.setAttribute("data-creative-accent-strip", String(i));
              strip.style.position = "absolute";
              strip.style.top = `${i * pageHeight}px`;
              strip.style.left = "0";
              strip.style.width = "8px";
              strip.style.height = `${pageHeight}px`;
              strip.style.backgroundColor = color;
              strip.style.pointerEvents = "none";
              strip.style.zIndex = "10";
              outer.appendChild(strip);
            }
          },
          starts.length,
          PAGE_HEIGHT_A4
        );
      }

      // ── Portrait's sidebar divider ───────────────────────────────────────
      // .portrait-sidebar draws its column divider via a single CSS
      // borderRight on a flex item that's meant to run the full (auto)
      // height of the continuous two-column document — same category of
      // problem as Modern's sidebar band and Creative's accent line: a
      // border on a box whose height was computed once, pre-pagination,
      // isn't guaranteed to keep painting on every physical page once
      // Chrome fragments the flex row for print. Hide the template's own
      // border and paint one absolutely-positioned 1px divider per real
      // page instead, at the sidebar's own right edge, sized to exactly
      // PAGE_HEIGHT_A4 and stacked at exact multiples of it.
      //
      // Only page 1 needs an exception: the header (photo/name/contact strip)
      // sits ABOVE the two-column body as a full-width block, so the sidebar
      // (and its divider) only actually start at .portrait-sidebar's own top,
      // not y=0 of the page. Continuation pages have no header to skip —
      // they're pure body content (plus the unrelated 40px breathing-room
      // gap every continuation page gets) — so they keep spanning the full
      // page height, same as before.
      if (templateId === "portrait") {
        await page.evaluate(
          (pageCount: number, pageHeight: number) => {
            const outer = document.querySelector<HTMLElement>(".portrait-outer");
            const sidebar = document.querySelector<HTMLElement>(".portrait-sidebar");
            if (!outer || !sidebar) return;
            const cs = getComputedStyle(sidebar);
            const color = cs.borderRightColor;
            const outerRect = outer.getBoundingClientRect();
            const sidebarRect = sidebar.getBoundingClientRect();
            const dividerX = sidebarRect.right - outerRect.left;
            const bodyTop = sidebarRect.top - outerRect.top;
            sidebar.style.borderRightStyle = "none";
            outer.style.position = "relative";
            outer.style.minHeight = `${pageCount * pageHeight}px`;
            for (let i = 0; i < pageCount; i++) {
              const stripTop = i === 0 ? bodyTop : i * pageHeight;
              const strip = document.createElement("div");
              strip.setAttribute("data-portrait-divider", String(i));
              strip.style.position = "absolute";
              strip.style.top = `${stripTop}px`;
              strip.style.left = `${dividerX}px`;
              strip.style.width = "1px";
              strip.style.height = `${i * pageHeight + pageHeight - stripTop}px`;
              strip.style.backgroundColor = color;
              strip.style.pointerEvents = "none";
              strip.style.zIndex = "10";
              outer.appendChild(strip);
            }
          },
          starts.length,
          PAGE_HEIGHT_A4
        );
      }

      // ── Milestone's sidebar divider ──────────────────────────────────────
      // Same fix as Portrait's sidebar divider above, for the same reason
      // (.milestone-sidebar's borderRight is a single CSS border on a box
      // whose height was computed once, pre-pagination — not guaranteed to
      // keep painting on every physical page). Page 1's strip starts at
      // .milestone-sidebar's own measured top, not y=0 — Milestone's header
      // zone is even taller than Portrait's (name/title block, then a
      // full-width Career Summary section, THEN the two-column body), so
      // hardcoding an offset would be wrong; measuring the sidebar's actual
      // top handles whatever precedes it automatically.
      //
      // Every strip is also capped at bodyBottom (.milestone-sidebar's own
      // measured bottom — align-items:stretch keeps this in sync with
      // whichever column, sidebar or main, is taller, so it's exactly where
      // the two-column body ends regardless of which one). Unlike Portrait,
      // Milestone has a full-width References section directly below the
      // two columns, which can start partway down a page once main content
      // runs long (e.g. several Project entries) — an uncapped strip would
      // run the divider straight through References instead of stopping
      // where the two-column body actually ends.
      if (templateId === "milestone") {
        await page.evaluate(
          (pageCount: number, pageHeight: number) => {
            const outer = document.querySelector<HTMLElement>(".milestone-outer");
            const sidebar = document.querySelector<HTMLElement>(".milestone-sidebar");
            if (!outer || !sidebar) return;
            const cs = getComputedStyle(sidebar);
            const color = cs.borderRightColor;
            const outerRect = outer.getBoundingClientRect();
            const sidebarRect = sidebar.getBoundingClientRect();
            const dividerX = sidebarRect.right - outerRect.left;
            const bodyTop = sidebarRect.top - outerRect.top;
            const bodyBottom = sidebarRect.bottom - outerRect.top;
            sidebar.style.borderRightStyle = "none";
            outer.style.position = "relative";
            outer.style.minHeight = `${pageCount * pageHeight}px`;
            for (let i = 0; i < pageCount; i++) {
              const stripTop = i === 0 ? bodyTop : i * pageHeight;
              const stripBottom = Math.min(i * pageHeight + pageHeight, bodyBottom);
              if (stripBottom <= stripTop) continue;
              const strip = document.createElement("div");
              strip.setAttribute("data-milestone-divider", String(i));
              strip.style.position = "absolute";
              strip.style.top = `${stripTop}px`;
              strip.style.left = `${dividerX}px`;
              strip.style.width = "1px";
              strip.style.height = `${stripBottom - stripTop}px`;
              strip.style.backgroundColor = color;
              strip.style.pointerEvents = "none";
              strip.style.zIndex = "10";
              outer.appendChild(strip);
            }
          },
          starts.length,
          PAGE_HEIGHT_A4
        );
      }

      // ── Corporate's sidebar divider ──────────────────────────────────────
      // Same fix as Milestone's sidebar divider above, and for the same
      // reason (.corporate-sidebar's borderLeft is a single CSS border on a
      // box whose height was computed once, pre-pagination — not guaranteed
      // to keep painting on every physical page). Mirrored vs Portrait/
      // Milestone: Corporate's sidebar sits on the RIGHT of the two-column
      // body and draws its divider via borderLeft, so dividerX is measured
      // from the sidebar's own LEFT edge (sidebarRect.left), not its right,
      // and the suppressed border is borderLeftStyle, not borderRightStyle.
      // Page 1's strip starts at .corporate-sidebar's own measured top (below
      // Corporate's header — name/title/contact row plus the decorative
      // dot-grid SVG), not y=0, same reasoning as Portrait/Milestone.
      //
      // Every strip is also capped at bodyBottom (.corporate-sidebar's own
      // measured bottom — align-items:stretch keeps this in sync with
      // whichever column, sidebar or main, is taller). Corporate, like
      // Milestone, has a full-width References section directly below the
      // two columns, which can start partway down a page once main content
      // runs long — an uncapped strip would run the divider straight through
      // References instead of stopping where the two-column body actually ends.
      if (templateId === "corporate") {
        await page.evaluate(
          (pageCount: number, pageHeight: number) => {
            const outer = document.querySelector<HTMLElement>(".corporate-outer");
            const sidebar = document.querySelector<HTMLElement>(".corporate-sidebar");
            if (!outer || !sidebar) return;
            const cs = getComputedStyle(sidebar);
            const color = cs.borderLeftColor;
            const outerRect = outer.getBoundingClientRect();
            const sidebarRect = sidebar.getBoundingClientRect();
            const dividerX = sidebarRect.left - outerRect.left;
            const bodyTop = sidebarRect.top - outerRect.top;
            const bodyBottom = sidebarRect.bottom - outerRect.top;
            sidebar.style.borderLeftStyle = "none";
            outer.style.position = "relative";
            outer.style.minHeight = `${pageCount * pageHeight}px`;
            for (let i = 0; i < pageCount; i++) {
              const stripTop = i === 0 ? bodyTop : i * pageHeight;
              const stripBottom = Math.min(i * pageHeight + pageHeight, bodyBottom);
              if (stripBottom <= stripTop) continue;
              const strip = document.createElement("div");
              strip.setAttribute("data-corporate-divider", String(i));
              strip.style.position = "absolute";
              strip.style.top = `${stripTop}px`;
              strip.style.left = `${dividerX}px`;
              strip.style.width = "1px";
              strip.style.height = `${stripBottom - stripTop}px`;
              strip.style.backgroundColor = color;
              strip.style.pointerEvents = "none";
              strip.style.zIndex = "10";
              outer.appendChild(strip);
            }
          },
          starts.length,
          PAGE_HEIGHT_A4
        );
      }

      // ── Vega's sidebar divider ───────────────────────────────────────────
      // Same fix as Corporate's sidebar divider above, and for the same
      // reason (.vega-sidebar's borderLeft is a single CSS border on a box
      // whose height was computed once, pre-pagination). Same mirrored shape
      // as Corporate — sidebar on the RIGHT with a borderLeft divider,
      // dividerX measured from the sidebar's own LEFT edge. Page 1's strip
      // starts at .vega-sidebar's own measured top, below Vega's full-width
      // accent-colored header band (name/title/contact), not y=0.
      //
      // Every strip is also capped at bodyBottom (.vega-sidebar's own
      // measured bottom — align-items:stretch keeps this in sync with
      // whichever column is taller). Vega, like Corporate, has a full-width
      // References section directly below the two columns, which can start
      // partway down a page once main content runs long — an uncapped strip
      // would run the divider straight through References instead of
      // stopping where the two-column body actually ends.
      if (templateId === "vega") {
        await page.evaluate(
          (pageCount: number, pageHeight: number) => {
            const outer = document.querySelector<HTMLElement>(".vega-outer");
            const sidebar = document.querySelector<HTMLElement>(".vega-sidebar");
            if (!outer || !sidebar) return;
            const cs = getComputedStyle(sidebar);
            const color = cs.borderLeftColor;
            const outerRect = outer.getBoundingClientRect();
            const sidebarRect = sidebar.getBoundingClientRect();
            const dividerX = sidebarRect.left - outerRect.left;
            const bodyTop = sidebarRect.top - outerRect.top;
            const bodyBottom = sidebarRect.bottom - outerRect.top;
            sidebar.style.borderLeftStyle = "none";
            outer.style.position = "relative";
            outer.style.minHeight = `${pageCount * pageHeight}px`;
            for (let i = 0; i < pageCount; i++) {
              const stripTop = i === 0 ? bodyTop : i * pageHeight;
              const stripBottom = Math.min(i * pageHeight + pageHeight, bodyBottom);
              if (stripBottom <= stripTop) continue;
              const strip = document.createElement("div");
              strip.setAttribute("data-vega-divider", String(i));
              strip.style.position = "absolute";
              strip.style.top = `${stripTop}px`;
              strip.style.left = `${dividerX}px`;
              strip.style.width = "1px";
              strip.style.height = `${stripBottom - stripTop}px`;
              strip.style.backgroundColor = color;
              strip.style.pointerEvents = "none";
              strip.style.zIndex = "10";
              outer.appendChild(strip);
            }
          },
          starts.length,
          PAGE_HEIGHT_A4
        );
      }

      // ── Aurora's sidebar band ─────────────────────────────────────────────
      // Unlike Corporate/Milestone/Vega's thin 1px divider line, Aurora's
      // sidebar carries an actual colored background (a gray zone behind the
      // photo, transitioning to accentColor for the rest) — same class of
      // problem as Modern's sidebar band: a real Chrome print pass fragments
      // flex/grid backgrounds unreliably across physical pages, so one
      // authoritative, absolutely-positioned rectangle is painted per real
      // page instead of trusting the template's own continuous-flow CSS
      // gradient. The gray zone only ever occupies the first
      // AURORA_GRAY_ZONE_HEIGHT px below the sidebar's own top (right at the
      // photo/header), so it's only ever painted on whichever page that
      // absolute range falls on (in practice always page 0) — every other
      // page gets a pure accentColor rectangle.
      //
      // Each rectangle now fills the FULL page height unconditionally (no
      // more capping at the sidebar's real content end) — matching the
      // accepted Modern/Tech/Creative convention of a band/frame spanning
      // every physical page regardless of content. The earlier version
      // capped this to protect a full-width References section that used to
      // sit below the two-column body; References now renders inside the
      // main column instead (AuroraTemplate.tsx), so there's nothing left
      // below the two-column body to bleed into.
      //
      // AURORA_GRAY_ZONE_HEIGHT/AURORA_GRAY_ZONE_COLOR are duplicated here
      // (not imported) to match this file's existing convention — every other
      // per-template pixel constant in this shared-pipeline branch (Modern's
      // "35%" sidebar width, Corporate/Vega's divider-X derivations) is
      // likewise a hardcoded value kept in sync with its template's source by
      // comment, not by cross-import. Must stay equal to the same-named
      // exports in AuroraTemplate.tsx.
      if (templateId === "aurora") {
        const AURORA_GRAY_ZONE_HEIGHT = 120;
        const AURORA_GRAY_ZONE_COLOR = "#e2e2e2";
        await page.evaluate(
          (pageCount: number, pageHeight: number, grayZoneHeight: number, grayColor: string) => {
            const outer = document.querySelector<HTMLElement>(".aurora-outer");
            const sidebar = document.querySelector<HTMLElement>(".aurora-sidebar");
            if (!outer || !sidebar) return;
            const accent = getComputedStyle(sidebar).getPropertyValue("--aurora-accent").trim();
            const outerRect = outer.getBoundingClientRect();
            const sidebarRect = sidebar.getBoundingClientRect();
            const sidebarWidth = sidebarRect.width;
            const bodyTop = sidebarRect.top - outerRect.top;
            sidebar.style.background = "none";
            outer.style.position = "relative";
            outer.style.minHeight = `${pageCount * pageHeight}px`;
            const grayAbsTop = bodyTop;
            const grayAbsBottom = bodyTop + grayZoneHeight;
            for (let i = 0; i < pageCount; i++) {
              const stripTop = i * pageHeight;
              const stripBottom = stripTop + pageHeight;
              const graySegTop = Math.max(stripTop, grayAbsTop);
              const graySegBottom = Math.min(stripBottom, grayAbsBottom);
              if (graySegBottom > graySegTop) {
                const grayBand = document.createElement("div");
                grayBand.setAttribute("data-aurora-band-gray", String(i));
                grayBand.style.position = "absolute";
                grayBand.style.top = `${graySegTop}px`;
                grayBand.style.left = "0";
                grayBand.style.width = `${sidebarWidth}px`;
                grayBand.style.height = `${graySegBottom - graySegTop}px`;
                grayBand.style.backgroundColor = grayColor;
                grayBand.style.pointerEvents = "none";
                grayBand.style.zIndex = "0";
                outer.insertBefore(grayBand, outer.firstChild);
              }
              const accentSegTop = graySegBottom > graySegTop ? graySegBottom : stripTop;
              if (stripBottom > accentSegTop) {
                const accentBand = document.createElement("div");
                accentBand.setAttribute("data-aurora-band-accent", String(i));
                accentBand.style.position = "absolute";
                accentBand.style.top = `${accentSegTop}px`;
                accentBand.style.left = "0";
                accentBand.style.width = `${sidebarWidth}px`;
                accentBand.style.height = `${stripBottom - accentSegTop}px`;
                accentBand.style.backgroundColor = accent;
                accentBand.style.pointerEvents = "none";
                accentBand.style.zIndex = "0";
                outer.insertBefore(accentBand, outer.firstChild);
              }
            }
          },
          starts.length,
          PAGE_HEIGHT_A4,
          AURORA_GRAY_ZONE_HEIGHT,
          AURORA_GRAY_ZONE_COLOR
        );
      }

      // ── Nova's footer bar ──────────────────────────────────────────────────
      // .nova-outer draws its footer bar (data-nova-footer) as a single
      // trailing div after the last section, meant for non-paginated
      // rendering — same category of problem as Tech's border frame/
      // Creative's accent line: once this flows across several physical
      // pages, that one div only ever lands on whichever page happens to
      // hold it, not the true bottom of every page. Hide it and paint one
      // absolutely-positioned bar per real page instead, pinned to each
      // page's own bottom edge (exact multiples of PAGE_HEIGHT_A4) —
      // repeating on every page, matching the accepted Modern/Tech/
      // Creative/Aurora convention of a band/frame spanning every physical
      // page regardless of content, rather than appearing once at the true
      // end of the document.
      //
      // NOVA_FOOTER_HEIGHT is duplicated here (not imported) to match this
      // file's existing convention for per-template pixel constants (see the
      // Aurora comment above) — must stay equal to NovaTemplate.tsx's own
      // exported constant.
      if (templateId === "nova") {
        const NOVA_FOOTER_HEIGHT = 14;
        await page.evaluate(
          (pageCount: number, pageHeight: number, footerHeight: number) => {
            const outer = document.querySelector<HTMLElement>(".nova-outer");
            if (!outer) return;
            const footer = outer.querySelector<HTMLElement>("[data-nova-footer]");
            const color = footer ? getComputedStyle(footer).backgroundColor : "#111827";
            if (footer) footer.style.display = "none";
            outer.style.position = "relative";
            outer.style.minHeight = `${pageCount * pageHeight}px`;
            for (let i = 0; i < pageCount; i++) {
              const bar = document.createElement("div");
              bar.setAttribute("data-nova-footer-bar", String(i));
              bar.style.position = "absolute";
              bar.style.top = `${(i + 1) * pageHeight - footerHeight}px`;
              bar.style.left = "0";
              bar.style.width = "100%";
              bar.style.height = `${footerHeight}px`;
              bar.style.backgroundColor = color;
              bar.style.pointerEvents = "none";
              bar.style.zIndex = "10";
              outer.appendChild(bar);
            }
          },
          starts.length,
          PAGE_HEIGHT_A4,
          NOVA_FOOTER_HEIGHT
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
