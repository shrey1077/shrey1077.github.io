/**
 * The five-panel showcase under band 04 — what each panel is, and where its
 * artwork comes from.
 *
 * The owner asked on 2026-09-27 for a composition of angled boxes running the
 * full width beneath the description: five panels around one large central
 * display. The centre shows artwork at random until a panel is hovered, and
 * then shows that panel's work, with a heading and a line about it underneath.
 *
 * ⚠ THE FIVE ARE THE OWNER'S, AND THEY ARE NOT THE SIX ROOMS. The rooms below
 * are navigation (Brand Guidelines, Print, Digital, Photo/Videography,
 * Proposals, AI Apps Dashboard); these are a showreel — Brand, Print, Digital,
 * Photography, Video editing. Photography and Video editing are one room but
 * two panels here, which is the point: the showcase is about the work, not
 * about where it is filed.
 *
 * ⚠ NOTHING HERE IS A NEW ASSET. Every panel draws on folders the catalogue
 * already carries, so the showcase cannot drift from what the page holds: add
 * a brochure to the Brochures folder and it joins the Print panel's pool on the
 * next build. Brand is the exception and uses the rulebook plates, which are
 * not catalogue folders.
 *
 * ⚠ The tints are the campuses' OWN hexes (TATA_GUIDELINES), not sampled from
 * the reference composition the owner sent, whose colours are arbitrary.
 *
 * ⚠ `cover` IS DECORATION, `folders` IS EVIDENCE, and the difference matters on
 * a client's page. The covers are composites the owner supplied on 2026-09-27 —
 * devices showing a site that does not exist as drawn, print pieces that are
 * not the real brochures — and they dress the panels. What the CENTRE plays is
 * the catalogue: the actual work, as delivered. Never promote a cover into the
 * centre's pool.
 */

import { TATA_GUIDELINES } from "@/constants/tataExperience";

const SHOWCASE = "/content/clients/tata-iis/showcase";

/** The grid-line artwork the owner supplied for the band to sit on. */
export const TATA_SHOWCASE_GRID = `${SHOWCASE}/grid-lines.webp`;

export interface ShowcasePanel {
  id: string;
  /** "01"… — fixed, because the owner numbered them. */
  number: string;
  label: string;
  /** The line under the heading in the central box. */
  blurb: string;
  /** Panel tint, from the campus palettes. */
  tint: string;
  /** The panel's cover art — decoration, not the work. See the note above. */
  cover: string;
  /** How this panel's artwork sits in the central hexagon. Printed matter and
   *  plates are CONTAINED — cropping a brochure page to a wide hexagon leaves a
   *  band of unreadable columns. Photographs and screens COVER it. */
  fit: "cover" | "contain";
  /** Catalogue folder ids this panel's artwork is drawn from, in order. */
  folders: string[];
  /** Artwork that is not in the catalogue — the rulebook plates. */
  plates?: string[];
}

/** How many images each panel contributes. Enough to keep the idle rotation
 *  from repeating quickly, few enough that the page is not loading fifty
 *  plates for a decorative panel. */
export const SHOWCASE_PER_PANEL = 5;

export const TATA_SHOWCASE: ShowcasePanel[] = [
  {
    id: "brand",
    number: "01",
    label: "Brand",
    blurb: "The wordmark, its construction and the rules that keep it itself.",
    tint: "#0d3857", // IISA blue
    cover: `${SHOWCASE}/brand.webp`,
    fit: "contain",
    folders: [],
    plates: TATA_GUIDELINES.tataPlates.slice(0, SHOWCASE_PER_PANEL),
  },
  {
    id: "print",
    number: "02",
    label: "Print",
    blurb: "Brochures, posters and certificates — ink on every surface the institute owns.",
    tint: "#ed6f24", // IISA orange
    cover: `${SHOWCASE}/print.webp`,
    fit: "contain",
    folders: ["brochures", "campus-posters", "certificates"],
  },
  {
    id: "digital",
    number: "03",
    label: "Digital",
    blurb: "Mockups, socials and screens: the brand as it meets people online.",
    tint: "#00a2b4", // IISM teal
    cover: `${SHOWCASE}/digital.webp`,
    fit: "cover",
    folders: ["mockups", "socials-and-screens"],
  },
  {
    id: "photography",
    number: "04",
    label: "Photography",
    blurb: "Campus, labs and trainees, shot on site. No stock, ever.",
    tint: "#502f7d", // IISM violet
    cover: `${SHOWCASE}/photography.webp`,
    fit: "cover",
    folders: ["photography"],
  },
  {
    id: "video",
    number: "05",
    label: "Video editing",
    blurb: "Films cut for launches, ceremonies and the feed.",
    tint: "#504596", // IISM indigo
    cover: `${SHOWCASE}/video.webp`,
    fit: "cover",
    // ⚠ The Films folder holds an .mp4 and a matching .jpg for each film. The
    // showcase takes the POSTERS: five films at ~19MB each is not a decorative
    // panel, and the films themselves are one click away in their room.
    folders: ["films"],
  },
];
