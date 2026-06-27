const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  // Login via API with JSON body
  const res = await page.request.post('http://localhost:8000/api/v1/auth/login', {
    data: { email: 'freelyricshub@gmail.com', password: 'password123' },
    headers: { 'Content-Type': 'application/json' }
  });
  const body = await res.json().catch(() => null);
  console.log('Login status:', res.status());

  if (!res.ok() || !body?.access_token) {
    // Try signup first
    const signupRes = await page.request.post('http://localhost:8000/api/v1/auth/signup', {
      data: { email: 'freelyricshub@gmail.com', password: 'password123', full_name: 'Test User' },
      headers: { 'Content-Type': 'application/json' }
    });
    const signupBody = await signupRes.json().catch(() => null);
    console.log('Signup status:', signupRes.status(), JSON.stringify(signupBody).slice(0, 100));
    if (signupBody?.access_token) {
      await ctx.addCookies([{ name: 'token', value: signupBody.access_token, domain: 'localhost', path: '/' }]);
    }
  } else {
    await ctx.addCookies([{ name: 'token', value: body.access_token, domain: 'localhost', path: '/' }]);
    console.log('Token set');
  }

  // Check dashboard
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'F:/zenzhire/frontend/screenshots/cl-03-dashboard.png', fullPage: true });
  console.log('Dashboard URL:', page.url());

  // Check navbar links
  const navText = await page.$eval('nav', el => el.innerText);
  console.log('Nav text:', navText.replace(/\n/g, ' | '));

  // Check cover letter list page
  await page.goto('http://localhost:3000/cover-letter');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'F:/zenzhire/frontend/screenshots/cl-04-cover-letter-list.png', fullPage: true });
  console.log('Cover letter page URL:', page.url());

  await browser.close();
})();
