"use client";

/**
 * nearness — when a picture that is NOT on the first screen may download
 * (speed fix 4, 2026-10-13).
 *
 * Every room is built when the page opens (hidden, waiting in the depth), and
 * the browser fetched all their pictures at once — the Arts & Crafts tiles,
 * the Projects boards, the logos — alongside the first screen. Now a room's
 * pictures wait until the camera is one step from it (or flying to it), or
 * until the page has settled, when the rest come down in the background. So
 * they are in before any room flies in; nothing on screen changes.
 *
 * Pictures that should wait use RoomImage instead of next/image. Anything
 * outside a NearContext (every other page) loads exactly as it always did.
 */

import { createContext, useContext, useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

/** True where pictures may load. The default — no provider — is true. */
export const NearContext = createContext(true);

/** A transparent pixel: what a waiting picture shows (it is hidden anyway). */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** next/image, holding its download until its room is near. */
export function RoomImage({ src, alt, ...rest }: ImageProps) {
  const near = useContext(NearContext);
  return <Image {...rest} alt={alt} src={near ? src : BLANK} />;
}

// ── The page's own milestones.

let loaded = false;
let settled = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((f) => f());

/** The brain's frames are all in (BrainSequence): the rooms' turn. */
export function markBrainFramesIn() {
  if (settled) return;
  settled = true;
  notify();
}

/** If the brain's frames are slow, the rooms do not wait on them past this. */
const SETTLE_FALLBACK_MS = 10000;

if (typeof window !== "undefined") {
  const onLoad = () => {
    loaded = true;
    notify();
    window.setTimeout(markBrainFramesIn, SETTLE_FALLBACK_MS);
  };
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });
}

function useMilestone(read: () => boolean) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const f = () => setV(read());
    f();
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  }, [read]);
  return v;
}

const readLoaded = () => loaded;
const readSettled = () => settled;

/** The page has loaded: the first screen's own downloads are done. */
export const usePageLoaded = () => useMilestone(readLoaded);
/** …and the brain's frames are in (or long overdue): everything else may come. */
export const usePageSettled = () => useMilestone(readSettled);
