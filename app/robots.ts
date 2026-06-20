import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/make", "/r/"] },
      { userAgent: "Yeti", allow: "/", disallow: ["/admin/", "/api/", "/make", "/r/"] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
