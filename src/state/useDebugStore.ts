/**
 * Debug / development configuration store (Zustand).
 *
 * Separate from the scene store on purpose: this holds *developer tuning knobs*
 * (driven by the Leva panel), not application state. Keeping it isolated means:
 *
 *   • Production code can read these values and always get the neutral defaults
 *     (which resolve to the same look the constants define), so behavior is
 *     identical whether or not the debug panel exists.
 *   • The Leva panel itself (components/debug/DebugPanel.tsx) is the ONLY writer,
 *     and it is dynamically imported dev-only — so `leva` never enters the
 *     production bundle, and this store simply sits at its defaults there.
 *
 * Values are expressed as neutral multipliers / overrides so "no panel" == "use
 * the constants verbatim".
 */

import { create } from "zustand";
import { CONTACT_SHADOW } from "@/constants/scene";

interface DebugState {
  /** Multiplier on the responsively-computed brain scale. 1 = as designed. */
  brainScale: number;
  /** Whether the brain reacts to the mouse. Lets a dev freeze it to inspect. */
  mouseRotationEnabled: boolean;
  /** Constant rotation offsets (degrees) added on top of mouse rotation. */
  rotationOffsetXDeg: number;
  rotationOffsetYDeg: number;
  /** Multiplier applied to every light's intensity. 1 = as designed. */
  lightIntensity: number;
  /** Multiplier on the camera's distance from the brain. 1 = as designed. */
  cameraDistance: number;
  /** Absolute opacity for the contact shadow. Defaults to the scene constant. */
  shadowOpacity: number;
}

interface DebugActions {
  /** Merge a partial patch. Leva's onChange handlers call this. */
  setDebug: (patch: Partial<DebugState>) => void;
}

export type DebugStore = DebugState & DebugActions;

/** Neutral defaults — with these, the scene renders exactly as the constants specify. */
export const DEBUG_DEFAULTS: DebugState = {
  brainScale: 1,
  mouseRotationEnabled: true,
  rotationOffsetXDeg: 0,
  rotationOffsetYDeg: 0,
  lightIntensity: 1,
  cameraDistance: 1,
  shadowOpacity: CONTACT_SHADOW.opacity,
};

export const useDebugStore = create<DebugStore>((set) => ({
  ...DEBUG_DEFAULTS,
  setDebug: (patch) => set(patch),
}));
