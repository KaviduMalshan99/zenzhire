import { test, expect, Page } from "@playwright/test";
import path from "path";

const SCREENSHOTS_DIR = path.join(__dirname, "../screenshots");

// Helper: set auth cookie so dashboard routes load
async function mockAuth(page: Page) {
  // Set a dummy token so the axios interceptor doesn't redirect immediately.
  // The API calls will fail with 401 but we can still test UI component rendering.
  await page.context().addCookies([{
    name: "token",
    value: "test-token-for-ui-screenshot",
    domain: "localhost",
    path: "/",
  }]);
}

test.describe("CV Builder Visual Tests", () => {
  test("1. Landing page loads correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-landing-page.png`, fullPage: true });
    await expect(page).toHaveTitle(/ZenzHire/i);
  });

  test("2. Login page renders", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-login-page.png`, fullPage: true });
    await expect(page.locator("input[type=email]")).toBeVisible();
  });

  test("3. Add Section Modal UI", async ({ page }) => {
    // Intercept all API calls to avoid auth failures blocking the page render
    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/cv/")) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 1, user_id: 1, title: "My CV", template_id: "classic",
            is_primary: true, created_at: new Date().toISOString(), updated_at: null,
            sections: [
              {
                id: 1, cv_id: 1, section_type: "personal_details",
                display_order: 0, is_visible: true,
                data: { full_name: "John Smith", email: "john@example.com", phone: "+1 234 567 8900", title: "Software Engineer" },
                created_at: new Date().toISOString(), updated_at: null,
              },
              {
                id: 2, cv_id: 1, section_type: "profile_summary",
                display_order: 1, is_visible: true,
                data: { summary: "<p>Experienced software engineer with 5+ years of expertise in full-stack development.</p>" },
                created_at: new Date().toISOString(), updated_at: null,
              },
              {
                id: 3, cv_id: 1, section_type: "experience",
                display_order: 2, is_visible: true,
                data: {
                  entries: [{
                    id: "e1", job_title: "Senior Software Engineer", employer: "Tech Corp",
                    location: "San Francisco, CA", start_date: "Jan 2022", end_date: "Present",
                    current: true,
                    description: "<ul><li>Led development of microservices architecture</li><li>Improved system performance by 40%</li></ul>",
                  }],
                },
                created_at: new Date().toISOString(), updated_at: null,
              },
              {
                id: 4, cv_id: 1, section_type: "skills",
                display_order: 3, is_visible: true,
                data: {
                  display_style: "text",
                  entries: [
                    { id: "s1", skill_name: "TypeScript", level: "Advanced", subskills: "React, Node.js, Next.js" },
                    { id: "s2", skill_name: "Python", level: "Intermediate", subskills: "FastAPI, Django" },
                  ],
                },
                created_at: new Date().toISOString(), updated_at: null,
              },
            ],
          }),
        });
      } else if (url.includes("/auth/")) {
        await route.fulfill({ status: 401, body: JSON.stringify({ detail: "Not authenticated" }) });
      } else {
        await route.continue();
      }
    });

    await page.goto("/cv-builder?id=1");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Click "Add Section" button
    const addBtn = page.getByRole("button", { name: /add section/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-add-section-modal.png`, fullPage: false });
    } else {
      // Take screenshot of whatever state the page is in
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-cv-builder-state.png`, fullPage: false });
    }
  });

  test("4. CV builder with Projects form and RTE toolbar", async ({ page }) => {
    await page.route("**/api/**", async (route) => {
      if (route.request().url().includes("/cv/")) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 1, user_id: 1, title: "My CV", template_id: "classic",
            is_primary: true, created_at: new Date().toISOString(), updated_at: null,
            sections: [
              {
                id: 1, cv_id: 1, section_type: "personal_details",
                display_order: 0, is_visible: true,
                data: { full_name: "John Smith", email: "john@example.com", title: "Software Engineer" },
                created_at: new Date().toISOString(), updated_at: null,
              },
              {
                id: 7, cv_id: 1, section_type: "projects",
                display_order: 6, is_visible: true,
                data: {
                  entries: [{
                    id: "p1", title: "ZenzHire Platform", subtitle: "AI Career Intelligence",
                    start_date: "Jan 2024", end_date: "Present",
                    description: "<ul><li>Built full-stack CV builder with AI integration</li><li>Implemented ATS scoring system</li></ul>",
                    link: "https://github.com/zenzhire",
                    tech: ["Next.js", "FastAPI", "PostgreSQL", "Claude AI"],
                  }],
                },
                created_at: new Date().toISOString(), updated_at: null,
              },
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/cv-builder?id=1");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Click Projects section if visible
    const projectsBtn = page.getByText("Projects");
    if (await projectsBtn.first().isVisible()) {
      await projectsBtn.first().click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-projects-form-with-rte.png`, fullPage: false });
    } else {
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-cv-builder-projects.png`, fullPage: false });
    }
  });

  test("5. Classic template CV preview", async ({ page }) => {
    await page.route("**/api/**", async (route) => {
      if (route.request().url().includes("/cv/")) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 1, user_id: 1, title: "My CV", template_id: "classic",
            is_primary: true, created_at: new Date().toISOString(), updated_at: null,
            sections: [
              {
                id: 1, cv_id: 1, section_type: "personal_details",
                display_order: 0, is_visible: true,
                data: {
                  full_name: "Jane Doe", email: "jane@example.com", phone: "+1 555 0100",
                  title: "Product Manager", location: "New York, USA",
                  nationality: "American", gender: "Female",
                },
                created_at: new Date().toISOString(), updated_at: null,
              },
              {
                id: 2, cv_id: 1, section_type: "profile_summary",
                display_order: 1, is_visible: true,
                data: { summary: "<p style=\"text-align: justify\">Experienced product manager with 7 years driving product strategy at scale. Passionate about user-centric design and data-driven decision making.</p>" },
                created_at: new Date().toISOString(), updated_at: null,
              },
              {
                id: 3, cv_id: 1, section_type: "experience",
                display_order: 2, is_visible: true,
                data: {
                  entries: [{
                    id: "e1", job_title: "Senior Product Manager", employer: "Acme Inc.",
                    location: "New York", start_date: "Mar 2020", current: true,
                    description: "<ul><li>Launched 3 major product features increasing MAU by 25%</li><li>Led cross-functional team of 12 engineers and designers</li><li>Reduced time-to-market by 30% through agile process improvements</li></ul>",
                  }],
                },
                created_at: new Date().toISOString(), updated_at: null,
              },
              {
                id: 4, cv_id: 1, section_type: "skills",
                display_order: 3, is_visible: true,
                data: {
                  display_style: "text",
                  entries: [
                    { id: "s1", skill_name: "Product Strategy", level: "Advanced", subskills: "Roadmapping, OKRs, PRDs" },
                    { id: "s2", skill_name: "Data Analysis", level: "Advanced", subskills: "SQL, Tableau, Mixpanel" },
                  ],
                },
                created_at: new Date().toISOString(), updated_at: null,
              },
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/cv-builder?id=1");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2500);

    // Screenshot the preview panel (first one — desktop view)
    const preview = page.locator("#cv-preview").first();
    if (await preview.isVisible()) {
      await preview.screenshot({ path: `${SCREENSHOTS_DIR}/05-classic-template-preview.png` });
    } else {
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-cv-builder-full.png`, fullPage: false });
    }
  });
});
