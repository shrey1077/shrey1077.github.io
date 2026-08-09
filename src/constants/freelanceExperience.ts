/**
 * Freelance — bespoke page configuration.
 *
 * The independent practice: the work that came in directly, before and between
 * the studio years. One room, several brands, each a small case study —
 * strongest first. Plates come from scripts/prepare-freelance-experience.mjs
 * (source: D:/Assets/Clients/Freelance).
 *
 * Farmstacks is deliberately absent — it's told as the UID packaging project.
 */

import type { CaseStudyConfig } from "@/types/caseStudy";

export const FREELANCE_EXPERIENCE: CaseStudyConfig = {
  slug: "freelance",
  eyebrow: "Selected — Independent practice",
  title: "Freelance",
  tagline: "Small brands, each taken from the problem to the finished thing.",
  intro:
    "The work that arrived directly — a filtration company that needed a whole technical language, a shoe label that needed to sell online, a school that needed to fill a session, marks for people who so far had only a name. Different rooms, the same job each time: find the one idea the brand turns on, then build everything else out from it.",
  metaLines: ["Identity · Web · Packaging · Marketing", "India · Remote", "2014 — present"],
  footerNote: "Independent commissions — selected work, shown as portfolio record",
  categories: [
    {
      id: "vivid",
      folder: "vivid",
      name: "Vivid Process Technology",
      kind: "Brand system · Website · Technical communication",
      headline: "Making invisible filtration legible.",
      challenge:
        "Vivid sells filtration and containment into pharma manufacturing — an unseen product bought on trust and specification. A small trading company had to read as an authority, able to sit in a deck beside Biocon or Dr. Reddy's without flinching.",
      description:
        "A full identity and website, plus the piece that did the real work: process maps placing every Vivid product inside the actual API, biopharma and formulation lines a plant runs. A catalogue of stainless housings turned into a story a process engineer already believes.",
      accent: "#0E63B3",
    },
    {
      id: "leder",
      folder: "leder",
      name: "Leder Warren",
      kind: "E-commerce brand · Marketing creative",
      headline: "Everyday elegance, on the feed.",
      challenge:
        "A homegrown leather-shoe label going direct-to-consumer had to look worth its price online — premium, consistent and unmistakably its own across an endless stream of product drops and category pushes.",
      description:
        "Marketing creatives and campaign frames held together by one warm, restrained system — a serif headline, an olive-and-tan palette, a bilingual mark — so that formals, categories and offers all read as the same shop.",
      accent: "#8A5A2B",
      site: "lederwarren.in",
    },
    {
      id: "first-divine",
      folder: "first-divine",
      name: "First Divine",
      kind: "Brand identity · Stationery",
      headline: "Herald the unheralded.",
      challenge:
        "A young Bengaluru venture wanted an identity with the weight of a masthead and the lift of a promise — trustworthy and a little ceremonial, without tipping into pastiche.",
      description:
        "A low-poly dove under a blackletter wordmark and the line 'Herald the Unheralded', worked out across a stationery set. New news in an old voice — faceted, modern geometry beneath an old-world word.",
      accent: "#12A5D6",
    },
    {
      id: "tsus",
      folder: "tsus",
      name: "The Shri Ram Universal School",
      kind: "Education marketing · Admissions campaign",
      headline: "Filling a session.",
      challenge:
        "Admissions creatives had to borrow the authority of the Shri Ram name and speak to parents in a crowded NCR market — warm enough to trust a child to, formal enough to command the fee.",
      description:
        "Awareness and admissions pieces for the session — a navy-and-gold system with the campus as its own hero, carrying 'igniting curiosity, nurturing creativity' consistently across formats.",
      accent: "#16386F",
    },
    {
      id: "komono",
      folder: "komono",
      name: "komono",
      kind: "Logo & identity",
      headline: "Three rings, one word.",
      challenge:
        "An accessories label named komono — Japanese for 'the small things' — wanted a mark that felt crafted and geometric: legible at charm size, confident on a shopfront.",
      description:
        "A custom geometric wordmark under three interlocked rings, boxed like a stamp. Built from a single stroke logic so it holds from a favicon to a storefront sign, and shown across its colourways.",
      accent: "#111827",
    },
    {
      id: "maler-oswald",
      folder: "maler-oswald",
      name: "Maler Oswald",
      kind: "Identity & signage · Germany",
      headline: "The tool of the trade, holding the name.",
      challenge:
        "A German wall-and-surface finishing firm needed a mark that shows the craft in the logo itself — the trade is paint, so the identity should feel painted.",
      description:
        "A single confident brushstroke as the field, the name set clean across it, shown as it would live — large, on the face of a building.",
      accent: "#2F3133",
    },
    {
      id: "sotai",
      folder: "sotai",
      name: "Sotai",
      kind: "Infrastructure boards · Public-health engineering",
      headline: "Drawing the network under the town.",
      challenge:
        "Public-health-engineering proposals live or die on legibility — water-supply and sewerage schemes have to be read by engineers and approved by officials who are not designers.",
      description:
        "Layout and information design for water-supply and sewer/PHE scheme boards — plan drawings organised, keyed and titled into clean panels that carry a technical proposal into a review room.",
      accent: "#2E6DA4",
    },
    {
      id: "maxbox",
      folder: "maxbox",
      name: "Maxbox Creations",
      kind: "3D interior visualisation · Early work",
      headline: "Rooms before they exist.",
      challenge:
        "The earliest commissions: showing a client a space they couldn't yet walk into — furnished, lit and dressed — convincingly enough to sign off a fit-out.",
      description:
        "Interiors modelled and rendered to sell a room before it was built. Formative work, and the first time the craft had to answer to a paying brief rather than a grade.",
      accent: "#B5722E",
    },
  ],
};
