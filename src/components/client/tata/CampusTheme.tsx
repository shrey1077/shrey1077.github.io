"use client";

/**
 * CampusTheme — a campus's logo film, then its building, then round again.
 *
 * The owner asked on 2026-09-26 for band 01's Ahmedabad column to "play this
 * before showing the iisa image, then wait 5 seconds and loop this behaviour".
 * So: the film runs once, the photograph holds for HOLD, the film runs again,
 * for as long as the panel is on screen.
 *
 * ⚠ THE PHOTOGRAPH IS ALWAYS IN THE DOM, underneath. It is what shows in the
 * photo half of the cycle, what a reduced-motion visitor gets, what a browser
 * that refuses to autoplay falls back to, and what carries the alt text. The
 * film is decoration layered over it and is `aria-hidden` — the panel must
 * never depend on it having played.
 *
 * ⚠ MUTED, `playsInline`, and the audio track is stripped from the file itself
 * (see scripts/prepare-tata-theme.mjs). A loop that made a sound every five
 * seconds would be unbearable, and muted is also the only way a browser will
 * autoplay at all. `play()` can still be refused, so the rejection is caught
 * and the panel simply stays on the photograph.
 *
 * ⚠ It stops when it scrolls away. A decoding video loop in a page nobody is
 * looking at costs battery for nothing; leaving the viewport pauses it and
 * coming back starts the cycle again at the film.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useInViewport } from "@/hooks/useInViewport";

/** ms the photograph holds before the film runs again — the owner's five. */
const HOLD = 5000;
/** ms of cross-fade between the two. Long enough to read as a dissolve, short
 *  enough that the film's first frame is not left half-visible. */
const FADE = 400;

export function CampusTheme({
  film,
  photo,
  photoAlt,
  sizes,
}: {
  film: string;
  photo: string;
  photoAlt: string;
  sizes: string;
}) {
  const reduceMotion = useReducedMotion();
  const { ref, inView } = useInViewport<HTMLDivElement>({ rootMargin: "200px" });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"film" | "photo">("film");

  /* The photo half of the cycle. ⚠ The state change happens inside the timeout,
     not in the effect body, which is what keeps `set-state-in-effect` happy —
     and is also correct: the effect's job is to schedule, not to switch. */
  useEffect(() => {
    if (reduceMotion || !inView || phase !== "photo") return;
    const timer = setTimeout(() => setPhase("film"), HOLD);
    return () => clearTimeout(timer);
  }, [phase, inView, reduceMotion]);

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
        // it as a refusal put the panel into its five-second hold for no
        // reason, which is what knocked the two campuses out of step: one
        // column started its film while the other sat on its photograph.
        // A real refusal (NotAllowedError) is not a failure to report either —
        // the photograph is already there, so the panel just stays on it.
        if (error?.name !== "AbortError") setPhase("photo");
      });
    } else {
      video.pause();
    }
  }, [phase, inView, reduceMotion]);

  return (
    <div ref={ref} className="relative block aspect-[4/3] w-full overflow-hidden rounded-sm bg-neutral-100">
      <Image src={photo} alt={photoAlt} fill sizes={sizes} className="object-cover" />

      {!reduceMotion && (
        <video
          ref={videoRef}
          src={film}
          muted
          playsInline
          // Fetched only once the panel is near the viewport; 121KB, so by the
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
