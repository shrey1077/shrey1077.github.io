/**
 * Client experience configs — which clients get a full experience page.
 *
 * `/clients/[slug]` branches on this: a config here → the sectioned
 * ClientExperience (brand opening, structure, catalogue, photography); no
 * config → the minimal work-in-progress page. Tata IIS is the reference
 * implementation every future client page follows.
 *
 * Asset side of the same coin: content folders under
 * `public/content/clients/<slug>/` (docs/CONTENT_GUIDE.md).
 */

import type { ClientExperienceConfig } from "@/types/client";

export const CLIENT_EXPERIENCES: readonly ClientExperienceConfig[] = [
  {
    slug: "tata-iis",
    tagline: "Brand & communication system for the Indian Institute of Skills",
    brand: {
      markText: "Tata IIS",
      note: "The identity is built on a strict construction grid — proportion, spacing, and typography all derive from it. The full logo-construction experience arrives with the official guidelines.",
    },
    institute: {
      parentName: "Indian Institute of Skills",
      parentNote: "A Tata initiative",
      branches: [
        { id: "iis-ahmedabad", name: "IIS Ahmedabad", city: "Ahmedabad" },
        { id: "iis-mumbai", name: "IIS Mumbai", city: "Mumbai" },
      ],
    },
  },
] as const;

/** Look up an experience config by client slug. */
export function clientExperienceBySlug(
  slug: string,
): ClientExperienceConfig | undefined {
  return CLIENT_EXPERIENCES.find((c) => c.slug === slug);
}
