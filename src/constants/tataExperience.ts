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
  { name: "Ministry of Skill Development & Entrepreneurship" }, // text lockup
];

/** The logo-guideline system (dedicated sections above the work). */
export const TATA_GUIDELINES = {
  wordmark: `${BRAND}/wordmark-black.png`,
  tataPlates: Array.from({ length: 12 }, (_, i) => `${BRAND}/guidelines/plate-${String(i + 1).padStart(2, "0")}.webp`),
  iisa: {
    logo: `${BRAND}/iisa.png`,
    texture: `${BRAND}/texture-iisa.webp`,
    line: "A canopy of growth in navy and orange, rising from machined stems.",
  },
  iism: {
    logo: `${BRAND}/iism.png`,
    texture: `${BRAND}/texture-iism.webp`,
    plates: Array.from({ length: 6 }, (_, i) => `${BRAND}/guidelines-iism/plate-${String(i + 1).padStart(2, "0")}.webp`),
    line: "Teal and violet planes, angled like sheet metal in motion.",
  },
};

/** The four work families → the catalogue folder ids they gather.
 *  (Ids are folderToId of the catalogue folder names.) */
export const TATA_GROUPS: {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  children: string[];
}[] = [
  {
    id: "brand-logo-guidelines",
    title: "Brand & Logo Guidelines",
    blurb: "The identity as it's held, worn and awarded — the everyday proof a system works.",
    accent: "#14279B",
    children: ["certificates", "merchandise", "stationery"],
  },
  {
    id: "print-media",
    title: "Print Media",
    blurb: "Ink on every surface the institute owns — from an A5 flyer to a fifteen-metre hoarding.",
    accent: "#B5540F",
    children: [
      "billboards-and-signages",
      "brochures",
      "flyers-and-campaigns",
      "campus-posters",
      "banners",
      "lab-standees",
      "events",
    ],
  },
  {
    id: "digital-graphics",
    title: "Digital Graphics",
    blurb: "The brand in motion and on screen — films, a broadcast spot, the social system.",
    accent: "#0E7C66",
    children: ["films", "socials-and-screens"],
  },
  {
    id: "photography",
    title: "Photography",
    blurb: "Real campus, real labs, the work photographed in place. No stock, ever.",
    accent: "#3F4756",
    children: ["photography"],
  },
];

/** Partner marquee — the equipment & hiring partners the identity stands with. */
export const TATA_PARTNERS = [
  "siemens", "fanuc", "universal-robots", "zeiss", "mitutoyo", "festo",
  "makino", "markforged", "formlabs", "fronius", "hexagon", "tvs",
  "tata-motors", "taj-skyline",
].map((slug) => `${BRAND}/partners/${slug}.png`);

/** The four categories, mirrored on the homepage detail panel (circular nav). */
export const TATA_CIRCLES = TATA_GROUPS.map((g) => ({
  id: g.id,
  title: g.title,
  accent: g.accent,
}));

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
