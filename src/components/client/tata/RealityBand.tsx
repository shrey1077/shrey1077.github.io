/**
 * RealityBand — band 06 of the Tata IIS page: Mockups to reality (owner,
 * 2026-10-04). The work installed on campus, photographed, each piece with its
 * design where the archive holds one. The photographs are
 * scripts/prepare-tata-photos.mjs's.
 *
 * Since 2026-10-05 all twelve pieces stand on one wall (RealityWall) beside
 * the band's words (SideBand), instead of a pair at a time under them.
 *
 * Server Component: it resolves the thumbnails; RealityWall brings its own
 * client boundary.
 */

import { RealityWall, type RealityTile } from "@/components/client/tata/RealityWall";
import { SideBand } from "@/components/client/tata/SideBand";
import { TATA_REALITY, type TataImage } from "@/constants/tataPhotos";
import { tataPlate } from "@/constants/tataPlates";
import { TATA_REALITY_BAND } from "@/constants/tataStory";
import { onTataPage } from "@/constants/tataCull";

const plateOf = (img: TataImage, name: string) => tataPlate(img.src, name, img);

export function RealityBand() {
  const tiles: RealityTile[] = TATA_REALITY.map((p) => ({
    slug: p.slug,
    caption: p.caption,
    kind: p.kind,
    photo: plateOf(p.photo, p.caption),
    // A design the owner took off the page (constants/tataCull.ts) leaves
    // its photograph standing alone.
    design: p.design && onTataPage(p.design.src) ? plateOf(p.design, p.caption) : undefined,
  }));
  const paired = tiles.filter((t) => t.design).length;

  return (
    <SideBand
      band={TATA_REALITY_BAND}
      id="tata-reality-title"
      anchor="reality"
      ground="bg-neutral-100/40"
      aside={
        <p className="tata-body text-[0.62rem] uppercase leading-[1.9] tracking-[0.2em] text-neutral-500 tabular-nums">
          {tiles.length} pieces installed · {paired} with their design inset
          <span className="block text-neutral-400">Point at one to swap them · click to open</span>
        </p>
      }
    >
      <RealityWall tiles={tiles} />
    </SideBand>
  );
}
