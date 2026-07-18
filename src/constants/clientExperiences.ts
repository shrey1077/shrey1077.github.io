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
    legacyIntro: true,
    logoSystem: true,
    brand: {
      markText: "Tata IIS",
      note: "The identity is built on a strict construction grid — proportion, spacing, and typography all derive from it.",
    },
    institute: {
      parentName: "Indian Institute of Skills",
      parentNote: "A Tata initiative",
      branches: [
        {
          id: "iis-ahmedabad",
          name: "IIS Ahmedabad",
          city: "Ahmedabad",
          logoSrc: "/content/clients/tata-iis/brand/iisa.png",
        },
        {
          id: "iis-mumbai",
          name: "IIS Mumbai",
          city: "Mumbai",
          logoSrc: "/content/clients/tata-iis/brand/iism.png",
        },
      ],
    },
    sectionDescriptions: {
      catalogue:
        "Every family of work, one card each — open a card to enter its gallery. Thirteen categories, the whole system.",
    },
    footer: {
      clientName: "Tata Indian Institute of Skills",
      facts: [
        "An initiative with the Ministry of Skill Development & Entrepreneurship, Government of India",
        "Supported by Tata Trusts and Tata Sons",
        "Campuses — Ahmedabad · Mumbai",
      ],
    },
  },
  {
    slug: "azoth-biotech",
    tagline: "Identity for a lab rewriting its own formula",
    brand: {
      markText: "Azoth Biotech",
      note: "A DNA-helix mark, explored across a dozen directions before landing on the circular tangle.",
    },
    sectionDescriptions: {
      brand: "A dozen directions for the mark, and its first campaign moment.",
      catalogue: "A small, honest set — the identity engagement is early.",
    },
    footer: {
      clientName: "Azoth Biotech",
      facts: ["Biotechnology", "Identity in progress"],
    },
  },
  {
    slug: "newsmobile",
    tagline: "A news identity moving at the speed of the feed",
    brand: {
      markText: "NewsMobile",
      note: "Editorial infographics built to read in a scroll, branded consistently under deadline.",
    },
    sectionDescriptions: {
      catalogue: "Policy launches, safety data, broadcast quotes — the daily feed, designed.",
    },
    footer: {
      clientName: "NewsMobile",
      facts: ["Digital news", "newsmobile.in · newsmobile.asia"],
    },
  },
  {
    slug: "zabraku-media",
    tagline: "A media house with a story-first spine",
    brand: {
      markText: "Zabraku",
      note: "The wordmark cut into a radial line field — a media identity built to move.",
    },
    sectionDescriptions: {
      catalogue:
        "A logo case study for RK Entertainment, then a year of the event marketing that followed it.",
    },
    footer: {
      clientName: "Zabraku Media",
      facts: ["Media · Content", "Brand identity + ongoing event campaigns"],
    },
  },
  {
    slug: "uid",
    tagline: "Design education, given its own design language",
    brand: {
      markText: "UID",
      note: "Coursework in identity, packaging, performance, and observation — the hand learning the system.",
    },
    sectionDescriptions: {
      catalogue:
        "A studio brand, a packaging system, a performance piece, and studies from life — the range a design education asks for.",
    },
    footer: {
      clientName: "University Institute of Design",
      facts: ["PG-1, Visual Communication", "Coursework archive"],
    },
  },
] as const;

/** Look up an experience config by client slug. */
export function clientExperienceBySlug(
  slug: string,
): ClientExperienceConfig | undefined {
  return CLIENT_EXPERIENCES.find((c) => c.slug === slug);
}
