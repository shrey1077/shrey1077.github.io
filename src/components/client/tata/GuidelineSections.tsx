/**
 * GuidelineSections — the Tata IIS logo-guideline system.
 *
 * Layout per the brief: the Tata IIS guidelines run full-width across roughly
 * half the viewport height (wordmark on a construction frame + the plate
 * strip + the colour law); beneath, IIS Ahmedabad and IIS Mumbai sit as two
 * equal columns filling the remaining half, each on a whisper of its own
 * campus texture. Server Component; the interactive plate strips are the
 * client GuidelinePlates.
 */

import Image from "next/image";
import { GuidelinePlates } from "@/components/client/GuidelinePlates";
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

export function GuidelineSections() {
  const g = TATA_GUIDELINES;
  const tataPlates = g.tataPlates.map((url, i) => ({
    name: `Tata IIS guideline plate ${i + 1}`,
    url,
    kind: "image" as const,
  }));
  const iismPlates = g.iism.plates.map((url, i) => ({
    name: `IIS Mumbai guideline plate ${i + 1}`,
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
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
              {COLOUR_LAW.map((c) => (
                <span key={c.hex} className="flex items-center gap-2.5">
                  <span aria-hidden className={`size-3 rounded-full ${c.swatch}`} />
                  <span className="tata-body text-[0.6rem] text-neutral-600">
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

      {/* IISA + IISM — two equal columns, the remaining half. */}
      <div className="grid grid-cols-1 border-t border-neutral-200 md:min-h-[48vh] md:grid-cols-2">
        {/* IIS Ahmedabad */}
        <div className="relative flex flex-col justify-center overflow-hidden border-neutral-200 p-10 md:border-r">
          <Image src={g.iisa.texture} alt="" aria-hidden fill sizes="50vw" className="object-cover opacity-[0.07]" />
          <div className="relative">
            <span className={`${KICKER} text-neutral-500`}>Campus dialect — Ahmedabad</span>
            <div className="relative mt-5 h-24 w-full">
              <Image src={g.iisa.logo} alt="IIS Ahmedabad logo" fill sizes="280px" className="object-contain object-left" />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-600">{g.iisa.line}</p>
          </div>
        </div>
        {/* IIS Mumbai */}
        <div className="relative flex min-h-[46vh] flex-col justify-center overflow-hidden p-10">
          <Image src={g.iism.texture} alt="" aria-hidden fill sizes="50vw" className="object-cover opacity-[0.07]" />
          <div className="relative">
            <span className={`${KICKER} text-neutral-500`}>Campus dialect — Mumbai</span>
            <div className="relative mt-5 h-24 w-full">
              <Image src={g.iism.logo} alt="IIS Mumbai logo" fill sizes="280px" className="object-contain object-left" />
            </div>
            <p className="mt-5 mb-7 max-w-sm text-sm leading-relaxed text-neutral-600">{g.iism.line}</p>
            <GuidelinePlates plates={iismPlates} />
          </div>
        </div>
      </div>
    </section>
  );
}
