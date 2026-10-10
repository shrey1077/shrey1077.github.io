/**
 * MockupsBand — band 04 of the Tata IIS page: the staged applications, in
 * the three themes (owner, 2026-10-04).
 *
 * Every themed mockup the archive holds (catalogue folder `mockups`, from
 * Assets/Clients/Tata IIS/Digital/Mockups), all of them on one moving wall
 * since 2026-10-05 (MockupWall) — it was a theme slider, one at a time.
 *
 * ⚠ A mockup's theme is the archive FOLDER it came from, which the pipeline
 * prefixes onto the file ("tata-", "iisa-", "iism-") — not brandOf(): a
 * Tata-theme cap is named "…mockup mum", which brandOf reads as Mumbai.
 *
 * Server Component: it reads the catalogue; MockupWall brings its own client
 * boundary.
 */

import { MockupWall, type ThemedPlate } from "@/components/client/tata/MockupWall";
import { readCatalogueCategory } from "@/content/catalogue";
import { pieceName, tataPlate } from "@/constants/tataPlates";
import { TATA_MOCKUPS_BAND } from "@/constants/tataStory";
import { TATA_THEMES } from "@/constants/tataThemes";

const SLUG = "tata-iis";

export function MockupsBand() {
  const assets = (readCatalogueCategory(SLUG, "mockups")?.assets ?? []).filter((a) => a.kind === "image");
  const plates: ThemedPlate[] = assets.map((a) => ({
    ...tataPlate(a.url, a.caption ?? pieceName(a.name)),
    theme: a.name.split("-")[0],
  }));
  const themes = TATA_THEMES.filter((t) => plates.some((p) => p.theme === t.id)).map((t) => ({
    id: t.id,
    label: t.label,
    colour: t.bg,
  }));

  return (
    <MockupWall
      band={TATA_MOCKUPS_BAND}
      plates={plates}
      themes={themes}
      href={`/clients/${SLUG}/catalogue/mockups`}
    />
  );
}
