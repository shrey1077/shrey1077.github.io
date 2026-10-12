"use client";

/**
 * FooterFormulas — the Formula Stream behind the footer's left, logic half
 * (2026-10-10, owner: "Add this code, with 50 % opacity in the left side
 * footer bg").
 *
 * The footer splits as the brain does — the name in the logic face on the
 * left, contact in the creative face on the right (SiteFooter) — so the
 * stream of equations stands behind the left half, fading out toward the
 * middle. Below `lg`, where the footer is one centred stack, it runs behind
 * all of it.
 *
 * Configured here, not in the vendored file (originkit/FormulaStream):
 *   · on the footer's own light ground — the stream's panel transparent, its
 *     equations in the site's near-black at the original's 55% — rather than
 *     the original's near-black panel with pale type, as the logic side and
 *     the creative ground both went light (owner, 2026-10-05 and 2026-10-10).
 *     The pointer still tints the equations near it in the original's orange;
 *   · the whole layer at 50% (the owner's number);
 *   · as many lanes as suit the band's height (the original's 18 are for an
 *     800px panel);
 *   · mounted once the footer is a screen away, so the stream prepares its
 *     type in spare moments before anyone sees it, and DRAWING only while the
 *     footer is actually on screen (speed fix 7, 2026-10-13 — it mounted
 *     300px out and drew every frame from then, unseen); reduced motion:
 *     still, and the pointer leaves it alone.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import FormulaStream from "@/components/originkit/FormulaStream";

/** One lane per this many px of the band's height. */
const LANE_PX = 46;

export function FooterFormulas() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [near, setNear] = useState(false);
  const [seen, setSeen] = useState(false);
  const [lanes, setLanes] = useState(6);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "100% 0px" });
    io.observe(el);
    const view = new IntersectionObserver(([e]) => setSeen(e.isIntersecting));
    view.observe(el);
    const ro = new ResizeObserver(() => setLanes(Math.max(4, Math.min(18, Math.round(el.offsetHeight / LANE_PX)))));
    ro.observe(el);
    return () => {
      io.disconnect();
      view.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 w-full opacity-50 lg:w-1/2 lg:[-webkit-mask-image:linear-gradient(to_right,#000_70%,transparent)] lg:[mask-image:linear-gradient(to_right,#000_70%,transparent)]"
    >
      {near && (
        <FormulaStream
          background="transparent"
          textColor="rgba(23, 23, 23, 0.55)"
          density={lanes}
          speed={reduceMotion ? 0 : 69}
          hover={reduceMotion ? 0 : 139}
          paused={!seen}
        />
      )}
    </div>
  );
}
