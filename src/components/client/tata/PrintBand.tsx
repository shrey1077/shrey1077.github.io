/**
 * PrintBand — band 05 of the Tata IIS page: Print, with all its subsections
 * (owner, 2026-10-04).
 *
 * Every subsection of the Print room as one tile on one wall (PrintWall,
 * 2026-10-05) — it was the room laid open, a slider and sixteen tiles that
 * each opened another slider. The subsections and their order are Print's in
 * TATA_SECTIONS, so the wall and the catalogue pages cannot disagree; one
 * with nothing in it yet is left off the wall.
 *
 * Server Component: it reads the catalogue; PrintWall brings its own client
 * boundary.
 */

import { PrintWall, type PrintTile } from "@/components/client/tata/PrintWall";
import { readCatalogueCategory } from "@/content/catalogue";
import { TATA_SECTIONS } from "@/constants/tataSections";
import { pieceName, tataPlate } from "@/constants/tataPlates";
import { TATA_PRINT_BAND } from "@/constants/tataStory";
import { onTataPage, TATA_PRINT_FIRST, TATA_PRINT_MOVES } from "@/constants/tataCull";

const SLUG = "tata-iis";

/** ⚠ WHAT A TILE MAY SHOW AT REST. The visiting cards carry real staff names,
 *  numbers and emails, and the ID cards a trainee's photograph — so their
 *  tiles turn only through the sides that carry neither (the Tata IIS
 *  fronts, the card backs, the mockups). The cards themselves are a click
 *  away in the viewer, as they were in the Print room. By file name. */
const PREVIEW: Record<string, RegExp> = {
  "Visiting Cards": /mockup|card-0[13]$|-0[13]$/,
  "ID Cards": /back|mockup/,
};

export function PrintBand() {
  const print = TATA_SECTIONS.find((s) => s.id === "print");
  const items = print?.items ?? [];
  // Each set's pictures as the page shows them (owner's cull, 2026-10-17 —
  // constants/tataCull.ts): the ones taken off left out, the ones filed in
  // the wrong set moved to the right one (before its mockup, if it has one),
  // and a chosen piece at the head of its set.
  const imagesOf = (folder?: string) =>
    (folder ? (readCatalogueCategory(SLUG, folder)?.assets ?? []) : []).filter((a) => a.kind === "image" && onTataPage(a.url));
  const sets = new Map(items.map((item) => [item.label, imagesOf(item.folder)]));
  for (const move of TATA_PRINT_MOVES) {
    const from = sets.get(move.from);
    const to = sets.get(move.to);
    const at = from?.findIndex((a) => a.name === move.file) ?? -1;
    if (!from || !to || at < 0) continue;
    const [piece] = from.splice(at, 1);
    const mock = to.findIndex((a) => /^mockup/.test(a.name));
    to.splice(mock < 0 ? to.length : mock, 0, piece);
  }
  for (const [label, file] of Object.entries(TATA_PRINT_FIRST)) {
    const set = sets.get(label);
    const at = set?.findIndex((a) => a.name === file) ?? -1;
    if (set && at > 0) set.unshift(...set.splice(at, 1));
  }
  const tiles: PrintTile[] = items
    .map((item) => {
      const images = sets.get(item.label) ?? [];
      const only = PREVIEW[item.label];
      return {
        key: item.label,
        label: item.label,
        plates: images.map((a) => tataPlate(a.url, `${item.label} — ${a.caption ?? pieceName(a.name)}`)),
        previews: only && images.flatMap((a, i) => (only.test(a.name) ? [i] : [])),
      };
    })
    .filter((t) => t.plates.length > 0);

  return <PrintWall band={TATA_PRINT_BAND} tiles={tiles} />;
}
