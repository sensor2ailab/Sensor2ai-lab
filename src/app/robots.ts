import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export const dynamic = "force-static";

// Public pages are crawlable; the signed-in surfaces (inbox, chat, admin, auth) and
// the API are not. The pages also carry `robots: noindex` metadata as a second line
// of defence, since robots.txt only asks politely.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/inbox", "/messages", "/announcements", "/login", "/api/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
