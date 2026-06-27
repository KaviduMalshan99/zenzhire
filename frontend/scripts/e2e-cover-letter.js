const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS = 'F:/zenzhire/frontend/screenshots/cl-e2e';
if (!fs.existsSync(SCREENSHOTS)) fs.mkdirSync(SCREENSHOTS, { recursive: true });
const ss = (name) => path.join(SCREENSHOTS, name);

const results = [];
function log(test, item, pass, note = '') {
  const mark = pass ? '✓' : '✗';
  results.push({ test, item, pass, note });
  console.log(`[${test}] ${mark} ${item}${note ? ' — ' + note : ''}`);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // ── Login ───────────────────────────────────────────────────────────────────
  let token;
  try {
    const r = await page.request.post('http://localhost:8000/api/v1/auth/login', {
      data: { email: 'freelyricshub@gmail.com', password: 'password123' },
      headers: { 'Content-Type': 'application/json' }
    });
    const b = await r.json();
    token = b.access_token;
    if (!token) throw new Error('no token');
    await ctx.addCookies([{ name: 'token', value: token, domain: 'localhost', path: '/' }]);
    log('SETUP', 'Login', true);
  } catch (e) {
    log('SETUP', 'Login', false, e.message);
    await browser.close(); return;
  }

  // Create fresh cover letter for testing
  const clR = await page.request.post('http://localhost:8000/api/v1/cover-letter/', {
    data: { title: 'Backend Engineer @ Google', template_id: 'classic', job_title: 'Backend Engineer', company: 'Google' },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  const cl = await clR.json();
  const CL_ID = cl.id;
  log('SETUP', `Created cover letter id=${CL_ID}`, !!CL_ID);

  // Navigate to editor
  await page.goto(`http://localhost:3000/cover-letter/${CL_ID}`);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: ss('01-editor-loaded.png') });
  log('SETUP', 'Editor page loaded', !page.url().includes('login'));

  // ── TEST 1: AI Generation ────────────────────────────────────────────────────
  console.log('\n=== TEST 1: AI Generation ===');

  // Fill Job Description
  await page.fill('textarea[placeholder*="job description"]', 'We are looking for a skilled Backend Engineer to join our team. Requirements: Python, FastAPI, PostgreSQL, Docker, AWS. 3+ years experience required.');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);

  // Check Generate button is enabled (job title + company already set)
  const genBtn = page.locator('button:has-text("Generate Cover Letter")');
  const genDisabled = await genBtn.isDisabled();
  log('TEST1', 'Generate button is enabled', !genDisabled);

  // Click Generate
  await genBtn.click();
  await page.screenshot({ path: ss('02-generating.png') });

  // Check spinner appeared
  const spinnerVisible = await page.locator('.animate-spin').first().isVisible().catch(() => false);
  log('TEST1', 'Loading spinner shown', spinnerVisible);
  console.log('  Waiting for AI response (up to 30s)...');

  // Wait for generation to complete
  const generated = await page.waitForFunction(() => {
    // Wait until the spinner in the right panel disappears
    const btn = document.querySelector('button:has([class*="animate-spin"])');
    return !btn || btn.textContent.includes('Generate');
  }, { timeout: 30000 }).then(() => true).catch(() => false);

  await page.waitForTimeout(1000);
  await page.screenshot({ path: ss('03-after-generation.png') });

  // Check if text appeared in preview
  const previewText = await page.evaluate(() => {
    const iframe = document.querySelector('iframe');
    if (iframe) return iframe.contentDocument?.body?.innerText ?? '';
    // Check the A4 white div for paragraph text
    const a4 = document.querySelector('[style*="210mm"]');
    return a4 ? a4.innerText : '';
  });

  const hasContent = previewText.length > 100;
  log('TEST1', 'Text appeared in preview', hasContent, hasContent ? `${previewText.slice(0,80)}...` : 'empty');

  // Check it looks like a cover letter
  const looksLikeLetter = previewText.includes('Dear') || previewText.includes('Hiring') || previewText.includes('Google');
  log('TEST1', 'Text looks like a cover letter', looksLikeLetter, looksLikeLetter ? 'contains expected phrases' : 'missing expected phrases');

  // Check for error alerts
  const errorDialog = await page.locator('[role="dialog"], [role="alertdialog"]').isVisible().catch(() => false);
  log('TEST1', 'No error messages shown', !errorDialog);

  // ── TEST 2: Edit Mode ────────────────────────────────────────────────────────
  console.log('\n=== TEST 2: Edit Mode ===');

  const editBtn = page.locator('button:has-text("Edit")');
  await editBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: ss('04-edit-mode.png') });

  const textarea = page.locator('textarea[placeholder*="Write or edit"]');
  const textareaVisible = await textarea.isVisible();
  log('TEST2', 'Edit textarea visible', textareaVisible);

  const textareaValue = await textarea.inputValue().catch(() => '');
  const textareaHasContent = textareaValue.length > 50;
  log('TEST2', 'Generated text appears in textarea', textareaHasContent, textareaHasContent ? `${textareaValue.slice(0,60)}...` : 'empty');

  // Edit the text
  if (textareaHasContent) {
    await textarea.fill(textareaValue + '\n\nAdditional test paragraph added during testing.');
    log('TEST2', 'Can edit textarea content', true);
  } else {
    log('TEST2', 'Can edit textarea content', false, 'textarea was empty');
  }

  // Switch back to Preview
  const previewBtn = page.locator('button:has-text("Preview")');
  await previewBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: ss('05-back-to-preview.png') });

  const previewAfterEdit = await page.evaluate(() => {
    const a4 = document.querySelector('[style*="210mm"]');
    return a4 ? a4.innerText : '';
  });
  const editReflected = previewAfterEdit.includes('Additional test paragraph');
  log('TEST2', 'Edited text reflects in preview', editReflected);

  // ── TEST 3: Save ──────────────────────────────────────────────────────────────
  console.log('\n=== TEST 3: Save ===');

  const saveBtn = page.locator('button:has-text("Save")').last();
  await saveBtn.click();

  // Check for "Saving..." text
  const savingText = await page.waitForSelector('button:has-text("Saving...")', { timeout: 2000 }).then(() => true).catch(() => false);
  log('TEST3', '"Saving..." shown briefly', savingText);

  // Wait for "Saved!" 
  const savedText = await page.waitForSelector('button:has-text("Saved!")', { timeout: 5000 }).then(() => true).catch(() => false);
  log('TEST3', '"Saved!" with check icon shown', savedText);
  await page.screenshot({ path: ss('06-saved.png') });

  // Refresh and check persistence
  await page.reload();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: ss('07-after-refresh.png') });

  const contentAfterRefresh = await page.evaluate(() => {
    const a4 = document.querySelector('[style*="210mm"]');
    return a4 ? a4.innerText : '';
  });
  const persistsAfterRefresh = contentAfterRefresh.length > 50;
  log('TEST3', 'Content persists after page refresh', persistsAfterRefresh, persistsAfterRefresh ? `${contentAfterRefresh.slice(0,60)}...` : 'empty');

  // ── TEST 4: PDF Export ────────────────────────────────────────────────────────
  console.log('\n=== TEST 4: PDF Export ===');

  // Intercept console errors
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.click('button:has-text("Download PDF")')
  ]).catch(async e => {
    log('TEST4', 'PDF download started', false, e.message);
    await page.screenshot({ path: ss('08-pdf-error.png') });
    return [null];
  });

  if (download) {
    log('TEST4', 'PDF download started', true);
    const pdfPath = await download.path();
    const size = pdfPath ? require('fs').statSync(pdfPath).size : 0;
    log('TEST4', 'PDF file has content', size > 1000, `${size} bytes`);
    await page.screenshot({ path: ss('08-pdf-downloaded.png') });
  }

  log('TEST4', 'No browser console errors', consoleErrors.length === 0, consoleErrors.length > 0 ? consoleErrors[0].slice(0,100) : '');

  // ── TEST 5: All Templates ─────────────────────────────────────────────────────
  console.log('\n=== TEST 5: Templates ===');

  const templates = ['Classic', 'Modern', 'Minimal', 'Professional'];
  for (const tmpl of templates) {
    const btn = page.locator(`button:has-text("${tmpl}")`).first();
    await btn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: ss(`09-template-${tmpl.toLowerCase()}.png`) });

    const preview = await page.evaluate(() => {
      const a4 = document.querySelector('[style*="210mm"]');
      if (!a4) return '';
      return a4.innerHTML;
    });
    const hasContent = preview.length > 100;
    log('TEST5', `Template: ${tmpl}`, hasContent, hasContent ? 'preview rendered' : 'empty preview');
  }

  // ── TEST 6: All Tones ──────────────────────────────────────────────────────────
  console.log('\n=== TEST 6: Tones ===');

  // Reset template to classic
  await page.locator('button:has-text("Classic")').first().click();

  const tones = ['Formal', 'Friendly', 'Confident'];
  const toneResults = {};

  for (const tone of tones) {
    // Click tone button
    const toneBtn = page.locator(`button:has-text("${tone}")`).first();
    await toneBtn.click();
    await page.waitForTimeout(300);

    // Click generate
    const genB = page.locator('button:has-text("Generate Cover Letter")');
    await genB.click();
    console.log(`  Generating with ${tone} tone...`);

    await page.waitForFunction(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Generate Cover Letter'));
      return btn && !btn.querySelector('.animate-spin');
    }, { timeout: 30000 }).catch(() => {});

    await page.waitForTimeout(500);

    const tonePreview = await page.evaluate(() => {
      const a4 = document.querySelector('[style*="210mm"]');
      return a4 ? a4.innerText.slice(0, 200) : '';
    });

    toneResults[tone] = tonePreview;
    log('TEST6', `Tone: ${tone}`, tonePreview.length > 50, tonePreview.slice(0, 80));
    await page.screenshot({ path: ss(`10-tone-${tone.toLowerCase()}.png`) });
  }

  // Check tones produce different content
  const allDifferent = toneResults['Formal'] !== toneResults['Friendly'] && toneResults['Formal'] !== toneResults['Confident'];
  log('TEST6', 'Different tones produce different content', allDifferent);

  // ── Summary ────────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('FINAL RESULTS SUMMARY');
  console.log('═══════════════════════════════════════');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  results.forEach(r => {
    const mark = r.pass ? '✓' : '✗';
    console.log(`${mark} [${r.test}] ${r.item}${r.note ? ' — ' + r.note : ''}`);
  });
  console.log(`\nTotal: ${passed} passed, ${failed} failed`);

  await browser.close();
})();
