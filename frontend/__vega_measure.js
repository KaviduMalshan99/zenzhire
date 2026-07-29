const { chromium } = require("playwright");

const API = "http://localhost:8000/api/v1";
const FRONTEND = "http://localhost:3000";
const EMAIL = "rollout-verify-test@example.com";
const PASSWORD = "TestPass123!";

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) } });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

function buildSections() {
  return [
    { section_type: "personal_details", data: { full_name: "Jordan Ellis", title: "Senior Backend Engineer", email: "jordan.ellis@email.com", phone: "+1 555 987 6543", location: "Austin, TX" } },
    { section_type: "profile_summary", data: { summary: "<p>Backend engineer with 10 years of experience.</p>" } },
    { section_type: "experience", data: { entries: [
      { id: "e1", job_title: "Senior Backend Engineer", employer: "Northbridge Systems", start_date: "2024", end_date: "", current: true, description: "", bullets: [{ text: "Did a thing" }] },
      { id: "e2", job_title: "Backend Engineer", employer: "Vantage Cloud", start_date: "2022", end_date: "2024", bullets: [{ text: "Did another thing" }] },
    ] } },
    { section_type: "education", data: { entries: [
      { id: "ed1", institution: "UT Austin", degree: "BSc CS", start_date: "2016", end_date: "2020" },
      { id: "ed2", institution: "Some HS", degree: "Diploma", start_date: "2012", end_date: "2016" },
    ] } },
    { section_type: "skills", data: { entries: [{ id: "s1", skill_name: "Go", level: "Advanced" }, { id: "s2", skill_name: "Python", level: "Advanced" }] } },
    { section_type: "soft_skills", data: { entries: [{ id: "ss1", skill_name: "Leadership", level: "Advanced" }] } },
    { section_type: "certificates", data: { entries: [{ id: "c1", certificate_name: "AWS SA", issuer: "AWS", date: "2022" }, { id: "c2", certificate_name: "GCP PCA", issuer: "Google", date: "2023" }] } },
    { section_type: "languages", data: { entries: [{ id: "l1", language: "English", level: "Native" }, { id: "l2", language: "Spanish", level: "Professional" }] } },
    { section_type: "interests", data: { entries: [{ id: "i1", title: "Rock climbing" }] } },
    { section_type: "projects", data: { entries: [{ id: "p1", title: "Rate Limiter", description: "<p>Built a thing.</p>" }] } },
    { section_type: "awards", data: { entries: [{ id: "a1", award_name: "Excellence Award", date: "2023" }] } },
    { section_type: "references", data: { entries: [{ id: "r1", name: "Ref One", job_title: "Manager", organization: "Co", show_on_cv: true }] } },
  ];
}

(async () => {
  const login = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  const token = login.access_token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  const cv = await apiFetch("/cv/", { method: "POST", headers: authHeaders, body: JSON.stringify({ title: "Vega Measure", template_id: "vega" }) });
  console.log("created cv id:", cv.id);

  const cvDetail = await apiFetch(`/cv/${cv.id}`, { headers: authHeaders });
  const existingByType = new Map((cvDetail.sections || []).map((s) => [s.section_type, s.id]));
  for (const s of buildSections()) {
    if (existingByType.has(s.section_type)) {
      await apiFetch(`/cv/${cv.id}/sections/${existingByType.get(s.section_type)}`, { method: "PUT", headers: authHeaders, body: JSON.stringify({ data: s.data }) });
    } else {
      await apiFetch(`/cv/${cv.id}/sections`, { method: "POST", headers: authHeaders, body: JSON.stringify(s) });
    }
  }

  const context = await chromium.launchPersistentContext(
    `C:/Users/kavidu/AppData/Local/Temp/rollout-verify-profile`,
    { args: ["--disable-web-security"], viewport: { width: 1400, height: 1400 } }
  );
  await context.addCookies([{ name: "token", value: token, domain: "localhost", path: "/" }]);
  const page = await context.newPage();
  await page.goto(`${FRONTEND}/cv-builder/${cv.id}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);

  const measurements = await page.evaluate(() => {
    const sidebarRoot = document.querySelector(".vega-sidebar");
    const mainRoot = document.querySelector(".vega-main");
    function measure(root) {
      if (!root) return null;
      const kids = Array.from(root.querySelectorAll(":scope > [data-section-id]"));
      const rects = kids.map((k) => ({ id: k.getAttribute("data-section-id"), rect: k.getBoundingClientRect() }));
      const gaps = [];
      for (let i = 0; i < rects.length - 1; i++) {
        gaps.push({ from: rects[i].id, to: rects[i + 1].id, gap: rects[i + 1].rect.top - rects[i].rect.bottom });
      }
      return { count: rects.length, gaps };
    }
    const bodyFlex = sidebarRoot ? sidebarRoot.parentElement : null;
    const referencesWrapper = bodyFlex ? bodyFlex.nextElementSibling : null;
    const bodyToReferencesGap = referencesWrapper ? referencesWrapper.getBoundingClientRect().top - bodyFlex.getBoundingClientRect().bottom : null;
    return { sidebar: measure(sidebarRoot), main: measure(mainRoot), bodyToReferencesGap };
  });

  console.log(JSON.stringify(measurements, null, 2));
  await context.close();
})().catch((e) => { console.error("FATAL:", e); process.exit(1); });
