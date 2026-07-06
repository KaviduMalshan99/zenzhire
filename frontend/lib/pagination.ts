// Shared pagination logic for the CV preview (CentrePanel.tsx) and PDF
// export (generate-pdf/route.ts). computePageBreaks() is the single,
// DOM-free source of truth both pipelines call so they can't independently
// diverge on where a page break belongs — extractPageChunks() is the (also
// shared, but necessarily DOM-touching) measurement step that turns a
// rendered CV container into the chunk list computePageBreaks() expects.
//
// Puppeteer's page.evaluate() can only exchange plain JSON with the page,
// so the PDF path can't literally import this file into the browser
// context it measures in. Its two page.evaluate() calls in
// generate-pdf/route.ts mirror extractPageChunks()'s DOM-reading logic
// line-for-line — but the actual decision algorithm (this file's
// computePageBreaks()) runs once, in Node, imported normally, so both
// pipelines are guaranteed to agree on where breaks fall.

export const PAGE_HEIGHT_A4 = 1123;

/** Blank top padding every page after the first gets — via a real
 *  margin-top injection in the PDF pipeline (generate-pdf/route.ts), or a
 *  clip-mask overlay in the live preview (CentrePanel.tsx). Both spend this
 *  same 40px, so it must be reserved out of a continuation page's budget
 *  here, not just applied visually afterward — see computePageBreaks(). */
export const CONTINUATION_TOP_GAP = 40;

/** Minimum forward progress (px) required before accepting a new break —
 *  guards against pathological back-to-back breaks on near-zero-height chunks. */
const MIN_ADVANCE = 20;

export interface PageChunkExtent {
  top: number;
  bottom: number;
}

export interface PageChunk extends PageChunkExtent {
  el: HTMLElement;
}

export interface PageBreakResult {
  /** Y coordinates, in the chunks' continuous-flow space, where each page begins. starts[0] is always 0. */
  starts: number[];
  /** starts.length - 1 entries: the index into the input chunk array that begins each page after the first. */
  breakChunkIndex: number[];
}

/**
 * Walks a rendered CV container and extracts the unbreakable chunk list
 * computePageBreaks() expects. Sections with a single entry (or a same-row
 * "grid" of entries, e.g. a skills grid) are one chunk; sections with
 * multiple stacked entries split after each entry, with the heading glued
 * to the first entry so it's never orphaned alone at a page bottom.
 * Read-only — never mutates the DOM — so it's safe to call from a live
 * preview measurement pass.
 */
export function extractPageChunks(root: HTMLElement): PageChunk[] {
  const sections = Array.from(root.querySelectorAll<HTMLElement>(".cv-section"));
  const baseTop = root.getBoundingClientRect().top;
  const chunks: PageChunk[] = [];

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
  return chunks;
}

/**
 * PURE: given an ordered list of unbreakable chunk extents (already
 * measured elsewhere — no DOM access here), decides where page breaks
 * fall. Same inputs always produce the same outputs, so the live preview
 * and the PDF export can call this identically and are guaranteed to agree
 * on every break point.
 *
 * Page 1 gets the full pageHeight budget (no gap). Every page after that
 * only has (pageHeight - CONTINUATION_TOP_GAP) of real content room, because
 * CONTINUATION_TOP_GAP of its height is always spent on blank top padding —
 * whether that's a real margin-top injected into the flow (PDF pipeline) or
 * a clip-mask covering the same span (live preview). Treating the full
 * pageHeight as available for continuation pages (as an earlier version of
 * this function did) systematically overpacked them: content that measured
 * as "fits" here would then get shifted down by the gap at render time and
 * genuinely overflow the physical page, forcing an extra page that this
 * decision never accounted for — observed independently on Executive's LONG
 * fixture and on Tech under normal spacing, both content shapes that happen
 * to land a chunk within that reserved 40px.
 */
export function computePageBreaks(chunks: PageChunkExtent[], pageHeight: number = PAGE_HEIGHT_A4): PageBreakResult {
  const starts: number[] = [0];
  const breakChunkIndex: number[] = [];
  let pageBottom = pageHeight;

  chunks.forEach((c, i) => {
    if (c.bottom > pageBottom && c.top > starts[starts.length - 1] + MIN_ADVANCE) {
      starts.push(c.top);
      breakChunkIndex.push(i);
      pageBottom = c.top + (pageHeight - CONTINUATION_TOP_GAP);
    }
  });

  return { starts, breakChunkIndex };
}
