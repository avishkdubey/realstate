import type { MetadataRoute } from "next";

import { getProjects } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

/**
 * File-based sitemap. `lastModified` matters beyond classic SEO — AI systems
 * use freshness as a recrawl signal (CLAUDE.md §11).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/projects", priority: 0.9 },
    { path: "/locations", priority: 0.8 },
    { path: "/about", priority: 0.7 },
    { path: "/amenities", priority: 0.6 },
    { path: "/gallery", priority: 0.5 },
    { path: "/nri-corner", priority: 0.7 },
    { path: "/insights", priority: 0.6 },
    { path: "/contact", priority: 0.8 },
    { path: "/channel-partners", priority: 0.4 },
    { path: "/careers", priority: 0.3 },
    { path: "/rera-disclosure", priority: 0.5 },
    { path: "/privacy", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
  ];

  const projects = await getProjects();

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: route.priority,
    })),
    ...projects.map((project) => ({
      url: `${base}/projects/${project.slug}`,
      // Construction updates are the freshest signal a project page carries.
      lastModified: project.progress[0]?.date
        ? new Date(project.progress[0].date)
        : now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
