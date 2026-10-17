"use client";

/**
 * LandscapeLaptop — a phone held sideways sees the home page as a laptop does
 * (owner, 2026-10-17: "mobile view if we see on landscape version, its very
 * different in size than laptop landscape view, match them as close as
 * possible" — then, asked: the laptop layout, scaled, on the home slides
 * only).
 *
 * How: the page's viewport is set to a laptop's width, so the browser lays
 * the slides out as on a laptop and scales the whole down to the phone —
 * the width chosen so the laid-out height is a laptop's too (≥ 640 px, the
 * phone's own proportions kept). Upright, and on every other page, the
 * viewport is the device's own, as before. Pinch-zoom still works.
 *
 *   · FIT_SCRIPT (landscapeFit) — run inline in the page, before it is painted, so a
 *     sideways phone never sees the phone layout first;
 *   · <LandscapeLaptop/> — keeps it right as the phone turns, and gives the
 *     device's viewport back when the visitor leaves the home page.
 *
 * (RotateGate, until 2026-10-03, scaled the whole site this way; it went for
 * the fully responsive site. This brings it back for one case: the home page,
 * sideways, on a phone.)
 */

import { useLayoutEffect } from "react";
import { DEVICE_VIEWPORT, fitViewport } from "@/components/home/landscapeFit";

export function LandscapeLaptop() {
  useLayoutEffect(() => {
    fitViewport();
    const onTurn = () => fitViewport();
    window.addEventListener("orientationchange", onTurn);
    screen.orientation?.addEventListener?.("change", onTurn);
    // Whenever the head changes — a viewport tag added (the framework adds
    // its own as the page starts) or rewritten — put it right again.
    const mo = new MutationObserver(() => fitViewport());
    mo.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ["content"] });
    return () => {
      mo.disconnect();
      window.removeEventListener("orientationchange", onTurn);
      screen.orientation?.removeEventListener?.("change", onTurn);
      document.querySelectorAll('meta[name="viewport"]').forEach((m) => {
        if (m.getAttribute("content") !== DEVICE_VIEWPORT) m.setAttribute("content", DEVICE_VIEWPORT);
      });
    };
  }, []);
  return null;
}
