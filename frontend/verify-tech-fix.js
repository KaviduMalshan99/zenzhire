const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = 'F:/zenzhire/frontend/screenshots/tech-fix';
fs.mkdirSync(OUT, { recursive: true });

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMCIsImV4cCI6MTc4MjcxNDc2OX0.15xFsr1Ez07MEIkjhhTCgbO2nAroYP-t7kdAT2Lmre0';
const CV_ID = 62;

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: {
      cookies: [{ name: 'token', value: TOKEN, domain: 'localhost', path: '/', httpOnly: false, secure: false, sameSite: 'Lax' }],
      origins: []
    }
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/cv-builder?id=' + CV_ID, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2500);

  // Select Tech template
  await page.locator('button').filter({ hasText: 'Tech' }).first().click();
  await page.waitForTimeout(1200);

  // Screenshot the first visible card
  const cards = page.locator('.flex-1.overflow-auto div[style*="1123"]');
  const count = await cards.count();
  if (count > 0) {
    await cards.first().screenshot({ path: path.join(OUT, 'tech-card.png') });
    console.log('Card screenshot saved (' + count + ' cards)');
  }

  // Full page screenshot
  await page.screenshot({ path: path.join(OUT, 'tech-full.png') });

  // Analyze the hidden #cv-preview for header content
  const analysis = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return { error: 'NO_PREVIEW' };

    const divs = Array.from(preview.querySelectorAll('div'));

    // Find dark header (HEADER_BG = #0f172a)
    const header = divs.find(d => {
      const bg = d.style.backgroundColor;
      return bg && (bg.includes('15, 23, 42') || bg === '#0f172a' || bg.toLowerCase() === 'rgb(15, 23, 42)');
    });

    if (!header) return { error: 'no dark header found', allBgs: divs.slice(0, 10).map(d => d.style.backgroundColor).filter(Boolean) };

    // Name: largest font in header
    const largeDivs = Array.from(header.querySelectorAll('div')).filter(d => {
      const fs = parseFloat(d.style.fontSize);
      return fs >= 20;
    });

    // Title: font 13px
    const titleDivs = Array.from(header.querySelectorAll('div')).filter(d => d.style.fontSize === '13px');

    // Chips in body
    const body = preview.querySelector('div[style*="background-color: rgb(255, 255, 255)"]') ||
                 Array.from(preview.querySelectorAll('div')).find(d => d.style.backgroundColor === 'rgb(255, 255, 255)' || d.style.backgroundColor === '#ffffff');

    const chips = Array.from(preview.querySelectorAll('span')).filter(s => {
      const bg = s.style.background || s.style.backgroundColor;
      return bg && (bg.includes('1e293b') || bg.includes('30, 41, 59'));
    });

    const linkChips = Array.from(preview.querySelectorAll('span')).filter(s => {
      const border = s.style.border || '';
      return border.includes('22d3ee') || border.includes('34, 211, 238');
    });

    return {
      headerBg: header.style.backgroundColor,
      headerTextContent: (header.textContent || '').trim().slice(0, 200),
      nameDivs: largeDivs.map(d => ({ text: d.textContent?.trim().slice(0, 40), color: d.style.color, fontSize: d.style.fontSize })),
      titleDivs: titleDivs.map(d => ({ text: d.textContent?.trim().slice(0, 40), color: d.style.color })),
      chipCount: chips.length,
      chipSample: chips[0] ? { text: chips[0].textContent?.trim(), lineHeight: chips[0].style.lineHeight, textAlign: chips[0].style.textAlign } : null,
      linkChipCount: linkChips.length,
      linkChipSample: linkChips[0] ? { text: linkChips[0].textContent?.trim().slice(0, 40), color: linkChips[0].style.color, lineHeight: linkChips[0].style.lineHeight } : null,
    };
  });

  console.log('\n=== DOM Analysis ===');
  console.log(JSON.stringify(analysis, null, 2));

  // Check key results
  const nameOk = analysis.nameDivs?.some(d => d.color === 'rgb(255, 255, 255)' || d.color === '#ffffff' || d.color === '#fff');
  const titleOk = analysis.titleDivs?.some(d => d.color === 'rgb(34, 211, 238)' || d.color === '#22d3ee');

  console.log('\n=== RESULTS ===');
  console.log('[name color white]', nameOk ? '✅' : '❌', analysis.nameDivs?.[0]?.color);
  console.log('[title color cyan]', titleOk ? '✅' : '❌', analysis.titleDivs?.[0]?.color);
  console.log('[chip lineHeight 1.6]', analysis.chipSample?.lineHeight === '1.6' ? '✅' : '❌', analysis.chipSample?.lineHeight);
  console.log('[chip textAlign center]', analysis.chipSample?.textAlign === 'center' ? '✅' : '❌', analysis.chipSample?.textAlign);
  console.log('[linkChip cyan border]', analysis.linkChipCount > 0 ? '✅ ' + analysis.linkChipCount + ' links' : '❌ none');
  console.log('[linkChip lineHeight]', analysis.linkChipSample?.lineHeight === '1.6' ? '✅' : '❌', analysis.linkChipSample?.lineHeight);

  await browser.close();
  console.log('\n=== DONE ===');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
