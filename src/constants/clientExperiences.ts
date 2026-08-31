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
    brandTheme: {
      // Cinzel, uppercase + wide tracking — the engraved-caps spirit of the
      // Copperplate Gothic wordmark.
      fontVar: "--font-cinzel",
      accent: "#14279B",
      tracking: "0.06em",
      uppercase: true,
    },
    stats: [
      { value: "180+", label: "Artifacts" },
      { value: "13", label: "Categories" },
      { value: "2", label: "Campuses" },
      { value: "5", label: "Films" },
    ],
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
    brandTheme: {
      // Michroma — wide technical geometric, the wordmark's own species.
      fontVar: "--font-michroma",
      // Darkened from #17817A for AA contrast on the near-white ground.
      accent: "#0F6E68",
      tracking: "0.05em",
    },
    stats: [
      { value: "12", label: "Directions explored" },
      { value: "5", label: "Sub-brands proposed" },
      { value: "1", label: "Living system" },
    ],
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
    brandTheme: {
      // Anton — the condensed headline weight the cards themselves speak.
      fontVar: "--font-anton",
      accent: "#D0342C",
      tracking: "0.01em",
    },
    stats: [
      { value: "6", label: "Data stories selected" },
      { value: "2014–18", label: "On the masthead" },
      { value: "Daily", label: "Deadline rhythm" },
    ],
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
    // ⚠ REMOTE SCENE, AND IT IS NOT OURS. This is the Montek template author's
    //   own Spline project, which the owner pointed at on 2026-08-25 wanting its
    //   cursor-responsive robot. Nothing about it is vendored — no model, no
    //   texture, no animation — so it is served from their account at view time.
    //   Replace with a scene on the owner's own Spline account before this is
    //   deployed publicly. See SplineScene's header for the full reasoning.
    splineScene: "https://prod.spline.design/AqtlWJlNbO-ZMkvz/scene.splinecode",
    brandTheme: {
      // Orbitron — techno display; used large and tracked-out only.
      fontVar: "--font-orbitron",
      accent: "#B3264A",
      tracking: "0.08em",
    },
    stats: [
      { value: "2", label: "Identities built" },
      { value: "4", label: "Campaign waves" },
      { value: "1 yr", label: "Party calendar" },
    ],
    brand: {
      markText: "Zabraku",
      note: "The wordmark cut into a radial line field — a media identity built to move.",
    },
    catalogueLabel: "Company Portfolio",
    // Both of these appear inside the deck as work: ABS Wholesale has its own
    // client room, and the RK Entertainment identity is the case study in
    // Zabraku's own Brand Identity room. ABS's mark comes on a white ground so
    // it takes a light disc; RKB's is gold cut onto transparency.
    relatedLinks: [
      {
        href: "/clients/abs",
        label: "ABS Wholesale",
        logo: "/content/career/abs.png",
        plate: "light",
        scale: 66,
      },
      {
        href: "/clients/zabraku-media/catalogue/brand-identity",
        label: "RKB Entertainment",
        logo: "/content/clients/zabraku-media/rkb-logo.png",
        plate: "dark",
        scale: 52,
      },
    ],
    sectionDescriptions: {
      catalogue:
        "The 2021 company portfolio in full, page by page, with the identity and event work from the same desk alongside it.",
    },
    footer: {
      clientName: "Zabraku Media",
      facts: ["Media · Content", "Brand identity + ongoing event campaigns"],
    },
  },
  {
    slug: "uid",
    tagline: "Design education, given its own design language",
    brandTheme: {
      // Syne — an expressive display grotesque; a design school gets a voice
      // of its own rather than the site's default serif.
      fontVar: "--font-syne",
      accent: "#3546B0",
      tracking: "-0.01em",
    },
    stats: [
      { value: "4", label: "Disciplines" },
      { value: "PG-1", label: "Visual Communication" },
      { value: "1", label: "Hand throughout" },
    ],
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
