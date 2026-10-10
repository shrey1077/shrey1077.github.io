"use client";

/**
 * TataViewer — the page's one way of looking at a piece full size: the
 * MediaViewer, walking a list of plates (2026-10-05).
 *
 * Every wall on the page shows THUMBNAILS (scripts/prepare-tata-thumbs.mjs)
 * and opens the full file here, so the page carries hundreds of pieces
 * without loading hundreds of full-size files. A wall keeps one `ViewerState`
 * — which list, and where in it — and hands it here.
 */

import { MediaViewer } from "@/components/experience/MediaViewer";

/** One piece of work, as the walls see it. */
export interface TataPlate {
  /** The full file — what the viewer shows. */
  url: string;
  /** The small copy — what a wall shows. The full file when there is none. */
  thumb: string;
  /** Said in the viewer. */
  name: string;
  /** The ORIGINAL's size, for laying a tile to its picture. */
  w: number;
  h: number;
}

export type ViewerState = { plates: readonly TataPlate[]; at: number } | null;

export function TataViewer({ state, onChange }: { state: ViewerState; onChange: (s: ViewerState) => void }) {
  const plate = state ? state.plates[state.at] : undefined;
  const n = state?.plates.length ?? 0;
  const step = (by: number) => state && onChange({ ...state, at: (state.at + by + n) % n });
  const walks = n > 1;
  return (
    <MediaViewer
      asset={plate ? { name: plate.name, url: plate.url, kind: "image" } : null}
      onClose={() => onChange(null)}
      onPrev={walks ? () => step(-1) : undefined}
      onNext={walks ? () => step(1) : undefined}
      position={state && walks ? { at: state.at + 1, of: n } : undefined}
    />
  );
}
