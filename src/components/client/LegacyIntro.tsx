"use client";

/**
 * LegacyIntro — the Tata IIS opening sequence (plays once, ever).
 *
 * Seven seconds on pure white: three generations surface one at a time —
 * Jamsetji, J. R. D., Ratan — each a monochrome portrait with a single meta
 * line. As the last fades, the TATA IIS wordmark arrives as a mask: zoomed
 * far out, it settles into place and resolves solid black on the white
 * ground (the digital guideline value). Then the memory releases into the
 * page.
 *
 * Storyboard Scene 2 (docs/STORYBOARD_TATA_IIS.md) · timeline in
 * docs/TATA_IIS_BUILD_PROMPT.md. Rules honored here:
 *   • plays once — localStorage flag; `?intro=1` replays (dev/testing)
 *   • Skip sits quietly bottom-right
 *   • prefers-reduced-motion → static wordmark beat, then release
 *   • no sound, no spinner, nothing decorative
 */

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Decide on a frame boundary so the sequence starts aligned to paint.
    const frame = requestAnimationFrame(() => {
      const forced = new URLSearchParams(window.location.search).has("intro");
      let played = false;
      try {
        played = !!localStorage.getItem(STORAGE_KEY);
        if (!played || forced)
          localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      } catch {
        // storage unavailable → play; the sequence remains skippable
      }
      if (played && !forced) {
        setPhase("done");
        return;
      }
      setPhase("playing");

      if (reducedMotion) {
        // The memory, condensed: the settled wordmark for a breath.
        setStep(4);
        timers.push(setTimeout(() => setPhase("leaving"), 1500));
        return;
      }

      for (const [at, s] of TIMELINE)
        timers.push(setTimeout(() => setStep(s), at * 1000));
      timers.push(setTimeout(() => setPhase("leaving"), TOTAL * 1000));
    });

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
  }, [reducedMotion]);

  if (phase === "done") return null;

  return (
    <AnimatePresence onExitComplete={() => setPhase("done")}>
      {phase !== "leaving" && (
        <motion.div
          role="presentation"
          aria-label="Tata legacy introduction"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: DURATION.medium, ease: EASE_OUT } }}
          className="fixed inset-0 bg-white"
          style={{ zIndex: Z_INDEX.viewer + 1 }}
        >
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
              type="button"
              onClick={() => setPhase("leaving")}
              className={`${typeVoiceClass("logic", "meta")} absolute bottom-6 right-6 text-[0.65rem] text-neutral-400 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900 sm:bottom-10 sm:right-10`}
            >
              Skip →
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
