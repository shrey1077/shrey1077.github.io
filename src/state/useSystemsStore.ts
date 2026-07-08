/**
 * Brain-systems toggle store (Zustand).
 *
 * Every homepage animation system can be individually enabled/disabled
 * (docs/BRAIN_SYSTEM.md). Defaults come from the registry (constants/systems.ts)
 * and ship to production as-is; the dev panel (DebugPanel) flips them live for
 * tuning/profiling. Separate from the scene/debug stores — this is *composition*
 * state, not tuning knobs or app state.
 */

import { create } from "zustand";
import { BRAIN_SYSTEMS, type BrainSystemId } from "@/constants/systems";

type SystemFlags = Record<BrainSystemId, boolean>;

const DEFAULTS: SystemFlags = BRAIN_SYSTEMS.reduce((acc, s) => {
  acc[s.id] = s.enabled;
  return acc;
}, {} as SystemFlags);

interface SystemsStore {
  flags: SystemFlags;
  setSystem: (id: BrainSystemId, enabled: boolean) => void;
}

export const useSystemsStore = create<SystemsStore>((set) => ({
  flags: { ...DEFAULTS },
  setSystem: (id, enabled) =>
    set((state) => ({ flags: { ...state.flags, [id]: enabled } })),
}));
