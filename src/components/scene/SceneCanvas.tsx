"use client";

/**
 * SceneCanvas — the React Three Fiber entry point and scene hierarchy.
 *
 *   <Canvas>
 *     └─ background (pure #FFFFFF)
 *     └─ CameraRig        (static perspective camera)
 *     └─ Lighting         (three-point rig + contact shadow)
 *     └─ Suspense
 *          ├─ Brain       (the centerpiece)
 *          └─ SceneEnvironment  (HDRI, fetched async → needs Suspense)
 *
 * This file owns renderer-level configuration only; each concern below it is a
 * focused component. It is imported dynamically with `ssr: false` (see
 * HeroStage) because WebGL cannot render on the server.
 *
 * `active` gates the render loop: when the hero scrolls out of view HeroStage
 * passes `active={false}`, switching `frameloop` to `"never"` so the GPU idles
 * while the visitor is in a preview. Switching back to `"always"` resumes.
 *
 * `export default` is intentional: `next/dynamic` imports the default export.
 */

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Brain } from "@/components/brain/Brain";
import { CameraRig } from "@/components/scene/CameraRig";
import { Lighting } from "@/components/scene/Lighting";
import { SceneEnvironment } from "@/components/scene/SceneEnvironment";
import { RENDERER } from "@/constants/scene";

interface SceneCanvasProps {
  /** When false, the render loop is paused (hero off-screen). Defaults to true. */
  active?: boolean;
}

export default function SceneCanvas({ active = true }: SceneCanvasProps) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={RENDERER.dpr}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: RENDERER.toneMappingExposure,
      }}
    >
      {/* Guarantee a pure-white backdrop regardless of the page behind it. */}
      <color attach="background" args={["#ffffff"]} />

      <CameraRig />
      <Lighting />

      <Suspense fallback={null}>
        <Brain />
        <SceneEnvironment />
      </Suspense>
    </Canvas>
  );
}
