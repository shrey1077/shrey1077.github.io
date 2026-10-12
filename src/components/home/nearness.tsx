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

//   loaded   the window's load event — the page's own downloads are done;
//   up       …and on the home page, the photo is on screen too — both halves
//            in (PortraitOrb) and its fade-in finished (HeroStage): the
//            first screen is up, and the background downloads
//            may start. Until then they would compete with it — and the
//            photo only appears once the page's code has run, after load;
//   settled  the brain's frames are in (BrainSequence), or long overdue: the
//            rest of the rooms' pictures may come.

let loaded = false;
let photoShown = false;
const photoParts = new Set<string>();
let up = false;
let settled = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((f) => f());

/** If the photo never reports (it always should), the first screen counts as
 *  up this long after the load. */
const UP_FALLBACK_MS = 5000;
/** If the brain's frames are slow, the rooms do not wait on them past this. */
const SETTLE_FALLBACK_MS = 10000;

const checkUp = () => {
  if (up || !loaded || !photoShown) return;
  up = true;
  notify();
  window.setTimeout(markBrainFramesIn, SETTLE_FALLBACK_MS);
};

/** The photo is on screen: called with "loaded" when both halves are in
 *  (PortraitOrb), with "settled" when its fade-in has finished (HeroStage) —
 *  both, and it is. With no part, it is outright (the fallback). */
export function markPhotoShown(part?: "loaded" | "settled") {
  if (photoShown) return;
  if (part) {
    photoParts.add(part);
    if (photoParts.size < 2) return;
  }
  photoShown = true;
  checkUp();
}

/** The brain's frames are all in (BrainSequence): the rooms' turn. */
export function markBrainFramesIn() {
  if (settled) return;
  settled = true;
  notify();
}

if (typeof window !== "undefined") {
  const onLoad = () => {
    loaded = true;
    notify();
    checkUp();
    window.setTimeout(() => markPhotoShown(), UP_FALLBACK_MS);
  };
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });
}

/** Calls `cb` once the first screen is up (now, if it is). Returns a stop. */
export function whenFirstScreenUp(cb: () => void): () => void {
  if (up) {
    cb();
    return () => {};
  }
  const f = () => {
    if (!up) return;
    listeners.delete(f);
    cb();
  };
  listeners.add(f);
  return () => listeners.delete(f);
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
const readUp = () => up;
const readSettled = () => settled;

/** The page has loaded: its own downloads are done (any page). */
export const usePageLoaded = () => useMilestone(readLoaded);
/** The home page's first screen is up — loaded, and the photo showing. */
export const useFirstScreenUp = () => useMilestone(readUp);
/** …and the brain's frames are in (or long overdue): everything else may come. */
export const usePageSettled = () => useMilestone(readSettled);
