const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Check login page first
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'F:/zenzhire/frontend/screenshots/cl-01-login.png', fullPage: false });
  
  // Login
  await page.fill('input[type="email"]', 'freelyricshub@gmail.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'F:/zenzhire/frontend/screenshots/cl-02-after-login.png', fullPage: false });
  console.log('After login URL:', page.url());
  
  await browser.close();
})();
