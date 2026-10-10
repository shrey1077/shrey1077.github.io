/**
 * HandbookBand — band 03 of the Tata IIS page: the trainee handbook (owner,
 * 2026-10-04).
 *
 * The band's head (TataBandHead), then the handbook's page in the
 * centre with its six points set round it on a circle, each lit while a page
 * it describes is on display (HandbookCircle). The welding artwork closes it.
 *
 * ⚠ What it says about the institute is kept general on purpose — see
 * TATA_HANDBOOK.
 *
 * Server Component; HandbookCircle brings its own client boundary.
 */

import Image from "next/image";
import { FlipbookFlow } from "@/components/client/tata/FlipbookFlow";
import { HandbookCircle } from "@/components/client/tata/HandbookCircle";
import { TataBandHead } from "@/components/client/tata/TataBandHead";
import { TATA_HANDBOOK, TATA_HANDBOOK_ART } from "@/constants/tataStory";

const SHELL = "mx-auto w-full max-w-7xl px-6 sm:px-10";

export function HandbookBand() {
  return (
    <section id="handbook" aria-labelledby="tata-handbook-title" className="scroll-mt-4 border-t border-neutral-200/70 bg-white/45">
      <div className={`${SHELL} pt-14 lg:pt-20`}>
        <TataBandHead band={TATA_HANDBOOK} id="tata-handbook-title" />
        <div className="mt-12 lg:mt-16">
          <HandbookCircle />
        </div>
        {/* The flipbook, told between two columns that give way to it. */}
        <div className="mt-20 lg:mt-24">
          <FlipbookFlow />
        </div>
      </div>

      {/* The band's close: the owner's welding artwork, edge to edge
          (2026-10-04). Decorative; a cut-out, so it rests on the band's foot. */}
      <div
        aria-hidden
        className="pointer-events-none relative mt-6 w-full lg:mt-4"
        style={{ aspectRatio: `${TATA_HANDBOOK_ART.w} / ${TATA_HANDBOOK_ART.h}` }}
      >
        <Image src={TATA_HANDBOOK_ART.src} alt="" fill sizes="100vw" className="object-cover" />
      </div>
    </section>
  );
}
