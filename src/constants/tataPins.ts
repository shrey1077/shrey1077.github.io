/**
 * The Tata IIS experience's six rooms.
 *
 * The owner asked on 2026-08-25 for that page to work the way the landing does:
 * click, the room opens. It did that as six PINS, three a side, until
 * 2026-09-22, when the owner's redesign turned them into a row of six numbered
 * cards under "The Work". The behaviour is unchanged — this list still says
 * which rooms exist, in which order, and the board still opens exactly one of
 * them beneath itself. Only the presentation moved.
 *
 * ⚠ THE ORDER IS THE OWNER'S, not the content's. `TATA_SECTIONS` happens to
 * start with Digital; the brief lists Brand Guidelines, Print, Digital, then
 * Photo/Videography, Proposals, AI Apps Dashboard, so that is what this file
 * fixes. Changing `TATA_SECTIONS` will not reorder the rooms, and should not.
 *
 * ⚠ `side` and `index` are LEFTOVERS FROM THE PINS. They are what placed a pin
 * in its column; the card row reads this list straight through instead. They
 * are kept because they are still the owner's stated grouping and cost nothing,
 * but nothing lays anything out with them any more — the card's number is its
 * position in this array.
 *
 * ⚠ `brand-guidelines` HAS NO ENTRY IN TATA_SECTIONS. It is rendered by its own
 * component (`GuidelineSections`), which predates the work sections and takes no
 * props. The board special-cases it — see TataSectionsBoard.
 */

export interface TataPin {
  /** Matches a TATA_SECTIONS id, except for `brand-guidelines`. */
  id: string;
  label: string;
  side: "left" | "right";
  /** Position within its own column, top to bottom. Vestigial — see above. */
  index: number;
  /** The three or four words set under the card's title.
   *
   *  ⚠ THESE ARE OUR OWN SUBSECTIONS, not the mockup's. The owner's comp put
   *  generic words under each card ("TOOLS / AUTOMATION / EXPERIMENTS"); what a
   *  room actually contains is better, and it is already written down — these
   *  are `TATA_SECTIONS[].items` labels, shortened. Re-check them if a room's
   *  contents change. */
  keywords: string[];
}

export const TATA_PINS: TataPin[] = [
  {
    id: "brand-guidelines",
    label: "Brand Guidelines",
    side: "left",
    index: 0,
    // Not from TATA_SECTIONS — this room is the three rulebooks, so its words
    // are what those plates actually cover.
    keywords: ["Logo", "Colour", "Typography", "Usage"],
  },
  {
    id: "print",
    label: "Print",
    side: "left",
    index: 1,
    keywords: ["Brochures", "Posters", "Certificates", "Boards"],
  },
  {
    id: "digital",
    label: "Digital",
    side: "left",
    index: 2,
    keywords: ["Mockups", "Socials", "Films", "Presentations"],
  },
  {
    id: "photo-videography",
    label: "Photo / Videography",
    side: "right",
    index: 0,
    keywords: ["Photography", "Videography", "Campus", "Labs"],
  },
  {
    id: "proposals",
    label: "Proposals",
    side: "right",
    index: 1,
    keywords: ["Brand system", "Website", "Trifold"],
  },
  {
    id: "ai-solutions",
    label: "AI Apps Dashboard",
    side: "right",
    index: 2,
    keywords: ["Cerci", "H3LEN", "Screensaver"],
  },
];
