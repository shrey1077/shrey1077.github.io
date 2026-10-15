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
import type { Showcase } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

const loadGlobe = () => import("@/components/originkit/AsciiGlobe");
const AsciiGlobe = dynamic(loadGlobe, { ssr: false });

const META = `${typeVoiceClass("logic", "meta")} text-[0.58rem] tracking-[0.28em] text-neutral-500`;
const BEATS = ["Sports", "Environment", "Politics", "& more"];

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
      {/* The globe, on the right — under the words on a portrait screen. */}
      <div className="absolute bottom-[7svh] right-0 top-[calc(max(2vh,0.75rem)+var(--strip-h))] w-[58%] portrait:top-auto portrait:h-[50svh] portrait:w-full">
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
      <div className="slide-frame is-logic pointer-events-none absolute inset-0 flex flex-col justify-center portrait:justify-start">
        <div className="pointer-events-auto flex max-w-[min(40vw,30rem)] flex-col items-start gap-3.5 portrait:max-w-none">
          <span className="relative block h-[clamp(2.2rem,5vw,3.6rem)] w-[clamp(9rem,20vw,15rem)]">
            <Image src={item.mark ?? ""} alt="NewsMobile" fill sizes="240px" className="object-contain object-left" />
          </span>
          <p className={META}>{item.years} · Gurugram, Haryana</p>
          <p className="face-logic text-[clamp(1.25rem,2.6vw,2.3rem)] leading-[1.05] text-neutral-900">
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
      <div className="absolute bottom-[calc(7svh+0.75rem)] right-4 z-10 sm:right-8 lg:right-[5vw]">
        <PixelButton side="logic" href={item.report.href}>
          {item.report.label} <span aria-hidden>→</span>
        </PixelButton>
      </div>
    </section>
  );
}
