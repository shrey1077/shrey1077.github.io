/**
 * sitemap.xml — every page the site builds, for search engines (Step 4,
 * 2026-10-13). Read from the same lists the pages are generated from, so a
 * new client, catalogue category or publication is listed without touching
 * this file. Addresses end in "/", as the site serves them (trailingSlash).
 */

import type { MetadataRoute } from "next";
import { SITE } from "@/constants/site";
import { routedClients } from "@/constants/clients";
import { READABLE_PUBLICATIONS } from "@/constants/publications";
import { readCatalogue } from "@/content/catalogue";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE.website}${path}`;
  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/clients/"), changeFrequency: "monthly", priority: 0.6 },
    // The rooms' own pages (2026-10-15).
    ...["/all-works/", "/arts-and-crafts/", "/writings/", "/extincts/"].map((p) => ({
      url: url(p),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...routedClients().flatMap((c) => [
      { url: url(`/clients/${c.slug}/`), changeFrequency: "monthly" as const, priority: 0.8 },
      ...readCatalogue(c.slug).map((cat) => ({
        url: url(`/clients/${c.slug}/catalogue/${cat.id}/`),
        changeFrequency: "yearly" as const,
        priority: 0.5,
      })),
    ]),
    ...READABLE_PUBLICATIONS.map((p) => ({
      url: url(`/publications/${p.slug}/`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
