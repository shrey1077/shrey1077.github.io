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

/* CampusPanel lived here — a logo plus a "Brand Guidelines" button, one per
 * campus, in a half-width row. Removed 2026-08-17: the slider above now
 * carries all three decks behind one switch, so the panels were a second
 * door to the same room. GuidelineSeeMore has no callers left on this page.
 */

export function GuidelineSections() {
  const g = TATA_GUIDELINES;
  const deck = (urls: readonly string[], who: string) =>
    urls.map((url, i) => ({ name: `${who} guideline plate ${i + 1}`, url, kind: "image" as const }));

  /* The three decks behind one switch. Grounds are the owner's call: Tata IIS
     black, Ahmedabad its navy, Mumbai its teal — the campus hexes come from
     TATA_GUIDELINES rather than being retyped here.
     ⚠ IISM's teal is colours[1]; colours[0] is the violet. */
  const brands = [
    {
      id: "tata",
      label: "Tata IIS",
      logo: g.wordmark,
      plates: deck(g.tataPlates, "Tata IIS"),
      bg: "#000000",
    },
    {
      id: "iisa",
      label: "IIS Ahmedabad",
      logo: g.iisa.logo,
      plates: deck([g.iisa.typography, ...g.iisa.plates], "IIS Ahmedabad"),
      bg: g.iisa.colours[0].hex,
    },
    {
      id: "iism",
      label: "IIS Mumbai",
      logo: g.iism.logo,
      plates: deck([g.iism.typography, ...g.iism.plates], "IIS Mumbai"),
      bg: g.iism.colours[1].hex,
    },
  ];

  return (
    <section aria-label="Brand guidelines" className="border-t border-neutral-200">
      <div className="p-6 lg:p-10">
        <h2 className="tata-heading text-2xl leading-[1.05] text-neutral-900 sm:text-3xl">
          Brand Guidelines
        </h2>
        <span className={`${KICKER} mt-3 block`} style={{ color: "var(--brand-accent, #737373)" }}>
          The wordmark &amp; its rulebook
        </span>

        {/* ⚠ The copy and the slider are stacked ROWS, not columns. They shared
            a two-column grid and it collapsed: the old plate strip had no
            intrinsic width cap, so it forced its column wide and squeezed the
            text to about 130px — one word per line. Keep these on separate
            rows. */}
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

        {/* One slider for all three rulebooks; the switch sits under it.
            ⚠ This replaces the two campus panels that used to sit in a
            half-width row below (each a logo plus a "Brand Guidelines" button).
            Their decks are reachable here now, so the panels were redundant —
            what is NOT carried over is the campus logos themselves, which no
            longer appear anywhere on this page. */}
        <div className="mt-10 lg:mx-auto lg:max-w-4xl">
          <GuidelineSlider brands={brands} />
        </div>
      </div>
    </section>
  );
}
