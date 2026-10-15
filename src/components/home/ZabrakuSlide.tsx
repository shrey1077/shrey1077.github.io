"use client";

/**
 * ZabrakuSlide — Zabraku on the left side (owner, 2026-10-15: "I want the
 * interactive robot on the main page, but move it completely from zabraku
 * page to main page slide of zabraku. and it should rest on the right side of
 * screen in 75% screen height centered, with zabraku and full preview button
 * on left of slide").
 *
 * The robot is the Spline scene that stood behind the Zabraku page until
 * then (SplineScene — read its header: the scene is the TEMPLATE AUTHOR'S,
 * hosted on their Spline account, and should be replaced with one of the
 * owner's own). It follows the cursor across its box. It starts only once
 * the camera has LANDED on the slide — its downloads and setting-up froze a
 * flight for half a second when it started on the way in — and stops when
 * the camera leaves, so its WebGL costs nothing anywhere else on the page.
 */

import { useQuietStart } from "@/components/home/quietStart";
import { RoomImage as Image } from "@/components/home/nearness";
import { SplineScene } from "@/components/client/SplineScene";
import { PixelButton } from "@/components/home/PixelButton";
import type { Showcase } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.58rem] tracking-[0.28em] text-neutral-500`;
/** The robot — the template author's scene; see SplineScene. */
const SCENE = "https://prod.spline.design/AqtlWJlNbO-ZMkvz/scene.splinecode";

export function ZabrakuSlide({ item, live, arrived }: { item: Showcase; live: boolean; arrived: boolean }) {
  // Started once the camera has landed here (its setting-up would stall a
  // move), kept while the slide is the camera's, dropped when it leaves.
  // After landing, once scrolling has gone quiet (useQuietStart).
  const on = useQuietStart(arrived, live);
  return (
    <section aria-label={item.name} data-side="logic" className="absolute inset-0 overflow-hidden">
      <h2 className="sr-only">{item.name}</h2>
      {/* The robot: the right side, 75% of the screen's height, centred. */}
      {/* On a portrait screen: the lower part, under the words. */}
      <div className="absolute right-0 top-1/2 h-[75svh] w-[min(62vw,75svh)] -translate-y-1/2 sm:right-[3vw] portrait:bottom-[calc(7svh+3.5rem)] portrait:top-auto portrait:h-[52svh] portrait:w-[80vw] portrait:translate-y-0">
        {on && (
          <SplineScene
            url={SCENE}
            offsetX="0%"
            scale={1.12}
            opacity={0.85}
            filter="grayscale(1) brightness(1.55) contrast(0.85)"
          />
        )}
      </div>
      {/* Zabraku, and the way in, on the left. */}
      <div className="pointer-events-none absolute left-4 top-1/2 z-10 flex -translate-y-1/2 flex-col items-start gap-4 sm:left-8 lg:left-[5vw] portrait:top-[calc(max(2vh,0.75rem)+var(--strip-h)+1.25rem)] portrait:translate-y-0">
        <p className={META}>{item.sector}</p>
        <span className="relative block aspect-[4/1] w-[min(36vw,26rem)] portrait:w-[58vw]">
          <Image src={item.mark ?? ""} alt="Zabraku" fill sizes="(orientation: portrait) 58vw, 36vw" className="object-contain object-left" />
        </span>
        <p className="font-helv max-w-[22rem] text-[0.86rem] leading-snug text-neutral-600 portrait:max-w-[60vw]">
          A media house with a story-first spine — its identity, RKB Entertainment&apos;s, and a year of event campaigns.
        </p>
        <span className="pointer-events-auto">
          <PixelButton side="logic" href={item.report.href}>
            {item.report.label} <span aria-hidden>→</span>
          </PixelButton>
        </span>
      </div>
    </section>
  );
}
