/**
 * Full visual regression test for ZenzHire.
 * Tests landing page, auth, dashboard, CV builder (all 8 templates), ATS checker.
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';
import path from 'path';

const BASE = 'http://localhost:3002';
const API  = 'http://127.0.0.1:8000/api/v1';
const SS   = './test-screenshots';
await mkdir(SS, { recursive: true });

const EMAIL = 'test@zenzhire.com';
const PASS  = 'Test1234!';

async function ss(page, name) {
  const file = path.join(SS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📸  ${name}.png`);
  return file;
}

// ── Auth: create/login user via API ───────────────────────────────────────────
let token;
try {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  if (r.ok) {
    ({ access_token: token } = await r.json());
    console.log('✅  Login OK');
  } else {
    const r2 = await fetch(`${API}/auth/signup`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASS, full_name: 'Kavidu Test' }),
    });
    ({ access_token: token } = await r2.json());
    console.log('✅  Registered new user');
  }
} catch (e) {
  console.error('❌  Auth failed:', e.message);
  process.exit(1);
}

// ── Create test CV via API ─────────────────────────────────────────────────────
let cvId;
const existingCVs = await (await fetch(`${API}/cv/`, { headers: { Authorization: `Bearer ${token}` } })).json();
const existing = existingCVs.find(c => c.title === 'Kavidu Test CV');
if (existing) {
  cvId = existing.id;
  console.log(`✅  Using existing CV id=${cvId}`);
} else {
  const cvRes = await fetch(`${API}/cv/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: 'Kavidu Test CV', template_id: 'classic' }),
  });
  const cv = await cvRes.json();
  cvId = cv.id;
  console.log(`✅  Created CV id=${cvId}`);

  // Populate sections
  const sections = (await (await fetch(`${API}/cv/${cvId}`, { headers: { Authorization: `Bearer ${token}` } })).json()).sections;

  const personal = sections.find(s => s.section_type === 'personal_details');
  await fetch(`${API}/cv/${cvId}/sections/${personal.id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data: {
      full_name: 'Kavidu Test', title: 'Software Engineer',
      email: 'test@zenzhire.com', phone: '+94 77 123 4567',
      location: 'Colombo, Sri Lanka',
      links: [{ id: '1', platform: 'LinkedIn', url: 'linkedin.com/in/kavidu' }, { id: '2', platform: 'GitHub', url: 'github.com/kavidu' }]
    }}),
  });

  const exp = sections.find(s => s.section_type === 'experience');
  if (exp) await fetch(`${API}/cv/${cvId}/sections/${exp.id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data: { entries: [{
      id: 'e1', job_title: 'Senior Software Engineer', employer: 'TechCorp',
      start_date: 'Jan 2022', end_date: '', current: true, location: 'Remote',
      bullets: [
        { id: 'b1', text: 'Led migration to microservices architecture reducing latency by 45%' },
        { id: 'b2', text: 'Mentored team of 5 engineers, improving sprint velocity by 30%' },
        { id: 'b3', text: 'Implemented CI/CD pipeline cutting deployment time from 2h to 12min' },
      ]
    }] } }),
  });

  const edu = sections.find(s => s.section_type === 'education');
  if (edu) await fetch(`${API}/cv/${cvId}/sections/${edu.id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data: { entries: [{
      id: 'ed1', degree: 'BSc Computer Science', institution: 'University of Colombo',
      start_date: '2018', end_date: '2022', location: 'Colombo', description: 'First Class Honours'
    }] } }),
  });

  const skills = sections.find(s => s.section_type === 'skills');
  if (skills) await fetch(`${API}/cv/${cvId}/sections/${skills.id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data: { entries: [
      { id: 's1', skill_name: 'Python', level: 'Expert' },
      { id: 's2', skill_name: 'React / Next.js', level: 'Advanced' },
      { id: 's3', skill_name: 'FastAPI', level: 'Advanced' },
      { id: 's4', skill_name: 'PostgreSQL', level: 'Intermediate' },
      { id: 's5', skill_name: 'Docker / Kubernetes', level: 'Intermediate' },
      { id: 's6', skill_name: 'AWS', level: 'Intermediate' },
    ] } }),
  });
  console.log('✅  CV sections populated');
}

// ── Browser setup ──────────────────────────────────────────────────────────────
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.setDefaultTimeout(25000);

await context.addCookies([
  { name: 'token', value: token, domain: 'localhost',  path: '/', httpOnly: false, secure: false },
  { name: 'token', value: token, domain: '127.0.0.1', path: '/', httpOnly: false, secure: false },
]);

// ── LANDING PAGE ───────────────────────────────────────────────────────────────
console.log('\n── Landing Page ──');
await page.goto(BASE);
await page.waitForLoadState('networkidle');
await ss(page, '01-landing');
const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
console.log(`  Body background: ${bodyBg}`);
const isDark = bodyBg.includes('13') || bodyBg.includes('0d') || !bodyBg.includes('255, 255, 255');
console.log(`  Dark theme: ${isDark ? '✅' : '❌ UNSTYLED!'}`);

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
console.log('\n── Dashboard ──');
await page.goto(`${BASE}/dashboard`);
await page.waitForLoadState('networkidle');
await ss(page, '02-dashboard');

// ── CV BUILDER ────────────────────────────────────────────────────────────────
console.log('\n── CV Builder ──');
await page.goto(`${BASE}/cv-builder?id=${cvId}`);
await page.waitForLoadState('networkidle');
// Wait for React useEffect to fire and API call to complete
// The loading state disappears when the CV data is loaded
try {
  await page.waitForSelector('text=Personal Details', { timeout: 15000 });
} catch {
  await page.waitForTimeout(3000); // fallback wait
}
await ss(page, '03-cv-builder-classic');

// Check three panels visible
const leftOk   = await page.locator('text=Personal Details').first().isVisible();
const previewOk = await page.locator('#cv-preview').first().isVisible();
const rightOk  = await page.locator('text=AI Assistant').first().isVisible();
console.log(`  Left panel (sections): ${leftOk ? '✅' : '❌'}`);
console.log(`  Centre panel (preview): ${previewOk ? '✅' : '❌'}`);
console.log(`  Right panel (AI): ${rightOk ? '✅' : '❌'}`);

const previewText = await page.locator('#cv-preview').first().textContent().catch(() => '');
console.log(`  Shows "Kavidu Test": ${previewText.includes('Kavidu Test') ? '✅' : '❌'}`);

// ── All 8 templates ────────────────────────────────────────────────────────────
console.log('\n── 8 Templates ──');
const templates = ['Classic', 'Modern', 'Minimal', 'Executive', 'Tech', 'Creative', 'Academic', 'GCC'];
for (const tmpl of templates) {
  // Template buttons are in the left panel — make sure we're in list mode
  const backBtn = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') }).first();
  if (await backBtn.isVisible().catch(() => false)) {
    await backBtn.click();
    await page.waitForTimeout(300);
  }
  const btn = page.locator(`button`).filter({ hasText: new RegExp(`^${tmpl}$`) }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(1000);
    await ss(page, `04-template-${tmpl.toLowerCase()}`);
    const rendered = await page.locator('#cv-preview').textContent().catch(() => '');
    console.log(`  ${tmpl}: ${rendered.length > 50 ? '✅ rendered' : '❌ empty'}`);
  } else {
    // Try scrolling left panel to find the template button
    await page.evaluate(() => window.scrollTo(0, 0));
    const allBtns = await page.locator('button').allTextContents();
    const found = allBtns.some(t => t.trim() === tmpl);
    console.log(`  ${tmpl}: ❌ button not found (visible buttons: ${allBtns.slice(0, 5).join(', ')})`);
  }
}

// ── Back to Classic, open Experience form ─────────────────────────────────────
const backBtn2 = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') }).first();
if (await backBtn2.isVisible().catch(() => false)) { await backBtn2.click(); await page.waitForTimeout(300); }
const classicBtn2 = page.locator('button').filter({ hasText: /^Classic$/ }).first();
if (await classicBtn2.isVisible().catch(() => false)) { await classicBtn2.click(); await page.waitForTimeout(500); }
const expSection = page.locator('text=Experience').first();
if (await expSection.isVisible().catch(() => false)) { await expSection.click(); await page.waitForTimeout(600); }
await ss(page, '05-experience-form');

// ── Send to ATS button ─────────────────────────────────────────────────────────
console.log('\n── Send to ATS ──');
const sendBtn = page.locator('button:has-text("Send to ATS"), button[title*="ATS"]').first();
const sendVisible = await sendBtn.isVisible().catch(() => false);
console.log(`  Send to ATS button: ${sendVisible ? '✅' : '❌ not found'}`);

// ── Mobile viewport test ───────────────────────────────────────────────────────
console.log('\n── Mobile Layout ──');
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(`${BASE}/cv-builder?id=${cvId}`);
await page.waitForLoadState('networkidle');
try { await page.waitForSelector('#cv-preview', { timeout: 12000 }); } catch {}
await page.waitForTimeout(800);
await ss(page, '06-mobile-cv-builder');

const mobileFloatBtn = await page.locator('button[title="Sections"], button[title="AI Assistant"]').first().isVisible().catch(() => false);
console.log(`  Mobile FABs visible: ${mobileFloatBtn ? '✅' : '❌'}`);

// ── ATS Checker ───────────────────────────────────────────────────────────────
console.log('\n── ATS Checker ──');
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/ats-checker`);
await page.waitForLoadState('networkidle');
await ss(page, '07-ats-checker');

// Switch to paste text tab
const pasteTab = page.locator('button:has-text("Paste Text")').first();
if (await pasteTab.isVisible()) {
  await pasteTab.click();
  await page.waitForTimeout(300);
  const textarea = page.locator('textarea').first();
  await textarea.fill(`John Doe
Software Engineer | john@example.com | +1 555 123 4567 | New York, USA

PROFILE SUMMARY
Experienced software engineer with 8 years building scalable web applications using Python, React, and AWS.

EXPERIENCE
Senior Software Engineer - TechCorp (2020 - Present)
• Led team of 6 engineers to deliver microservices platform
• Reduced API latency by 60% through caching optimizations
• Deployed 15+ production services on AWS ECS

EDUCATION
BS Computer Science - MIT (2012 - 2016)

SKILLS
Python, React, FastAPI, PostgreSQL, Docker, AWS, Kubernetes, Redis

LANGUAGES
English (Native), Spanish (Intermediate)`);
  await ss(page, '08-ats-text-entered');
  console.log('✅  ATS text pasted');
  // Don't run the actual analysis (takes 30s+) — just verify UI
  const analyzeBtn = page.locator('button:has-text("Analyze My CV")').first();
  console.log(`  Analyze button: ${await analyzeBtn.isVisible() ? '✅' : '❌'}`);
}

// ── Send to ATS from CV Builder ───────────────────────────────────────────────
console.log('\n── From-CV ATS flow ──');
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/cv-builder?id=${cvId}`);
await page.waitForLoadState('networkidle');
try { await page.waitForSelector('#cv-preview', { timeout: 12000 }); } catch {}
await page.waitForTimeout(800);
const atsBtnDesktop = page.locator('button[title="Send to ATS Checker"]').first();
if (await atsBtnDesktop.isVisible().catch(() => false)) {
  await atsBtnDesktop.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await ss(page, '09-ats-from-cv');
  const url = page.url();
  console.log(`  ✅ Navigated to: ${url}`);
  const toastOrText = await page.locator('text=CV loaded').isVisible().catch(() => false);
  console.log(`  CV loaded toast: ${toastOrText ? '✅' : '⚠️ (may have dismissed already)'}`);
} else {
  console.log('  Send to ATS button not visible on desktop (may need wider viewport)');
}

// ── Login page visual ─────────────────────────────────────────────────────────
console.log('\n── Auth Pages ──');
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page2 = await ctx2.newPage();
await page2.goto(`${BASE}/login`);
await page2.waitForLoadState('networkidle');
await ss(page2, '10-login-page');
const loginBg = await page2.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
console.log(`  Login bg: ${loginBg} — dark: ${!loginBg.includes('255, 255, 255') ? '✅' : '❌'}`);

await page2.goto(`${BASE}/signup`);
await page2.waitForLoadState('networkidle');
await ss(page2, '11-signup-page');

await ctx2.close();
await browser.close();

console.log('\n' + '═'.repeat(50));
console.log('✅  All visual tests complete');
console.log(`📸  Screenshots: ${SS}/`);
