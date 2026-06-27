const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = 'F:/zenzhire/frontend/screenshots/verify-templates';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

async function ss(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`SCREENSHOT: ${file}`);
  return file;
}

async function ssFull(page, name) {
  const file = path.join(OUT, `${name}-full.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`SCREENSHOT_FULL: ${file}`);
  return file;
}

// Capture only the CV preview area
async function ssCV(page, name) {
  const file = path.join(OUT, `${name}.png`);
  try {
    const el = await page.locator('#cv-preview').first();
    if (await el.isVisible()) {
      await el.screenshot({ path: file });
      console.log(`SCREENSHOT_CV: ${file}`);
      return file;
    }
  } catch(e) {}
  // Fallback to full page
  await page.screenshot({ path: file, fullPage: false });
  console.log(`SCREENSHOT_CV_FALLBACK: ${file}`);
  return file;
}

async function waitForCV(page) {
  // Wait for cv-preview to be present
  await page.waitForSelector('#cv-preview', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  console.log('--- Navigating to app ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await ss(page, '00-landing');

  // Check if already logged in or need to login
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);

  if (currentUrl.includes('/login') || currentUrl.includes('auth') || !currentUrl.includes('dashboard')) {
    console.log('--- Logging in ---');
    // Try to find login fields
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 }).catch(() => {});
    const emailField = await page.locator('input[type="email"], input[name="email"]').first();
    const passField = await page.locator('input[type="password"]').first();

    if (await emailField.isVisible()) {
      await emailField.fill('freelyricshub@gmail.com');
      await passField.fill('password123');
      await ss(page, '01-login-filled');
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(1000);
      await ss(page, '02-after-login');
    }
  }

  console.log('Current URL after login attempt:', page.url());

  // Navigate to CV builder
  console.log('--- Navigating to CV builder ---');
  await page.goto('http://localhost:3000/cv-builder', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await ss(page, '03-cv-builder-initial');
  console.log('CV builder URL:', page.url());

  // ── Fill personal details ────────────────────────────────────────────────────
  console.log('--- Filling personal details ---');

  // Click on Personal Details section
  const personalSection = await page.locator('text=Personal Details').first();
  if (await personalSection.isVisible()) {
    await personalSection.click();
    await page.waitForTimeout(800);
    await ss(page, '04-personal-form-open');

    // Fill full name
    const nameField = await page.locator('input[placeholder*="name" i], input[name*="full_name" i], input[name*="name" i]').first();
    if (await nameField.isVisible()) {
      await nameField.clear();
      await nameField.fill('Alexandra Chen');
    }

    // Fill job title
    const titleField = await page.locator('input[placeholder*="title" i], input[name*="title" i]').first();
    if (await titleField.isVisible()) {
      await titleField.clear();
      await titleField.fill('Senior Software Engineer');
    }

    // Fill email
    const emailField = await page.locator('input[type="email"], input[placeholder*="email" i]').first();
    if (await emailField.isVisible()) {
      await emailField.clear();
      await emailField.fill('alex.chen@example.com');
    }

    // Fill phone
    const phoneField = await page.locator('input[type="tel"], input[placeholder*="phone" i]').first();
    if (await phoneField.isVisible()) {
      await phoneField.clear();
      await phoneField.fill('+1 (555) 234-5678');
    }

    // Fill location
    const locField = await page.locator('input[placeholder*="location" i], input[placeholder*="city" i]').first();
    if (await locField.isVisible()) {
      await locField.clear();
      await locField.fill('San Francisco, CA');
    }

    // Fill nationality
    const natField = await page.locator('input[placeholder*="national" i]').first();
    if (await natField.isVisible()) {
      await natField.clear();
      await natField.fill('American');
    }

    await ss(page, '05-personal-filled');
  }

  // Go back to sections list
  const backBtn = await page.locator('button[class*="back"], button[title*="back"], svg[data-lucide="chevron-left"]').first();
  if (await backBtn.isVisible()) {
    await backBtn.click();
  } else {
    // Try clicking ChevronLeft
    await page.locator('[class*="ChevronLeft"], [data-lucide="chevron-left"]').first().click().catch(() => {});
  }
  await page.waitForTimeout(500);

  // ── Add experience if not present ──────────────────────────────────────────
  console.log('--- Checking for Experience section ---');
  const expSection = await page.locator('text=Experience').first();
  if (await expSection.isVisible()) {
    await expSection.click();
    await page.waitForTimeout(600);

    // Try to add an entry if none exist
    const addEntryBtn = await page.locator('button:has-text("Add"), button:has-text("+ Add")').first();
    if (await addEntryBtn.isVisible()) {
      await addEntryBtn.click();
      await page.waitForTimeout(400);
    }

    // Fill job title
    const jobTitleInput = await page.locator('input[placeholder*="job" i], input[placeholder*="title" i], input[name*="job_title" i]').first();
    if (await jobTitleInput.isVisible()) {
      await jobTitleInput.fill('Lead Engineer');
    }

    const employerInput = await page.locator('input[placeholder*="employer" i], input[placeholder*="company" i], input[name*="employer" i]').first();
    if (await employerInput.isVisible()) {
      await employerInput.fill('TechCorp Inc.');
    }

    const startInput = await page.locator('input[placeholder*="start" i]').first();
    if (await startInput.isVisible()) {
      await startInput.fill('Jan 2021');
    }

    const currentCheckbox = await page.locator('input[type="checkbox"]').first();
    if (await currentCheckbox.isVisible()) {
      const isChecked = await currentCheckbox.isChecked();
      if (!isChecked) await currentCheckbox.check();
    }

    const locationInput = await page.locator('input[placeholder*="location" i]').first();
    if (await locationInput.isVisible()) {
      await locationInput.fill('San Francisco, CA');
    }

    await ss(page, '06-experience-filled');

    // Go back
    await page.locator('[data-lucide="chevron-left"]').first().click().catch(() => {});
    await page.waitForTimeout(400);
  }

  // ── Add skills ──────────────────────────────────────────────────────────────
  console.log('--- Filling skills ---');
  const skillsSection = await page.locator('span:has-text("Skills"), div:has-text("Skills")').first();
  await skillsSection.click().catch(() => {});
  await page.waitForTimeout(600);

  // Try adding skill entries
  for (const skill of ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python']) {
    const addBtn = await page.locator('button:has-text("Add")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(300);
      const skillInput = await page.locator('input[placeholder*="skill" i]').last();
      if (await skillInput.isVisible()) {
        await skillInput.fill(skill);
      }
    }
  }
  await page.locator('[data-lucide="chevron-left"]').first().click().catch(() => {});
  await page.waitForTimeout(400);

  // ── Add languages ───────────────────────────────────────────────────────────
  console.log('--- Filling languages ---');
  const langSection = await page.locator('span:has-text("Languages"), text=Languages').first();
  await langSection.click().catch(() => {});
  await page.waitForTimeout(600);

  for (const [lang, level] of [['English', 'Native'], ['Spanish', 'Professional'], ['French', 'Basic']]) {
    const addBtn = await page.locator('button:has-text("Add")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(300);

      const langInput = await page.locator('input[placeholder*="language" i]').last();
      if (await langInput.isVisible()) await langInput.fill(lang);

      const levelInput = await page.locator('input[placeholder*="level" i], select[name*="level" i]').last();
      if (await levelInput.isVisible()) {
        const tag = await levelInput.evaluate(el => el.tagName.toLowerCase());
        if (tag === 'select') {
          await levelInput.selectOption({ label: level }).catch(async () => {
            await levelInput.selectOption(level).catch(() => {});
          });
        } else {
          await levelInput.fill(level);
        }
      }
    }
  }
  await page.locator('[data-lucide="chevron-left"]').first().click().catch(() => {});
  await page.waitForTimeout(600);

  await waitForCV(page);
  await ss(page, '07-data-filled-overview');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPLATE 1: COLORFUL (minimal)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- Switching to Colorful template ---');
  const colorfulBtn = await page.locator('button:has-text("Colorful")').first();
  if (await colorfulBtn.isVisible()) {
    await colorfulBtn.click();
    await page.waitForTimeout(1500);
    console.log('Colorful template selected');
  } else {
    console.log('WARNING: Colorful button not found');
    // List available template buttons
    const templateBtns = await page.locator('.grid button').allTextContents();
    console.log('Template buttons found:', templateBtns);
  }

  await waitForCV(page);
  await ss(page, '10-colorful-full-view');
  await ssCV(page, '11-colorful-cv-preview');

  // Check colored header exists
  const headerBg = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    // Find the first colored div (header)
    const allDivs = preview.querySelectorAll('div');
    for (const div of allDivs) {
      const bg = window.getComputedStyle(div).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)' && bg !== '') {
        return `FOUND_COLORED_HEADER: ${bg} on ${div.style.padding || 'no-pad'}`;
      }
    }
    return 'NO_COLORED_HEADER';
  });
  console.log('Colorful header check:', headerBg);

  // Check dot ratings exist
  const dotCount = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 0;
    // Count bullet/dot characters
    const spans = preview.querySelectorAll('span');
    let count = 0;
    for (const s of spans) {
      if (s.textContent.includes('●') || s.innerHTML.includes('&#9679;')) count++;
    }
    return count;
  });
  console.log('Dot rating spans in Colorful:', dotCount);

  // Check skills grid columns
  const skillsGrid = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    const divs = preview.querySelectorAll('div[style*="grid-template-columns"]');
    for (const d of divs) {
      const style = d.style.gridTemplateColumns;
      if (style) return `GRID: ${style}`;
    }
    return 'NO_GRID';
  });
  console.log('Skills grid in Colorful:', skillsGrid);

  // Check white text in header
  const whiteTextCheck = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    const divs = preview.querySelectorAll('div');
    for (const d of divs) {
      const bg = window.getComputedStyle(d).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)') {
        // Found colored header, look for white text children
        const children = d.querySelectorAll('*');
        for (const ch of children) {
          const color = ch.style.color;
          if (color === 'rgb(255, 255, 255)' || color === '#ffffff' || color === 'white') {
            return `WHITE_TEXT_FOUND: "${ch.textContent.trim().substring(0,30)}"`;
          }
        }
        return `COLORED_HEADER_FOUND_BUT_NO_WHITE_TEXT_INLINE`;
      }
    }
    return 'NO_COLORED_BG';
  });
  console.log('White text check:', whiteTextCheck);

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPLATE 2: INLINE (academic)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- Switching to Inline template ---');
  const inlineBtn = await page.locator('button:has-text("Inline")').first();
  if (await inlineBtn.isVisible()) {
    await inlineBtn.click();
    await page.waitForTimeout(1500);
    console.log('Inline template selected');
  } else {
    console.log('WARNING: Inline button not found');
  }

  await waitForCV(page);
  await ss(page, '20-inline-full-view');
  await ssCV(page, '21-inline-cv-preview');

  // Check name + title on same line
  const inlineHeaderCheck = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    // Check if we can find "·" separator in a flex row with name
    const spans = preview.querySelectorAll('span');
    for (const s of spans) {
      if (s.textContent === '·' || s.textContent === ' · ' || s.innerHTML.includes('·')) {
        return `DOT_SEPARATOR_FOUND: "${s.textContent}" in parent: ${s.parentElement?.style?.display}`;
      }
    }
    return 'NO_DOT_SEPARATOR';
  });
  console.log('Inline header check (name·title):', inlineHeaderCheck);

  // Check 2px bottom border
  const borderCheck = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    const divs = preview.querySelectorAll('div');
    for (const d of divs) {
      const style = window.getComputedStyle(d);
      const bb = style.borderBottomWidth;
      const bc = style.borderBottomColor;
      if (bb === '2px') return `2PX_BORDER_FOUND: color=${bc}`;
    }
    return 'NO_2PX_BORDER';
  });
  console.log('Inline header border check:', borderCheck);

  // Check 2-col skills grid
  const inlineSkillsGrid = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    const divs = preview.querySelectorAll('div[style*="grid-template-columns"]');
    for (const d of divs) {
      if (d.style.gridTemplateColumns) return `GRID: ${d.style.gridTemplateColumns}`;
    }
    return 'NO_GRID';
  });
  console.log('Skills grid in Inline:', inlineSkillsGrid);

  // Check dot ratings
  const inlineDots = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 0;
    const spans = preview.querySelectorAll('span');
    let count = 0;
    for (const s of spans) {
      if (s.textContent.includes('●') || s.innerHTML.includes('&#9679;')) count++;
    }
    return count;
  });
  console.log('Dot rating spans in Inline:', inlineDots);

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPLATE 3: TIMELINE (creative)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- Switching to Timeline template ---');
  const timelineBtn = await page.locator('button:has-text("Timeline")').first();
  if (await timelineBtn.isVisible()) {
    await timelineBtn.click();
    await page.waitForTimeout(1500);
    console.log('Timeline template selected');
  } else {
    console.log('WARNING: Timeline button not found');
  }

  await waitForCV(page);
  await ss(page, '30-timeline-full-view');
  await ssCV(page, '31-timeline-cv-preview');

  // Check left border on outer wrapper
  const leftBorderCheck = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    // Check direct children's border-left
    const firstChild = preview.firstElementChild;
    if (!firstChild) return 'NO_FIRST_CHILD';
    const style = window.getComputedStyle(firstChild);
    const bl = firstChild.style.borderLeft || window.getComputedStyle(firstChild).borderLeft;
    const blStyle = firstChild.style.borderLeft;
    return `FIRST_CHILD_BORDER_LEFT: inline=${blStyle}, computed_width=${style.borderLeftWidth}, computed_color=${style.borderLeftColor}`;
  });
  console.log('Timeline left border check:', leftBorderCheck);

  // Check two-column layout in experience entries
  const twoColCheck = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    const entries = preview.querySelectorAll('.cv-entry');
    for (const entry of entries) {
      const style = window.getComputedStyle(entry);
      if (style.display === 'flex') {
        const children = Array.from(entry.children);
        if (children.length >= 2) {
          const firstChildStyle = window.getComputedStyle(children[0]);
          return `TWO_COL_FOUND: first-col-width=${children[0].style.width || firstChildStyle.width}, flex=${style.display}`;
        }
      }
    }
    return 'NO_TWO_COL_FLEX_ENTRY';
  });
  console.log('Timeline two-column check:', twoColCheck);

  // Check section headings are underline style (should have border-bottom)
  const underlineCheck = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    const headers = preview.querySelectorAll('.cv-section-header');
    for (const h of headers) {
      const style = window.getComputedStyle(h);
      if (style.borderBottomWidth && style.borderBottomWidth !== '0px') {
        return `UNDERLINE_STYLE_FOUND: border-bottom=${style.borderBottomWidth} ${style.borderBottomColor}`;
      }
    }
    return 'NO_UNDERLINE_ON_HEADERS';
  });
  console.log('Timeline heading underline check:', underlineCheck);

  // Check dot ratings
  const timelineDots = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 0;
    const spans = preview.querySelectorAll('span');
    let count = 0;
    for (const s of spans) {
      if (s.textContent.includes('●') || s.innerHTML.includes('&#9679;')) count++;
    }
    return count;
  });
  console.log('Dot rating spans in Timeline:', timelineDots);

  // ─────────────────────────────────────────────────────────────────────────────
  // ACCENT COLOR CHANGE TEST (purple)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- Testing accent color change to purple ---');

  // Open Style tab
  const styleTab = await page.locator('button:has-text("Style")').first();
  if (await styleTab.isVisible()) {
    await styleTab.click();
    await page.waitForTimeout(600);
    await ss(page, '40-style-tab-open');

    // Find color picker or color input
    const colorInput = await page.locator('input[type="color"]').first();
    if (await colorInput.isVisible()) {
      await colorInput.evaluate(el => {
        el.value = '#7c3aed';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(1000);
      console.log('Set accent color to purple #7c3aed');
    } else {
      console.log('No color input found in Style tab');
    }
  }

  // Check Timeline is still selected and verify purple border
  const purpleTimelineBtn = await page.locator('button:has-text("Timeline")').first();
  if (await purpleTimelineBtn.isVisible()) {
    // Make sure Timeline is active
    const isActive = await purpleTimelineBtn.evaluate(el => el.className.includes('blue') || el.getAttribute('class'));
    console.log('Timeline button state:', isActive);
  }

  // Switch back to sections to see the CV
  const sectionsTab = await page.locator('button:has-text("Sections")').first();
  if (await sectionsTab.isVisible()) {
    await sectionsTab.click();
    await page.waitForTimeout(600);
  }

  await waitForCV(page);
  await ss(page, '41-timeline-purple-full');
  await ssCV(page, '42-timeline-purple-cv');

  // Check if purple is visible in the left border
  const purpleBorderCheck = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    const firstChild = preview.firstElementChild;
    if (!firstChild) return 'NO_FIRST_CHILD';
    const style = window.getComputedStyle(firstChild);
    return `BORDER_LEFT: width=${style.borderLeftWidth}, color=${style.borderLeftColor}`;
  });
  console.log('Purple border check (Timeline):', purpleBorderCheck);

  // Switch to Colorful and check purple header
  const colorfulBtn2 = await page.locator('button:has-text("Colorful")').first();
  if (await colorfulBtn2.isVisible()) {
    await colorfulBtn2.click();
    await page.waitForTimeout(1500);
    await waitForCV(page);
    await ssCV(page, '43-colorful-purple-cv');

    const purpleHeaderCheck = await page.evaluate(() => {
      const preview = document.getElementById('cv-preview');
      if (!preview) return 'NO_PREVIEW';
      const allDivs = preview.querySelectorAll('div');
      for (const div of allDivs) {
        const bg = window.getComputedStyle(div).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)') {
          return `COLORED_HEADER: bg=${bg}`;
        }
      }
      return 'NO_COLORED_HEADER';
    });
    console.log('Purple Colorful header check:', purpleHeaderCheck);
  }

  // Switch to Inline and check
  const inlineBtn2 = await page.locator('button:has-text("Inline")').first();
  if (await inlineBtn2.isVisible()) {
    await inlineBtn2.click();
    await page.waitForTimeout(1500);
    await waitForCV(page);
    await ssCV(page, '44-inline-purple-cv');
  }

  await ss(page, '99-final-state');
  console.log('--- Verification complete ---');
  await browser.close();
})();
