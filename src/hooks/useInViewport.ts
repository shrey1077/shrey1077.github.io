"use client";

/**
 * useInViewport — reports whether a referenced element is currently in view.
 *
 * Cross-cutting (not owned by one visual system), so it lives in `src/hooks`.
 * Phase 2 uses it to pause the WebGL render loop when the hero scrolls out of
 * view (the GPU idles while the visitor is reading a preview), but it is generic
 * enough for any future visibility-gated behavior.
 *
 * Uses a single IntersectionObserver and cleans it up on unmount / ref change.
 */

import { useEffect, useRef, useState, type RefObject } from "react";

interface Options {
  /** IntersectionObserver threshold(s). Default fires as soon as any part shows. */
  threshold?: number | number[];
  /** IntersectionObserver rootMargin (e.g. to pre-trigger before fully visible). */
  rootMargin?: string;
  /** Value assumed before the observer first reports. Default `true` so 3D isn't
   *  paused during the initial mount. */
  initial?: boolean;
}

export function useInViewport<T extends Element>(
  options: Options = {},
): { ref: RefObject<T | null>; inView: boolean } {
  const { threshold = 0, rootMargin = "0px", initial = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(initial);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold, rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
    // threshold arrays are referentially unstable; callers pass literals/constants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootMargin]);

  return { ref, inView };
}
