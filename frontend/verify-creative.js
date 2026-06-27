const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = 'F:/zenzhire/frontend/screenshots/creative-test';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();

  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"]').first().fill('it23565876@my.sliit.lk');
  await page.locator('input[type="password"]').first().fill('123Dul123#');
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // Open CV 66 with Timeline template selected
  await page.goto('http://localhost:3000/cv-builder?id=66', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);

  // Select Timeline template
  const timelineBtn = page.locator('button', { hasText: 'Timeline' }).first();
  if (await timelineBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await timelineBtn.click();
    await page.waitForTimeout(2500);
  }

  // ── CHECK 1: Close-up of contact row ─────────────────────────────────────
  // Zoom to 125% so contact row is large and readable
  await page.locator('button', { hasText: '125' }).first().click();
  await page.waitForTimeout(1000);

  // Screenshot just the top of the preview panel (header area)
  // The preview panel starts after the left sidebar (~350px wide)
  const file1 = path.join(OUT, 'check1-contact-row-125pct.png');
  await page.screenshot({
    path: file1,
    clip: { x: 350, y: 100, width: 850, height: 200 }
  });
  console.log('CHECK 1 screenshot:', file1);

  // Also a wider crop at 100% zoom for context
  await page.locator('button', { hasText: '100' }).first().click();
  await page.waitForTimeout(800);

  const file1b = path.join(OUT, 'check1-contact-row-100pct.png');
  await page.screenshot({
    path: file1b,
    clip: { x: 350, y: 100, width: 850, height: 180 }
  });
  console.log('CHECK 1b screenshot:', file1b);

  // ── CHECK 2: Close-up of page gap area ───────────────────────────────────
  // Scroll so the gap between page 1 and page 2 is centred in view
  const previewScroll = page.locator('.overflow-auto.min-h-0').first();
  await previewScroll.evaluate(el => el.scrollTop += 1000);
  await page.waitForTimeout(600);

  // Capture the full viewport to find where the gap is
  const file2full = path.join(OUT, 'check2-gap-full.png');
  await page.screenshot({ path: file2full, fullPage: false });
  console.log('CHECK 2 full:', file2full);

  // Crop just the left edge where the blue line should be, spanning the gap
  // The gap area is roughly in the middle of the screen vertically
  const file2 = path.join(OUT, 'check2-gap-left-edge.png');
  await page.screenshot({
    path: file2,
    clip: { x: 350, y: 0, width: 120, height: 900 }
  });
  console.log('CHECK 2 left edge crop:', file2);

  await browser.close();
  console.log('Done.');
})();
