import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/*", "/staff", "/staff/*", "/api/*"],
    },
    sitemap: "https://travelsphere.com/sitemap.xml",
  };
}
