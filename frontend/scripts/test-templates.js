const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE_URL = "http://localhost:3000";
const EMAIL = "it23565876@my.sliit.lk";
const PASSWORD = "123Dul123#";

// Labels must match LeftPanel.tsx TEMPLATE_OPTIONS exactly
const TEMPLATES = [
  { id: "classic",   name: "Classic" },
  { id: "modern",    name: "Modern" },
  { id: "minimal",   name: "Colorful" },
  { id: "executive", name: "Executive" },
  { id: "tech",      name: "Bordered" },
  { id: "creative",  name: "Timeline" },
  { id: "academic",  name: "Inline" },
  { id: "gcc",       name: "GCC" },
];

const RESULTS = [];

async function runTests() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const outDir = path.join(__dirname, "template-test-results");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  // ── Login ──────────────────────────────────────────────────────────────────
  // Note: (auth) is a Next.js route group — URL is /login, not /auth/login
  console.log("Logging in...");
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
  console.log("Logged in successfully");

  // ── CV builder ─────────────────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/cv-builder`);
  await page.waitForTimeout(3000);

  for (const template of TEMPLATES) {
    console.log(`\nTesting ${template.name}...`);
    const result = { template: template.name, id: template.id, issues: [], screenshots: {} };

    try {
      // Click template button by exact label
      await page.getByRole("button", { name: template.name, exact: true }).click({ timeout: 5000 });
      await page.waitForTimeout(2000);

      // Preview screenshot
      const previewPath = path.join(outDir, `${template.id}-preview.png`);
      await page.screenshot({ path: previewPath, fullPage: false });
      result.screenshots.preview = previewPath;
      console.log(`  ✓ Preview screenshot saved`);

      // ── PDF export ─────────────────────────────────────────────────────────
      // Intercept /api/generate-pdf response to capture bytes before browser
      // triggers the blob-URL download (Playwright download event is unreliable
      // for programmatic blob downloads created via link.click()).
      let pdfBytes = null;
      await page.route("**/api/generate-pdf", async (route) => {
        const response = await route.fetch();
        if (response.ok()) pdfBytes = await response.body();
        await route.fulfill({ response });
      });

      await page.click('button:has-text("Download PDF")', { timeout: 10000 });
      console.log(`  ⏳ Waiting for PDF generation...`);

      // Wait for the Download PDF button to re-enable (export finished)
      await page.waitForFunction(
        () => {
          const btn = Array.from(document.querySelectorAll("button"))
            .find((b) => b.textContent && b.textContent.includes("Download PDF"));
          return btn && !btn.disabled;
        },
        null,
        { timeout: 45000 }
      );

      await page.unroute("**/api/generate-pdf");

      if (pdfBytes) {
        const pdfPath = path.join(outDir, `${template.id}.pdf`);
        fs.writeFileSync(pdfPath, pdfBytes);
        result.screenshots.pdf = pdfPath;
        console.log(`  ✓ PDF saved (${Math.round(pdfBytes.length / 1024)} KB)`);
      } else {
        result.issues.push("PDF bytes not captured — check route interception");
        console.log(`  ⚠ PDF export ran but bytes not captured`);
      }

      await page.waitForTimeout(1500);

      // Post-export screenshot
      const afterPdfPath = path.join(outDir, `${template.id}-after-pdf.png`);
      await page.screenshot({ path: afterPdfPath });
      console.log(`  ✓ Post-export screenshot saved`);

      result.status = result.issues.length === 0 ? "PASS" : "WARN";

    } catch (err) {
      await page.unroute("**/api/generate-pdf").catch(() => {});
      result.status = "FAIL";
      result.issues.push(err.message);
      console.log(`  ✗ Error: ${err.message}`);

      const errPath = path.join(outDir, `${template.id}-error.png`);
      await page.screenshot({ path: errPath }).catch(() => {});
    }

    RESULTS.push(result);
    console.log(`  Status: ${result.status}`);
    if (result.issues.length > 0) console.log(`  Issues: ${result.issues.join(", ")}`);
  }

  // ── Report ─────────────────────────────────────────────────────────────────
  const reportPath = path.join(outDir, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify(RESULTS, null, 2));

  console.log("\n════════════════════════");
  console.log("TEST SUMMARY");
  console.log("════════════════════════");
  RESULTS.forEach((r) => {
    const icon = r.status === "PASS" ? "✅" : r.status === "WARN" ? "⚠️ " : "❌";
    console.log(`${icon} ${r.template}: ${r.status}`);
    if (r.issues.length > 0) r.issues.forEach((i) => console.log(`   - ${i}`));
  });

  const passed = RESULTS.filter((r) => r.status === "PASS").length;
  console.log(`\n${passed}/${RESULTS.length} templates passed`);
  console.log(`Results saved to: ${outDir}`);

  await browser.close();
}

runTests().catch(console.error);
