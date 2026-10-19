"use client";

/**
 * NewsMobileSlide — NewsMobile on the left side (owner, 2026-10-15): an
 * interactive globe on the right — Originkit's Glyph Globe, supplied by the
 * owner (components/originkit/AsciiGlobe, vendored as given) — and on the
 * left the NewsMobile mark and the owner's role in their words: graphic
 * designer, video editor and copy editor, with weekly bylines on beats from
 * sports and the environment to politics.
 *
 * The globe turns on its own and parts around the cursor. It is drawn in the
 * left side's graphite on the slide's white, its accents in NewsMobile's red,
 * and started only once the camera has landed on the slide, stopped when it
 * leaves — it is a WebGL loop. Reduced motion: it holds still.
 */

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useQuietStart } from "@/components/home/quietStart";
import type { MotionValue } from "framer-motion";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { BrandPlate, PLATE_ABOVE_FOOT, PLATE_ART_RIGHT, PLATE_FOOT, PLATE_PAD, PLATE_RIGHT, PLATE_TOP } from "@/components/home/BrandPlate";
import type { Showcase } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

const loadGlobe = () => import("@/components/originkit/AsciiGlobe");
const AsciiGlobe = dynamic(loadGlobe, { ssr: false });

const META = `${typeVoiceClass("logic", "meta")} text-[0.58rem] tracking-[0.28em] text-neutral-500`;
const BEATS = ["Sports", "Environment", "Politics", "& more"];
/** The logo's two colours (read off newsmobile.png), for the plate's rim. */
const RED = "#be2126";
const BLUE = "#2c52a4";

export function NewsMobileSlide({
  item,
  live,
  soon,
  moving,
  reduceMotion,
}: {
  item: Showcase;
  live: boolean;
  /** The camera is here or a step away: fetch the globe's code ahead. */
  soon: boolean;
  moving: MotionValue<number>;
  reduceMotion: boolean;
}) {
  useEffect(() => {
    if (soon) void loadGlobe();
  }, [soon]);
  // Started once the camera has landed here, kept while the slide is the
  // camera's, dropped when it leaves (as the Zabraku robot).
  // After landing, once scrolling has gone quiet (useQuietStart).
  const on = useQuietStart(live, moving);
  return (
    <section aria-label={item.name} data-side="logic" className="absolute inset-0 overflow-hidden">
      <h2 className="sr-only">{item.name}</h2>
      {/* The plate under it all (owner, 2026-10-19: "put behind Newsmobile
          elements with red inside and blue outside on border" — the logo's
          own red and blue), everything on it. */}
      <BrandPlate inner={RED} outer={BLUE} />
      {/* The globe, on the right — under the words on a portrait screen —
          within the plate's rim, above the way in at the foot. */}
      <div className={`absolute ${PLATE_ART_RIGHT} ${PLATE_ABOVE_FOOT} top-[calc(max(2vh,0.75rem)+var(--strip-h)+1rem)] w-[56%] portrait:left-[1.25rem] portrait:top-auto portrait:h-[38svh] portrait:w-auto sm:portrait:left-7`}>
        {on && (
          <AsciiGlobe
            background="transparent"
            baseColor="#1f1f1f"
            accentColor="#C0392B"
            distance={330}
            dotSize={80}
            speed={reduceMotion ? 0 : -100}
            style={{ minWidth: 0, minHeight: 0, width: "100%", height: "100%" }}
          />
        )}
      </div>
      <div className={`slide-frame is-logic pointer-events-none absolute inset-0 flex flex-col justify-center portrait:justify-start ${PLATE_PAD} ${PLATE_TOP}`}>
        <div className="pointer-events-auto flex max-w-[min(40vw,30rem)] flex-col items-start gap-3.5 portrait:max-w-none">
          {/* The mark, bigger, in a white pill (owner, 2026-10-16: "make
              newsmobile logo bigger and inside a horizontal pill"). */}
          <span className="block rounded-full bg-white px-[clamp(1.1rem,2.4vw,2rem)] py-[clamp(0.55rem,1.2vw,0.95rem)] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.45)] ring-1 ring-neutral-900/12">
            <span className="relative block h-[clamp(2.6rem,5.6vw,4.4rem)] w-[clamp(11.5rem,25vw,19.5rem)]">
              <Image src={item.mark ?? ""} alt="NewsMobile" fill sizes="320px" className="object-contain" />
            </span>
          </span>
          <p className={META}>{item.years} · Gurugram, Haryana</p>
          {/* Bold Helvetica (owner, 2026-10-16: "this info in bold helvetica"). */}
          <p className="font-helv text-[clamp(1.25rem,2.6vw,2.3rem)] font-bold leading-[1.08] tracking-[-0.015em] text-neutral-900">
            Graphic Designer, Video Editor &amp; Copy Editor
          </p>
          <p className="font-helv text-[0.88rem] leading-snug text-neutral-600">
            Weekly bylines on a range of beats, alongside the graphics and the edit.
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {BEATS.map((b) => (
              <li key={b} className="rounded-full bg-white/85 px-3 py-1 text-[0.72rem] text-neutral-800 ring-1 ring-neutral-900/15">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={`absolute z-10 ${PLATE_FOOT} ${PLATE_RIGHT}`}>
        <PixelButton side="logic" href={item.report.href}>
          {item.report.label} <span aria-hidden>→</span>
        </PixelButton>
      </div>
    </section>
  );
}
