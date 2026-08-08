/**
 * GuidelineSections — the Tata IIS logo-guideline system.
 *
 * The Tata IIS guidelines run full-width (wordmark on a construction frame +
 * the colour law + the plate strip); beneath, IIS Ahmedabad and IIS Mumbai sit
 * as two columns. Each campus column leads with its logo and a line, then shows
 * its colour scheme (big swatches) and typography slide, and tucks the rest of
 * its guideline plates behind a round "See more" that opens a modal slider.
 * Server Component; the plate strips and the See-more modal are client.
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

/** One campus column: logo, line, colour scheme, typography, then See more.
 *  Laid out so colour and typography sit side by side — the column reads at
 *  about half the height of the old stacked version. */
function CampusColumn({ kicker, data, className }: { kicker: string; data: Campus; className: string }) {
  return (
    <div className={`relative flex flex-col justify-center gap-5 p-6 lg:p-7 ${className}`}>
      <div>
        <span className={`${KICKER} text-neutral-500`}>{kicker}</span>
        <div className="relative mt-3 h-12 w-full">
          <Image src={data.logo} alt={`${kicker} logo`} fill sizes="220px" className="object-contain object-left" />
        </div>
        <p className="mt-3 max-w-sm text-xs leading-relaxed text-neutral-600">{data.line}</p>
      </div>

      <div className="flex flex-wrap items-start gap-x-8 gap-y-5">
        {/* Colour scheme. */}
        <div>
          <span className={`${KICKER} text-neutral-400`}>Colour</span>
          <div className="mt-3 flex flex-wrap gap-4">
            {data.colours.map((c) => (
              <div key={c.hex} className="flex flex-col items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-10 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="tata-body text-[0.58rem] uppercase tracking-[0.04em] text-neutral-500">{c.hex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Typography slide. */}
        <div className="min-w-0 flex-1">
          <span className={`${KICKER} text-neutral-400`}>Typography</span>
          <div className="relative mt-3 aspect-[3557/2528] w-full max-w-[15rem] overflow-hidden border border-neutral-200 bg-white">
            <Image src={data.typography} alt={`${kicker} typography`} fill sizes="240px" className="object-contain" />
          </div>
        </div>
      </div>

      {/* The rest of the deck, behind a circle. */}
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
    <section aria-label="Logo guidelines" className="border-t border-neutral-200">
      {/* Tata IIS — full width, ~half the viewport. */}
      <div className="flex min-h-[52vh] flex-col justify-center gap-2 py-14">
        <span className={KICKER} style={{ color: "var(--brand-accent, #737373)" }}>
          The wordmark & its rulebook
        </span>
        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div className="relative flex aspect-[16/9] items-center justify-center border border-neutral-200">
            <Guide className="left-1/3 top-0 h-full w-px" />
            <Guide className="left-2/3 top-0 h-full w-px" />
            <Guide className="left-0 top-1/3 h-px w-full" />
            <Guide className="left-0 top-2/3 h-px w-full" />
            <div className="relative aspect-[4/1] w-3/4">
              <Image
                src={g.wordmark}
                alt="TATA IIS — Tata Indian Institute of Skills wordmark"
                fill
                sizes="(max-width: 1024px) 75vw, 480px"
                className="object-contain"
              />
            </div>
          </div>
          <div>
            <p className="max-w-md text-sm leading-relaxed text-neutral-600">
              Copperplate Gothic Bold, kerned to the Tata Trusts standard, on an
              8x construction grid. The subtitle line is structural, not
              decorative — it exists so the mark never reads as &ldquo;TIIS&rdquo;.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-9 gap-y-5">
              {COLOUR_LAW.map((c) => (
                <span key={c.hex} className="flex items-center gap-3">
                  <span aria-hidden className={`size-6 rounded-full ${c.swatch}`} />
                  <span className="tata-body text-xs text-neutral-600">
                    {c.hex} — {c.use}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10">
          <GuidelinePlates plates={tataPlates} />
        </div>
      </div>

      {/* IISA + IISM — two equal columns. */}
      <div className="grid grid-cols-1 border-t border-neutral-200 md:grid-cols-2">
        <CampusColumn kicker="Campus dialect — Ahmedabad" data={g.iisa} className="border-neutral-200 md:border-r" />
        <CampusColumn kicker="Campus dialect — Mumbai" data={g.iism} className="" />
      </div>
    </section>
  );
}
