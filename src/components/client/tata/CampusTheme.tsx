"use client";

/**
 * CampusTheme — a campus's logo film, then its photographs, then round again.
 *
 * The owner asked on 2026-09-26 for band 01's columns to "play this before
 * showing the iisa image, then wait 5 seconds and loop this behaviour", and on
 * 2026-09-27 for Ahmedabad to run THREE photographs after its film, three
 * seconds each, fading between them. So the cycle is:
 *
 *   film ──▶ photo 1 ──▶ photo 2 ──▶ photo 3 ──▶ film ──▶ …
 *
 * with a dissolve at every step, for as long as the panel is on screen. A
 * column with one photograph is the same machine with one stop, which is what
 * Mumbai runs until its own set arrives.
 *
 * ⚠ EVERY PHOTOGRAPH IS ALWAYS IN THE DOM, stacked, with only the current one
 * at opacity 1. They are what shows in the photo half of the cycle, what a
 * reduced-motion visitor gets, what a browser that refuses to autoplay falls
 * back to, and what carries the alt text. The film is decoration layered over
 * them and is `aria-hidden` — the panel must never depend on it having played.
 *
 * ⚠ Only the FIRST photograph carries alt text; the rest are `alt=""`. All
 * three are in the DOM at once, so describing each would have a screen reader
 * announce three descriptions for what is visually one panel. The campus's own
 * paragraph sits directly beneath it either way.
 *
 * ⚠ MUTED, `playsInline`, and the audio track is stripped from the file itself
 * (see scripts/prepare-tata-theme.mjs). A loop that made a sound every few
 * seconds would be unbearable, and muted is also the only way a browser will
 * autoplay at all. `play()` can still be refused, and that is handled below.
 *
 * ⚠ It stops when it scrolls away. A decoding video loop in a page nobody is
 * looking at costs battery for nothing; leaving the viewport pauses it, and
 * coming back starts the cycle again at the film.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useInViewport } from "@/hooks/useInViewport";

/** ms each photograph holds. The owner's three seconds. (It was a single
 *  five-second hold when a column had only one photograph.) */
const PHOTO_HOLD = 3000;
/** ms of cross-fade — between photographs, and between the last one and the
 *  film. Long enough to read as a dissolve rather than a cut. */
const FADE = 700;
/** ms a column spends on photographs IN TOTAL before its film runs again.
 *
 *  ⚠ THIS IS WHAT KEEPS THE TWO COLUMNS IN STEP. They sit side by side and
 *  started their films together when both had one photograph; give Ahmedabad
 *  three and Mumbai one at a flat three seconds each and the pair drifts apart
 *  within a cycle, which reads as a fault rather than as a design. A column
 *  with fewer photographs holds each one longer instead, so every column's
 *  film starts at the same moment. It resolves itself the day Mumbai's own set
 *  arrives: three photographs each, three seconds each, nothing stretched. */
const PHOTO_STAGE = 3 * PHOTO_HOLD;

export interface CampusPhoto {
  src: string;
  alt: string;
}

export function CampusTheme({
  film,
  photos,
  sizes,
}: {
  /** The campus's logo sting. A column without one is just the slideshow. */
  film?: string;
  photos: CampusPhoto[];
  sizes: string;
}) {
  const reduceMotion = useReducedMotion();
  const { ref, inView } = useInViewport<HTMLDivElement>({ rootMargin: "200px" });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"film" | "photo">(film ? "film" : "photo");
  const [shot, setShot] = useState(0);

  /* The photograph half of the cycle: hold, then either move to the next one or
     hand back to the film. ⚠ The state change happens inside the timeout, not
     in the effect body — which is what keeps `set-state-in-effect` happy, and
     is also correct: the effect's job is to schedule, not to switch. */
  useEffect(() => {
    if (reduceMotion || !inView || phase !== "photo") return;
    // Each stop's share of the stage — PHOTO_HOLD when there are three.
    const hold = Math.max(PHOTO_HOLD, PHOTO_STAGE / photos.length);
    const timer = setTimeout(() => {
      if (shot < photos.length - 1) {
        setShot(shot + 1);
      } else if (film) {
        // Back to the top: reset first, so the film dissolves out onto the
        // opening photograph rather than the closing one.
        setShot(0);
        setPhase("film");
      } else {
        setShot(0);
      }
    }, hold);
    return () => clearTimeout(timer);
  }, [phase, shot, inView, reduceMotion, photos.length, film]);

  /* The film half: rewind and run, or stop because nobody is watching. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;
    if (phase === "film" && inView) {
      video.currentTime = 0;
      video.play().catch((error: DOMException) => {
        // ⚠ AbortError IS NOT A REFUSAL. It means something interrupted this
        // play() — the effect re-running (React's development double-mount
        // does exactly that), or the panel scrolling away mid-start. Treating
        // it as a refusal put the panel into its hold for no reason, which is
        // what knocked the two campuses out of step: one column started its
        // film while the other sat on its photograph.
        // A real refusal (NotAllowedError) is not a failure to report either —
        // the photographs are already there, so the panel just stays on them.
        if (error?.name !== "AbortError") setPhase("photo");
      });
    } else {
      video.pause();
    }
  }, [phase, inView, reduceMotion]);

  return (
    <div ref={ref} className="relative block aspect-[4/3] w-full overflow-hidden rounded-sm bg-neutral-100">
      {photos.map((photo, i) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={i === 0 ? photo.alt : ""}
          fill
          sizes={sizes}
          // ⚠ The opening photograph is eager because it is what the panel
          // shows before anything has run; the rest arrive while the film
          // plays, which is three seconds of cover at minimum.
          priority={false}
          loading={i === 0 ? "eager" : "lazy"}
          className="object-cover transition-opacity ease-out"
          style={{
            opacity: reduceMotion ? (i === 0 ? 1 : 0) : i === shot ? 1 : 0,
            transitionDuration: `${FADE}ms`,
          }}
        />
      ))}

      {film && !reduceMotion && (
        <video
          ref={videoRef}
          src={film}
          muted
          playsInline
          // Fetched only once the panel is near the viewport; ~120KB, so by the
          // time it is scrolled to, it is there.
          preload={inView ? "auto" : "none"}
          aria-hidden
          onEnded={() => setPhase("photo")}
          className="absolute inset-0 h-full w-full object-cover transition-opacity ease-out"
          style={{ opacity: phase === "film" ? 1 : 0, transitionDuration: `${FADE}ms` }}
        />
      )}
    </div>
  );
}
