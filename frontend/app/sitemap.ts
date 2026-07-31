import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/share-links";

// Static, public marketing pages only — authenticated app routes
// ((dashboard) group, /login, /signup forms, etc.) are intentionally excluded
// since they're not meant to be indexed. career-tips/[id] entries aren't
// enumerated here since they're DB-backed and can change independently of a
// deploy; the /career-tips index page itself is listed and links out to them.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/features/cv-builder", changeFrequency: "weekly", priority: 0.9 },
    { path: "/features/ats-checker", changeFrequency: "weekly", priority: 0.9 },
    { path: "/templates", changeFrequency: "weekly", priority: 0.9 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.8 },
    { path: "/reviews", changeFrequency: "weekly", priority: 0.6 },
    { path: "/career-tips", changeFrequency: "weekly", priority: 0.6 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
    { path: "/partners", changeFrequency: "monthly", priority: 0.4 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
