/**
 * Azoth Biotech — bespoke full-experience configuration.
 *
 * Azoth Biotech was the parent client (complete branding, collateral, social
 * and web design). Beneath it we built a family of brands; Mycoveda was a
 * separate client, still in development (logo only). This file holds the copy,
 * the palette and the brand taxonomy; AzothExperience is the layout.
 *
 * ⚠ RE-COMPOSED 2026-10-06 (owner: "redo the azoth page… use the new color
 * logo, and recompose all info on the page"). Everything under the hero was
 * laid out again, around the COLOUR LOCKUP — the teal monogram over the navy
 * wordmark, supplied 2026-10-03 — and its two inks, which replaced the
 * "derived" four-colour palette (#147d6e / #4eb8af / #1c2b28 / #f2971e) that
 * stood here before: that palette was read off the built work, not the logo,
 * and the logo is the authority. git has the old palette and layout.
 *
 * ⚠ The words are the repo's own: the tagline, scope and brand blurbs as they
 * stood; the master-mark story and the sub-brand captions are the catalogue's
 * (catalogue/Brand Identity and catalogue/Sub-brands, _meta.json); the role,
 * years, city and site are clients.ts's and CareerTimeline's. Nothing here
 * states a new fact about the client.
 */

const BASE = "/content/clients/azoth-biotech";
const BRAND = `${BASE}/brand`;
const MARKS = `${BRAND}/marks`;
const CATALOGUE = `${BASE}/catalogue`;

/** The logo's two inks, sampled from the colour lockup's flats. */
export const AZOTH_INK = {
  teal: "#28A898",
  navy: "#283078",
} as const;

export const AZOTH = {
  /** The colour lockup — the page's logo since 2026-10-06. */
  logo: { src: `${MARKS}/lockup-stacked-colour.webp`, w: 647, h: 705 },
  accent: AZOTH_INK.teal,
  ink: AZOTH_INK.navy,
  tagline: "A biotech house growing medicine, materials and market-ready brands out of mushrooms.",
  scope:
    "Azoth Biotech was the parent client — the full remit: brand identity, print & packaging collateral, a running social-media system, and website design. Under that umbrella we grew a family of brands, each with its own voice.",
  /** The masthead's facts — clients.ts and CareerTimeline. */
  facts: [
    { label: "Role", value: "Web & Graphic Designer" },
    { label: "Years", value: "2020 — 2023" },
    { label: "Based", value: "Noida, Uttar Pradesh" },
    { label: "Site", value: "azothbiotech.com", href: "https://azothbiotech.com" },
  ],
};

/** The page's chapters, in order — the masthead's index links down to each. */
export const AZOTH_CHAPTERS = [
  { id: "mark", n: "01", label: "The mark" },
  { id: "system", n: "02", label: "The system" },
  { id: "family", n: "03", label: "The family" },
  { id: "naturalist", n: "04", label: "Naturalist" },
  { id: "mushroomworks", n: "05", label: "Mushroomworks" },
  { id: "house", n: "06", label: "The house" },
  { id: "explorations", n: "07", label: "Explorations" },
] as const;

/** 01 — the mark: the brief (catalogue), and how it was built (the page's own). */
export const AZOTH_MARK_STORY = {
  headline: "Make biology feel engineered.",
  brief:
    "Twelve directions were drawn — helixes, flasks, monograms — before the answer arrived from the organism itself: a mycelial network, clipped by a perfect circle, precise enough for a pharma label and alive enough for a festival post.",
  build:
    "The monogram began as a culture: strains of mycelium branching across a petri dish, the letters of Azoth hidden in their forks. The sketch set the rule — hyphae on one diagonal, branches on the level — and the final mark tightened it onto a strict grid, rounded at every tip like living growth.",
};

/** The identity files the owner supplied on 2026-10-03, prepared by
 *  scripts/prepare-azoth-marks.mjs: the monogram, the sketch it was built
 *  from, and its three lockups. Sizes are the prepared files' own. */
export const AZOTH_MARK = {
  mark: { src: `${MARKS}/mark-black.webp`, w: 845, h: 1087 },
  /** The master mark — the monogram CLIPPED by its circle (catalogue, Brand
   *  Identity). Black on transparent, so the page masks it to teal. */
  seal: { src: `${CATALOGUE}/Brand Identity/azoth-master-mark.webp`, w: 739, h: 739 },
  construction: { src: `${MARKS}/mark-construction.webp`, w: 1100, h: 1038 },
  inks: [
    { name: "Culture teal", hex: AZOTH_INK.teal, role: "The signal — the mark, and one accent per surface." },
    { name: "Lab navy", hex: AZOTH_INK.navy, role: "The voice — the wordmark, headlines, the reversed ground." },
  ],
  /** Each on the plate it is meant for — the reversed one only reads on navy. */
  lockups: {
    horizontal: { name: "Horizontal", src: `${MARKS}/lockup-horizontal-black.webp`, w: 433, h: 115, plate: "#f4f5f7" },
    reversed: { name: "Horizontal, reversed", src: `${MARKS}/lockup-horizontal-white.webp`, w: 482, h: 123, plate: AZOTH_INK.navy },
    stacked: { name: "Stacked, colour", src: `${MARKS}/lockup-stacked-colour.webp`, w: 647, h: 705, plate: "#ffffff" },
  },
};

/** 02 — the system's own line (catalogue), and its type, as the page has
 *  always described it (no face is named: the files do not say). */
export const AZOTH_SYSTEM = {
  line: "The chrome stays neutral so one teal reads as the signal.",
  type: {
    display: "Geometric grotesque",
    displayNote:
      "A confident geometric sans carries the wordmarks — even strokes, circular bowls, engineered like the lab it speaks for.",
    text: "Neutral humanist sans",
    textNote: "Body and captions stay in a quiet humanist sans for long-form legibility.",
  },
};

export interface AzothBrand {
  id: string;
  name: string;
  descriptor: string;
  accent: string;
  logo: string;
  /** The catalogue's one-line caption for the brand's mark. */
  caption: string;
  blurb?: string;
}

/** 03 — the family: the lines proposed under the house — five in the
 *  catalogue, four on the page since Lion's Mane came off (2026-10-26) (catalogue,
 *  Sub-brands: "Mushroomworks, MycoActives, Kavaka, Lion's Mane, The
 *  Naturalist"). Lion's Mane has no standalone mark — its node is its name. */
export const AZOTH_BRANDS: AzothBrand[] = [
  {
    id: "naturalist",
    name: "Naturalist Nootropics",
    descriptor: "Functional-mushroom nutraceuticals",
    accent: "#f2971e",
    logo: `${BRAND}/brands/naturalist.png`,
    caption: "The field-notes voice.",
    blurb:
      "Cordyceps and lion's mane, reframed as everyday performance — an editorial social system that teaches the science while it sells.",
  },
  {
    id: "mushroomworks",
    name: "Mushroomworks",
    descriptor: "Mycelium materials — packaging & vegan leather",
    accent: AZOTH_INK.teal,
    // The official mark, the gear, since 2026-10-26 (owner: "this is the
    // official logo for mushroomworks"; scripts/prepare-azoth-official-
    // marks.mjs). The MW-and-arrow mark, `mushroomworks.png`, stood here
    // until then, captioned "The cap that grows into an arrow."
    logo: `${BRAND}/brands/mushroomworks-gear.png`,
    caption: "A mushroom at the hub of a gear.",
    blurb:
      "Growing packaging and leather from mycelium — a brand for a material that replaces plastic and hide, told with hard numbers and clean product frames.",
  },
  {
    id: "mycoactive",
    name: "MycoActives",
    descriptor: "Active mushroom supplements",
    accent: "#111111",
    logo: `${BRAND}/brands/mycoactive.png`,
    caption: "Bolt-stemmed, energy-first.",
  },
  {
    id: "kavaka",
    name: "Kavaka",
    descriptor: "Proposed line",
    accent: "#111111",
    logo: `${BRAND}/brands/kavaka.png`,
    caption: "The Sanskrit name, drawn as a mark.",
  },
  // Lion's Mane stood here, a proposed line with no mark of its own, until
  // 2026-10-26 (owner: "remove this").
];

/** Mycoveda — a separate client, not part of the Azoth family. */
export const AZOTH_MYCOVEDA = {
  name: "Mycoveda",
  /** The official mark since 2026-10-26 (owner: "this is official logo for
   *  mycoveda"); the Devanagari-style wordmark, `mycoveda.png`, until then. */
  logo: `${BRAND}/brands/mycoveda-lockup.png`,
  logoAspect: 532 / 586,
  /** What the mark is (owner: "correct with new logo and description
   *  relevant to it"). */
  note:
    "Mycoveda sits apart — a separate client. Its mark is an arched window onto the forest floor: mycelium branching through the upper half, a mushroom cap at its heart, and rays fanning out beneath it, the fungus as a source of light. Under it, the name in a rounded geometric hand — myco, fungi, joined to veda, knowledge.",
};

/** 04 — Naturalist's brand board, and Brain Fuel as packaged. */
export const AZOTH_NATURALIST_ARTWORK = { src: `${BRAND}/naturalist-artwork.webp`, w: 1600, h: 1688 };
export const AZOTH_BRAIN_FUEL = { src: `${MARKS}/naturalist-brain-fuel.webp`, w: 800, h: 1422 };
export const AZOTH_BRAIN_FUEL_NOTE =
  "The first product to wear the system: a 100 ml nootropic tincture — Cordyceps militaris and Lion's Mane with L-Alpha GPC, L-Theanine and Bacopa. The label turns the wordmark on its side and lets one condensed line, Brain Fuel, do the talking; the rest stays white, like the lab it came from.";

/** 05 — Mushroomworks' system sheet (catalogue). */
export const AZOTH_MUSHROOMWORKS_SHEET = { src: `${CATALOGUE}/Sub-brands/mushroomworks-system.webp`, w: 2000, h: 2828 };

/** 06 — the parent's own programme: training, and its festival moment. */
export const AZOTH_HOUSE = {
  line:
    "Beyond the family brands, the parent ran its own programme — research, training and certification, held together by the same identity.",
  pieces: [
    { src: `${BASE}/work/azoth/training.webp`, w: 1080, h: 1350, caption: "Research projects & dissertation — the training programme." },
    {
      src: `${CATALOGUE}/Brand Identity/dusshera-campaign-post.webp`,
      w: 1600,
      h: 2000,
      caption: "Dusshera, said in brand language: strike out your daemons.",
    },
  ],
};

/** 07 — the exploration sheets — "there were a lot." */
export const AZOTH_REJECTED = [
  { name: "Azoth Biotech", src: `${BRAND}/rejected/azoth.webp`, w: 1400, h: 1980 },
  { name: "Mushroomworks", src: `${BRAND}/rejected/mushroomworks.webp`, w: 1400, h: 1980 },
  { name: "Mycoveda", src: `${BRAND}/rejected/mycoveda.webp`, w: 1400, h: 1980 },
];
