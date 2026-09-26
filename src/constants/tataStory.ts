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

/** The two campus photographs the owner supplied on 2026-09-26 —
 *  `scripts/prepare-tata-campus.mjs` re-encodes them and keeps the originals. */
const CAMPUS = "/content/clients/tata-iis/campus";
const BRAND = "/content/clients/tata-iis/brand";
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

/** Band 01. It was "The institute" against a single campus photograph until
 *  2026-09-26, when the owner turned it into the institute introducing ITSELF —
 *  both campuses, each with its own building and its own paragraph. */
export const TATA_WHO: TataBand = {
  number: "01",
  kicker: "The institute",
  headline: ["Who we are."],
  body:
    "Tata IIS is a Section 8 company set up by the Tata Group. It runs two campuses — Ahmedabad and Mumbai — each built with the Ministry of Skill Development & Entrepreneurship.",
  rail: ["Skills", "People", "Progress", "Opportunity"],
};

/** The two campuses, side by side under 01.
 *
 * ⚠ THE PARAGRAPHS ARE THE CLIENT'S OWN, supplied verbatim by the owner on
 * 2026-09-26 — the acreage, the villages, the partner ministries and the
 * Section 8 status all come from them. Do not paraphrase them into something
 * that reads better; they are the institute describing itself, and the numbers
 * in them are checkable facts about a real organisation.
 *
 * ⚠ BOTH CAMPUSES HAVE A FILM. Ahmedabad's was easy to find; Mumbai's was
 * filed as `All Logos/Color_1.mp4` — by number, not by campus — and only
 * turned up on 2026-09-26 when the owner said it existed. A column with no
 * `film` still renders as the photograph alone (see CampusTheme), so the pair
 * can lose one without breaking.
 *
 * ⚠ `ink` is measured, and `inkBox` (tataExperience.ts) turns it into a box.
 * iism.png is an 800×800 canvas with its ink in the middle 32%; iisa.png fills
 * its frame. The two marks are also different SHAPES — Ahmedabad stacks its
 * name under the symbol at 1.35:1, Mumbai sets it alongside at 2.98:1 — so
 * matching their heights still leaves them looking unequal. Equal ink area
 * does not. */
export const TATA_CAMPUS_PROFILES = [
  {
    label: "IIS Ahmedabad",
    logo: TATA_GUIDELINES.iisa.logo,
    ink: { aspect: 1.35, fillH: 1, box: 800 / 593 },
    /** ⚠ ORDER IS THE POINT — frontage, lab entrance, workshop floor: outside
     *  in. Band 01 plays them in this order, three seconds each, after the
     *  campus film. */
    photos: [
      {
        src: `${CAMPUS}/iisa-frontage.webp`,
        alt: "The IIS Ahmedabad building, its name lettered across the upper facade.",
      },
      {
        src: `${CAMPUS}/iisa-lab-1.webp`,
        alt: "Lab 1 at the IIS Ahmedabad campus, with the institute's standee at the foot of the steps.",
      },
      {
        src: `${CAMPUS}/iisa-workshop.webp`,
        alt: "The workshop floor at IIS Ahmedabad, seen from the gantry: vehicle bays, benches and trainees at work.",
      },
    ],
    /** ⚠ THE CAMPUS'S OWN LOGO STING, and only Ahmedabad has one. It plays,
     *  the photograph holds for five seconds, and it plays again — the owner's
     *  ask, 2026-09-26. `scripts/prepare-tata-theme.mjs` makes this web copy
     *  from the archive master (6.4MB → 121KB, audio stripped). A campus with
     *  no `film` simply shows its photograph; see CampusTheme. */
    film: `${CAMPUS}/iisa-theme.mp4`,
    text:
      "The Indian Institute of Skills (IIS) Ahmedabad, established by Tata IIS (a Section 8 company set up by the Tata Group) in collaboration with the Ministry of Skill Development & Entrepreneurship (MSDE) and the Government of Gujarat (GoG), aims to empower India’s youth. Located on a 20-acre campus in Nasmed village, it features state-of-the-art infrastructure designed for job-oriented learning. With advanced labs and classrooms, IIS Ahmedabad is dedicated to equipping youth with the essential skills needed for professional success.",
  },
  {
    label: "IIS Mumbai",
    logo: TATA_GUIDELINES.iism.logo,
    ink: { aspect: 2.98, fillH: 0.32, box: 1 },
    /** One, for now: the owner said to wait for Mumbai's set. The column runs
     *  the same cycle with a single stop until they arrive. */
    photos: [
      {
        src: `${CAMPUS}/iism-facade.webp`,
        alt: "The glazed frontage of the IIS Mumbai campus at Chunabhatti.",
      },
    ],
    /** Mumbai's own sting — the teal counterpart to Ahmedabad's orange. Same
     *  length, same structure, each ending on its campus URL. */
    film: `${CAMPUS}/iism-theme.mp4`,
    text:
      "The Indian Institute of Skills Mumbai, established by Tata IIS (a Section 8 company set up by the Tata Group) in collaboration with the Ministry of Skill Development & Entrepreneurship (MSDE), Government of India, aims to empower India’s youth. Located on a 4+ acre campus in Chunabhatti, it features state-of-the-art infrastructure designed for job-oriented learning. With advanced labs and classrooms, IIS Mumbai is dedicated to equipping youth with the essential skills needed for professional success.",
  },
];

export const TATA_SYSTEM: TataBand = {
  number: "02",
  kicker: "The system",
  headline: ["A mark", "rewritten."],
  body:
    "The institute already had a wordmark when its ownership moved to Tata Trusts. What it did not have was a reason to look the way it did — so the mark was rebuilt around the one thing the new parent already owned: its typeface.",
  rail: ["Learn", "Practice", "Build", "Belong"],
};

/** 02's first movement: the wordmark before and after.
 *
 * ⚠ WHAT IS ASSERTED HERE IS WHAT THE FILES SAY. The new mark's own artwork
 * (`logo guidelines/TATA IIS Logo.ai`, `Precaution_logo.pdf`) names Copperplate
 * Gothic Bold and Helvetica LT Std; the Tata Trusts logo file names Copperplate
 * Gothic Bold too, which is what makes "the Tata Trusts font" checkable rather
 * than folklore; and plate 12 of the rulebook states it outright — "Designed in
 * the signature Tata Trusts font". The 4:1 ratio and its fourfold reading are
 * quoted from that same plate.
 *
 * ⚠ THE OLD WORDMARK'S FACE IS DELIBERATELY NOT NAMED. Its artwork is fully
 * outlined — no font data survives in it — and the owner's recollection of
 * Myriad Pro does not hold up against the letterforms: Myriad's cap A has a
 * pointed apex and the old mark's is flat, which rules it out. Rendered against
 * the usual suspects it sits closest to Titillium, but "closest" is not a name,
 * so the page says what can be seen instead. Name it here only when someone can
 * point at a file. */
export const TATA_LOGO_STORY = {
  before: {
    label: "Before",
    mark: `${BRAND}/legacy-wordmark.webp`,
    markAlt: "The institute's earlier wordmark: TATA IIS in blue, over its full name.",
    caption: "A humanist sans, beside the Tata group mark.",
  },
  after: {
    label: "After",
    mark: TATA_GUIDELINES.wordmark,
    markAlt: "The current Tata IIS wordmark, set in Copperplate Gothic Bold.",
    caption: "Copperplate Gothic Bold — the Tata Trusts face.",
  },
  /** The argument, in the order it happened.
   *  ⚠ It ran to four until 2026-09-27, when the owner cut "The handover" and
   *  "The brief". The handover is still in the band's opening paragraph, so
   *  nothing about the ownership change was lost with them. */
  steps: [
    {
      title: "The proposal",
      text: "Rather than draw a new voice, adopt the parent's. I put Copperplate Gothic Bold — Tata Trusts' own face — to the institute's name.",
    },
    {
      title: "The rulebook",
      text: "It carried: \u201cDesigned in the signature Tata Trusts font\u201d, at a fixed 4:1 ratio the guidelines read as fourfold growth \u2014 academic excellence, industry relevance, skill development, sustainability.",
    },
  ],
} as const;

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
      ink: { aspect: 1.35, fillH: 1, box: 800 / 593 },
    },
    {
      label: "IIS Mumbai",
      logo: TATA_GUIDELINES.iism.logo,
      line: TATA_GUIDELINES.iism.line,
      colours: TATA_GUIDELINES.iism.colours,
      // ⚠ MEASURED, not eyeballed, and fed to `inkBox` — iism.png is an 800×800
      // canvas whose ink sits in rows 272–528 (32% of its height) while
      // iisa.png fills its frame edge to edge, and the two marks are different
      // shapes besides. Sized by their files the Mumbai mark came out a third
      // of Ahmedabad's, which is what the old page did.
      // Re-measure if either file is replaced.
      ink: { aspect: 2.98, fillH: 0.32, box: 1 },
    },
  ],
} as const;

/** 02's second movement. It was band 03 until 2026-09-28, when the owner asked
 *  for the whole identity story to live in one section. */
export const TATA_DNA = {
  kicker: "What the rulebook fixes",
  body:
    "The rest is law, so the mark holds at any size: built on a grid at that 4:1 ratio, the full name aligned under the initials, a 2x exclusion zone it never gives up, two licensed faces, and a colour that survives print, screen and a fifteen-foot ceremony backdrop.",
};

/** 02's third movement — the parent mark and its two campuses. */
export const TATA_IDENTITIES = {
  kicker: "One vision, three identities",
  body:
    "Two campuses opened under that mark, and each needed a voice of its own without breaking from it. All three rulebooks share the same construction, exclusion zone and behaviour, and part company only on colour and geometry.",
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

export const TATA_WORK_BAND: TataBand = {
  // ⚠ 04 until 2026-09-28. Brand DNA folded into 02, so everything after it
  // moved up one; the numbers are hand-set, not derived.
  number: "03",
  kicker: "The work",
  headline: ["From identity", "to impact."],
  // The band's paragraph is TATA_WORK_INTRO (tataSections.ts) — the owner's own
  // account of the job, already written and already true. Nothing here.
  body: "",
  // ⚠ It carried a photograph (Photography/shot-dsc-7893) until 2026-09-28.
  // The showcase under the band is a large display in its own right, so the
  // band was showing a picture and then a picture; the owner dropped it. The
  // file is untouched and still in its room.
};

export const TATA_COLLABORATE: TataBand = {
  number: "04",
  kicker: "Let's build what's next",
  headline: ["Collaborate."],
  body:
    "Open to collaborations, commissions and the odd experiment — brand systems, campaigns, and the tools that keep them running.",
};
