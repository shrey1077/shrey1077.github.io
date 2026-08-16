"use client";

/**
 * RotateGate — ask a phone to turn sideways, then serve it the laptop site.
 *
 * The owner's decision (2026-08-16): rather than maintaining a second, mobile
 * layout of a stage that is built around a wide canvas, a phone is asked to
 * rotate once and then gets the desktop composition.
 *
 * ⚠ Rotating is NOT sufficient on its own, and this is the whole reason the
 * component does more than draw an overlay. A phone in landscape is about
 * 844×390 — still far below the `lg` (1024px) breakpoint that the pins, the
 * corner furniture and the thought box are gated on. Turning the phone alone
 * would produce the same cramped layout, sideways. So in landscape this also
 * rewrites the viewport meta to a fixed `width=DESIGN_W`, which makes the
 * browser lay the page out at laptop width and scale the whole thing down to
 * fit. That is what "just like laptop" actually requires.
 *
 * ⚠ The override is applied ONLY in landscape. Left on in portrait it would
 * shrink this very overlay to ~30% and the instruction would be unreadable.
 *
 * ⚠ Detection reads `screen`, never the viewport. Once the override is live
 * the layout viewport reports 1280, so any `max-width` test would immediately
 * flip and fight itself. `screen.width/height` and `(orientation: portrait)`
 * are unaffected by the viewport meta, so they are stable ground.
 *
 * There is a way past the gate on purpose. Plenty of people browse with
 * rotation locked, and a hard block would strand them; "continue anyway" hands
 * them the narrow layout, which is what `SectionNav` exists to serve.
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Lay the site out at this width on a handheld and let the browser scale. */
const DESIGN_W = 1280;
/** Shorter screen edge, in device px, at or under which we treat it as a phone.
 *  820 keeps phones and the smallest tablets in, and leaves iPads — which get
 *  ≥1024 in landscape natively — out. */
const PHONE_EDGE = 820;

function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => {};
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => (typeof window === "undefined" ? false : window.matchMedia(query).matches),
    () => false,
  );
}

/** The shorter edge of the physical screen. Server snapshot is deliberately
 *  huge so the static export renders as desktop and never flashes the gate. */
function useScreenEdge(): number {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("resize", cb);
      window.addEventListener("orientationchange", cb);
      return () => {
        window.removeEventListener("resize", cb);
        window.removeEventListener("orientationchange", cb);
      };
    },
    () => Math.min(window.screen.width, window.screen.height),
    () => 9999,
  );
}

export function RotateGate() {
  const reduceMotion = useReducedMotion();
  const coarse = useMedia("(pointer: coarse)");
  const portrait = useMedia("(orientation: portrait)");
  const edge = useScreenEdge();
  const [dismissed, setDismissed] = useState(false);

  const handheld = coarse && edge <= PHONE_EDGE;
  const wantsLandscapeLayout = handheld && !portrait;
  const showGate = handheld && portrait && !dismissed;

  // Widen the layout viewport in landscape so `lg:` actually engages. Restores
  // whatever was there on the way out, so the root layout stays the source of
  // truth for everyone else.
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta || !wantsLandscapeLayout) return;
    const prev = meta.getAttribute("content");
    meta.setAttribute("content", `width=${DESIGN_W}`);
    return () => {
      if (prev) meta.setAttribute("content", prev);
    };
  }, [wantsLandscapeLayout]);

  if (!showGate) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rotate your device"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 bg-gallery px-8 text-center"
    >
      <motion.svg
        aria-hidden
        viewBox="0 0 64 64"
        className="size-16 text-neutral-900"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? false : { rotate: 0 }}
        animate={reduceMotion ? undefined : { rotate: [0, 0, -90, -90, 0] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 3.4, times: [0, 0.25, 0.5, 0.85, 1], repeat: Infinity, ease: "easeInOut" }
        }
      >
        <rect x="20" y="6" width="24" height="42" rx="4" />
        <line x1="28" y1="42" x2="36" y2="42" />
      </motion.svg>

      <div className="max-w-xs">
        <h2 className="font-graff text-2xl font-extrabold leading-tight text-neutral-900">
          Turn your phone sideways
        </h2>
        <p className="font-helv mt-3 text-sm leading-relaxed text-neutral-500">
          This one is built wide — the brain, the sections and both margins only
          fit in landscape. Rotate and it loads like a laptop.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="font-helv min-h-11 text-xs uppercase tracking-[0.18em] text-neutral-400 underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"
      >
        Continue anyway
      </button>
    </div>
  );
}
