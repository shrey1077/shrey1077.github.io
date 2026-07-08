/**
 * Scene configuration constants.
 *
 * Every "magic number" that governs how the scene looks or behaves lives here,
 * named and commented. Components read these instead of hardcoding values, so
 * art-direction tweaks happen in one place and the debug panel (Leva) can be
 * seeded from the same source of truth.
 *
 * Units are three.js world units unless noted. The brain is authored at roughly
 * unit scale (see BRAIN constants), so camera distances are chosen relative to
 * that.
 */

/** Perspective camera setup. Kept static in Phase 1 — no cinematic movement. */
export const CAMERA = {
  /** Field of view in degrees. ~35° reads as a calm, near-orthographic lens,
   *  the kind used in premium product photography — minimal perspective
   *  distortion, elegant rather than dramatic. */
  fov: 35,
  /** Default camera position. Placed high and pulled slightly forward so we look
   *  DOWN onto the brain (top-view, per the brief) with just enough forward
   *  offset to keep a sense of real, dimensional space rather than a flat plan
   *  view. The brain is authored with its top facing +Y, so a high camera reads
   *  the two hemispheres and the longitudinal fissure from above. */
  position: [0, 5.6, 1.9] as const,
  /** Point the camera looks at — the world origin, where the brain is centered. */
  target: [0, 0, 0] as const,
  near: 0.1,
  far: 100,
} as const;

/**
 * Lighting rig. Modeled on a soft three-point studio setup plus environment
 * fill. Intensities are tuned for a `MeshStandardMaterial` under an HDRI
 * environment; the debug panel exposes a master multiplier over these.
 */
export const LIGHTING = {
  /** Ambient base so shadow-side detail never crushes to pure black. */
  ambientIntensity: 0.28,
  /** Key light — the primary shaper. High, camera-left, in front. Intensities
   *  are tuned so the light *paper* surface lands in the 0.75–0.9 range rather
   *  than clipping to pure white — that headroom is what lets the shading
   *  gradient and ink linework read against the white background.
   *
   *  Phase 2.5 refinement: a *very* subtle warm key / cool rim split (classic
   *  studio-photography color contrast). Kept near-white so the gallery stays
   *  clean; it only adds dimensional warmth to the paper surface. */
  key: {
    position: [-4.5, 6, 3.5] as const,
    intensity: 1.4,
    color: "#fff4e8",
  },
  /** Fill light — softens the key's shadows from the opposite side, lower power. */
  fill: {
    position: [5, 3, 2.5] as const,
    intensity: 0.5,
    color: "#ffffff",
  },
  /** Rim/back light — separates the silhouette from the white background with a
   *  subtle edge highlight. Placed behind and above. Slightly cool against the
   *  warm key. */
  rim: {
    position: [0, 4.5, -5.5] as const,
    intensity: 1.2,
    color: "#edf2fb",
  },
} as const;

/**
 * Soft contact shadow beneath the brain. This substitutes for a true SSAO pass
 * in Phase 1 (see docs/BRAIN_SYSTEM.md) — it grounds the object in space
 * without pulling in a postprocessing dependency.
 */
export const CONTACT_SHADOW = {
  /** How far below the brain's center the shadow plane sits. Kept just beneath
   *  the (flattened, scaled) brain so the grounding halo reads from the top-down
   *  camera without detaching from the object. */
  positionY: -0.5,
  opacity: 0.3,
  /** Blur softness — slightly tighter since 3B: a present, premium shadow that
   *  grounds the sculpture instead of a vague blot. */
  blur: 2.6,
  /** How far the shadow reaches before fading — keeps it from looking hard. */
  far: 1.5,
  /** Ground plane size. */
  scale: 5,
  /** Shadow map resolution — 1024 for a clean falloff at museum quality. */
  resolution: 1024,
} as const;

/**
 * HDRI environment. Uses a drei built-in preset in Phase 1 so there is no
 * asset to license or host yet. Swapping to a custom `.hdr` later is a single
 * prop change on `<Environment>` (see docs/BRAIN_SYSTEM.md).
 */
export const ENVIRONMENT = {
  preset: "studio" as const,
  /** Environment lighting contribution. Kept modest so the explicit lights
   *  remain the primary shapers, the white background stays clean, and the
   *  paper surface keeps its shading headroom (doesn't wash to pure white). */
  environmentIntensity: 0.36,
} as const;

/**
 * Renderer configuration for the <Canvas>. These are the settings that matter
 * for a clean, premium look on a pure-white background at 60fps.
 */
export const RENDERER: {
  /** [min, max] device-pixel-ratio clamp passed straight to <Canvas dpr>. */
  dpr: [number, number];
  toneMappingExposure: number;
} = {
  /** Cap device pixel ratio. Retina is gorgeous but 3x DPR on a 4K panel is a
   *  needless GPU tax; [1, 2] keeps it crisp without melting laptops. */
  dpr: [1, 2],
  /** ACES gives filmic, natural highlight rolloff — key for a photographic feel. */
  toneMappingExposure: 1.0,
};
