"use client";

/**
 * WritingsSlide — Writings & Publications on the right side: six boxes,
 * three across and two down — two across and three down on a portrait
 * screen (owner, 2026-10-15).
 *
 * The six are the documents with pages of their own (owner's pick): the
 * Ethnography, Food Distribution, Design for Print, Packaging, Mycoveda and
 * Nirvaan. Each box is fronted by its first page, its title and year set
 * over the foot, and opens it at /publications/<slug>. The other two — "Are
 * There Any Takers?" and the NewsMobile bylines — are on the full shelf,
 * which "Read Them All" opens (/writings). The boxes share the slide's
 * height evenly, so it fits any screen without a scroll.
 */

import Link from "next/link";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { RAINBOW } from "@/components/home/MoodField";
import { PUBLICATIONS } from "@/constants/publications";
import { SIX_WRITINGS } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em]`;

export function WritingsSlide({ covers }: { covers: Record<string, string | undefined> }) {
  const six = SIX_WRITINGS.map((slug) => PUBLICATIONS.find((p) => p.slug === slug)).filter((p) => !!p);
  return (
    <section aria-label="Writings & Publications" data-side="creative" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame absolute inset-0 flex flex-col gap-3">
        <div className="shrink-0">
          <p className={`${META} text-neutral-500`}>Creative · 04 / 04</p>
          <h2 className="face-creative mt-1.5 text-[clamp(1.4rem,3vw,2.8rem)] font-bold leading-none text-neutral-900">
            Writings &amp; Publications
          </h2>
        </div>
        <ul className="grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-2.5 landscape:grid-cols-3 landscape:grid-rows-2 sm:gap-3">
          {six.map((p, i) => {
            const cover = covers[p.slug];
            return (
              <li key={p.slug} className="min-h-0">
                <Link
                  href={`/publications/${p.slug}`}
                  prefetch={false}
                  className="group relative block h-full overflow-hidden rounded-xl bg-neutral-900 outline-none ring-1 ring-neutral-900/10 focus-visible:ring-2 focus-visible:ring-neutral-900/60"
                >
                  {cover && (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="(orientation: landscape) 30vw, 46vw"
                      className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  )}
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/45 to-transparent" />
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: RAINBOW[(i * 3) % RAINBOW.length] }} />
                  <span className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5">
                    <span className={`${META} block text-white/60`}>
                      {p.year} · {p.kind}
                    </span>
                    <span className="face-creative mt-1 line-clamp-2 block text-[clamp(0.85rem,1.6vw,1.3rem)] font-bold leading-tight text-white">
                      {p.title}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative" href="/writings">
          Read Them All <span aria-hidden>↗</span>
        </PixelButton>
      </div>
    </section>
  );
}
