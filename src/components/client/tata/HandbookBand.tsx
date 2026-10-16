/**
 * HandbookBand — band 03 of the Tata IIS page: the trainee handbook (owner,
 * 2026-10-04).
 *
 * The band's head (TataBandHead), then the handbook's page in the
 * centre with its six points set round it on a circle, each lit while a page
 * it describes is on display (HandbookCircle), then the flipbook's story told
 * round the owner's film of it (FilmFlow, 2026-10-16; the drawn flipbook,
 * FlipbookFlow, until then). The welding artwork that closed it came off the
 * same day (owner: "remove this"); TATA_HANDBOOK_ART and its file are kept.
 *
 * ⚠ What it says about the institute is kept general on purpose — see
 * TATA_HANDBOOK.
 *
 * Server Component; HandbookCircle brings its own client boundary.
 */

import { FilmFlow } from "@/components/client/tata/FilmFlow";
import { HandbookCircle } from "@/components/client/tata/HandbookCircle";
import { TataBandHead } from "@/components/client/tata/TataBandHead";
import { TATA_HANDBOOK } from "@/constants/tataStory";

const SHELL = "mx-auto w-full max-w-7xl px-6 sm:px-10";

export function HandbookBand() {
  return (
    <section id="handbook" aria-labelledby="tata-handbook-title" className="scroll-mt-4 border-t border-neutral-200/70 bg-white/45">
      <div className={`${SHELL} pt-14 lg:pt-20`}>
        <TataBandHead band={TATA_HANDBOOK} id="tata-handbook-title" />
        <div className="mt-12 lg:mt-16">
          <HandbookCircle />
        </div>
        {/* The flipbook's story, told round the film of it. */}
        <div className="mt-20 pb-16 lg:mt-24 lg:pb-24">
          <FilmFlow />
        </div>
      </div>
    </section>
  );
}
