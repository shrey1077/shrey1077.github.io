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
    // The robot (a remote Spline scene, the template author's — see
    // SplineScene) stood behind this page until 2026-10-15, when the owner
    // moved it to the home page's Zabraku slide ("move it completely").
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
    // ⚠ The 35-page 2021 deck opens IN PLACE rather than behind a card, at the
    //   owner's request (2026-08-25): it is the substance of this room, and
    //   making the reader click into it buried it under two much smaller
    //   categories. Brand Identity and Event Campaigns follow it as cards.
    catalogueExpandId: "portfolio-2021",
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
    // Zabraku's own clients (owner, 2026-10-17: "include their sections in
    // Zabraku page"), each linked from the home slide's dark-grey marks.
    // Casa Playa's account and work are its page in the 2021 deck (p. 64–65;
    // scripts/prepare-zabraku-sections.mjs cuts the pieces, phone numbers
    // blurred); RKB's are its logo spread and case study, and the event
    // campaigns — The After After Party carries its mark.
    clientSections: [
      {
        id: "casa-playa",
        name: "Casa Playa",
        logo: "/content/clients/zabraku-media/clients/casa-playa-grey.png",
        kind: "Restaurant · Bar · Grill — Vagator, Goa",
        text: "A luxury resort in Goa that trusted us with its social media as well as its printables. Its two big weekly nights, Fry Downer and Badmaashi, needed fresh, modern work every week to bring people in — event posters, social posts and screen creatives, each night with a look of its own.",
        groups: [
          {
            title: "Event posters",
            rowRem: 13,
            pieces: [
              { src: "/content/clients/zabraku-media/clients/casa-playa/poster-01.webp", name: "Badmaashi — Drop On, Basand, Dyno, AK47", w: 952, h: 1353 },
              { src: "/content/clients/zabraku-media/clients/casa-playa/poster-02.webp", name: "Badmaashi — AK47, CJ, Basand", w: 952, h: 1353 },
              { src: "/content/clients/zabraku-media/clients/casa-playa/poster-03.webp", name: "Fry Downer — Basand, Jawad, Drop On", w: 960, h: 1353 },
              { src: "/content/clients/zabraku-media/clients/casa-playa/poster-04.webp", name: "Badmaashi — Drop On, Saj Akhtar, Basand", w: 956, h: 1349 },
              { src: "/content/clients/zabraku-media/clients/casa-playa/poster-05.webp", name: "Fry Downer — Loysum, Drop On, Basand", w: 956, h: 1349 },
            ],
          },
          {
            title: "Social & screens",
            rowRem: 14,
            pieces: [
              { src: "/content/clients/zabraku-media/clients/casa-playa/social-posts.webp", name: "Badmaashi — social posts", w: 1400, h: 867 },
              { src: "/content/clients/zabraku-media/clients/casa-playa/screens.webp", name: "Fry Downer and Badmaashi — screen creatives", w: 1400, h: 566 },
            ],
          },
        ],
      },
      {
        id: "rkb-entertainment",
        name: "RKB Entertainment",
        logo: "/content/clients/zabraku-media/clients/rkb-grey.png",
        kind: "Nightlife & events — Rahul Kushwant Bhansali Entertainment",
        text: "A nightlife and events company with a new name, Rahul Kushwant Bhansali Entertainment, and a mark to match: a champagne glass drawn on a bounding box, in black and gold. Then a year of its parties across Goa — Ohm 2.Ω, the After After Party and more — with line-ups, day bills and teasers that change their colours from night to night while the type and the sponsor rows hold.",
        groups: [
          {
            title: "Identity",
            rowRem: 22,
            // ⚠ The two files carry each other's names: christmas-party.webp is
            // the logo spread, rk-entertainment-case-study.webp the Christmas
            // bill. Placed here by what they show.
            pieces: [
              { src: "/content/clients/zabraku-media/catalogue/Event Campaigns/christmas-party.webp", name: "The logo — the champagne glass on its bounding box, black and gold", w: 1280, h: 905 },
            ],
          },
          {
            title: "Event campaigns",
            rowRem: 12,
            pieces: [
              { src: "/content/clients/zabraku-media/catalogue/Event Campaigns/ohm-2-teaser.webp", name: "Ohm 2.Ω — the announce teaser", w: 1275, h: 1275 },
              { src: "/content/clients/zabraku-media/catalogue/Event Campaigns/ohm-2-lineup-a-to-z.webp", name: "Ohm 2.Ω — the full A–Z line-up, 12–15 August", w: 1600, h: 2844 },
              { src: "/content/clients/zabraku-media/catalogue/Event Campaigns/ohm-2-lineup-15-aug.webp", name: "Ohm 2.Ω — the 15th August day bill", w: 1600, h: 2844 },
              { src: "/content/clients/zabraku-media/catalogue/Event Campaigns/the-after-after-party.webp", name: "The After After Party, 20–22 November", w: 1080, h: 1920 },
              { src: "/content/clients/zabraku-media/catalogue/Event Campaigns/phantom-halloween.webp", name: "Phantom Halloween, 29–31 October", w: 1280, h: 1280 },
              { src: "/content/clients/zabraku-media/catalogue/Brand Identity/rk-entertainment-case-study.webp", name: "The Christmas party at Ohm, 21 December", w: 2000, h: 2828 },
            ],
          },
        ],
      },
    ],
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
