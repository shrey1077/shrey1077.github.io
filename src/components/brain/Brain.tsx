"use client";

/**
 * Brain — the centerpiece, composed from its subsystems
 * (docs/BRAIN_SYSTEM.md — each evolves independently):
 *
 *   • Model        useBrainModel()        real anatomical mesh + per-vertex recolour
 *   • Interaction  useBrainInteraction()  damped mouse rotation + nav-hover lean (hot path)
 *   • Animation    useBrainAnimation()    reserved: idle/intro autonomous motion
 *   • Lighting     scene/Lighting.tsx     the studio rig (lives at scene level)
 *   • Effects      <BrainEffects/>        reserved: paint flow, circuits, sparks
 *
 * The brain is a single recoloured mesh (white-ink left / patchy painted right,
 * per-vertex in BrainModel) under one material that restores the model's OWN
 * 4K detail maps (processed to web weight in /public/models/textures):
 *
 *   • ink.jpg      — the original baseColor desaturated and lifted to white:
 *                    cortex reads as paper, the vessel network as fine dark
 *                    ink lines (multiplied under the vertex colours on BOTH
 *                    hemispheres — the reference's etched detailing).
 *   • normal2k.png — the original normal map: per-pixel fold/vessel relief far
 *                    beyond what vertex normals resolve.
 *   • orm.jpg      — occlusion/roughness (glTF ORM packing): deep crevice
 *                    shadowing + realistic surface response.
 *
 * The parent group scales and rotates. Sizing comes from useBrainScale.
 */

import { useLayoutEffect, useRef } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { useBrainModel } from "@/components/brain/BrainModel";
import { useBrainInteraction } from "@/components/brain/useBrainInteraction";
import { useBrainAnimation } from "@/components/brain/BrainAnimation";
import { useBrainScale } from "@/components/brain/useBrainScale";
import { BrainEffects } from "@/components/brain/BrainEffects";

const TEX = {
  ink: "/models/textures/ink.jpg",
  normal: "/models/textures/normal2k.png",
  orm: "/models/textures/orm.jpg",
} as const;

export function Brain() {
  const groupRef = useRef<Group>(null);

  const { geometry, intrinsicWidth, intrinsicDepth } = useBrainModel();

  // The model's own detail maps (suspends until loaded — Brain sits under the
  // scene's Suspense). Manual TextureLoader defaults to flipY=true; the
  // geometry's UVs are glTF-convention, so flip back and set colour spaces.
  const [ink, normalMap, orm] = useLoader(THREE.TextureLoader, [
    TEX.ink,
    TEX.normal,
    TEX.orm,
  ]);
  useLayoutEffect(() => {
    const textures: THREE.Texture[] = [ink, normalMap, orm];
    textures.forEach((t, i) => {
      t.flipY = false;
      t.anisotropy = 8;
      // Only the albedo (ink) is colour data; normal/ORM stay linear.
      if (i === 0) t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
    });
  }, [ink, normalMap, orm]);

  // Top-down camera: the brain's DEPTH (front-to-back) is its on-screen vertical
  // size, and its WIDTH (side-to-side) is on-screen horizontal.
  const scale = useBrainScale(intrinsicDepth, intrinsicWidth);

  // The interaction hook owns per-frame scale (base × hover pulse) and rotation.
  useBrainInteraction(groupRef, scale);
  useBrainAnimation(groupRef);

  return (
    <group ref={groupRef} scale={scale}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          map={ink}
          normalMap={normalMap}
          normalScale={[0.9, 0.9]}
          aoMap={orm}
          aoMapIntensity={0.9}
          roughnessMap={orm}
          roughness={1}
          metalness={0}
        />
      </mesh>

      <BrainEffects />
    </group>
  );
}
