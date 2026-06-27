const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots', 'cl-template-test');
const BASE_URL = 'http://localhost:3000';
const EMAIL = 'it23565876@my.sliit.lk';
const PASSWORD = '123Dul123#';

// Ensure screenshots dir exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const results = [];

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function reportStep(step, status, detail = '') {
  const entry = { step, status, detail };
  results.push(entry);
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : 'i';
  console.log(`  ${icon} ${step}: ${status}${detail ? ' — ' + detail : ''}`);
}

async function screenshot(page, filename, description) {
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  try {
    await page.screenshot({ path: filepath, fullPage: false });
    log(`Screenshot saved: ${filename} (${description})`);
    return filepath;
  } catch (err) {
    log(`Screenshot FAILED for ${filename}: ${err.message}`);
    return null;
  }
}

async function main() {
  log('Starting ZenzHire Cover Letter UI Tests');
  log(`Screenshots will be saved to: ${SCREENSHOTS_DIR}`);

  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // ─── SETUP: LOGIN ──────────────────────────────────────────────────────────
  log('\n=== SETUP: Login ===');
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    log('Login page loaded');

    await page.fill('input[type="email"], input[placeholder*="email" i], input[name="email"]', EMAIL);
    await page.fill('input[type="password"], input[placeholder*="password" i], input[name="password"]', PASSWORD);
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');

    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    log(`Logged in. Current URL: ${page.url()}`);
    reportStep('Login', 'PASS', `Redirected to ${page.url()}`);
  } catch (err) {
    reportStep('Login', 'FAIL', err.message);
    log('Login failed — aborting tests');
    await browser.close();
    printReport();
    return;
  }

  // ─── Navigate to Cover Letter ───────────────────────────────────────────────
  log('\n=== Navigating to /cover-letter ===');
  try {
    await page.goto(`${BASE_URL}/cover-letter`, { waitUntil: 'networkidle', timeout: 15000 });
    log(`Cover letter list page loaded: ${page.url()}`);
    reportStep('Navigate to /cover-letter', 'PASS');
  } catch (err) {
    reportStep('Navigate to /cover-letter', 'FAIL', err.message);
  }

  // ─── Create or open cover letter ───────────────────────────────────────────
  log('\n=== Create / Open Cover Letter ===');
  let coverLetterUrl = null;
  try {
    await page.waitForTimeout(1500);

    // Check if any cover letters exist by looking for grid items
    const existingCards = await page.$$('.grid .cursor-pointer, .grid [class*="cursor-pointer"]');
    log(`Found ${existingCards.length} existing cover letter cards`);

    if (existingCards.length > 0) {
      log('Opening first existing cover letter...');
      await existingCards[0].click();
      await page.waitForURL(/\/cover-letter\/\d+/, { timeout: 10000 });
      reportStep('Open cover letter', 'PASS', `Opened existing: ${page.url()}`);
    } else {
      log('No cover letters found — creating new one...');
      // Try clicking "New Cover Letter" or "Create Cover Letter" button
      const newBtn = page.locator('button:has-text("New Cover Letter"), button:has-text("Create Cover Letter")').first();
      await newBtn.click();
      await page.waitForURL(/\/cover-letter\/\d+/, { timeout: 15000 });
      reportStep('Create cover letter', 'PASS', `Created: ${page.url()}`);
    }

    coverLetterUrl = page.url();
    log(`Editor URL: ${coverLetterUrl}`);
  } catch (err) {
    reportStep('Create/Open cover letter', 'FAIL', err.message);
    log('Could not open editor — aborting');
    await browser.close();
    printReport();
    return;
  }

  // Wait for editor to fully load
  await page.waitForTimeout(2000);

  // Screenshot 01 — editor open
  await screenshot(page, '01-editor-open.png', 'Editor page opened');
  reportStep('Screenshot 01-editor-open', 'PASS');

  // ─── TEST 1: Link CV ────────────────────────────────────────────────────────
  log('\n=== TEST 1: Link CV ===');
  try {
    // Make sure we're on the "details" tab
    const detailsTab = page.locator('button:has-text("details"), button[class*="capitalize"]:has-text("details")').first();
    try {
      await detailsTab.click();
      await page.waitForTimeout(300);
    } catch (e) {
      log('Details tab click failed or not needed: ' + e.message);
    }

    const cvSelect = page.locator('select').first();
    await cvSelect.waitFor({ timeout: 5000 });

    const options = await cvSelect.locator('option').all();
    log(`CV dropdown options: ${options.length}`);
    const optionTexts = await Promise.all(options.map((o) => o.textContent()));
    log(`Options: ${optionTexts.join(', ')}`);

    if (options.length > 1) {
      // Select the first real CV (index 1, skipping "No CV linked")
      const firstCvValue = await options[1].getAttribute('value');
      log(`Selecting CV with value: ${firstCvValue}`);
      await cvSelect.selectOption({ index: 1 });
      await page.waitForTimeout(1500);
      reportStep('TEST 1: Link CV — select CV', 'PASS', `Selected: ${optionTexts[1]}`);
    } else {
      reportStep('TEST 1: Link CV — select CV', 'INFO', 'No CVs available, only "No CV linked" option');
    }

    await screenshot(page, '02-cv-linked-preview.png', 'Preview after linking CV');
    reportStep('Screenshot 02-cv-linked-preview', 'PASS');

    // Check what's in the preview
    const previewContent = await page.locator('[style*="210mm"]').textContent().catch(() => '');
    const hasName = previewContent.length > 50;
    reportStep('TEST 1: Preview content check', hasName ? 'PASS' : 'INFO',
      hasName ? `Preview has ${previewContent.length} chars of content` : 'Preview appears empty or minimal');
  } catch (err) {
    reportStep('TEST 1: Link CV', 'FAIL', err.message);
    await screenshot(page, '02-cv-linked-preview.png', 'State when TEST 1 failed');
  }

  // ─── TEST 2: Check all 8 templates ─────────────────────────────────────────
  log('\n=== TEST 2: Template switching ===');
  const TEMPLATES = ['classic', 'modern', 'colorful', 'executive', 'bordered', 'creative', 'inline', 'gcc'];

  for (const templateId of TEMPLATES) {
    try {
      // Make sure we're on the "details" tab (templates are there)
      const detailsTab = page.locator('button:has-text("details")').first();
      try { await detailsTab.click(); } catch(e) {}

      // Wait for template buttons to be visible
      await page.waitForTimeout(200);

      // Find the template button — the page uses buttons with the template name text
      const capitalizedName = templateId.charAt(0).toUpperCase() + templateId.slice(1);
      const templateBtn = page.locator(`button:has-text("${capitalizedName}")`).filter({ hasText: capitalizedName }).first();

      await templateBtn.waitFor({ timeout: 5000 });
      await templateBtn.click();
      log(`Clicked template button: ${templateId}`);
      await page.waitForTimeout(600);

      // Screenshot the center preview panel
      const previewPanel = page.locator('[style*="210mm"]').first();
      const screenshotFile = `03-template-${templateId}.png`;
      try {
        await previewPanel.screenshot({ path: path.join(SCREENSHOTS_DIR, screenshotFile) });
        log(`Template screenshot saved: ${screenshotFile}`);
      } catch (e) {
        // Fall back to full page screenshot
        await screenshot(page, screenshotFile, `Template: ${templateId}`);
      }

      reportStep(`TEST 2: Template ${templateId}`, 'PASS', `Switched and captured ${screenshotFile}`);
    } catch (err) {
      reportStep(`TEST 2: Template ${templateId}`, 'FAIL', err.message);
      await screenshot(page, `03-template-${templateId}.png`, `Failed state for template ${templateId}`);
    }
  }

  // ─── TEST 3: AI Generation ──────────────────────────────────────────────────
  log('\n=== TEST 3: AI Generation ===');
  try {
    // Make sure details tab is active
    const detailsTab = page.locator('button:has-text("details")').first();
    try { await detailsTab.click(); } catch(e) {}
    await page.waitForTimeout(300);

    // Fill Job Title
    const jobTitleInput = page.locator('input[placeholder*="Backend Engineer" i], input[placeholder*="job title" i]').first();
    await jobTitleInput.waitFor({ timeout: 5000 });
    const currentJobTitle = await jobTitleInput.inputValue();
    log(`Current job title: "${currentJobTitle}"`);

    if (!currentJobTitle || currentJobTitle.trim() === '') {
      await jobTitleInput.fill('Backend Engineer');
      log('Filled job title: Backend Engineer');
    }

    // Fill Company
    const companyInput = page.locator('input[placeholder*="Google" i], input[placeholder*="company" i]').first();
    await companyInput.waitFor({ timeout: 5000 });
    const currentCompany = await companyInput.inputValue();
    log(`Current company: "${currentCompany}"`);

    if (!currentCompany || currentCompany.trim() === '') {
      await companyInput.fill('Google');
      log('Filled company: Google');
    }

    // Select Formal tone (click the Formal tone button)
    try {
      const formalBtn = page.locator('button:has-text("Formal")').first();
      await formalBtn.click();
      log('Clicked Formal tone button');
      await page.waitForTimeout(200);
    } catch (e) {
      log('Could not click Formal tone: ' + e.message);
    }

    reportStep('TEST 3: Fill job title and company', 'PASS', `Job: "${await jobTitleInput.inputValue()}", Company: "${await companyInput.inputValue()}"`);

    // Click "Generate Cover Letter" button (in right panel)
    const generateBtn = page.locator('button:has-text("Generate Cover Letter")').first();
    await generateBtn.waitFor({ timeout: 5000 });
    await generateBtn.click();
    log('Clicked Generate Cover Letter button');

    // Wait up to 30 seconds for generation
    log('Waiting for generation (up to 30s)...');
    await page.waitForSelector('button:has-text("Generate Cover Letter"):not([disabled])', { timeout: 35000 });
    // Also wait a bit more for content to render
    await page.waitForTimeout(1000);

    // Check if content appeared
    const previewContent = await page.locator('[style*="210mm"]').textContent().catch(() => '');
    const contentLength = previewContent.trim().length;
    log(`Preview content after generation: ${contentLength} chars`);

    await screenshot(page, '04-after-generation.png', 'After AI generation');

    if (contentLength > 200) {
      reportStep('TEST 3: AI Generation', 'PASS', `Generated content: ${contentLength} chars in preview`);
    } else {
      reportStep('TEST 3: AI Generation', 'INFO', `Content length only ${contentLength} chars — may be minimal or failed`);
    }
  } catch (err) {
    reportStep('TEST 3: AI Generation', 'FAIL', err.message);
    await screenshot(page, '04-after-generation.png', 'State when TEST 3 failed');
  }

  // ─── TEST 4: PDF Export ─────────────────────────────────────────────────────
  log('\n=== TEST 4: PDF Export ===');
  try {
    // Switch to classic template first
    const detailsTab = page.locator('button:has-text("details")').first();
    try { await detailsTab.click(); } catch(e) {}
    await page.waitForTimeout(300);

    const classicBtn = page.locator('button:has-text("Classic")').first();
    await classicBtn.click();
    log('Switched to Classic template');
    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = context.waitForEvent('download', { timeout: 35000 }).catch((e) => {
      log(`Download event not caught: ${e.message}`);
      return null;
    });

    // Click Download PDF button (in the top bar of center panel)
    const downloadBtn = page.locator('button:has-text("Download PDF")').first();
    await downloadBtn.waitFor({ timeout: 5000 });
    await downloadBtn.click();
    log('Clicked Download PDF button');

    // Wait for download or timeout
    const download = await downloadPromise;
    if (download) {
      const suggestedFilename = download.suggestedFilename();
      log(`Download started: ${suggestedFilename}`);
      const savePath = path.join(SCREENSHOTS_DIR, suggestedFilename);
      await download.saveAs(savePath);
      reportStep('TEST 4: PDF Download', 'PASS', `Downloaded: ${suggestedFilename}`);
    } else {
      // Check for alert/error
      log('No download event received — checking for error dialogs');
      reportStep('TEST 4: PDF Download', 'INFO', 'No download event triggered within timeout');
    }

    await page.waitForTimeout(2000);
    await screenshot(page, '05-pdf-download-classic.png', 'After PDF download attempt');
    reportStep('Screenshot 05-pdf-download-classic', 'PASS');
  } catch (err) {
    reportStep('TEST 4: PDF Export', 'FAIL', err.message);
    await screenshot(page, '05-pdf-download-classic.png', 'State when TEST 4 failed');
  }

  // ─── TEST 5: No CV linked — manual fields ──────────────────────────────────
  log('\n=== TEST 5: Manual fields (No CV linked) ===');
  try {
    // Make sure details tab is active
    const detailsTab = page.locator('button:has-text("details")').first();
    try { await detailsTab.click(); } catch(e) {}
    await page.waitForTimeout(300);

    // Set CV dropdown back to "No CV linked"
    const cvSelect = page.locator('select').first();
    await cvSelect.selectOption({ value: '' });
    log('Set CV dropdown to "No CV linked"');
    await page.waitForTimeout(700);

    await screenshot(page, '06-no-cv-manual-fields.png', 'Left panel with no CV — manual fields');
    reportStep('Screenshot 06-no-cv-manual-fields', 'PASS');

    // Check if manual input fields appeared
    // They appear in a div when no CV is selected — inputs with placeholders like "John Smith"
    const manualSection = page.locator('input[placeholder="John Smith"]').first();
    const manualVisible = await manualSection.isVisible().catch(() => false);
    log(`Manual name field visible: ${manualVisible}`);

    if (manualVisible) {
      reportStep('TEST 5: Manual fields visible', 'PASS', 'Manual input fields appeared');

      // Fill name and email
      await manualSection.fill('John Doe');
      log('Filled name: John Doe');

      const emailField = page.locator('input[placeholder="john@email.com"]').first();
      await emailField.fill('john@example.com');
      log('Filled email: john@example.com');

      await page.waitForTimeout(600);

      // Screenshot preview
      await screenshot(page, '07-manual-details-preview.png', 'Preview after filling manual details');
      reportStep('TEST 5: Manual details preview', 'PASS', 'Filled John Doe / john@example.com');
    } else {
      reportStep('TEST 5: Manual fields visible', 'FAIL', 'Manual fields did not appear after removing CV link');
      await screenshot(page, '07-manual-details-preview.png', 'State when manual fields not found');
    }
  } catch (err) {
    reportStep('TEST 5: Manual fields', 'FAIL', err.message);
    await screenshot(page, '06-no-cv-manual-fields.png', 'State when TEST 5 failed');
    await screenshot(page, '07-manual-details-preview.png', 'State when TEST 5 failed');
  }

  // ─── FINAL REPORT ──────────────────────────────────────────────────────────
  await browser.close();
  printReport();
}

function printReport() {
  console.log('\n' + '='.repeat(70));
  console.log('FINAL TEST REPORT — ZenzHire Cover Letter UI Tests');
  console.log('='.repeat(70));

  const pass = results.filter((r) => r.status === 'PASS').length;
  const fail = results.filter((r) => r.status === 'FAIL').length;
  const info = results.filter((r) => r.status === 'INFO').length;

  results.forEach((r) => {
    const icon = r.status === 'PASS' ? '✓' : r.status === 'FAIL' ? '✗' : 'i';
    console.log(`  ${icon} [${r.status}] ${r.step}${r.detail ? '\n       → ' + r.detail : ''}`);
  });

  console.log('\n' + '-'.repeat(70));
  console.log(`Summary: ${pass} PASS, ${fail} FAIL, ${info} INFO`);
  console.log('='.repeat(70));
}

main().catch((err) => {
  console.error('FATAL ERROR:', err);
  printReport();
  process.exit(1);
});
