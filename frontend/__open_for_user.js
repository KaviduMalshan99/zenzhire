const { chromium } = require("playwright");
const API = "http://localhost:8000/api/v1";
const FRONTEND = "http://localhost:3000";
const EMAIL = "pagination-bug-investigation@example.com";
const PASSWORD = "InvestigateBug!2026x";
const CV_ID = 112;

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) } });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

(async () => {
  const login = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  const token = login.access_token;
  const browser = await chromium.launch({ headless: false, args: ["--start-maximized"] });
  const context = await browser.newContext({ viewport: null });
  await context.addCookies([{ name: "token", value: token, domain: "localhost", path: "/" }]);
  const page = await context.newPage();
  await page.goto(`${FRONTEND}/cv-builder/${CV_ID}`, { waitUntil: "networkidle", timeout: 60000 });
  console.log("Browser window open at /cv-builder/" + CV_ID + " -- leaving it running for manual inspection.");
  // Intentionally do not close browser/context -- left open for the user.
})().catch((e) => { console.error("FATAL:", e); process.exit(1); });
