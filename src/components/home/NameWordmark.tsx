"use client";

/**
 * ⚠ UNUSED SINCE 2026-10-26, the day it went in (owner: "Remove the effect we
 * did on name on first slide"). Kept whole, with VectorWordmark.
 *
 * NameWordmark — the name on the first slide, drawn through Originkit's
 * Vector Wordmark (owner, 2026-10-26: "i want my name on first slide to have
 * this effect in the same font as now").
 *
 * The name stays in the page as it was — the same span, the same Digibra, the
 * same size, so everything laid out round it holds — but unseen; the effect
 * is drawn over it at its size, a margin round it for the handles and their
 * readouts. Reduced motion: the name as it was, still.
 */

import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { VectorWordmark } from "@/components/originkit/VectorWordmark";

export function NameWordmark({ text, className, active }: { text: string; className: string; active: boolean }) {
  const reduceMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLSpanElement>(null);
  const [px, setPx] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setPx(parseFloat(getComputedStyle(el).fontSize) || 0);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const on = !reduceMotion && px > 0;
  return (
    <span className="relative inline-block">
      <span ref={ref} className={`${className} ${on ? "opacity-0" : ""}`}>
        {text}
      </span>
      {on && (
        <VectorWordmark
          text={text.toUpperCase()}
          font={{ family: "Digibra", weight: 400 }}
          fontPx={px}
          active={active}
          textColor="#171717"
          shade="#3f3f46"
          accent="rgba(23, 23, 23, 0.4)"
          reach={Math.round(px * 3.2)}
          handles={{ size: Math.round(px * 1.35), spread: 27, labels: true }}
          className="!absolute"
          style={{ left: "-10%", right: "-10%", top: "-75%", bottom: "-75%" }}
        />
      )}
    </span>
  );
}
