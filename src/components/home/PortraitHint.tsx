"use client";

/**
 * PortraitHint — on a phone held upright, a suggestion: turn it sideways, or
 * come back on a laptop, for the full experience (Step 7 of the improvement
 * plan, 2026-10-13). A suggestion only — the page underneath is the same fully
 * responsive page, and "Continue anyway" is always there.
 *
 *   · PHONES IN PORTRAIT ONLY: a coarse pointer, upright, and no wider than a
 *     phone (600px) — never a tablet or a desktop.
 *   · It goes on its own the moment the phone turns to landscape, and once it
 *     has gone (turned, or "Continue anyway") it stays gone for the visit —
 *     sessionStorage, read and written inside try/catch (a private window or
 *     blocked storage just means it may ask again).
 *   · It does not trap anyone: not modal, no focus taken or held, the page
 *     behind still reachable by keyboard and screen reader.
 *
 * In the site's language: the black of the band, the name's face (Digibra —
 * .face-logic, as the home page's type rules want)
 * for the line, Helvetica under it, the facts' fade-and-rise to come in — and
 * a phone that turns on its side, its screen split as the brain is, grey and
 * paint. Reduced motion: no turning, no rise.
 *
 * ⚠ The words are the owner's choice between two drafts (COPY, CHOSEN).
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_IN_OUT, EASE_OUT } from "@/constants/motion";

const COPY = {
  A: {
    title: "Best on a bigger screen",
    body: "This portfolio is built as an experience — it opens up fully on a laptop. Or turn your phone sideways for more room.",
  },
  B: {
    title: "Turn me sideways",
    body: "Two halves of a brain live in here, and they like the room. Tilt your phone to landscape — or come back on a laptop for the full experience.",
  },
} as const;
/** The owner chose B (2026-10-13). */
export const CHOSEN: keyof typeof COPY = "B";

const PHONE_UPRIGHT = "(orientation: portrait) and (max-width: 600px) and (pointer: coarse)";
const LANDSCAPE = "(orientation: landscape)";
const KEY = "portrait-hint-dismissed";

const remembered = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
const remember = () => {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* storage blocked: it may ask again next load, nothing worse */
  }
};

/** The phone, turning on its side: outlined in white, its screen grey on the
 *  left and paint on the right. */
function TurningPhone({ still }: { still: boolean }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 48 48"
      className="size-14"
      animate={still ? undefined : { rotate: [0, 0, -90, -90, 0] }}
      transition={still ? undefined : { duration: 3.2, times: [0, 0.2, 0.45, 0.8, 1], ease: EASE_IN_OUT, repeat: Infinity }}
    >
      <defs>
        <linearGradient id="hint-paint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff2e8b" />
          <stop offset="0.35" stopColor="#ff8a00" />
          <stop offset="0.6" stopColor="#7fbf2e" />
          <stop offset="0.85" stopColor="#3f6ad8" />
          <stop offset="1" stopColor="#7a3fb0" />
        </linearGradient>
      </defs>
      <rect x="15" y="6" width="18" height="36" rx="3.5" fill="none" stroke="#fff" strokeWidth="2" />
      <rect x="18" y="10" width="6" height="26" fill="#737373" />
      <rect x="24" y="10" width="6" height="26" fill="url(#hint-paint)" />
      <circle cx="24" cy="39" r="1" fill="#fff" />
    </motion.svg>
  );
}

export function PortraitHint() {
  const reduceMotion = useReducedMotion() ?? false;
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (remembered()) return;
    const upright = window.matchMedia(PHONE_UPRIGHT);
    const landscape = window.matchMedia(LANDSCAPE);
    const sync = () => {
      // Turned sideways: the advice was taken — gone for the visit.
      if (landscape.matches) {
        remember();
        setShown(false);
        return;
      }
      setShown(upright.matches && !remembered());
    };
    sync();
    upright.addEventListener("change", sync);
    landscape.addEventListener("change", sync);
    return () => {
      upright.removeEventListener("change", sync);
      landscape.removeEventListener("change", sync);
    };
  }, []);

  const dismiss = () => {
    remember();
    setShown(false);
  };

  const copy = COPY[CHOSEN];
  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key="hint"
          className="fixed inset-0 grid place-items-center bg-white/70 px-6 backdrop-blur-sm"
          // Over the band and the stage; not modal — nothing behind is locked.
          style={{ zIndex: 60 }}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-labelledby="portrait-hint-title"
            aria-describedby="portrait-hint-body"
            className="flex w-full max-w-[20rem] flex-col items-center gap-4 rounded-3xl bg-neutral-950 px-7 pb-6 pt-8 text-center text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: reduceMotion ? 0 : 0.15 }}
          >
            <TurningPhone still={reduceMotion} />
            <p id="portrait-hint-title" className="face-logic digibra-light text-[1.35rem] uppercase leading-tight tracking-[0.04em]">
              {copy.title}
            </p>
            <p id="portrait-hint-body" className="text-[0.9rem] leading-relaxed text-neutral-300">
              {copy.body}
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-1 rounded-full border border-white/40 px-5 py-2 text-[0.8rem] font-bold tracking-[0.04em] text-white transition-colors hover:bg-white hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Continue anyway
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
