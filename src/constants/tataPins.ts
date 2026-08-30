/**
 * The Tata IIS experience's six rooms, as pins.
 *
 * The owner asked on 2026-08-25 for that page to work the way the landing does:
 * click a pin, the room opens. Three pins a side.
 *
 * ⚠ THE ORDER IS THE OWNER'S, not the content's. `TATA_SECTIONS` happens to
 * start with Digital; the brief lists Brand Guidelines, Print, Digital on the
 * left and Photo/Videography, Proposals, AI Apps Dashboard on the right, so
 * that is what this file fixes. Changing `TATA_SECTIONS` will not reorder the
 * pins, and should not.
 *
 * ⚠ `brand-guidelines` HAS NO ENTRY IN TATA_SECTIONS. It is rendered by its own
 * component (`GuidelineSections`), which predates the work sections and takes no
 * props. `section` is therefore null for it, and the board special-cases it —
 * see TataSectionsBoard.
 */

export interface TataPin {
  /** Matches a TATA_SECTIONS id, except for `brand-guidelines`. */
  id: string;
  label: string;
  side: "left" | "right";
  /** Position within its own column, top to bottom. */
  index: number;
}

export const TATA_PINS: TataPin[] = [
  { id: "brand-guidelines", label: "Brand Guidelines", side: "left", index: 0 },
  { id: "print", label: "Print", side: "left", index: 1 },
  { id: "digital", label: "Digital", side: "left", index: 2 },
  { id: "photo-videography", label: "Photo / Videography", side: "right", index: 0 },
  { id: "proposals", label: "Proposals", side: "right", index: 1 },
  { id: "ai-solutions", label: "AI Apps Dashboard", side: "right", index: 2 },
];

/** ⚠ The owner calls this room "AI Apps Dashboard"; the content constant calls
 *  it "AI Solutions". The pin label above wins on this page — the id is what
 *  joins them, and the id is unchanged so nothing else has to move. */
export const TATA_PIN_BY_ID = Object.fromEntries(TATA_PINS.map((p) => [p.id, p]));
