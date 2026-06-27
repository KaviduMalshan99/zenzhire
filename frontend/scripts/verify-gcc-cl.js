const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = 'F:\\zenzhire\\frontend\\screenshots\\cl-template-test';

async function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('Step 1: Logging in...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.fill('input[type="email"]', 'it23565876@my.sliit.lk');
    await page.fill('input[type="password"]', '123Dul123#');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });
    console.log('After login URL:', page.url());

    // Step 2: Navigate to cover letter list
    console.log('Step 2: Navigating to /cover-letter...');
    await page.goto('http://localhost:3000/cover-letter');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Step 3: Click first cover letter card
    console.log('Step 3: Opening first cover letter...');
    const firstCard = page.locator('[class*="cursor-pointer"]').first();
    await firstCard.click();
    await page.waitForURL(url => url.toString().includes('/cover-letter/'), { timeout: 10000 });
    await page.waitForTimeout(2500);
    console.log('Opened editor at:', page.url());

    // Step 4: Make sure we're on the "details" tab (where template buttons live)
    console.log('Step 4a: Ensuring "details" tab is active...');
    const detailsTab = page.locator('button').filter({ hasText: /^details$/i }).first();
    if (await detailsTab.isVisible().catch(() => false)) {
      await detailsTab.click();
      console.log('Clicked details tab');
      await page.waitForTimeout(800);
    }

    // Step 4b: Select "Kavidu cv" from CV dropdown (on details tab)
    console.log('Step 4b: Selecting Kavidu cv...');
    const cvSelect = page.locator('select').first();
    const opts = await cvSelect.locator('option').all();
    for (const opt of opts) {
      const txt = await opt.textContent();
      const val = await opt.getAttribute('value');
      if (/kavidu/i.test(txt)) {
        await cvSelect.selectOption({ value: val });
        console.log('Selected Kavidu cv (value:', val, ')');
        break;
      }
    }
    await page.waitForTimeout(1500);

    // Step 5: Scroll the left panel to reveal the Template section, then click GCC
    console.log('Step 5: Scrolling left panel and clicking GCC template...');

    // The left panel scrollable area
    const leftPanelScroll = page.locator('.flex-1.overflow-y-auto').first();
    if (await leftPanelScroll.isVisible().catch(() => false)) {
      await leftPanelScroll.evaluate(el => el.scrollTop = el.scrollHeight);
      console.log('Scrolled left panel to bottom');
      await page.waitForTimeout(600);
    }

    // Find GCC button — button text starts with "GCC"
    let gccClicked = false;
    const allBtns = await page.locator('button').all();
    for (const btn of allBtns) {
      const text = await btn.textContent().catch(() => '');
      // Button text content is "GCCDark header — matches GCC CV"
      if (text.trim().startsWith('GCC')) {
        await btn.scrollIntoViewIfNeeded();
        console.log('Found GCC button:', text.trim().substring(0, 60));
        await btn.click();
        gccClicked = true;
        console.log('Clicked GCC button');
        break;
      }
    }

    if (!gccClicked) {
      console.log('GCC button still not found. All button texts:');
      const freshBtns = await page.locator('button').all();
      for (const btn of freshBtns) {
        const text = await btn.textContent().catch(() => '');
        if (text.trim()) console.log(`  "${text.trim().substring(0, 80)}"`);
      }
      // Try the :has-text selector as last resort
      const gccBtn = page.locator('button').filter({ hasText: 'GCC' }).first();
      if (await gccBtn.isVisible().catch(() => false)) {
        await gccBtn.scrollIntoViewIfNeeded();
        await gccBtn.click();
        gccClicked = true;
        console.log('Clicked GCC via filter');
      }
    }

    // Wait 1 second as requested
    console.log('Waiting 1 second...');
    await page.waitForTimeout(1000);

    // Step 6: Take screenshots of the preview panel
    console.log('Step 6: Taking screenshots...');

    // The preview panel is the flex-1 div with overflow-auto and p-8 bg-[#0d1117]
    // It contains the A4 white document div
    // Find the white A4 document (210mm wide)
    const docBox = await page.evaluate(() => {
      // Find all divs with white background that are large
      const whites = Array.from(document.querySelectorAll('div')).filter(el => {
        const bg = window.getComputedStyle(el).backgroundColor;
        const rect = el.getBoundingClientRect();
        return bg === 'rgb(255, 255, 255)' && rect.width > 400 && rect.height > 400 && rect.y >= 0;
      });
      if (whites.length > 0) {
        const el = whites[0];
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, classes: el.className };
      }
      return null;
    });

    console.log('Document box:', JSON.stringify(docBox));

    // Also capture the full preview panel (dark background + white doc)
    const previewPanelBox = await page.evaluate(() => {
      const el = document.querySelector('.flex-1.overflow-auto');
      if (el) {
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      }
      return null;
    });

    const fullPath = path.join(SCREENSHOTS_DIR, 'gcc-v2.png');
    const headerPath = path.join(SCREENSHOTS_DIR, 'gcc-v2-header.png');

    if (docBox) {
      // Screenshot the document itself
      await page.screenshot({
        path: fullPath,
        clip: { x: docBox.x, y: docBox.y, width: docBox.width, height: Math.min(docBox.height, 850) }
      });
      console.log('Saved full preview screenshot to:', fullPath);

      // Header crop: top 250px of document
      await page.screenshot({
        path: headerPath,
        clip: { x: docBox.x, y: docBox.y, width: docBox.width, height: 250 }
      });
      console.log('Saved header screenshot to:', headerPath);
    } else if (previewPanelBox) {
      await page.screenshot({
        path: fullPath,
        clip: { x: previewPanelBox.x, y: previewPanelBox.y, width: previewPanelBox.width, height: previewPanelBox.height }
      });
      await page.screenshot({
        path: headerPath,
        clip: { x: previewPanelBox.x, y: previewPanelBox.y, width: previewPanelBox.width, height: 250 }
      });
    } else {
      await page.screenshot({ path: fullPath });
      const vp = page.viewportSize();
      await page.screenshot({ path: headerPath, clip: { x: 0, y: 0, width: vp.width, height: 250 } });
    }

    // Step 7: DOM inspection for GCC template visual properties
    console.log('Step 7: DOM color inspection...');

    const domInfo = await page.evaluate(() => {
      const results = {};

      // Find the white document
      const docEls = Array.from(document.querySelectorAll('div')).filter(el => {
        const bg = window.getComputedStyle(el).backgroundColor;
        const rect = el.getBoundingClientRect();
        return bg === 'rgb(255, 255, 255)' && rect.width > 400 && rect.height > 400;
      });

      const root = docEls[0] || document.body;

      // Get all elements with non-transparent backgrounds, sorted by vertical position
      const colorData = [];
      Array.from(root.querySelectorAll('*')).forEach(el => {
        const styles = window.getComputedStyle(el);
        const bg = styles.backgroundColor;
        if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') return;

        const rect = el.getBoundingClientRect();
        if (rect.width < 30 || rect.height < 5) return;

        colorData.push({
          tag: el.tagName,
          classes: String(el.className).substring(0, 200),
          bg,
          color: styles.color,
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
          text: el.textContent?.trim().substring(0, 80),
        });
      });

      colorData.sort((a, b) => a.rect.y - b.rect.y);
      results.colorData = colorData;

      // Find images in document
      results.images = Array.from(root.querySelectorAll('img')).map(img => {
        const rect = img.getBoundingClientRect();
        const styles = window.getComputedStyle(img);
        const parentStyles = window.getComputedStyle(img.parentElement || document.body);
        const parentRect = img.parentElement?.getBoundingClientRect() || rect;
        return {
          classes: String(img.className).substring(0, 100),
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
          border: styles.border,
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow,
          outline: styles.outline,
          parentBg: parentStyles.backgroundColor,
          parentBorder: parentStyles.border,
          parentClasses: String(img.parentElement?.className).substring(0, 150),
          parentRect: { x: Math.round(parentRect.x), y: Math.round(parentRect.y), w: Math.round(parentRect.width), h: Math.round(parentRect.height) },
          isOnRight: rect.x > (parentRect.x + parentRect.width * 0.5),
        };
      });

      // Root document info
      if (docEls.length > 0) {
        const docRect = docEls[0].getBoundingClientRect();
        results.docRect = { x: Math.round(docRect.x), y: Math.round(docRect.y), w: Math.round(docRect.width), h: Math.round(docRect.height) };
      }

      return results;
    });

    console.log('\n=== GCC Template DOM Elements (top to bottom) ===');
    for (const el of (domInfo.colorData || []).slice(0, 30)) {
      console.log(`[${el.rect.x},${el.rect.y} ${el.rect.w}x${el.rect.h}] ${el.tag} bg="${el.bg}" text="${el.text?.substring(0,50)}"`);
    }

    console.log('\n=== Images in Document ===');
    for (const img of (domInfo.images || [])) {
      console.log(`  img [${img.rect.x},${img.rect.y}] ${img.rect.w}x${img.rect.h}`);
      console.log(`    border: ${img.border}`);
      console.log(`    borderRadius: ${img.borderRadius}`);
      console.log(`    boxShadow: ${img.boxShadow}`);
      console.log(`    parentBg: ${img.parentBg}`);
      console.log(`    parentBorder: ${img.parentBorder}`);
      console.log(`    parentClasses: ${img.parentClasses}`);
      console.log(`    isOnRight: ${img.isOnRight}`);
    }

    console.log('\n=== KEY QUESTIONS ===');
    const docTop = domInfo.docRect?.y || 0;

    // 1. Header background color (first few elements at top of doc)
    const topEls = (domInfo.colorData || []).filter(el =>
      el.rect.y >= docTop && el.rect.y <= docTop + 150 && el.rect.w > 200
    );
    console.log('Top elements (header area):');
    for (const el of topEls) {
      console.log(`  bg=${el.bg} at y=${el.rect.y} text="${el.text?.substring(0,50)}"`);
    }

    // 2. Contact strip (elements just below header)
    const contactEls = (domInfo.colorData || []).filter(el =>
      el.rect.y >= docTop + 80 && el.rect.y <= docTop + 200 && el.rect.w > 200
    );
    console.log('Contact strip candidates:');
    for (const el of contactEls) {
      console.log(`  bg=${el.bg} at y=${el.rect.y} h=${el.rect.h} text="${el.text?.substring(0,50)}"`);
    }

    console.log('\nDone!');
    console.log('GCC clicked:', gccClicked);

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'debug-error.png') }).catch(() => {});
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
