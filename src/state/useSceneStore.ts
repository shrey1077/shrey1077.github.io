/**
 * Global scene store (Zustand).
 *
 * This is the single source of shared, cross-component state for the whole
 * experience. In Phase 1 most of it is scaffolding: the fields exist and can be
 * read/written, but only a couple are actively consumed. That is deliberate —
 * the brief asks us to "prepare state for future phases" without over-
 * engineering, so we declare the shape now and let later phases wire it in.
 *
 * IMPORTANT — performance contract:
 * The brain's mouse rotation does NOT flow through this store. Writing pointer
 * coordinates here every frame would re-render every subscribed component 60+
 * times per second. Instead, the render-loop reads R3F's internal `state.pointer`
 * and mutates the mesh via refs (see components/brain/useBrainInteraction.ts). The
 * `mousePosition` field below exists only for *non-hot-path* consumers (e.g. a
 * future cursor UI) and should be updated sparingly / throttled, never per frame.
 */

import { create } from "zustand";
import type {
  AnimationState,
  HeroPose,
  NormalizedPointer,
  ProjectPhase,
} from "@/types/scene";
import type { RotationEuler } from "@/types/brain";
import type { NavHoverTarget, NavSectionId } from "@/types/navigation";

/** The reactive data held in the store. */
interface SceneState {
  /** Last known normalized pointer position. NOT written per-frame (see note above). */
  mousePosition: NormalizedPointer;
  /** Latest brain rotation, in radians. A mirror for consumers that need to
   *  *read* rotation outside the render loop; the render loop itself owns the
   *  authoritative value on the mesh ref. */
  brainRotation: RotationEuler;
  /** Normalized scroll progress [0, 1]. Reserved for later scroll-driven work. */
  scrollProgress: number;
  /** High-level animation lifecycle. */
  animationState: AnimationState;
  /** Which navigation section's preview is open, or `null` when the pane is
   *  closed. Set by nav clicks; read by the preview pane. */
  activeSection: NavSectionId | null;
  /** The nav item currently hovered (id + hemisphere), or `null`. The 3D brain
   *  reads this to lean toward the hovered side. Kept out of the per-frame hot
   *  path — components read it via `getState()` inside `useFrame`. */
  hoveredNav: NavHoverTarget | null;
  /** A memory (client) the visitor has chosen, mid-transition. Set by client
   *  cards with the click point; consumed by MemoryTransitionHost, which draws
   *  the thread, raises the veil, and performs the navigation. */
  pendingMemory: { slug: string; x: number; y: number } | null;
  /** The hero's pose (Phase 5 v4): landing "center", or a committed hemisphere.
   *  Written by HeroStage's click zones and the panels' flip strip; read by
   *  HeroVideo (drives playback), the layout (zoom-out), and SectionPanels
   *  (which hemisphere's sections show, and in which theme). */
  heroPose: HeroPose;
  /** The current build phase. Future systems branch on this. */
  currentPhase: ProjectPhase;
}

/** The imperative actions that mutate the store. */
interface SceneActions {
  setMousePosition: (pointer: NormalizedPointer) => void;
  setBrainRotation: (rotation: RotationEuler) => void;
  setScrollProgress: (progress: number) => void;
  setAnimationState: (state: AnimationState) => void;
  setActiveSection: (section: NavSectionId | null) => void;
  setHoveredNav: (hover: NavHoverTarget | null) => void;
  setPendingMemory: (memory: { slug: string; x: number; y: number } | null) => void;
  setHeroPose: (pose: HeroPose) => void;
  setCurrentPhase: (phase: ProjectPhase) => void;
}

export type SceneStore = SceneState & SceneActions;

/** Initial state, extracted so it can be referenced by tests / resets later. */
const INITIAL_STATE: SceneState = {
  mousePosition: { x: 0, y: 0 },
  brainRotation: { x: 0, y: 0, z: 0 },
  scrollProgress: 0,
  animationState: "idle",
  activeSection: null,
  hoveredNav: null,
  pendingMemory: null,
  heroPose: "center",
  currentPhase: 3,
};

export const useSceneStore = create<SceneStore>((set) => ({
  ...INITIAL_STATE,
  setMousePosition: (mousePosition) => set({ mousePosition }),
  setBrainRotation: (brainRotation) => set({ brainRotation }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setAnimationState: (animationState) => set({ animationState }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setHoveredNav: (hoveredNav) => set({ hoveredNav }),
  setPendingMemory: (pendingMemory) => set({ pendingMemory }),
  setHeroPose: (heroPose) => set({ heroPose }),
  setCurrentPhase: (currentPhase) => set({ currentPhase }),
}));
