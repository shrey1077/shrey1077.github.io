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
 * owner's own). It follows the cursor across its box.
 *
 * LOADING (owner, same day: it "takes time to load, can it be made faster"):
 * the viewer's module and the scene are fetched AHEAD, as soon as the camera
 * is a step away (`soon`, preloadSpline), so arriving finds them in hand; the
 * scene itself starts once the camera has landed and the scrolling has gone
 * quiet (useQuietStart — its setting-up would stall a move), and stops when
 * the camera leaves. Until it is drawing, the box says so: "Sending Robot
 * from future…" (owner's words).
 *
 * Where the words on the left run over the robot — a portrait screen; on a
 * landscape one they stand clear of it — they turn light (owner: "when grey
 * text overlaps with robot it should become white in affected area"): drawn
 * white in `difference` blending, at an opacity that comes out the usual grey
 * on white and near white over the robot's dark body. That blending needs the
 * slide's own white under it, so on a portrait screen this one slide is plain
 * white, without the drifting field behind.
 *
 * Everything on the slide stands on one plate between the field of falling
 * nodes and the slide's own things (owner, 2026-10-18: "for better
 * visiblity"): since 2026-10-19 white at 80%, two corners square and two
 * round, its double rim in the logo's yellow within its black (BrandPlate).
 * Under the logo: where the studio is, and the years (owner, 2026-10-18);
 * then the company in a paragraph (owner, 2026-10-20 — COMPANY_ABOUT).
 */

import { useState } from "react";
import Link from "next/link";
import type { MotionValue } from "framer-motion";
import { RoomImage as Image } from "@/components/home/nearness";
import { SplineScene, preloadSpline } from "@/components/client/SplineScene";
import { PixelButton } from "@/components/home/PixelButton";
import { BrandPlate, PLATE_ART_RIGHT, PLATE_INSET } from "@/components/home/BrandPlate";
import { useQuietStart } from "@/components/home/quietStart";
import { COMPANY_ABOUT } from "@/constants/companyAbout";
import type { Showcase } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.58rem] tracking-[0.28em]`;
/** The clients named under the button; ids are their sections' anchors on
 *  the Zabraku page (clientExperiences). */
const CLIENTS = [
  { id: "casa-playa", name: "Casa Playa", logo: "/content/clients/zabraku-media/clients/casa-playa-grey.png", aspect: 480 / 449 },
  { id: "rkb-entertainment", name: "RKB Entertainment", logo: "/content/clients/zabraku-media/clients/rkb-grey.png", aspect: 346 / 900 },
] as const;
/** The logo's two colours (read off zabraku-logo.png): the yellow of its
 *  "RA", the black of the rest. */
const YELLOW = "#ffdb3b";
const INK = "#262626";
/** Where the studio is (owner, 2026-10-18: "Zabraku is based in Malviya
 *  Nagar, New Delhi"). */
const BASED = "Malviya Nagar, New Delhi";
/** The robot — the template author's scene; see SplineScene. */
const SCENE = "https://prod.spline.design/AqtlWJlNbO-ZMkvz/scene.splinecode";

export function ZabrakuSlide({
  item,
  live,
  soon,
  moving,
}: {
  item: Showcase;
  live: boolean;
  /** The camera is here or a step away: fetch ahead. */
  soon: boolean;
  moving: MotionValue<number>;
}) {
  if (soon) preloadSpline(SCENE);
  const on = useQuietStart(live, moving);
  const [ready, setReady] = useState(false);
  if (!on && ready) setReady(false);

  return (
    // ⚠ White under everything on a portrait screen: a slide is a layer of
    // its own, so the words' `difference` blending (below) can only meet what
    // is IN the slide — without this it met nothing, and white words on the
    // page's white came out invisible.
    <section aria-label={item.name} data-side="logic" className="absolute inset-0 overflow-hidden portrait:bg-white">
      <h2 className="sr-only">{item.name}</h2>
      {/* The plate under it all, clear of the sections button above and the
          band below: the logo's yellow within its black. */}
      <BrandPlate inner={YELLOW} outer={INK} />
      {/* The robot: the right side, 75% of the screen's height, centred; on a
          portrait screen the lower part, under the words. */}
      <div className={`absolute top-1/2 h-[75svh] w-[min(62vw,75svh)] -translate-y-1/2 ${PLATE_ART_RIGHT} portrait:bottom-[calc(7svh+3.5rem)] portrait:top-auto portrait:h-[52svh] portrait:w-[80vw] portrait:translate-y-0`}>
        {on && (
          <SplineScene
            url={SCENE}
            offsetX="0%"
            scale={1.12}
            opacity={0.85}
            filter="grayscale(1) brightness(1.55) contrast(0.85)"
            onReady={() => setReady(true)}
          />
        )}
        {live && !ready && (
          <p
            aria-live="polite"
            className="font-graff pointer-events-none absolute inset-0 grid place-items-center text-center text-[clamp(0.7rem,1.2vw,0.95rem)] uppercase tracking-[0.24em] text-neutral-500"
          >
            <span className="animate-pulse">Sending Robot from future…</span>
          </p>
        )}
      </div>
      {/* Zabraku, and the way in, on the left. ⚠ No transform and no
          z-index on this box: either would make it a layer of its own, and
          the words' `difference` blending would then meet only the empty box,
          never the robot. Centred by flex instead; above the robot by order. */}
      {/* Centred a little high, and closer set on a short screen: the
          clients at its foot must clear the plate's round lower-left corner. */}
      <div className={`pointer-events-none absolute inset-y-0 ${PLATE_INSET} flex flex-col items-start justify-center gap-4 landscape:pb-[min(6svh,3rem)] portrait:justify-start portrait:pt-[calc(max(2vh,0.75rem)+var(--strip-h)+1.85rem)] [@media(max-height:45rem)]:gap-3`}>
        <p className={`${META} text-neutral-500 portrait:text-white/70 portrait:mix-blend-difference`}>{item.sector}</p>
        <span className="relative block aspect-[4/1] w-[min(36vw,26rem,55svh)] portrait:w-[58vw]">
          <Image src={item.mark ?? ""} alt="Zabraku" fill sizes="(orientation: portrait) 58vw, 36vw" className="object-contain object-left" />
        </span>
        <p className="font-helv -mt-1 text-[0.86rem] leading-snug text-neutral-700 portrait:text-white/[0.72] portrait:mix-blend-difference">
          <span className="font-bold">{BASED}</span>
          {item.years && (
            <>
              <span aria-hidden className="px-2 text-neutral-400 portrait:text-inherit">
                ·
              </span>
              {item.years}
            </>
          )}
        </p>
        <p className="font-helv max-w-[min(30rem,34vw)] text-[0.86rem] xl:max-w-[min(36rem,40vw)] leading-snug text-neutral-600 portrait:max-w-[calc(100vw-4.5rem)] portrait:text-white/[0.66] portrait:mix-blend-difference">
          {COMPANY_ABOUT.zabraku}
        </p>
        <span className="pointer-events-auto">
          <PixelButton side="logic" href={item.report.href}>
            {item.report.label} <span aria-hidden>→</span>
          </PixelButton>
        </span>
        {/* The clients, under the button (owner, 2026-10-17: "include
            Clients: Casa Playa and RKB dark grey logos"): the two marks in
            one dark grey (scripts/prepare-zabraku-clients.mjs), each a way to
            its section on the Zabraku page. On a portrait screen they sit
            over the robot, so they go light with the words. */}
        <div className="pointer-events-auto mt-[clamp(0.25rem,2vh,1.25rem)] flex flex-col gap-2 [@media(max-height:31.25rem)]:mt-0 [@media(max-height:31.25rem)]:gap-1">
          <p className={`${META} text-neutral-500 portrait:text-white/70 portrait:mix-blend-difference`}>Clients</p>
          <ul className="flex items-center gap-[clamp(1rem,2.5vw,1.75rem)]">
            {CLIENTS.map((c) => (
              <li key={c.id}>
                <Link
                  href={`${item.report.href ?? "/clients/zabraku-media"}#${c.id}`}
                  prefetch={false}
                  aria-label={`${c.name} — on the Zabraku page`}
                  className="block rounded-md opacity-90 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-neutral-900/40 portrait:invert portrait:mix-blend-difference"
                >
                  <span
                    className="relative block h-[clamp(2.75rem,8vh,4.5rem)] [@media(max-height:31.25rem)]:h-9"
                    style={{ aspectRatio: String(c.aspect) }}
                  >
                    <Image src={c.logo} alt="" fill sizes="10rem" className="object-contain" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
