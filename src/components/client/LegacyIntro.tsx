"use client";

/**
 * LegacyIntro — the Tata IIS opening sequence (plays once, once SEEN).
 *
 * Seven seconds on pure white: three generations surface one at a time —
 * Jamsetji, J. R. D., Ratan — each a monochrome portrait with a single meta
 * line. As the last fades, the TATA IIS wordmark arrives as a mask: zoomed
 * far out, it settles into place and resolves solid black on the white
 * ground. Then the memory releases into the page.
 *
 * Storyboard Scene 2 (docs/STORYBOARD_TATA_IIS.md). Rules honored here:
 *   • plays once — the localStorage flag is written on COMPLETION or Skip,
 *     never at the start, so a refresh mid-intro replays rather than burning
 *     the one-time play; `?intro=1` always replays (dev/testing)
 *   • it is a real dialog — announced, focus moved to Skip, Escape dismisses
 *   • the wordmark reveal carries a text alternative for assistive tech
 *   • prefers-reduced-motion → static wordmark beat, then release
 *   • no sound, no spinner, nothing decorative
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { Z_INDEX } from "@/constants/design";
import { typeVoiceClass } from "@/constants/typography";

const STORAGE_KEY = "tata-iis-legacy-played";
const BASE = "/content/clients/tata-iis/intro";

const PORTRAITS = [
  { src: `${BASE}/01-jamsetji.webp`, name: "Jamsetji Tata", years: "1839–1904" },
  { src: `${BASE}/02-jrd.webp`, name: "J. R. D. Tata", years: "1904–1993" },
  { src: `${BASE}/03-ratan.webp`, name: "Ratan Tata", years: "1937–2024" },
] as const;

const WORDMARK_MASK = `${BASE}/wordmark-mask.png`;

/** Timeline (seconds → step). Steps: 0 hold · 1/2/3 portraits · 4 wordmark. */
const TIMELINE: readonly [number, number][] = [
  [0.3, 1],
  [2.3, 2],
  [4.3, 3],
  [5.8, 4],
];
const TOTAL = 7.0;

type Phase = "deciding" | "playing" | "leaving" | "done";

export function LegacyIntro() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("deciding");
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const skipRef = useRef<HTMLButtonElement>(null);

  /** Record that the sequence was actually seen — write the once-only flag,
   *  clear any pending timers, and release. Called on natural completion,
   *  Skip, or Escape — never at the start. */
  const leave = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // storage unavailable → nothing to persist; the sequence still ends
    }
    setPhase("leaving");
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const forced = new URLSearchParams(window.location.search).has("intro");
      let played = false;
      try {
        played = !!localStorage.getItem(STORAGE_KEY);
      } catch {
        // storage unavailable → treat as unplayed; sequence remains skippable
      }
      if (played && !forced) {
        setPhase("done");
        return;
      }
      setPhase("playing");

      if (reducedMotion) {
        setStep(4); // the memory, condensed: the settled wordmark for a breath
        timers.current.push(setTimeout(leave, 1500));
        return;
      }

      for (const [at, s] of TIMELINE)
        timers.current.push(setTimeout(() => setStep(s), at * 1000));
      timers.current.push(setTimeout(leave, TOTAL * 1000));
    });

    return () => {
      cancelAnimationFrame(frame);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [reducedMotion, leave]);

  // Move focus into the dialog and let Escape dismiss it.
  useEffect(() => {
    if (phase !== "playing") return;
    skipRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, leave]);

  if (phase === "done") return null;

  return (
    <AnimatePresence onExitComplete={() => setPhase("done")}>
      {phase !== "leaving" && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Tata legacy — the founders behind the institute"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: DURATION.medium, ease: EASE_OUT } }}
          className="fixed inset-0 bg-white"
          style={{ zIndex: Z_INDEX.viewer + 1 }}
        >
          {/* Preload the climactic mask so the final beat never pops in late. */}
          <link rel="preload" as="image" href={WORDMARK_MASK} />

          {/* The three generations. */}
          {PORTRAITS.map((portrait, i) => {
            const active = step === i + 1;
            const passed = step > i + 1;
            return (
              <motion.figure
                key={portrait.name}
                initial={false}
                animate={{
                  opacity: active ? 1 : 0,
                  scale: active || passed ? 1 : 1.03,
                }}
                transition={{ duration: 0.7, ease: EASE_OUT }}
                className="absolute inset-0 flex flex-col items-center justify-center px-8 py-14"
              >
                <div className="relative h-[58vh] w-full max-w-xl">
                  <Image
                    src={portrait.src}
                    alt={portrait.name}
                    fill
                    priority
                    sizes="(max-width: 640px) 90vw, 576px"
                    className="object-contain"
                  />
                </div>
                <figcaption
                  className={`${typeVoiceClass("logic", "meta")} mt-8 text-[0.65rem] text-neutral-500`}
                >
                  {portrait.name} · {portrait.years}
                </figcaption>
              </motion.figure>
            );
          })}

          {/* The wordmark mask: zoomed out → into place → solid black. */}
          {step >= 4 && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-8">
              <motion.div
                role="img"
                aria-label="TATA IIS"
                initial={
                  reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 7 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: EASE_OUT }}
                className="aspect-[4/1] w-[min(84vw,44rem)] bg-black"
                style={{
                  WebkitMaskImage: `url(${WORDMARK_MASK})`,
                  maskImage: `url(${WORDMARK_MASK})`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            </div>
          )}

          {/* Returning visitors' respect. */}
          {phase === "playing" && (
            <button
              ref={skipRef}
              type="button"
              onClick={leave}
              className={`${typeVoiceClass("logic", "meta")} absolute bottom-6 right-6 rounded px-2 py-1 text-[0.65rem] text-neutral-500 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40 sm:bottom-10 sm:right-10`}
            >
              Skip →
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
