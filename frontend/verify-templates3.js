const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = 'F:/zenzhire/frontend/screenshots/verify-templates';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMCIsImV4cCI6MTc4MjcxNDc2OX0.15xFsr1Ez07MEIkjhhTCgbO2nAroYP-t7kdAT2Lmre0';
const CV_ID = 62;

async function ss(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  console.log(`SS: ${name}.png`);
}

// Screenshot the first visible white A4 page card in the scrollable preview
async function ssCard(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.waitForTimeout(600);
  // The visible page cards have style with width:794px height:1123px overflow:hidden
  // They're inside the gray (#94a3b8) scrollable area
  const cards = page.locator('.flex-1.overflow-auto div[style*="1123"]');
  const count = await cards.count();
  if (count > 0) {
    await cards.first().screenshot({ path: file });
    console.log(`SS_CARD: ${name}.png (${count} cards found)`);
    return;
  }
  // Fallback: screenshot the center column (bg-[#0d1117] flex-1)
  await page.screenshot({ path: file });
  console.log(`SS_FALLBACK: ${name}.png`);
}

async function selectTemplate(page, label) {
  // Template buttons are in a 4-col grid inside the left panel
  const btn = page.locator(`button`).filter({ hasText: label }).first();
  const count = await btn.count();
  if (count > 0 && await btn.isVisible()) {
    await btn.click();
    await page.waitForTimeout(1000);
    console.log(`✓ Selected: ${label}`);
    return true;
  }
  // Debug: list all buttons
  const allBtns = await page.locator('button').allTextContents();
  console.log('All buttons:', allBtns.filter(t => t.trim()).slice(0, 30));
  return false;
}

// Read the hidden #cv-preview DOM for analysis
async function analyze(page) {
  return page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return { error: 'NO_CV_PREVIEW' };

    const result = {};

    // 1. Colored background (Colorful header)
    const divs = Array.from(preview.querySelectorAll('div'));
    for (const d of divs) {
      const bg = d.style.backgroundColor;
      if (bg && bg !== '' && !bg.includes('255, 255, 255')) {
        result.coloredHeaderBg = bg;
        result.coloredHeaderPadding = d.style.padding;
        // Check for white text children
        const whites = Array.from(d.querySelectorAll('[style*="color"]'));
        for (const w of whites) {
          const c = w.style.color;
          if (c === '#ffffff' || c === 'rgb(255, 255, 255)' || c.includes('rgba(255, 255, 255')) {
            result.whiteText = (w.textContent || '').trim().slice(0, 60);
            break;
          }
        }
        // Check contact icons
        const txt = d.textContent || '';
        result.hasEmailIcon = txt.includes('✉');
        result.hasPhoneIcon = txt.includes('✆');
        result.hasLocationIcon = txt.includes('⊙');
        break;
      }
    }

    // 2. Left border (Timeline)
    const fc = preview.firstElementChild;
    if (fc) {
      result.outerBorderLeft = fc.style.borderLeft;
      const cs = window.getComputedStyle(fc);
      result.outerBorderLeftComputed = cs.borderLeftWidth + ' solid ' + cs.borderLeftColor;
    }

    // 3. Dot ratings
    let dotCount = 0, filledDots = 0;
    const spans = Array.from(preview.querySelectorAll('span'));
    for (const s of spans) {
      const inner = s.innerHTML;
      if (inner === '&#9679;' || s.textContent.trim() === '●') {
        dotCount++;
        const col = s.style.color;
        if (col && !col.includes('229, 231, 235') && col !== '#e5e7eb') filledDots++;
      }
    }
    result.totalDotSpans = dotCount;
    result.filledDots = filledDots;
    result.emptyDots = dotCount - filledDots;

    // 4. Grid layouts (skills)
    const gridDivs = Array.from(preview.querySelectorAll('div[style*="grid-template-columns"]'));
    result.gridColumns = gridDivs.map(d => d.style.gridTemplateColumns);

    // 5. Two-column entries (Timeline experience)
    const entries = Array.from(preview.querySelectorAll('.cv-entry'));
    const flexEntries = entries.filter(e => window.getComputedStyle(e).display === 'flex');
    result.totalEntries = entries.length;
    result.flexEntries = flexEntries.length;
    if (flexEntries.length > 0) {
      const ch = Array.from(flexEntries[0].children);
      result.firstFlexColWidth = ch[0]?.style?.width || '';
      result.firstFlexColCount = ch.length;
    }

    // 6. Section headings
    const headings = Array.from(preview.querySelectorAll('.cv-section-header'));
    result.headingCount = headings.length;
    if (headings.length > 0) {
      const cs = window.getComputedStyle(headings[0]);
      result.headingBorderBottom = cs.borderBottomWidth;
      result.headingBgColor = headings[0].style.backgroundColor;
    }

    // 7. 2px border (Inline)
    for (const d of divs) {
      const cs = window.getComputedStyle(d);
      if (cs.borderBottomWidth === '2px') {
        result.twoPxBorder = { color: cs.borderBottomColor, found: true };
        break;
      }
    }

    // 8. "·" separator spans
    for (const s of spans) {
      if (s.innerHTML.includes('&nbsp;·&nbsp;')) {
        result.midDotSeparator = true;
        break;
      }
    }

    // 9. Photo
    result.imgCount = preview.querySelectorAll('img').length;

    // 10. Large name element
    const largeDivs = divs.filter(d => {
      const fs = parseFloat(d.style.fontSize);
      return fs >= 24;
    });
    if (largeDivs.length > 0) {
      result.nameText = (largeDivs[0].textContent || '').trim().slice(0, 60);
      result.nameFontSize = largeDivs[0].style.fontSize;
      result.nameColor = largeDivs[0].style.color;
    }

    // 11. Company color in Timeline
    const italicDivs = divs.filter(d => d.style.fontStyle === 'italic');
    for (const d of italicDivs) {
      const col = d.style.color;
      // If color is accent (not standard grey/dark)
      if (col && col !== '#374151' && col !== '#4b5563' && col !== '#6b7280' && col !== '#111827') {
        result.italicWithAccentColor = { text: (d.textContent || '').trim().slice(0, 40), color: col };
        break;
      }
    }

    return result;
  });
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: {
      cookies: [{
        name: 'token',
        value: TOKEN,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      }],
      origins: []
    }
  });
  const page = await ctx.newPage();

  // Navigate to CV builder
  console.log('Opening CV builder...');
  await page.goto(`http://localhost:3000/cv-builder?id=${CV_ID}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2500);
  await ss(page, 'A0-loaded');

  // Check state
  const hasError = await page.locator('text=Failed').isVisible().catch(() => false);
  const hasGrid = await page.locator('.grid.grid-cols-4').isVisible().catch(() => false);
  console.log('Has error:', hasError, '| Has template grid:', hasGrid);

  if (hasError) {
    console.log('ERROR: Failed to load CV builder. Checking error details...');
    const errs = await page.locator('[class*="toast"], [role="alert"]').allTextContents();
    console.log('Toast messages:', errs);
  }

  await ss(page, 'A1-initial');

  // ── COLORFUL TEMPLATE ─────────────────────────────────────────────────────────
  console.log('\n──── COLORFUL ────');
  if (await selectTemplate(page, 'Colorful')) {
    await page.waitForTimeout(800);
    await ss(page, 'B1-colorful-full');
    await ssCard(page, 'B2-colorful-card');
    const a = await analyze(page);
    console.log('Analysis:', JSON.stringify(a, null, 2));
    console.log('RESULTS:');
    console.log('  [colored header]', a.coloredHeaderBg ? `✅ ${a.coloredHeaderBg}` : '❌ MISSING');
    console.log('  [white text]', a.whiteText ? `✅ "${a.whiteText}"` : a.nameColor === 'rgb(255, 255, 255)' ? '✅ name is white' : '❌ NOT FOUND');
    console.log('  [email icon in header]', a.hasEmailIcon ? '✅' : '❌');
    console.log('  [phone icon in header]', a.hasPhoneIcon ? '✅' : '❌');
    console.log('  [dot ratings]', a.totalDotSpans > 0 ? `✅ ${a.totalDotSpans} spans (${a.filledDots} filled, ${a.emptyDots} empty)` : '❌ NONE');
    console.log('  [skills 3-col grid]', a.gridColumns?.some(g => g.includes('1fr 1fr 1fr')) ? `✅ ${a.gridColumns}` : `❌ got: ${a.gridColumns}`);
    console.log('  [name text]', a.nameText, '(' + a.nameFontSize + ')');
  }

  // ── INLINE TEMPLATE ───────────────────────────────────────────────────────────
  console.log('\n──── INLINE ────');
  if (await selectTemplate(page, 'Inline')) {
    await page.waitForTimeout(800);
    await ss(page, 'C1-inline-full');
    await ssCard(page, 'C2-inline-card');
    const a = await analyze(page);
    console.log('Analysis:', JSON.stringify(a, null, 2));
    console.log('RESULTS:');
    console.log('  [no colored header]', !a.coloredHeaderBg ? '✅ correct' : `⚠️ has bg: ${a.coloredHeaderBg}`);
    console.log('  [2px header border]', a.twoPxBorder ? `✅ ${a.twoPxBorder.color}` : '❌ MISSING');
    console.log('  [· separator]', a.midDotSeparator ? '✅' : '❌ NOT FOUND');
    console.log('  [dot ratings]', a.totalDotSpans > 0 ? `✅ ${a.totalDotSpans} (${a.filledDots} filled)` : '❌ NONE');
    console.log('  [skills 2-col grid]', a.gridColumns?.some(g => g.includes('1fr 1fr') && !g.includes('1fr 1fr 1fr')) ? `✅ ${a.gridColumns}` : `❌ got: ${a.gridColumns}`);
    console.log('  [name text]', a.nameText, '(' + a.nameFontSize + ')');
  }

  // ── TIMELINE TEMPLATE ─────────────────────────────────────────────────────────
  console.log('\n──── TIMELINE ────');
  if (await selectTemplate(page, 'Timeline')) {
    await page.waitForTimeout(800);
    await ss(page, 'D1-timeline-full');
    await ssCard(page, 'D2-timeline-card');
    const a = await analyze(page);
    console.log('Analysis:', JSON.stringify(a, null, 2));
    console.log('RESULTS:');
    console.log('  [left border]', a.outerBorderLeft ? `✅ "${a.outerBorderLeft}"` : `computed: ${a.outerBorderLeftComputed}`);
    console.log('  [no colored header]', !a.coloredHeaderBg ? '✅ correct' : `⚠️ ${a.coloredHeaderBg}`);
    console.log('  [two-col entries]', a.flexEntries > 0 ? `✅ ${a.flexEntries}/${a.totalEntries} flex, first col width: "${a.firstFlexColWidth}"` : '❌ NO FLEX ENTRIES');
    console.log('  [dot ratings]', a.totalDotSpans > 0 ? `✅ ${a.totalDotSpans} (${a.filledDots} filled)` : '❌ NONE');
    console.log('  [underline headings]', a.headingBorderBottom && a.headingBorderBottom !== '0px' ? `✅ ${a.headingBorderBottom}` : `❌ ${a.headingBorderBottom}`);
    console.log('  [no photo]', a.imgCount === 0 ? '✅ no image' : `⚠️ ${a.imgCount} images`);
    console.log('  [company accent color]', a.italicWithAccentColor ? `✅ "${a.italicWithAccentColor.text}" (${a.italicWithAccentColor.color})` : '❌ not found');
  }

  // ── ACCENT COLOR → PURPLE ─────────────────────────────────────────────────────
  console.log('\n──── PURPLE ACCENT COLOR TEST ────');
  const styleTab = page.locator('button:has-text("Style")').first();
  if (await styleTab.isVisible()) {
    await styleTab.click();
    await page.waitForTimeout(700);

    const colorInput = page.locator('input[type="color"]').first();
    if (await colorInput.count() > 0) {
      await colorInput.evaluate(el => {
        el.value = '#7c3aed';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(1200);
      console.log('Set accent → #7c3aed (purple)');
    } else {
      // Try other color inputs
      const hexInputs = await page.locator('input').all();
      for (const inp of hexInputs) {
        const val = await inp.inputValue().catch(() => '');
        if (val.startsWith('#')) {
          await inp.fill('#7c3aed');
          await inp.press('Enter');
          await page.waitForTimeout(1200);
          console.log('Set via hex input:', val, '→ #7c3aed');
          break;
        }
      }
    }

    const secTab = page.locator('button:has-text("Sections")').first();
    await secTab.click().catch(() => {});
    await page.waitForTimeout(400);
  }

  // Test all 3 with purple
  for (const [tpl, fname] of [['Timeline', 'E1-purple-timeline'], ['Colorful', 'E2-purple-colorful'], ['Inline', 'E3-purple-inline']]) {
    await selectTemplate(page, tpl);
    await page.waitForTimeout(800);
    await ssCard(page, fname);
    const a = await analyze(page);
    if (tpl === 'Timeline') {
      console.log(`${tpl} purple border:`, a.outerBorderLeft || a.outerBorderLeftComputed);
    } else if (tpl === 'Colorful') {
      console.log(`${tpl} purple header:`, a.coloredHeaderBg);
    } else {
      console.log(`${tpl} purple border/headings: headingBorderBottom=${a.headingBorderBottom}`);
    }
  }

  await ss(page, 'Z-final');
  console.log('\n=== DONE ===');
  await browser.close();
})();
