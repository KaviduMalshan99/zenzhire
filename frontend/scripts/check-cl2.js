const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  // Login via API to get token, then set cookie
  const res = await page.request.post('http://localhost:8000/api/v1/auth/login', {
    form: { username: 'freelyricshub@gmail.com', password: 'password123' }
  });
  const body = await res.json().catch(() => null);
  console.log('Login status:', res.status(), body ? 'got body' : 'no body');
  
  if (res.ok() && body?.access_token) {
    await ctx.addCookies([{ name: 'token', value: body.access_token, domain: 'localhost', path: '/' }]);
    console.log('Token set');
    
    // Check dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'F:/zenzhire/frontend/screenshots/cl-03-dashboard.png', fullPage: true });
    console.log('Dashboard URL:', page.url());
    
    // Check cover letter page
    await page.goto('http://localhost:3000/cover-letter');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'F:/zenzhire/frontend/screenshots/cl-04-cover-letter-list.png', fullPage: true });
    console.log('Cover letter page URL:', page.url());
    
    // Check navbar is visible
    const navLinks = await page.$$eval('nav a', links => links.map(l => ({ href: l.getAttribute('href'), text: l.textContent.trim() })));
    console.log('Nav links:', JSON.stringify(navLinks));
  } else {
    console.log('Login failed:', JSON.stringify(body));
    await page.screenshot({ path: 'F:/zenzhire/frontend/screenshots/cl-error.png' });
  }
  
  await browser.close();
})();
