const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Login
  const res = await page.request.post('http://localhost:8000/api/v1/auth/login', {
    data: { email: 'freelyricshub@gmail.com', password: 'password123' },
    headers: { 'Content-Type': 'application/json' }
  });
  const body = await res.json().catch(() => null);
  if (!res.ok() || !body?.access_token) {
    console.log('Login failed, trying signup...');
    const s = await page.request.post('http://localhost:8000/api/v1/auth/signup', {
      data: { email: 'test2@zenzhire.com', password: 'password123', full_name: 'Test User' },
      headers: { 'Content-Type': 'application/json' }
    });
    const sb = await s.json();
    await ctx.addCookies([{ name: 'token', value: sb.access_token, domain: 'localhost', path: '/' }]);
  } else {
    await ctx.addCookies([{ name: 'token', value: body.access_token, domain: 'localhost', path: '/' }]);
  }

  // Create a cover letter via API
  const token = body?.access_token || (await (await page.request.post('http://localhost:8000/api/v1/auth/login', {
    data: { email: 'test2@zenzhire.com', password: 'password123' },
    headers: { 'Content-Type': 'application/json' }
  })).json()).access_token;

  const clRes = await page.request.post('http://localhost:8000/api/v1/cover-letter/', {
    data: { title: 'Backend Engineer at Google', template_id: 'classic', job_title: 'Backend Engineer', company: 'Google' },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  const cl = await clRes.json();
  console.log('Created CL id:', cl.id);

  // Navigate to editor
  await page.goto(`http://localhost:3000/cover-letter/${cl.id}`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'F:/zenzhire/frontend/screenshots/cl-05-editor-initial.png', fullPage: false });
  console.log('Editor loaded at:', page.url());

  // Check left panel content
  const leftText = await page.$eval('[class*="w-72"][class*="border-r"]', el => el.innerText).catch(() => 'not found');
  console.log('Left panel excerpt:', leftText.slice(0, 200));

  // Switch to Style tab
  const styleBtns = await page.$$('button');
  for (const btn of styleBtns) {
    const t = await btn.innerText().catch(() => '');
    if (t.trim() === 'style') { await btn.click(); break; }
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'F:/zenzhire/frontend/screenshots/cl-06-editor-style.png', fullPage: false });

  // Switch back to details, click Edit toggle
  for (const btn of await page.$$('button')) {
    const t = await btn.innerText().catch(() => '');
    if (t.trim() === 'details') { await btn.click(); break; }
  }
  await page.waitForTimeout(300);
  for (const btn of await page.$$('button')) {
    const t = await btn.innerText().catch(() => '');
    if (t.trim() === 'Edit') { await btn.click(); break; }
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'F:/zenzhire/frontend/screenshots/cl-07-editor-edit-mode.png', fullPage: false });

  await browser.close();
})();
