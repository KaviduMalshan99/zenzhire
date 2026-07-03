const { chromium } = require('playwright');

const TOKEN = process.argv[2];
const CV_ID = process.argv[3];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await context.addCookies([{ name: 'token', value: TOKEN, domain: 'localhost', path: '/' }]);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(`http://localhost:3000/cv-builder/${CV_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('Page errors after load:', errors);

  // Confirm the Move ("place freely") button no longer exists anywhere
  const moveBtnCount = await page.locator('[title="Drag to place anywhere on the page"]').count();
  const oldMoveBtnCount = await page.locator('[title="Place freely anywhere on the page"]').count();
  console.log('New-style move button count (should be 0):', moveBtnCount);
  console.log('Old-style move button count (should be 0):', oldMoveBtnCount);

  // Confirm the reorder grip handle still exists (hover a visible section to reveal it)
  const candidates = page.locator('[data-section-id]');
  const count = await candidates.count();
  let hovered = false;
  for (let i = 0; i < count; i++) {
    const item = candidates.nth(i);
    if (await item.isVisible()) {
      const box = await item.boundingBox();
      if (box && box.x >= 0 && box.width > 0) {
        await item.hover();
        hovered = true;
        break;
      }
    }
  }
  console.log('Hovered a visible section:', hovered);
  await page.waitForTimeout(300);
  const gripCount = await page.locator('[title="Drag to reorder"]').count();
  console.log('Grip (reorder) handle count:', gripCount);

  await page.screenshot({ path: 'C:/Users/Administrator/AppData/Local/Temp/revert-verify.png', fullPage: false });
  console.log('Final page errors:', errors);
  await browser.close();
  console.log('done');
})().catch((e) => { console.error(e); process.exit(1); });
