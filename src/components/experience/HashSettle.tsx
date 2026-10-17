"use client";

/**
 * HashSettle — keeps a linked section in view while the page above it is
 * still growing (2026-10-17: the home slide's client marks link to their
 * sections on the Zabraku page, below a gallery that adds rows as it is
 * scrolled past — the jump to the section tripped it, and the section was
 * pushed out of view as the rows came in).
 *
 * On a page opened at #anchor, each time the page's height changes in its
 * first few seconds the anchor is brought back to the top (its own
 * scroll-margin respected). The first wheel, touch or key of the visitor's
 * hands the scroll back to them. Renders nothing.
 */

import { useEffect } from "react";

/** How long the page may take to settle. */
const SETTLE_MS = 4000;

export function HashSettle() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    let done = false;
    const stop = () => {
      done = true;
      ro.disconnect();
      window.clearTimeout(timer);
      for (const e of EVENTS) window.removeEventListener(e, stop);
    };
    const hold = () => {
      if (done) return;
      document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    };
    const ro = new ResizeObserver(hold);
    ro.observe(document.body);
    const timer = window.setTimeout(stop, SETTLE_MS);
    const EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    for (const e of EVENTS) window.addEventListener(e, stop, { passive: true, once: true });
    hold();
    return stop;
  }, []);
  return null;
}
