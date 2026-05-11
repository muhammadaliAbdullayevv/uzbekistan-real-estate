import type { MetadataRoute } from "next";
import { ListingStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getAbsoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      lastModified: new Date()
    },
    {
      url: getAbsoluteUrl("/about"),
      lastModified: new Date()
    },
    {
      url: getAbsoluteUrl("/contact"),
      lastModified: new Date()
    },
    {
      url: getAbsoluteUrl("/privacy"),
      lastModified: new Date()
    },
    {
      url: getAbsoluteUrl("/terms"),
      lastModified: new Date()
    }
  ];

  try {
    const listings = await prisma.listing.findMany({
      where: {
        status: ListingStatus.APPROVED
      },
      select: {
        id: true,
        updatedAt: true
      }
    });

    const listingRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
      url: getAbsoluteUrl(`/listings/${listing.id}`),
      lastModified: listing.updatedAt
    }));

    return [...staticRoutes, ...listingRoutes];
  } catch {
    return staticRoutes;
  }
}
