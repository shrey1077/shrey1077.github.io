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

/* TATA_HERO (the 16:9 fly-through film and its poster) lived here until
 * 2026-08-17. The film was removed from the page, which left VideoHero and this
 * constant with no callers, so both went in the dead-code sweep.
 * ⚠ The MEDIA is still on disk and still ships: brand/hero.mp4 is 2.9MB and
 * brand/hero-poster.jpg 110KB, both now unreferenced by any page.
 * `scripts/prepare-tata-experience.mjs` still regenerates the poster. */

export const TATA_DESCRIPTION =
  "Tata Indian Institute of Skills (Tata IIS) is a Tata Group initiative, in partnership with the Ministry of Skill Development and Entrepreneurship (MSDE), established to build world-class skill institutes in Mumbai and Ahmedabad. Backed by Tata values, we deliver industry-grade, outcome-driven training in emerging technical and service skills, transforming India's demographic advantage into workplace excellence.";

/** Endorsement logos in the hero. `src` absent → a text lockup.
 *
 * ⚠ `ink` IS MEASURED, and it is what makes the four sit together. They are a
 * wordmark, two emblems and an emblem-plus-text, with ink aspect ratios from
 * 0.70 to 9.78 and canvases carrying between 0% and 28% padding. Sized by their
 * files — which is what the page did until 2026-09-23 — Tata Trusts came out
 * tiny and the Gujarat emblem came out huge. The layout instead gives each one
 * the same ink AREA, which is how the eye judges "same size" across shapes that
 * different, and it needs both numbers to do it:
 *   · `aspect` — the INK's width ÷ height (not the file's)
 *   · `fillH`  — how much of the file's height the ink actually uses
 *   · `box`    — the FILE's width ÷ height, which is what `object-contain`
 *                actually fits, so the element has to be shaped to it
 * Measured 2026-09-23 off the alpha and luminance of each PNG. ⚠ RE-MEASURE if
 * a file is replaced; a logo re-exported with different padding will silently
 * come out the wrong size. */
export const TATA_POWERED_BY: {
  name: string;
  src?: string;
  ink?: { aspect: number; fillH: number; box: number };
}[] = [
  {
    name: "Tata Trusts",
    src: `${BRAND}/powered/tata-trusts.png`,
    ink: { aspect: 9.78, fillH: 0.724, box: 640 / 87 },
  },
  {
    name: "Skill India",
    src: `${BRAND}/powered/skill-india.png`,
    ink: { aspect: 1.22, fillH: 0.859, box: 480 / 341 },
  },
  {
    name: "Government of Gujarat",
    src: `${BRAND}/powered/govt-gujarat.png`,
    ink: { aspect: 0.7, fillH: 0.9, box: 1 },
  },
  {
    name: "Ministry of Skill Development & Entrepreneurship",
    src: `${BRAND}/powered/msde.png`,
    ink: { aspect: 2.76, fillH: 1, box: 640 / 232 },
  },
];

/** px². The ink area every endorsement is scaled to — a 44×44 square's worth.
 *  Height then falls out as √(AREA / aspect), so a long wordmark comes out
 *  short and wide and a tall emblem narrow and tall, both weighing the same.
 *  ⚠ A floor on the height was tried and removed the same day: at 26px the
 *  9.8:1 Tata Trusts wordmark ran 254px wide and dwarfed the other three, which
 *  is the very thing this is here to stop. Area, and nothing else. The four
 *  together come to ~380px, which is what keeps them on one line in the hero's
 *  column — raising this wraps them.
 *  ⚠ 3200 until 2026-09-26, when the owner asked for the row to stay equal-area
 *  but sit smaller under the enlarged wordmark. */
export const POWERED_INK_AREA = 1900;

/** How much ink a logo in the two campus columns of band 01 covers. Bigger
 *  than the endorsements: these are the subject of that band, not a credit. */
export const CAMPUS_INK_AREA = 3200;

/** A logo's box, sized so its INK covers `area` px² however the file is padded.
 *
 * ⚠ THIS IS THE ONE PLACE THAT MATH LIVES. Three parts of the Tata page show
 * logos side by side — the hero's endorsements, band 01's two campuses, band
 * 02's family tree — and every one of them was getting it wrong in its own way
 * before: a wordmark against an emblem sized by file height comes out four
 * times too small, and the same pair sized by INK height still reads unequal
 * because a long mark at the same height covers far more paper.
 *
 * Equal ink AREA is what the eye actually reads as "the same size" across
 * shapes that different, so height falls out as √(area / inkAspect).
 *   · `aspect` — the INK's width ÷ height
 *   · `fillH`  — the fraction of the FILE's height the ink uses
 *   · `box`    — the FILE's width ÷ height, which is what object-contain fits
 * `padBottom` is the transparent slack under the ink, for pulling a row of
 * logos onto one baseline. All four Tata files pad symmetrically (measured). */
export function inkBox(ink: { aspect: number; fillH: number; box: number }, area: number) {
  const height = Math.sqrt(area / ink.aspect) / ink.fillH;
  return { height, width: height * ink.box, padBottom: (height * (1 - ink.fillH)) / 2 };
}

/** The circuit-grid texture behind the whole page.
 *
 *  ⚠ REPLACED 2026-09-26 by a file the owner supplied — same circuitry, but
 *  with a fine graph-paper grid across the full frame rather than only a
 *  vignette. `gridNEW.webp` (the old one, from `Grid-min.png`) is left on disk
 *  and is now referenced by nothing; delete it if the new wash sticks.
 *  ⚠ It is the PAGE wash only. The guideline columns wear `texture-iisa` /
 *  `texture-iism` instead (LogoSystem) — the note that used to claim this file
 *  did both was wrong. */
export const TATA_GRID = `${BRAND}/grid-2026.webp`;

/** The logo-guideline system (dedicated sections above the work). */
export const TATA_GUIDELINES = {
  wordmark: `${BRAND}/wordmark-black.png`,
  tataPlates: Array.from({ length: 12 }, (_, i) => `${BRAND}/guidelines/plate-${String(i + 1).padStart(2, "0")}.webp`),
  iisa: {
    logo: `${BRAND}/iisa.png`,
    plates: Array.from({ length: 6 }, (_, i) => `${BRAND}/guidelines-iisa/plate-${String(i + 1).padStart(2, "0")}.webp`),
    // ⚠ THE CAMPUS'S OWN RATIONALE, condensed — not a description of how the
    // mark looks. The owner supplied Ahmedabad's on 2026-09-26 ("inspired by
    // the tree of knowledge… interspersed dots representing various skills…
    // the bark represents individuals with different mindsets coming together
    // with a common purpose of growth… one can subtly see the acronym IIS,
    // which also represents students as figurines") and said the line that
    // stood here before — an invented one about navy and orange stems — was
    // wrong. Do not reword these into something that scans better: they are
    // the institute explaining its own mark.
    line:
      "The tree of knowledge: dots through the canopy for the skills taught, a bark of individuals grown to one purpose, and the letters IIS standing in it as figures.",
    colours: [
      { hex: "#0d3857", name: "Blue" },
      { hex: "#ed6f24", name: "Orange" },
    ],
    typography: `${BRAND}/guidelines-iisa/typography.webp`,
  },
  iism: {
    logo: `${BRAND}/iism.png`,
    plates: Array.from({ length: 6 }, (_, i) => `${BRAND}/guidelines-iism/plate-${String(i + 1).padStart(2, "0")}.webp`),
    // ⚠ Condensed from the Rationale plate in Mumbai's OWN rulebook
    // (guidelines-iism/plate-02): "Two parallelograms with triangles,
    // incrementally placed alongside an elevated 'S,' symbolize rising
    // expertise and progression. The bold Poppins font… conveys modernity and
    // structure… embodies stability, aspiration, and IIS Mumbai's
    // forward-thinking vision." The line that stood here before was invented
    // and, like Ahmedabad's, wrong.
    line:
      "Two parallelograms and triangles climbing an elevated S: rising expertise and progression, set in bold Poppins for stability and structure.",
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
