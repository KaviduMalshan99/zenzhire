const { chromium } = require("playwright");

const API = "http://localhost:8000/api/v1";
const FRONTEND = "http://localhost:3000";
const OUT = "C:/Users/kavidu/AppData/Local/Temp/claude/F--zenzhire-zenzhire/27b7dae4-8cc8-4960-a502-f3a96f69675b/scratchpad";

const EMAIL = "pagination-fix-test@example.com";
const PASSWORD = "TestPass123!";

const suffix = process.argv[2] || "before";

function experienceEntry(i) {
  return {
    id: `e${i}`,
    job_title: ["Senior Backend Engineer", "Backend Engineer", "Software Engineer", "Platform Engineer", "Software Engineer II", "Junior Software Engineer", "Software Engineering Intern"][i % 7],
    employer: ["Northbridge Systems", "Vantage Cloud", "Meridian Data", "Lockstep Analytics", "Farview Technologies", "Riverton Labs", "Ashfield Software"][i % 7],
    employer_link: "",
    location: "Austin, TX",
    start_date: `${2024 - i}`,
    end_date: i === 0 ? "" : `${2025 - i}`,
    current: i === 0,
    description: "",
    bullets: [
      { text: "Designed and shipped a service handling several million requests per day with sub-100ms p99 latency" },
      { text: "Led migration of a monolithic billing pipeline into independently deployable services" },
      { text: "Introduced contract testing across five teams, cutting integration regressions by a third" },
      { text: "Mentored two engineers through their first on-call rotations and promotion cycles" },
    ],
  };
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) } });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

(async () => {
  let token;
  try {
    const signup = await apiFetch("/auth/signup", { method: "POST", body: JSON.stringify({ email: EMAIL, full_name: "Pagination Test", password: PASSWORD }) });
    token = signup.access_token;
  } catch {
    const login = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
    token = login.access_token;
  }
  const authHeaders = { Authorization: `Bearer ${token}` };

  const cv = await apiFetch("/cv/", { method: "POST", headers: authHeaders, body: JSON.stringify({ title: "Academic Pagination Test", template_id: "academic" }) });
  console.log("created cv id:", cv.id);

  const sections = [
    {
      section_type: "personal_details",
      data: {
        full_name: "Jordan Ellis", title: "Senior Backend Engineer", email: "jordan.ellis@email.com",
        phone: "+1 555 987 6543", location: "Austin, TX", nationality: "American",
        links: [
          { id: "1", platform: "LinkedIn", url: "linkedin.com/in/jordanellis" },
          { id: "2", platform: "GitHub", url: "github.com/jordanellis" },
        ],
      },
    },
    {
      section_type: "profile_summary",
      data: { summary: "<p>Backend engineer with 10 years of experience spanning fintech, logistics, and developer-tooling companies. Track record of leading multi-quarter platform migrations and mentoring engineers into senior roles.</p>" },
    },
    {
      // 7 entries — enough to force a genuine mid-section split.
      section_type: "experience",
      data: { entries: [0, 1, 2, 3, 4, 5, 6].map((i) => experienceEntry(i)) },
    },
    {
      section_type: "education",
      data: {
        entries: [
          { id: "ed1", degree: "BSc Computer Science", institution: "University of Texas at Austin", institution_link: "", location: "Austin, TX", start_date: "2016", end_date: "2020", score_type: "GPA", score_value: "3.7 / 4.0", description: "" },
        ],
      },
    },
    {
      section_type: "skills",
      data: {
        entries: [
          { id: "s1", skill_name: "Go", level: "Advanced" }, { id: "s2", skill_name: "Python", level: "Advanced" },
          { id: "s3", skill_name: "PostgreSQL", level: "Advanced" }, { id: "s4", skill_name: "Redis", level: "Intermediate" },
          { id: "s5", skill_name: "Docker", level: "Intermediate" }, { id: "s6", skill_name: "Kubernetes", level: "Intermediate" },
          { id: "s7", skill_name: "gRPC", level: "Intermediate" }, { id: "s8", skill_name: "Kafka", level: "Intermediate" },
        ],
      },
    },
    {
      section_type: "projects",
      data: {
        entries: [
          { id: "p1", title: "Distributed Rate Limiter", subtitle: "Personal / Open Source", start_date: "2023", end_date: "Present", description: "<p>Built a token-bucket rate limiter used across internal services.</p>", link: "github.com/jordanellis/project", tech: ["Go", "Redis", "PostgreSQL"] },
        ],
      },
    },
  ];

  const cvDetail = await apiFetch(`/cv/${cv.id}`, { headers: authHeaders });
  const existingByType = new Map((cvDetail.sections || []).map((s) => [s.section_type, s.id]));
  for (const s of sections) {
    if (existingByType.has(s.section_type)) {
      await apiFetch(`/cv/${cv.id}/sections/${existingByType.get(s.section_type)}`, { method: "PUT", headers: authHeaders, body: JSON.stringify({ data: s.data }) });
    } else {
      await apiFetch(`/cv/${cv.id}/sections`, { method: "POST", headers: authHeaders, body: JSON.stringify(s) });
    }
  }
  console.log("all sections added");

  const context = await chromium.launchPersistentContext(
    `C:/Users/kavidu/AppData/Local/Temp/academic-e2e-profile-${suffix}`,
    { args: ["--disable-web-security"], viewport: { width: 1400, height: 1400 } }
  );
  await context.addCookies([{ name: "token", value: token, domain: "localhost", path: "/" }]);
  const page = await context.newPage();
  page.on("pageerror", (err) => console.log("[pageerror]", err.message));

  await page.goto(`${FRONTEND}/cv-builder/${cv.id}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/academic-${suffix}-preview.png`, fullPage: true });
  console.log("preview screenshot saved");

  const pdfRes = await context.request.post(`${FRONTEND}/api/generate-pdf`, {
    data: { cvId: cv.id, token, fileName: "academic-pagination-test", templateId: "academic" },
    timeout: 60000,
  });
  console.log("generate-pdf status:", pdfRes.status());
  const pdfBuffer = await pdfRes.body();
  require("fs").writeFileSync(`${OUT}/academic-${suffix}-output.pdf`, pdfBuffer);
  console.log("pdf saved, bytes:", pdfBuffer.length);

  const pdfPage = await context.newPage();
  await pdfPage.goto("about:blank");
  await pdfPage.addScriptTag({ path: require.resolve("pdfjs-dist/build/pdf.js") });
  const workerSrc = require("fs").readFileSync(require.resolve("pdfjs-dist/build/pdf.worker.js"), "utf8");
  const pdfBase64 = pdfBuffer.toString("base64");
  const pageCount = await pdfPage.evaluate(async ({ base64, workerSrc }) => {
    const pdfjsLib = globalThis.pdfjsLib;
    const workerBlob = new Blob([workerSrc], { type: "application/javascript" });
    pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    document.body.style.margin = "0";
    document.body.style.background = "#94a3b8";
    document.body.style.display = "flex";
    document.body.style.flexDirection = "column";
    document.body.style.alignItems = "center";
    document.body.style.gap = "20px";
    document.body.style.padding = "20px";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      document.body.appendChild(canvas);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    }
    return doc.numPages;
  }, { base64: pdfBase64, workerSrc });
  console.log("pdf page count (real PDF, via pdfjs):", pageCount);
  await pdfPage.waitForTimeout(500);
  await pdfPage.screenshot({ path: `${OUT}/academic-${suffix}-pdf-rendered.png`, fullPage: true });
  console.log("pdf render screenshot saved");

  await context.close();
  console.log("DONE. cv id:", cv.id);
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
