/**
 * The scroll journey's route — which exsec sits where on the 2D plane.
 *
 * Spec: docs/HANDOFF/16_SCROLL_JOURNEY_SPEC.md
 *
 * ⚠ THE ZIG-ZAG IS THE TWO HEMISPHERES INTERLEAVED, not a new ordering. The
 * owner asked for Clients, then Art down-and-RIGHT, then Projects down-and-LEFT,
 * alternating. Left-column (logic) and right-column (creative) sections taken in
 * turn produce exactly that, so the route reads as the brain's own split
 * unfolding rather than an arbitrary path:
 *
 *     col 0 (logic)      col 1 (creative)
 *     ─────────────      ────────────────
 *  0  Clients
 *  1                     Art
 *  2  Projects
 *  3                     Publications
 *  4  Logofolio
 *  5                     The Extincts Project
 *  6  Career Path
 *  7                     AI Generations & Ideas
 *
 * `row` doubles as the step index: step N is the Nth stop on the scroll.
 */

import { NAV_SECTIONS } from "@/constants/navigation";
import type { NavSectionId } from "@/types/navigation";

export interface JourneyStop {
  id: NavSectionId;
  label: string;
  /** 0 = the plane's left column, 1 = its right. */
  col: 0 | 1;
  /** Also the step index — one row per stop, so the camera always descends. */
  row: number;
}

const byHemisphere = (side: "left" | "right") =>
  NAV_SECTIONS.filter((s) => s.hemisphere === side).sort((a, b) => a.order - b.order);

/** Interleaved: logic, creative, logic, creative… */
export const JOURNEY: JourneyStop[] = (() => {
  const logic = byHemisphere("left");
  const creative = byHemisphere("right");
  const out: JourneyStop[] = [];
  for (let i = 0; i < Math.max(logic.length, creative.length); i++) {
    if (logic[i]) out.push({ id: logic[i].id, label: logic[i].label, col: 0, row: out.length });
    if (creative[i]) out.push({ id: creative[i].id, label: creative[i].label, col: 1, row: out.length });
  }
  return out;
})();

/** How many viewport-heights of scroll each phase gets.
 *
 *  ⚠ The fly-through gets ONE and each stop gets ONE, so the whole journey is
 *  1 + JOURNEY.length screens of scrolling. Changing these changes how fast the
 *  camera moves, not what it passes. */
export const FLY_VH = 1;
export const STOP_VH = 1;
export const JOURNEY_VH = FLY_VH + JOURNEY.length * STOP_VH;

/** Where phase A (the fly-through) ends, as a fraction of the whole journey. */
export const FLY_END = FLY_VH / JOURNEY_VH;

/** Find a stop's index by id — the click-to-jump route needs it. */
export function stopIndexOf(id: NavSectionId): number {
  return JOURNEY.findIndex((s) => s.id === id);
}
