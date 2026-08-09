/**
 * LogoSystem — section 01 of the Tata IIS experience: the identity, in full.
 *
 * Four movements (docs/TATA_IIS_BUILD_PROMPT.md):
 *   1  The wordmark on its construction stage (real thirds/center hairlines,
 *      the real mark) with the colour law beneath.
 *   2  The guideline plates as a monograph (GuidelinePlates → MediaViewer).
 *   3  The two campus dialects — IISA and IISM — each on a whisper of its
 *      own texture.
 *   4  The partner wall: the marks this identity must stand beside.
 *
 * Server Component; asset paths are the stable derivative locations produced
 * by scripts/prepare-tata-iis.mjs.
 */

import Image from "next/image";
import { GuidelinePlates } from "@/components/client/GuidelinePlates";
import { typeVoiceClass } from "@/constants/typography";

const BASE = "/content/clients/tata-iis/brand";

const PLATES = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    name: `Guideline plate ${n}`,
    url: `${BASE}/guidelines/plate-${n}.webp`,
    kind: "image" as const,
  };
});

const COLOUR_LAW = [
  { hex: "#262222", use: "Print", swatch: "bg-[#262222]" },
  { hex: "#000000", use: "Digital", swatch: "bg-black" },
  { hex: "#FFFFFF", use: "Reverse", swatch: "bg-white border border-neutral-300" },
] as const;

const CAMPUSES = [
  {
    id: "iisa",
    logo: `${BASE}/iisa.png`,
    texture: `${BASE}/texture-iisa.webp`,
    name: "IIS Ahmedabad",
    line: "A canopy of growth in navy and orange, rising from machined stems.",
  },
  {
    id: "iism",
    logo: `${BASE}/iism.png`,
    texture: `${BASE}/texture-iism.webp`,
    name: "IIS Mumbai",
    line: "Teal and violet planes, angled like sheet metal in motion.",
  },
] as const;

const PARTNERS = [
  "siemens", "fanuc", "universal-robots", "zeiss", "mitutoyo", "festo",
  "makino", "markforged", "formlabs", "fronius", "hexagon", "tvs",
  "tata-motors", "taj-skyline",
] as const;

/** Hairline guide inside the construction stage. */
function Guide({ className }: { className: string }) {
  return <span aria-hidden className={`absolute bg-neutral-100 ${className}`} />;
}

export function LogoSystem() {
  return (
    <div className="flex flex-col gap-16">
      {/* 1 — the wordmark stage. */}
      <div>
        <div className="relative flex aspect-[16/9] w-full max-w-3xl items-center justify-center border border-neutral-200">
          <Guide className="left-1/3 top-0 h-full w-px" />
          <Guide className="left-2/3 top-0 h-full w-px" />
          <Guide className="left-0 top-1/3 h-px w-full" />
          <Guide className="left-0 top-2/3 h-px w-full" />
          <div className="relative aspect-[4/1] w-3/4">
            <Image
              src={`${BASE}/wordmark-black.png`}
              alt="TATA IIS — Tata Indian Institute of Skills wordmark"
              fill
              sizes="(max-width: 768px) 75vw, 576px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
          {COLOUR_LAW.map((c) => (
            <span key={c.hex} className="flex items-center gap-2.5">
              <span aria-hidden className={`size-3 rounded-full ${c.swatch}`} />
              <span
                className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-neutral-500`}
              >
                {c.hex} — {c.use}
              </span>
            </span>
          ))}
        </div>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-500">
          Copperplate Gothic Bold, kerned to the Tata Trusts standard, on an 8x
          construction grid. The subtitle line is structural, not decorative —
          it exists so the mark never reads as &ldquo;TIIS&rdquo;.
        </p>
      </div>

      {/* 2 — the guideline plates. */}
      <div>
        <h3
          className={`${typeVoiceClass("logic", "meta")} mb-4 text-[0.65rem] text-neutral-500`}
        >
          The construction plates
        </h3>
        <GuidelinePlates plates={PLATES} />
      </div>

      {/* 3 — the two campus dialects. */}
      <div>
        <h3
          className={`${typeVoiceClass("logic", "meta")} mb-4 text-[0.65rem] text-neutral-500`}
        >
          Two campuses, two dialects
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {CAMPUSES.map((campus) => (
            <div
              key={campus.id}
              className="relative overflow-hidden border border-neutral-200 bg-white p-8 transition-colors duration-500 hover:border-neutral-400"
            >
              <Image
                src={campus.texture}
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 640px) 100vw, 480px"
                className="object-cover opacity-[0.08]"
              />
              <div className="relative">
                <div className="relative h-28 w-full">
                  <Image
                    src={campus.logo}
                    alt={`${campus.name} logo`}
                    fill
                    sizes="240px"
                    className="object-contain object-left"
                  />
                </div>
                <p className="mt-6 text-sm font-medium text-neutral-900">
                  {campus.name}
                </p>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-neutral-500">
                  {campus.line}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 — the partner wall. */}
      <div>
        <h3
          className={`${typeVoiceClass("logic", "meta")} mb-5 text-[0.65rem] text-neutral-500`}
        >
          In the company of
        </h3>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
          {PARTNERS.map((partner) => (
            <li key={partner}>
              <Image
                src={`${BASE}/partners/${partner}.png`}
                alt={partner.replace(/-/g, " ")}
                width={144}
                height={40}
                className="h-8 w-auto object-contain opacity-55 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 sm:h-9"
              />
            </li>
          ))}
        </ul>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-500">
          The equipment and hiring partners the identity stands beside every
          day — from FANUC to the Taj.
        </p>
      </div>
    </div>
  );
}
