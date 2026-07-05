import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const routes = ["", "/team", "/publications", "/projects", "/news", "/join"];

  const staticEntries = routes.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const projectEntries = projects.map((project) => ({
    url: `${base}/projects/${project.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...projectEntries];
}
