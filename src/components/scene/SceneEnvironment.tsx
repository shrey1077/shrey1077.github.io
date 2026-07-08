"use client";

/**
 * SceneEnvironment — image-based lighting via a drei `<Environment>` preset.
 *
 * Provides soft, realistic reflections/fill that the explicit lights alone
 * cannot, which is what sells the "premium product photography" feel. We use a
 * built-in preset (studio) so there is no HDRI asset to license or host in
 * Phase 1.
 *
 * SWAP POINT: to use a custom HDRI later, drop an `.hdr` in /public and replace
 * `preset={...}` with `files="/your-file.hdr"`. `background` stays false so the
 * environment only lights the scene — the visible backdrop remains pure white
 * (set on the scene in SceneCanvas), preserving the gallery look.
 *
 * This component fetches the preset asynchronously, so it must render inside a
 * <Suspense> boundary (SceneCanvas provides one).
 */

import { Environment } from "@react-three/drei";
import { ENVIRONMENT } from "@/constants/scene";

export function SceneEnvironment() {
  return (
    <Environment
      preset={ENVIRONMENT.preset}
      environmentIntensity={ENVIRONMENT.environmentIntensity}
      background={false}
    />
  );
}
