/**
 * GuidelineSections — the Tata IIS logo-guideline system.
 *
 * The section is two thirds of the viewport, full width, and its split states
 * the brand hierarchy outright: Tata IIS owns the entire left half at full
 * height; the right half is halved again, IIS Ahmedabad above IIS Mumbai. The
 * parent is therefore twice the size of either campus, which is the point.
 *
 * Each campus panel leads with its logo and a line, sets its colour scheme and
 * typography side by side, and tucks the rest of its plates behind a round
 * "See more" that opens a modal slider. Server Component; the plate strips and
 * the See-more modal are client.
 */

import Image from "next/image";
import { GuidelinePlates } from "@/components/client/GuidelinePlates";
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

/** One campus panel — a quarter of the section, so everything runs compact. */
function CampusPanel({ kicker, data, className }: { kicker: string; data: Campus; className: string }) {
  return (
    <div className={`relative flex min-h-0 flex-col justify-center gap-2.5 p-5 lg:p-5 ${className}`}>
      <div>
        <span className={`${KICKER} text-neutral-500`}>{kicker}</span>
        <div className="relative mt-2 h-8 w-full">
          <Image src={data.logo} alt={`${kicker} logo`} fill sizes="200px" className="object-contain object-left" />
        </div>
        <p className="tata-body mt-2 line-clamp-2 max-w-sm text-[0.68rem] leading-relaxed text-neutral-600">{data.line}</p>
      </div>

      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        {/* Colour scheme. */}
        <div>
          <span className={`${KICKER} text-neutral-400`}>Colour</span>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {data.colours.map((c) => (
              <div key={c.hex} className="flex flex-col items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-8 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="tata-body text-[0.55rem] uppercase tracking-[0.04em] text-neutral-500">{c.hex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Typography slide. */}
        <div className="min-w-0 flex-1">
          <span className={`${KICKER} text-neutral-400`}>Typography</span>
          <div className="relative mt-2.5 aspect-[3557/2528] w-full max-w-[7rem] overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <Image src={data.typography} alt={`${kicker} typography`} fill sizes="180px" className="object-contain" />
          </div>
        </div>
      </div>

      <GuidelineSeeMore plates={data.plates} accent={data.colours[0].hex} label="See more" />
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
    <section
      aria-label="Logo guidelines"
      className="grid grid-cols-1 border-t border-neutral-200 lg:min-h-[67vh] lg:grid-cols-2"
    >
      {/* Tata IIS — the whole left half, full height. The parent brand. */}
      <div className="flex min-h-0 flex-col justify-center gap-3 border-neutral-200 p-6 lg:border-r lg:p-8">
        <span className={KICKER} style={{ color: "var(--brand-accent, #737373)" }}>
          The wordmark &amp; its rulebook
        </span>

        <div className="relative flex aspect-[16/5] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200">
          <Guide className="left-1/3 top-0 h-full w-px" />
          <Guide className="left-2/3 top-0 h-full w-px" />
          <Guide className="left-0 top-1/3 h-px w-full" />
          <Guide className="left-0 top-2/3 h-px w-full" />
          <div className="relative aspect-[4/1] w-3/4">
            <Image
              src={g.wordmark}
              alt="TATA IIS — Tata Indian Institute of Skills wordmark"
              fill
              sizes="(max-width: 1024px) 75vw, 460px"
              className="object-contain"
            />
          </div>
        </div>

        <p className="tata-body max-w-md text-xs leading-relaxed text-neutral-600">
          Copperplate Gothic Bold, kerned to the Tata Trusts standard, on an 8x
          construction grid. The subtitle line is structural, not decorative — it
          exists so the mark never reads as &ldquo;TIIS&rdquo;.
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {COLOUR_LAW.map((c) => (
            <span key={c.hex} className="flex items-center gap-2.5">
              <span aria-hidden className={`size-5 rounded-full ${c.swatch}`} />
              <span className="tata-body text-[0.68rem] text-neutral-600">
                {c.hex} — {c.use}
              </span>
            </span>
          ))}
        </div>

        <div className="min-h-0 flex-1">
          <GuidelinePlates plates={tataPlates} />
        </div>
      </div>

      {/* The two campuses — the right half, halved again. */}
      <div className="grid min-h-0 grid-cols-1 lg:grid-rows-2">
        <CampusPanel
          kicker="Campus dialect — Ahmedabad"
          data={g.iisa}
          className="border-t border-neutral-200 lg:border-t-0"
        />
        <CampusPanel kicker="Campus dialect — Mumbai" data={g.iism} className="border-t border-neutral-200" />
      </div>
    </section>
  );
}
