"use client";

/**
 * BrainModel — the brain's geometry subsystem (Model of Model/Materials/
 * Interaction/Animation/Lighting/Effects — see docs/BRAIN_SYSTEM.md).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  Loads the REAL anatomical mesh and recolours it in code.
 * ─────────────────────────────────────────────────────────────────────────────
 *  The model is `public/models/brain.glb` — a detailed human brain decimated to
 *  ~130k triangles and meshopt-compressed (~0.7 MB). Its own normals give the
 *  gyri/sulci their photographic shading under the studio rig; we throw away its
 *  realistic albedo and paint the portfolio's language per-vertex instead:
 *
 *   • LEFT hemisphere  (x < 0) → monochrome graphite (logic).
 *   • RIGHT hemisphere (x > 0) → a front→back watercolour spectrum (creativity):
 *     pink → red → amber → green → teal → blue → violet.
 *
 *  Colour is a pure function of vertex position, so it needs no UVs and transfers
 *  to any future mesh. The source is authored Y-up (superior = +Y), Z = front-
 *  back, X = left-right with the longitudinal fissure at x≈0 — already what the
 *  top-down camera wants; we only centre it at the origin. Everything downstream
 *  (interaction, responsive scaling, lighting) depends on the BrainGeometrySet
 *  interface below and is unaffected.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

const MODEL_URL = "/models/brain.glb";

/** Orientation applied after load (radians). The source mesh is Y-up but yawed
 *  about Y, so it renders tilted with the fissure crossing the split plane. This
 *  straightens it (front-back → +Z, mid-sagittal plane → x≈0): -23.25° zeroes the
 *  per-slice fissure tilt (symmetry fit on the top-view), so the split runs
 *  straight down the midline. */
const MODEL_ROTATION: [number, number, number] = [0, -0.4058, 0];
/** Sign of the creative (spectrum) hemisphere along X: +1 → x>0, -1 → x<0. */
const CREATIVE_SIGN = 1;
/** Fine offset (world X, post-centre) of the mono/spectrum boundary so it lands
 *  exactly on the fissure if the mesh isn't perfectly symmetric about x=0. */
const SPLIT_X = 0;
/** Flip the front→back spectrum (pink at front vs at back). */
const SPECTRUM_FLIP = true;
/** Ink-drawing tones (sRGB) for the logic hemisphere: a WHITE brain drawn in
 *  ink (the reference) — near-white gyri crowns, ink settling only into the
 *  creases. The filament texture (Brain.tsx) adds the fine web linework. */
const PENCIL_CROWN = 0.97;
const PENCIL_LINE = 0.07;

/* ── Right-hemisphere spectrum (creativity) ───────────────────────────── */

/** sRGB → linear for one channel. Vertex colours are consumed in linear space,
 *  so authoring in sRGB and storing linear makes them display at full vividness. */
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Front (+z) → back (−z) watercolour sweep matching the reference brain. */
const SPECTRUM_SRGB: [number, [number, number, number]][] = [
  [0.0, [0.99, 0.09, 0.53]], // pink / magenta (frontal)
  [0.14, [0.98, 0.14, 0.13]], // red
  [0.3, [1.0, 0.47, 0.04]], // orange
  [0.45, [1.0, 0.78, 0.07]], // amber
  [0.6, [0.44, 0.76, 0.13]], // green
  [0.74, [0.0, 0.71, 0.62]], // teal
  [0.86, [0.04, 0.42, 0.9]], // blue
  [1.0, [0.46, 0.16, 0.75]], // violet (occipital)
];
const SPECTRUM_LIN: [number, [number, number, number]][] = SPECTRUM_SRGB.map(
  ([t, c]): [number, [number, number, number]] => [
    t,
    [srgbToLinear(c[0]), srgbToLinear(c[1]), srgbToLinear(c[2])],
  ],
);
const PENCIL_CROWN_LIN = srgbToLinear(PENCIL_CROWN);
const PENCIL_LINE_LIN = srgbToLinear(PENCIL_LINE);

/** Smooth 0→1 ramp between edges a and b. */
function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** A slow, smooth flow field (~[-1,1]) — drives the acrylic streaking/pooling. */
function flow(x: number, y: number, z: number): number {
  return (
    0.6 * Math.sin(x * 0.9 + Math.cos(z * 0.7)) * Math.cos(y * 0.8 - z * 0.6) +
    0.4 * Math.sin(x * 1.7 - y * 1.3 + z * 0.5)
  );
}

/** High-frequency grain (~[-1,1]) — graphite tooth on the left, pigment
 *  granulation on the right, so neither hemisphere reads as a flat material. */
function grain(x: number, y: number, z: number): number {
  return (
    0.5 * Math.sin(x * 23.0 + z * 17.0) * Math.cos(y * 19.0 - x * 13.0) +
    0.5 * Math.sin(z * 29.0 - y * 21.0)
  );
}

/** Linear spectral colour at t∈[0,1] (0 = frontal pink, 1 = occipital violet). */
function spectral(t: number): [number, number, number] {
  const u = t <= 0 ? 0 : t >= 1 ? 1 : t;
  for (let i = 1; i < SPECTRUM_LIN.length; i += 1) {
    const [t1, c1] = SPECTRUM_LIN[i];
    if (u <= t1) {
      const [t0, c0] = SPECTRUM_LIN[i - 1];
      const k = (u - t0) / (t1 - t0);
      return [
        c0[0] + (c1[0] - c0[0]) * k,
        c0[1] + (c1[1] - c0[1]) * k,
        c0[2] + (c1[2] - c0[2]) * k,
      ];
    }
  }
  const last = SPECTRUM_LIN[SPECTRUM_LIN.length - 1][1];
  return [last[0], last[1], last[2]];
}

/** The shape every consumer depends on. */
export interface BrainGeometrySet {
  geometry: THREE.BufferGeometry;
  /** Un-scaled Y extent (world units). */
  intrinsicHeight: number;
  /** Un-scaled X extent, side-to-side (world units). */
  intrinsicWidth: number;
  /** Un-scaled Z extent, front-to-back — the on-screen vertical size under the
   *  top-down camera, so it drives the "≈⅓ of viewport height" fit. */
  intrinsicDepth: number;
}

/** Orient, centre, and paint the loaded mesh (once). */
function recolour(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geometry = source.clone();

  const [rx, ry, rz] = MODEL_ROTATION;
  if (rx) geometry.rotateX(rx);
  if (ry) geometry.rotateY(ry);
  if (rz) geometry.rotateZ(rz);

  // Centre at the origin so it rotates about its middle and the fissure ≈ x=0.
  geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  (geometry.boundingBox as THREE.Box3).getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox as THREE.Box3;
  const halfZ = Math.max(Math.abs(box.min.z), Math.abs(box.max.z)) || 1;

  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const nrm = geometry.attributes.normal as THREE.BufferAttribute | undefined;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // Top-facing-ness (after orientation, superior = +Y): ~1 on a gyrus crown,
    // →0 on a sulcus wall or the silhouette rim. This is what draws the folds —
    // as dark pencil lines on the left, as pooled paint on the right — and it
    // sinks the midline fissure into shadow on BOTH sides so the mono/colour
    // boundary hides in the groove instead of showing as a straight line.
    const up = nrm ? Math.max(0, Math.min(1, nrm.getY(i))) : 1;

    if ((x - SPLIT_X) * CREATIVE_SIGN > 0) {
      // Creativity — PATCHY painted colour (the reference): a loose front→back
      // rainbow broken into organic per-gyrus patches by a strong low-frequency
      // warp, plus fine pigment mottle. Wrapping (not clamping) lets the palette
      // cycle, so neighbouring patches contrast instead of pooling at the ends.
      let t = (1 - z / halfZ) / 2;
      if (SPECTRUM_FLIP) t = 1 - t;
      t += 0.3 * flow(x * 0.55 + 3.1, y * 0.5, z * 0.55);
      t += 0.05 * flow(x * 2.1 + 9.0, y * 1.9, z * 2.2);
      t = ((t % 1) + 1) % 1;
      const [r0, g0, b0] = spectral(t);
      // Punchier pigment — push saturation like wet marker ink.
      const lum = 0.3 * r0 + 0.59 * g0 + 0.11 * b0;
      const r1 = lum + (r0 - lum) * 1.25;
      const g1 = lum + (g0 - lum) * 1.25;
      const b1 = lum + (b0 - lum) * 1.25;
      const crown = smoothstep(0.15, 0.7, up);
      const pool = 0.45 + 0.65 * crown; // deep in grooves, bright on crowns
      const streak = 1 + 0.16 * flow(z * 1.7 + 11.0, x * 1.5, y * 1.2 + 4.0);
      // Pigment granulation so the paint reads painted, not flat colour.
      const k = pool * streak * (1 + 0.1 * grain(x, y, z));
      colors[i * 3 + 0] = Math.min(1, Math.max(0, r1 * k));
      colors[i * 3 + 1] = Math.min(1, Math.max(0, g1 * k));
      colors[i * 3 + 2] = Math.min(1, Math.max(0, b1 * k));
    } else {
      // Logic — a WHITE brain drawn in ink (the reference): near-white crowns,
      // ink settling only into the creases; the filament texture (Brain.tsx)
      // supplies the fine web linework across the gyri. Pressure + tooth keep
      // it hand-shaded rather than plastic.
      const crown = smoothstep(0.18, 0.62, up);
      const press = 1 + 0.05 * flow(x * 0.8, y * 0.7, z * 0.8);
      const v = (PENCIL_LINE_LIN + (PENCIL_CROWN_LIN - PENCIL_LINE_LIN) * crown) * press;
      const vg = Math.min(1, Math.max(0, v * (1 + 0.06 * grain(x, y, z))));
      colors[i * 3 + 0] = vg;
      colors[i * 3 + 1] = vg;
      colors[i * 3 + 2] = vg;
    }
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/**
 * Load (and cache) the anatomical brain, recoloured to the portfolio language.
 * `useGLTF` suspends until the mesh is ready (Brain sits under Suspense).
 */
export function useBrainModel(): BrainGeometrySet {
  const { scene } = useGLTF(MODEL_URL);

  return useMemo(() => {
    scene.updateWorldMatrix(true, true);
    let src: THREE.BufferGeometry | null = null;
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!src && mesh.isMesh) {
        const g = (mesh.geometry as THREE.BufferGeometry).clone();
        g.applyMatrix4(mesh.matrixWorld); // bake any node transform into the verts
        src = g;
      }
    });
    if (!src) throw new Error("brain.glb: no mesh found");

    const geometry = recolour(src);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox as THREE.Box3;
    return {
      geometry,
      intrinsicWidth: box.max.x - box.min.x,
      intrinsicHeight: box.max.y - box.min.y,
      intrinsicDepth: box.max.z - box.min.z,
    };
  }, [scene]);
}

useGLTF.preload(MODEL_URL);
