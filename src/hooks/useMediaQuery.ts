"use client";

/**
 * useMediaQuery — subscribe to a CSS media query.
 *
 * Built on useSyncExternalStore rather than useState + useEffect, for two
 * reasons: it gives a correct value on the very first client render (no
 * one-frame flash of the wrong layout), and it avoids calling setState from
 * inside an effect, which this repo lints as an error.
 *
 * The server snapshot is always `false`, so write queries such that `false`
 * describes the DESKTOP case — the markup then matches on first paint for the
 * static export and only narrow viewports correct themselves.
 */

import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => (typeof window === "undefined" ? false : window.matchMedia(query).matches),
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Tailwind's `sm` breakpoint: true below 640px. */
export const useIsPhone = () => useMediaQuery("(max-width: 639px)");
/** Tailwind's `lg` breakpoint: true below 1024px. */
export const useIsCompact = () => useMediaQuery("(max-width: 1023px)");
