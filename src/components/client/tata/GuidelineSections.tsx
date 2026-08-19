/**
 * GuidelineSections — the Tata IIS logo-guideline system.
 *
 * The split states the brand hierarchy outright: Tata IIS takes a FULL-WIDTH
 * band of its own, and the two campuses share the half-width row beneath it.
 * The parent brand is therefore twice either campus, which is the point.
 *
 * ⚠ Restructured 2026-08-17. It used to be a two-column grid — Tata IIS down
 * the whole left half, the campuses stacked in the right half — with each
 * campus panel carrying its logo, a line, its colour scheme AND a typography
 * plate, all inside a quarter of the section. That was too crowded to read at
 * the size it ran. The campus panels are now just the mark and a way in.
 *
 * ⚠ Colour swatches and the typography plate no longer appear on the page for
 * either campus. The typography plate is prepended to the modal's stack so the
 * information is still reachable rather than dropped; the colour hexes are not
 * shown anywhere now, and would need re-adding if they matter.
 *
 * Server Component; the plate strip and the modal are client.
 */

import Image from "next/image";
import { GuidelineSlider } from "@/components/client/tata/GuidelineSlider";
import { GuidelineSeeMore } from "@/components/client/tata/GuidelineSeeMore";
import { TATA_GUIDELINES } from "@/constants/tataExperience";

const COLOUR_LAW = [
  { hex: "#262222", use: "Print", swatch: "bg-[#262222]" },
  { hex: "#000000", use: "Digital", swatch: "bg-black" },
  { hex: "#FFFFFF", use: "Reverse", swatch: "bg-white border border-neutral-300" },
] as const;

function Guide({ className }: { className: string }) {
  return <span aria-hidden className={`absolute bg-neutral-100 ${className}`} />;
}

/** Section kicker — a subheading (Helvetica Bold), small and tracked. */
const KICKER = "tata-subhead text-[0.62rem] uppercase tracking-[0.12em]";

type Campus = typeof TATA_GUIDELINES.iisa;

/** One campus — the mark, and a way into its rulebook. Nothing else. */
function CampusPanel({ kicker, data, className }: { kicker: string; data: Campus; className: string }) {
  return (
    <div className={`flex flex-col items-center gap-7 p-6 text-center lg:p-12 ${className}`}>
      <span className={`${KICKER} text-neutral-500`}>{kicker}</span>

      {/* ⚠ Both marks share this box exactly — same height, same max width,
          `object-contain` — so the two campuses read as equals. The two source
          files are different shapes, so anything that sized to the image itself
          made one noticeably larger than the other. */}
      <div className="relative h-28 w-full max-w-[22rem]">
        <Image src={data.logo} alt={`${kicker} logo`} fill sizes="352px" className="object-contain" />
      </div>

      {/* The typography plate leads the stack — it is no longer on the page,
          so this is the only place it survives. */}
      <GuidelineSeeMore
        plates={[data.typography, ...data.plates]}
        accent={data.colours[0].hex}
        label="Brand Guidelines"
      />
    </div>
  );
}

export function GuidelineSections() {
  const g = TATA_GUIDELINES;
  const tataPlates = g.tataPlates.map((url, i) => ({
    name: `Tata IIS guideline plate ${i + 1}`,
    url,
    kind: "image" as const,
  }));

  return (
    <section aria-label="Logo guidelines" className="border-t border-neutral-200">
      {/* Tata IIS — the full-width band. The parent brand. */}
      <div className="p-6 lg:p-10">
        <span className={KICKER} style={{ color: "var(--brand-accent, #737373)" }}>
          The wordmark &amp; its rulebook
        </span>

        {/* ⚠ The copy and the slider are stacked ROWS, not columns.
            They shared a two-column grid and it collapsed: the old plate strip
            is a flex row of twelve 256px plates with no intrinsic width cap, so
            it forced its column wide and squeezed the copy to about 130px —
            one word per line. Keep these on separate rows. */}
        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-12">
          <div className="relative flex aspect-[16/5] w-full max-w-md shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200">
            <Guide className="left-1/3 top-0 h-full w-px" />
            <Guide className="left-2/3 top-0 h-full w-px" />
            <Guide className="left-0 top-1/3 h-px w-full" />
            <Guide className="left-0 top-2/3 h-px w-full" />
            <div className="relative aspect-[4/1] w-3/4">
              <Image
                src={g.wordmark}
                alt="TATA IIS — Tata Indian Institute of Skills wordmark"
                fill
                sizes="(max-width: 1024px) 75vw, 420px"
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <p className="tata-body max-w-2xl text-sm leading-relaxed text-neutral-600">
              Copperplate Gothic Bold, kerned to the Tata Trusts standard, on an 8x
              construction grid. The subtitle line is structural, not decorative — it
              exists so the mark never reads as &ldquo;TIIS&rdquo;.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {COLOUR_LAW.map((c) => (
                <span key={c.hex} className="flex items-center gap-2.5">
                  <span aria-hidden className={`size-5 shrink-0 rounded-full ${c.swatch}`} />
                  <span className="tata-body whitespace-nowrap text-[0.68rem] text-neutral-600">
                    {c.hex} — {c.use}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* The plates: one held large, four in the tray, moving on its own. */}
        <div className="mt-10 lg:mx-auto lg:max-w-4xl">
          <GuidelineSlider plates={tataPlates} />
        </div>
      </div>

      {/* The two campuses — half the width each, beneath the parent. */}
      <div className="grid grid-cols-1 border-t border-neutral-200 lg:grid-cols-2">
        <CampusPanel
          kicker="Campus dialect — Ahmedabad"
          data={g.iisa}
          className="border-neutral-200 lg:border-r"
        />
        <CampusPanel
          kicker="Campus dialect — Mumbai"
          data={g.iism}
          className="border-t border-neutral-200 lg:border-t-0"
        />
      </div>
    </section>
  );
}
