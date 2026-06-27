const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = 'F:/zenzhire/frontend/screenshots/svg-icons';
fs.mkdirSync(OUT, { recursive: true });

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMCIsImV4cCI6MTc4MjcxNDc2OX0.15xFsr1Ez07MEIkjhhTCgbO2nAroYP-t7kdAT2Lmre0';
const CV_ID = 62;

async function cardShot(page, name) {
  await page.waitForTimeout(800);
  const cards = page.locator('.flex-1.overflow-auto div[style*="1123"]');
  const c = await cards.count();
  if (c > 0) {
    await cards.first().screenshot({ path: path.join(OUT, name + '.png') });
    console.log('CARD: ' + name + '.png (' + c + ' cards)');
  } else {
    await page.screenshot({ path: path.join(OUT, name + '-fallback.png') });
    console.log('FALLBACK: ' + name);
  }
}

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

  // --- COLORFUL ---
  console.log('\n=== COLORFUL ===');
  await page.locator('button').filter({ hasText: 'Colorful' }).first().click();
  await page.waitForTimeout(1200);
  await cardShot(page, 'colorful');

  const colorfulInfo = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return { error: 'NO_PREVIEW' };
    const divs = Array.from(preview.querySelectorAll('div'));
    const header = divs.find(d => d.style.backgroundColor && !d.style.backgroundColor.includes('255, 255, 255') && d.style.backgroundColor !== '');
    if (!header) return { error: 'no colored header div found' };
    const svgs = Array.from(header.querySelectorAll('svg'));
    const img = header.querySelector('img');
    return {
      bgColor: header.style.backgroundColor,
      svgCount: svgs.length,
      svgFills: svgs.slice(0, 6).map(s => s.getAttribute('fill')),
      svgWidths: svgs.slice(0, 6).map(s => s.getAttribute('width')),
      hasImg: !!img,
      imgWidth: img ? img.style.width : null,
      imgHeight: img ? img.style.height : null,
      headerText: (header.textContent || '').trim().slice(0, 150),
    };
  });
  console.log('Colorful header analysis:', JSON.stringify(colorfulInfo, null, 2));
  if (colorfulInfo.svgCount > 0) {
    console.log('  [SVG icons] FOUND: ' + colorfulInfo.svgCount + ' SVGs, fills: ' + colorfulInfo.svgFills.join(', '));
  } else {
    console.log('  [SVG icons] NOT FOUND');
  }
  if (colorfulInfo.imgWidth === '120px') {
    console.log('  [Photo size] 120px OK');
  } else {
    console.log('  [Photo size] imgWidth=' + colorfulInfo.imgWidth + ' (no photo on this account)');
  }

  // --- INLINE ---
  console.log('\n=== INLINE ===');
  await page.locator('button').filter({ hasText: 'Inline' }).first().click();
  await page.waitForTimeout(1200);
  await cardShot(page, 'inline');

  const inlineInfo = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return { error: 'NO_PREVIEW' };
    const allSvgs = Array.from(preview.querySelectorAll('svg'));
    const grayFillSvgs = allSvgs.filter(s => s.getAttribute('fill') === '#6b7280');
    const whiteFillSvgs = allSvgs.filter(s => s.getAttribute('fill') === 'white');
    const divs = Array.from(preview.querySelectorAll('div'));
    const contactRow = divs.find(d => d.style.fontSize === '11px' && d.querySelectorAll('svg').length > 0);
    return {
      totalSvgs: allSvgs.length,
      grayFillCount: grayFillSvgs.length,
      whiteFillCount: whiteFillSvgs.length,
      allFills: [...new Set(allSvgs.map(s => s.getAttribute('fill')))],
      contactRowFound: !!contactRow,
      contactText: contactRow ? (contactRow.textContent || '').trim().slice(0, 120) : null,
    };
  });
  console.log('Inline analysis:', JSON.stringify(inlineInfo, null, 2));
  if (inlineInfo.grayFillCount > 0) {
    console.log('  [SVG icons gray] FOUND: ' + inlineInfo.grayFillCount + ' gray (#6b7280) SVGs');
  } else {
    console.log('  [SVG icons gray] NOT FOUND');
  }

  console.log('\n=== DONE ===');
  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
