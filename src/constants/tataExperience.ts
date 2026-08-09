/**
 * Tata IIS — bespoke full-experience configuration.
 *
 * The Tata page diverges from the generic ClientExperience into a directed
 * layout: a 16:9 hero film → description + endorsements → the logo-guideline
 * system → a partner marquee → four expandable work families → a contact
 * footer. This file holds the copy and the taxonomy; assets come from the
 * already-curated catalogue folders (regrouped, not re-copied).
 */

const BRAND = "/content/clients/tata-iis/brand";

export const TATA_HERO = {
  poster: `${BRAND}/hero-poster.jpg`,
  /** The 16:9 fly-through film — plays once on load and freezes on its last
   *  frame (poster is that last frame). Replace this file to swap the hero. */
  src: `${BRAND}/hero.mp4` as string | undefined,
};

export const TATA_DESCRIPTION =
  "Tata Indian Institute of Skills (Tata IIS) is a Tata Group initiative, in partnership with the Ministry of Skill Development and Entrepreneurship (MSDE), established to build world-class skill institutes in Mumbai and Ahmedabad. Backed by Tata values, we deliver industry-grade, outcome-driven training in emerging technical and service skills, transforming India's demographic advantage into workplace excellence.";

/** Endorsement logos beneath the hero. `src` absent → a text lockup. */
export const TATA_POWERED_BY: { name: string; src?: string }[] = [
  { name: "Tata Trusts", src: `${BRAND}/powered/tata-trusts.png` },
  { name: "Skill India", src: `${BRAND}/powered/skill-india.png` },
  { name: "Government of Gujarat", src: `${BRAND}/powered/govt-gujarat.png` },
  { name: "Ministry of Skill Development & Entrepreneurship", src: `${BRAND}/powered/msde.png` },
];

/** The circuit-grid texture (`gridNEW`) — the page body wash and the whisper
 *  behind the IISA / IISM guideline columns. Source: user's `Grid-min.png`. */
export const TATA_GRID = `${BRAND}/gridNEW.webp`;

/** The logo-guideline system (dedicated sections above the work). */
export const TATA_GUIDELINES = {
  wordmark: `${BRAND}/wordmark-black.png`,
  tataPlates: Array.from({ length: 12 }, (_, i) => `${BRAND}/guidelines/plate-${String(i + 1).padStart(2, "0")}.webp`),
  iisa: {
    logo: `${BRAND}/iisa.png`,
    plates: Array.from({ length: 6 }, (_, i) => `${BRAND}/guidelines-iisa/plate-${String(i + 1).padStart(2, "0")}.webp`),
    line: "A canopy of growth in navy and orange, rising from machined stems.",
    colours: [
      { hex: "#0d3857", name: "Blue" },
      { hex: "#ed6f24", name: "Orange" },
    ],
    typography: `${BRAND}/guidelines-iisa/typography.webp`,
  },
  iism: {
    logo: `${BRAND}/iism.png`,
    plates: Array.from({ length: 6 }, (_, i) => `${BRAND}/guidelines-iism/plate-${String(i + 1).padStart(2, "0")}.webp`),
    line: "Teal and violet planes, angled like sheet metal in motion.",
    colours: [
      { hex: "#502f7d", name: "Violet" },
      { hex: "#00a2b4", name: "Teal" },
      { hex: "#504596", name: "Indigo" },
    ],
    typography: `${BRAND}/guidelines-iism/typography.webp`,
  },
};

/** Little product-mockup cutouts (transparent PNGs) that badge each work
 *  subsection tile. Generated from two OpenArt contact
 *  sheets and sliced by `scripts/slice-tata-mockups.mjs`; keep those in sync. */
export const TATA_MOCKUPS = `${BRAND}/mockups`;
/** Cutout badged onto a subsection tile — `sub-<folderId>.png`. */
export const tataSubcatMockup = (subcatId: string) => `${TATA_MOCKUPS}/sub-${subcatId}.png`;

/** Partner marquee — the equipment & hiring partners the identity stands with. */
export const TATA_PARTNERS = [
  "siemens", "fanuc", "universal-robots", "zeiss", "mitutoyo", "festo",
  "makino", "markforged", "formlabs", "fronius", "hexagon", "tvs",
  "tata-motors", "taj-skyline",
].map((slug) => `${BRAND}/partners/${slug}.png`);

export const TATA_FOOTER = {
  contact: {
    email: "admissions@tataiis.org",
    phone: "+91 99090-24217",
  },
  campuses: [
    {
      name: "IIS Ahmedabad",
      address: "Survey No: 654, Nasmed, Taluka Kalol, District Gandhinagar - 382721",
    },
    {
      name: "IIS Mumbai",
      address: "Inside NSTI Campus, Chunabhatti, Mumbai 400 022",
    },
  ],
  cin: "U93000MH2020NPL338639",
};
