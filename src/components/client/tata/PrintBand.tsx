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
  const tiles: PrintTile[] = (print?.items ?? [])
    .map((item) => {
      const assets = item.folder ? (readCatalogueCategory(SLUG, item.folder)?.assets ?? []) : [];
      const images = assets.filter((a) => a.kind === "image");
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
