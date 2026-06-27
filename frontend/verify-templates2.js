const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = 'F:/zenzhire/frontend/screenshots/verify-templates';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMCIsImV4cCI6MTc4MjcxNDEyOH0.pEReQK1crm6L1DI5JHqyvB7wE-VWBFSDK0F0cPW0FhY';
const CV_ID = 62;
const API = 'http://localhost:8000/api/v1';

async function apiCall(method, path, body) {
  const opts = {
    method,
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${API}${path}`, opts);
  const text = await r.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function ss(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  console.log(`SS: ${name}.png`);
}

// Screenshot the first visible page card (white A4 card in scrollable preview)
async function ssPage(page, name) {
  const file = path.join(OUT, `${name}.png`);
  try {
    // The white A4 page cards are inside the scrollable center area
    // They have style width:794px height:1123px backgroundColor:#ffffff boxShadow
    const card = page.locator('[style*="794"][style*="1123"]').first();
    if (await card.count() > 0) {
      await card.screenshot({ path: file });
      console.log(`SS_PAGE: ${name}.png`);
      return;
    }
  } catch (e) { console.log('page card selector failed:', e.message); }
  // Fallback: screenshot center area
  try {
    // The center panel has bg #94a3b8 (slate gray)
    const center = page.locator('[style*="#94a3b8"], [style*="94a3b8"]').first();
    if (await center.count() > 0) {
      await center.screenshot({ path: file });
      console.log(`SS_CENTER: ${name}.png`);
      return;
    }
  } catch (e) {}
  await page.screenshot({ path: file });
  console.log(`SS_FALLBACK: ${name}.png`);
}

// Query DOM inside the off-screen #cv-preview (brought to 0,0 for inspection)
async function queryPreview(page, fn) {
  return await page.evaluate((fnStr) => {
    // First try off-screen #cv-preview
    const preview = document.getElementById('cv-preview');
    if (preview) {
      const evalFn = new Function('preview', fnStr);
      return evalFn(preview);
    }
    // Fallback: query inside the first white page card
    const cards = document.querySelectorAll('[style*="794"]');
    for (const card of cards) {
      const h = card.getAttribute('style') || '';
      if (h.includes('1123') || h.includes('overflow: hidden')) {
        const inner = card.querySelector('div');
        if (inner) {
          const evalFn = new Function('preview', fnStr);
          return evalFn(inner);
        }
      }
    }
    return 'NO_TEMPLATE_CONTAINER';
  }, fn.toString().replace(/^[^{]*\{/, '').replace(/\}[^}]*$/, ''));
}

async function fillSectionData() {
  // Fill personal details via API
  const sections = await apiCall('GET', `/cv/${CV_ID}/sections`);
  const personalSection = sections.find(s => s.section_type === 'personal_details');
  if (personalSection) {
    await apiCall('PUT', `/cv/${CV_ID}/sections/${personalSection.id}`, {
      data: {
        full_name: 'Alexandra Chen',
        title: 'Senior Software Engineer',
        email: 'alex.chen@example.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        nationality: 'American',
        links: [
          { platform: 'LinkedIn', url: 'linkedin.com/in/alexandrachen' },
          { platform: 'GitHub', url: 'github.com/alexchen' },
        ]
      }
    });
    console.log('Personal details filled via API');
  }

  // Find/add experience section
  let expSection = sections.find(s => s.section_type === 'experience');
  if (!expSection) {
    expSection = await apiCall('POST', `/cv/${CV_ID}/sections`, { section_type: 'experience' });
  }
  if (expSection) {
    await apiCall('PUT', `/cv/${CV_ID}/sections/${expSection.id}`, {
      data: {
        entries: [
          {
            job_title: 'Lead Software Engineer',
            employer: 'TechCorp Inc.',
            location: 'San Francisco, CA',
            start_date: 'Jan 2021',
            end_date: '',
            current: true,
            bullets: [
              { text: 'Led a team of 8 engineers to deliver a real-time data pipeline' },
              { text: 'Reduced system latency by 40% through architecture improvements' },
              { text: 'Mentored junior developers and conducted code reviews' },
            ]
          },
          {
            job_title: 'Software Engineer',
            employer: 'StartupXYZ',
            location: 'New York, NY',
            start_date: 'Jun 2018',
            end_date: 'Dec 2020',
            current: false,
            bullets: [
              { text: 'Built REST APIs serving 1M+ daily requests' },
              { text: 'Implemented CI/CD pipeline reducing deployment time by 60%' },
            ]
          }
        ]
      }
    });
    console.log('Experience filled via API');
  }

  // Education
  let eduSection = sections.find(s => s.section_type === 'education');
  if (!eduSection) {
    eduSection = await apiCall('POST', `/cv/${CV_ID}/sections`, { section_type: 'education' });
  }
  if (eduSection) {
    await apiCall('PUT', `/cv/${CV_ID}/sections/${eduSection.id}`, {
      data: {
        entries: [
          {
            degree: 'B.S. Computer Science',
            institution: 'Stanford University',
            location: 'Stanford, CA',
            start_date: '2014',
            end_date: '2018',
          }
        ]
      }
    });
  }

  // Skills
  let skillsSection = sections.find(s => s.section_type === 'skills');
  if (!skillsSection) {
    skillsSection = await apiCall('POST', `/cv/${CV_ID}/sections`, { section_type: 'skills' });
  }
  if (skillsSection) {
    await apiCall('PUT', `/cv/${CV_ID}/sections/${skillsSection.id}`, {
      data: {
        entries: [
          { skill_name: 'JavaScript', level: 'Expert' },
          { skill_name: 'TypeScript', level: 'Expert' },
          { skill_name: 'React', level: 'Advanced' },
          { skill_name: 'Node.js', level: 'Advanced' },
          { skill_name: 'Python', level: 'Intermediate' },
          { skill_name: 'AWS', level: 'Intermediate' },
        ]
      }
    });
    console.log('Skills filled via API');
  }

  // Languages
  let langSection = sections.find(s => s.section_type === 'languages');
  if (!langSection) {
    langSection = await apiCall('POST', `/cv/${CV_ID}/sections`, { section_type: 'languages' });
  }
  if (langSection) {
    await apiCall('PUT', `/cv/${CV_ID}/sections/${langSection.id}`, {
      data: {
        entries: [
          { language: 'English', level: 'Native' },
          { language: 'Spanish', level: 'Professional' },
          { language: 'French', level: 'Basic' },
          { language: 'Mandarin', level: 'A2' },
        ]
      }
    });
    console.log('Languages filled via API');
  }

  // Profile summary
  let summarySection = sections.find(s => s.section_type === 'profile_summary');
  if (!summarySection) {
    summarySection = await apiCall('POST', `/cv/${CV_ID}/sections`, { section_type: 'profile_summary' });
  }
  if (summarySection) {
    await apiCall('PUT', `/cv/${CV_ID}/sections/${summarySection.id}`, {
      data: {
        summary: '<p>Passionate software engineer with 8+ years of experience building scalable systems. Expert in full-stack development with a track record of delivering high-impact products. Led cross-functional teams and drove technical strategy at multiple high-growth startups.</p>'
      }
    });
  }
  console.log('All sections filled via API');
}

async function selectTemplate(page, label) {
  // The template grid buttons
  const btn = page.locator(`.grid button:has-text("${label}")`).first();
  const count = await btn.count();
  if (count > 0) {
    await btn.click();
    await page.waitForTimeout(1200);
    console.log(`Selected template: ${label}`);
    return true;
  }
  // Try any button with text
  const allBtns = page.locator(`button:has-text("${label}")`);
  const allCount = await allBtns.count();
  console.log(`Template "${label}" btn count: ${allCount}`);
  if (allCount > 0) {
    await allBtns.first().click();
    await page.waitForTimeout(1200);
    return true;
  }
  // Log all available template buttons
  const gridBtns = page.locator('.grid.grid-cols-4 button');
  const btnTexts = await gridBtns.allTextContents();
  console.log(`Available template buttons: ${JSON.stringify(btnTexts)}`);
  return false;
}

async function checkTemplate(page, templateName) {
  console.log(`\n=== Checking ${templateName} template ===`);

  // Get DOM state from the off-screen #cv-preview
  const domInfo = await page.evaluate((tname) => {
    const preview = document.getElementById('cv-preview');
    const result = { template: tname, found: !!preview };
    if (!preview) return result;

    // Check for colored background in header
    const allDivs = Array.from(preview.querySelectorAll('div'));
    for (const div of allDivs) {
      const bg = div.style.backgroundColor;
      if (bg && bg !== 'rgb(255, 255, 255)' && bg !== '') {
        result.coloredBg = bg;
        // Check padding (header-like element)
        result.coloredBgPadding = div.style.padding;
        break;
      }
    }

    // Check border-left on first child (Timeline)
    const firstChild = preview.firstElementChild;
    if (firstChild) {
      result.firstChildBorderLeft = firstChild.style.borderLeft;
      result.firstChildBorderLeftStr = window.getComputedStyle(firstChild).borderLeftWidth + ' ' + window.getComputedStyle(firstChild).borderLeftColor;
    }

    // Check dot ratings
    const allSpans = Array.from(preview.querySelectorAll('span'));
    let dotCount = 0;
    let filledDots = 0;
    let emptyDots = 0;
    for (const s of allSpans) {
      const text = s.textContent || '';
      if (text.trim() === '●' || s.innerHTML.includes('&#9679;')) {
        dotCount++;
        const color = s.style.color;
        if (color && color !== '#e5e7eb' && color !== 'rgb(229, 231, 235)') filledDots++;
        else emptyDots++;
      }
    }
    result.dotRatingSpans = dotCount;
    result.filledDots = filledDots;
    result.emptyDots = emptyDots;

    // Check grid template columns (skills)
    const gridDivs = Array.from(preview.querySelectorAll('div[style*="grid-template-columns"]'));
    result.gridLayouts = gridDivs.map(d => d.style.gridTemplateColumns);

    // Check flex entries (Timeline two-col)
    const entries = Array.from(preview.querySelectorAll('.cv-entry'));
    const flexEntries = entries.filter(e => window.getComputedStyle(e).display === 'flex');
    result.totalEntries = entries.length;
    result.flexEntries = flexEntries.length;
    if (flexEntries.length > 0) {
      const firstFlex = flexEntries[0];
      const children = Array.from(firstFlex.children);
      result.firstFlexEntryChildren = children.length;
      if (children.length > 0) result.firstChildWidth = children[0].style.width;
    }

    // Check section headings style
    const headings = Array.from(preview.querySelectorAll('.cv-section-header'));
    result.headingCount = headings.length;
    if (headings.length > 0) {
      const h = headings[0];
      const cs = window.getComputedStyle(h);
      result.firstHeadingBorderBottom = cs.borderBottomWidth + ' ' + cs.borderBottomColor;
      result.firstHeadingBgColor = cs.backgroundColor;
    }

    // Check white text in header
    for (const div of allDivs) {
      const bg = div.style.backgroundColor;
      if (bg && bg !== 'rgb(255, 255, 255)' && bg !== '') {
        const children = Array.from(div.querySelectorAll('*'));
        for (const ch of children) {
          if (ch.style.color === '#ffffff' || ch.style.color === 'rgb(255, 255, 255)') {
            result.whiteText = ch.textContent.trim().substring(0, 40);
            break;
          }
        }
        // Check for rgba white
        if (!result.whiteText) {
          for (const ch of children) {
            const color = ch.style.color;
            if (color && color.includes('rgba(255, 255, 255')) {
              result.rgbaWhiteText = ch.textContent.trim().substring(0, 40);
              break;
            }
          }
        }
        break;
      }
    }

    // Check for photo element
    const imgs = preview.querySelectorAll('img');
    result.photoCount = imgs.length;

    // Check name is in first div with large font
    const largeFontDivs = allDivs.filter(d => {
      const fs = parseFloat(d.style.fontSize);
      return fs >= 24;
    });
    if (largeFontDivs.length > 0) {
      result.largeFontText = largeFontDivs[0].textContent.trim().substring(0, 50);
      result.largeFontSize = largeFontDivs[0].style.fontSize;
    }

    // Check border-bottom: 2px (Inline header)
    for (const div of allDivs) {
      const cs = window.getComputedStyle(div);
      if (cs.borderBottomWidth === '2px') {
        result.twoPxBorder = true;
        result.twoPxBorderColor = cs.borderBottomColor;
        break;
      }
    }

    // Check for " · " separator spans (Inline template)
    for (const s of allSpans) {
      if (s.innerHTML.includes('&nbsp;·&nbsp;') || s.textContent === ' · ') {
        result.midDotSeparator = true;
        break;
      }
    }

    // Check contact icons in colored area
    for (const div of allDivs) {
      const bg = div.style.backgroundColor;
      if (bg && bg !== 'rgb(255, 255, 255)' && bg !== '') {
        const text = div.textContent;
        result.coloredAreaHasEmailIcon = text.includes('✉');
        result.coloredAreaHasPhoneIcon = text.includes('✆');
        result.coloredAreaHasLocationIcon = text.includes('⊙');
        break;
      }
    }

    return result;
  }, templateName);

  console.log('DOM Analysis:', JSON.stringify(domInfo, null, 2));
  return domInfo;
}

(async () => {
  // Pre-fill data via API
  console.log('=== Filling CV data via API ===');
  await fillSectionData();

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    // Inject auth cookie so we're logged in
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

  console.log('\n=== Opening CV Builder ===');
  await page.goto(`http://localhost:3000/cv-builder?id=${CV_ID}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  await ss(page, 'A-cv-builder-loaded');

  // Wait for template grid to appear
  const gridVisible = await page.locator('.grid.grid-cols-4').first().isVisible().catch(() => false);
  console.log('Template grid visible:', gridVisible);

  // Log page title and any errors
  const pageTitle = await page.title();
  console.log('Page title:', pageTitle);

  // Check for error toast
  const errorToast = await page.locator('text=Failed').first().isVisible().catch(() => false);
  console.log('Error toast visible:', errorToast);

  if (errorToast) {
    const toastText = await page.locator('text=Failed').first().textContent().catch(() => '');
    console.log('Toast text:', toastText);
    await ss(page, 'A-error-state');
  }

  await ss(page, 'B-initial-state');

  // Confirm we see the left panel with templates
  const templateSection = await page.locator('text=Template').first().isVisible().catch(() => false);
  console.log('Template section visible:', templateSection);

  // ─── COLORFUL TEMPLATE ──────────────────────────────────────────────────────
  console.log('\n=== COLORFUL TEMPLATE ===');
  const colorfulOk = await selectTemplate(page, 'Colorful');
  if (colorfulOk) {
    await page.waitForTimeout(1000);
    await ss(page, 'C1-colorful-full');
    await ssPage(page, 'C2-colorful-page');
    const analysis = await checkTemplate(page, 'Colorful');

    // Report findings
    console.log('\nColorful Results:');
    console.log('  Colored header:', analysis.coloredBg ? `YES (${analysis.coloredBg})` : 'NO');
    console.log('  White text:', analysis.whiteText || analysis.rgbaWhiteText || 'NOT FOUND');
    console.log('  Contact icons in header:', analysis.coloredAreaHasEmailIcon ? '✉ found' : 'NO');
    console.log('  Dot ratings:', analysis.dotRatingSpans, 'spans (filled:', analysis.filledDots, 'empty:', analysis.emptyDots, ')');
    console.log('  Skills grid:', analysis.gridLayouts?.[0] || 'NONE');
    console.log('  Photo:', analysis.photoCount, 'img elements');
    console.log('  Large font text:', analysis.largeFontText, '(', analysis.largeFontSize, ')');
  }

  // ─── INLINE TEMPLATE ────────────────────────────────────────────────────────
  console.log('\n=== INLINE TEMPLATE ===');
  const inlineOk = await selectTemplate(page, 'Inline');
  if (inlineOk) {
    await page.waitForTimeout(1000);
    await ss(page, 'D1-inline-full');
    await ssPage(page, 'D2-inline-page');
    const analysis = await checkTemplate(page, 'Inline');

    console.log('\nInline Results:');
    console.log('  Colored header:', analysis.coloredBg ? `YES - unexpected` : 'No (correct for Inline)');
    console.log('  2px border under header:', analysis.twoPxBorder ? `YES (${analysis.twoPxBorderColor})` : 'NO');
    console.log('  "·" separator:', analysis.midDotSeparator ? 'YES' : 'NO');
    console.log('  Dot ratings:', analysis.dotRatingSpans, 'spans');
    console.log('  Skills grid:', analysis.gridLayouts?.[0] || 'NONE');
    console.log('  Photo:', analysis.photoCount, 'img elements');
    console.log('  Large font text:', analysis.largeFontText);
  }

  // ─── TIMELINE TEMPLATE ──────────────────────────────────────────────────────
  console.log('\n=== TIMELINE TEMPLATE ===');
  const timelineOk = await selectTemplate(page, 'Timeline');
  if (timelineOk) {
    await page.waitForTimeout(1000);
    await ss(page, 'E1-timeline-full');
    await ssPage(page, 'E2-timeline-page');
    const analysis = await checkTemplate(page, 'Timeline');

    console.log('\nTimeline Results:');
    console.log('  Left border:', analysis.firstChildBorderLeft || 'none');
    console.log('  Left border computed:', analysis.firstChildBorderLeftStr);
    console.log('  Two-col flex entries:', analysis.flexEntries, '/', analysis.totalEntries);
    console.log('  First col width:', analysis.firstChildWidth);
    console.log('  Dot ratings:', analysis.dotRatingSpans, 'spans');
    console.log('  Section heading style:', analysis.firstHeadingBorderBottom);
    console.log('  No photo:', analysis.photoCount === 0 ? 'CORRECT' : `HAS ${analysis.photoCount} PHOTOS`);
    console.log('  Colored header:', analysis.coloredBg ? 'YES (unexpected)' : 'None (correct)');
  }

  // ─── ACCENT COLOR CHANGE TEST ────────────────────────────────────────────────
  console.log('\n=== ACCENT COLOR TEST (purple #7c3aed) ===');
  // Click Style tab
  const styleTab = page.locator('button:has-text("Style")').first();
  if (await styleTab.isVisible()) {
    await styleTab.click();
    await page.waitForTimeout(600);
    await ss(page, 'F1-style-tab');

    const colorInput = page.locator('input[type="color"]').first();
    if (await colorInput.count() > 0) {
      await colorInput.evaluate(el => {
        el.value = '#7c3aed';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(1000);
      console.log('Set accent color to purple #7c3aed via color input');
    } else {
      // Try text input
      const hexInput = page.locator('input[placeholder*="#"], input[value*="#"]').first();
      if (await hexInput.count() > 0) {
        await hexInput.fill('#7c3aed');
        await hexInput.press('Enter');
        await page.waitForTimeout(1000);
        console.log('Set via hex input');
      } else {
        console.log('No color input found');
        const inputs = await page.locator('input').allTextContents();
        console.log('All inputs:', inputs);
      }
    }

    // Switch back to sections tab
    const sectionsTab = page.locator('button:has-text("Sections")').first();
    await sectionsTab.click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // Check Timeline with purple
  await selectTemplate(page, 'Timeline');
  await ss(page, 'F2-timeline-purple');
  await ssPage(page, 'F3-timeline-purple-page');
  const tlPurple = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    const fc = preview.firstElementChild;
    if (!fc) return 'NO_CHILD';
    return `borderLeft: "${fc.style.borderLeft}", computed: "${window.getComputedStyle(fc).borderLeftColor}"`;
  });
  console.log('Timeline purple left border:', tlPurple);

  // Check Colorful with purple
  await selectTemplate(page, 'Colorful');
  await page.waitForTimeout(800);
  await ssPage(page, 'F4-colorful-purple-page');
  const cfPurple = await page.evaluate(() => {
    const preview = document.getElementById('cv-preview');
    if (!preview) return 'NO_PREVIEW';
    const divs = preview.querySelectorAll('div');
    for (const d of divs) {
      const bg = d.style.backgroundColor;
      if (bg && bg !== 'rgb(255, 255, 255)' && bg !== '') return `Header bg: "${bg}"`;
    }
    return 'NO_COLORED_BG';
  });
  console.log('Colorful purple header:', cfPurple);

  // Check Inline with purple
  await selectTemplate(page, 'Inline');
  await page.waitForTimeout(800);
  await ssPage(page, 'F5-inline-purple-page');

  await ss(page, 'Z-final-state');
  console.log('\n=== VERIFICATION COMPLETE ===');
  await browser.close();
})();
