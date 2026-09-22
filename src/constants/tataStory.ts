/**
 * The Tata IIS page as numbered bands — copy, artwork and rails.
 *
 * The owner redesigned that page on 2026-09-22 from a comp: a two-column hero,
 * then bands numbered 01…05, each one a kicker, a serif headline, a short
 * paragraph and one piece of evidence. This file is the copy and the pointers;
 * TataExperience is the layout.
 *
 * ⚠ THE COMP'S LOGOS AND SOME OF ITS WORDS ARE NOT THE CLIENT'S. It was made to
 * show composition, and its marks are redrawn approximations, its campus
 * taglines invented, its email a placeholder. Everything here therefore comes
 * from what the repo already holds and can vouch for:
 *   · marks          — TATA_GUIDELINES (the real files the rulebooks ship)
 *   · campus lines   — the dialect sentences already written for each campus
 *   · colours        — the hexes in TATA_GUIDELINES, not sampled from the comp
 *   · photographs    — real campus frames from the catalogue, not stock
 *   · contact        — SITE, not the comp's address
 * ⚠ Nothing in this file should ever state a fact about Tata IIS that is not
 * already established elsewhere in the repo. If a band needs a new claim, get
 * it from the owner rather than writing one that reads well.
 *
 * ⚠ The comp also carried a campaign line over the photograph in 04 ("REAL
 * SKILLS REAL OPPORTUNITIES"). It is not in any file the institute supplied, so
 * it is deliberately absent — an invented campaign line on a real client's page
 * is a claim, not decoration. The hero artwork's own wording is the owner's and
 * is baked into that image.
 */

import { TATA_GUIDELINES } from "@/constants/tataExperience";

const PHOTO = "/content/clients/tata-iis/catalogue/Photography";
/** Card-sized crops of the rulebook plates — `scripts/prepare-tata-dna.mjs`
 *  cuts them and says which page each one came out of. */
const DNA = "/content/clients/tata-iis/brand/dna";

/** The hero: the wordmark, the pitch, and the owner's supplied artwork. */
export const TATA_HERO = {
  eyebrow: ["Client", "Enterprise", "Systems"],
  /** Two lines, set apart so the break never lands on the browser's whim. */
  headline: ["The system", "behind the skills."],
  /** Supplied by the owner 2026-09-22 (1071×1469). Its own wording — "SKILLS
   *  BUILD STRONGER INDIA", "PEOPLE SKILLS INDUSTRY INDIA" — is part of the
   *  image, so the page must not set those words again beside it. */
  art: "/content/clients/tata-iis/hero/skills-build-stronger-india.webp",
  artAlt:
    "Campaign artwork: a trainee in safety glasses in profile, the campus workshops and machining bays composited inside the silhouette.",
  /** The vertical micro-rail down the right edge. */
  rail: ["Think", "Design", "Skill", "Impact"],
  railFoot: ["A more", "skilled", "India"],
} as const;

/** One numbered band. `art` is evidence, never decoration — every one of them
 *  is a real plate, photograph or mark from this client's own files. */
export interface TataBand {
  /** "01" … — fixed rather than derived, because the bands are hand-ordered. */
  number: string;
  kicker: string;
  /** Kept as lines for the same reason as the hero's. */
  headline: string[];
  body: string;
  /** The words set small beside the band, as in the comp. */
  rail?: string[];
}

export const TATA_INSTITUTE: TataBand & { photo: string; photoAlt: string } = {
  number: "01",
  kicker: "The institute",
  headline: ["A national mission", "for a skilled tomorrow."],
  body:
    "Tata IIS trains for the trades industry is hiring into — emerging technical and service skills, taught to industry grade and measured by what a trainee can do at the end of it. Two campuses carry it, Ahmedabad and Mumbai, built with the Ministry of Skill Development and Entrepreneurship and backed by Tata Trusts.",
  rail: ["Skills", "People", "Progress", "Opportunity"],
  photo: `${PHOTO}/campus-frame-iii.webp`,
  photoAlt: "The Indian Institute of Skills campus building, Mumbai.",
};

export const TATA_SYSTEM: TataBand = {
  number: "02",
  kicker: "The system",
  headline: ["One vision.", "Three identities."],
  body:
    "One parent mark and two campus dialects. Each campus needed a voice of its own without breaking from Tata IIS, so all three rulebooks share the same construction, exclusion zone and behaviour, and part company only on colour and geometry.",
  rail: ["Learn", "Practice", "Build", "Belong"],
};

/** The 02 lockup: the parent mark over its two campuses.
 *  ⚠ Every file here is the real supplied artwork — the comp's versions of
 *  these three marks are redrawn and wrong. */
export const TATA_LOCKUP = {
  parent: { logo: TATA_GUIDELINES.wordmark, label: "Tata IIS" },
  campuses: [
    {
      label: "IIS Ahmedabad",
      logo: TATA_GUIDELINES.iisa.logo,
      line: TATA_GUIDELINES.iisa.line,
      colours: TATA_GUIDELINES.iisa.colours,
      inkFill: 1,
    },
    {
      label: "IIS Mumbai",
      logo: TATA_GUIDELINES.iism.logo,
      line: TATA_GUIDELINES.iism.line,
      colours: TATA_GUIDELINES.iism.colours,
      // ⚠ MEASURED, not eyeballed. iism.png is an 800×800 canvas whose ink sits
      // in rows 272–528 — 32% of its height — while iisa.png fills its frame
      // edge to edge. Given equal boxes the Mumbai mark comes out a third the
      // size of Ahmedabad's, which is exactly what the old page did. The layout
      // divides its box height by this, so the two campuses read as equals.
      // Re-measure if either file is replaced.
      inkFill: 0.32,
    },
  ],
} as const;

export const TATA_DNA: TataBand = {
  number: "03",
  kicker: "Brand DNA",
  headline: ["Built on a", "grid of possibility."],
  body:
    "A system made to hold at any size: the mark constructed on a grid at a fixed 4:1 ratio, a 2x exclusion zone it never gives up, two licensed faces, and a colour law that survives print, screen and a fifteen-foot ceremony backdrop.",
};

/** The five cards under 03.
 *
 * ⚠ THE FIFTH CARD IS NOT THE COMP'S. The comp's last card is "Iconography"
 * with four drawn icons; the Tata IIS rulebooks contain no icon set, and
 * drawing one to fill the slot would put a system on the page that the client
 * does not have. Usage — the precautions plate, which the rulebooks DO carry —
 * takes its place.
 *
 * `swatches` is for the colour card, which paints its own evidence rather than
 * showing a plate; the hexes are the campus rulebooks', not sampled.
 *
 * ⚠ The plates are CROPS, not the pages. A full rulebook page in a 200px card
 * is a grey smudge — `scripts/prepare-tata-dna.mjs` cuts each one down to the
 * diagram and records where from. Run it if the rulebook is re-exported. */
export const TATA_DNA_CARDS: {
  title: string;
  words: string[];
  plate?: string;
  swatches?: { hex: string; name: string }[];
}[] = [
  {
    title: "Grid",
    words: ["Structure", "Clarity", "Scalability"],
    plate: `${DNA}/grid.webp`, // cut from plate-03 — construction, with measures
  },
  {
    title: "Geometry",
    words: ["Unity", "Identity", "Flexibility"],
    plate: `${DNA}/geometry.webp`, // cut from plate-08 — the alternate T shapes
  },
  {
    title: "Colour",
    words: ["Trust", "Energy", "Aspiration"],
    swatches: [
      ...TATA_GUIDELINES.iisa.colours,
      ...TATA_GUIDELINES.iism.colours,
    ],
  },
  {
    title: "Typography",
    words: ["Modern", "Clean", "Authoritative"],
    plate: `${DNA}/typography.webp`, // cut from plate-10 — Copperplate + Helvetica
  },
  {
    title: "Usage",
    words: ["Consistency", "Protection", "Discipline"],
    plate: `${DNA}/usage.webp`, // cut from plate-11 — precautions
  },
];

export const TATA_WORK_BAND: TataBand & { photo: string; photoAlt: string } = {
  number: "04",
  kicker: "The work",
  headline: ["From identity", "to impact."],
  // The band's paragraph is TATA_WORK_INTRO (tataSections.ts) — the owner's own
  // account of the job, already written and already true. Nothing here.
  body: "",
  photo: `${PHOTO}/shot-dsc-7893.webp`,
  photoAlt: "A trainee at a machine in the campus workshop, in safety glasses.",
};

export const TATA_COLLABORATE: TataBand = {
  number: "05",
  kicker: "Let's build what's next",
  headline: ["Collaborate."],
  body:
    "Open to collaborations, commissions and the odd experiment — brand systems, campaigns, and the tools that keep them running.",
};
