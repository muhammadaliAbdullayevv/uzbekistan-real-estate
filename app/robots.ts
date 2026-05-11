import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/listings/"],
        disallow: [
          "/admin",
          "/account",
          "/favorites",
          "/my-listings",
          "/login",
          "/register",
          "/add-listing",
          "/api/"
        ]
      }
    ],
    sitemap: getAbsoluteUrl("/sitemap.xml")
  };
}
