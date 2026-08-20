"use client";

/**
 * FireworkCursor — a GPGPU particle trail that follows the pointer.
 *
 * Adapted from the Originkit "Firework Cursor" the owner supplied on
 * 2026-08-20. The simulation is `threejs-components`' particles1 cursor; this
 * wrapper's job is to start it safely, keep it off devices it makes no sense
 * on, and take it down cleanly.
 *
 * ⚠ THE SUPPLIED IMPORT PATH DOES NOT WORK, and fails SILENTLY. It reaches for
 * `import("threejs-components")` then `mod.default.cursors.particles1`. The
 * package's module entry is `build/module.min.js` — 75KB that contains neither
 * the string "cursors" nor "particles1" — so the lookup yields `undefined`, the
 * `typeof !== "function"` guard returns, and nothing renders or warns. The
 * cursor actually lives in its own file, exported as `default`:
 *
 *     threejs-components/build/cursors/particles1.min.js
 *
 * ⚠ THAT FILE IS ~532KB MINIFIED — three.js is bundled inside it. It is
 * imported dynamically and only from the homepage, so it lands in its own lazy
 * chunk rather than the shared bundle, and nothing else on the site pays for
 * it. Still the single largest thing this site can ask a visitor to download.
 *
 * ⚠ IT HIDES THE NATIVE CURSOR while the pointer is over its frame — that is
 * the point of a cursor replacement, but the frame here is the whole homepage,
 * so the arrow is gone over the nav and the pins too.
 *
 * Gated off entirely where it would be wrong rather than merely expensive:
 *   · coarse pointers — a touch device has no cursor to replace, and hiding one
 *     that isn't there while downloading half a megabyte helps nobody;
 *   · reduced motion — this is a large, continuous, unsolicited animation.
 * Both are matched live, so plugging in a mouse or changing the OS setting is
 * picked up without a reload.
 */

import { useEffect, useRef, useState } from "react";
import type {
  Particles1App,
  Particles1Options,
} from "threejs-components/build/cursors/particles1.min.js";
import { Z_INDEX } from "@/constants/design";

/** `.brain-paint`'s stops — the same palette the right hemisphere throws. */
const COLORS = ["#ff2e8b", "#ff8a00", "#f5c518", "#7fbf2e", "#00a6a6", "#3f6ad8", "#7a3fb0"];
const BASE_COLOR = "#ff2e8b";

/**
 * ⚠ 30k particles, not the preset's 100k. `gpgpuSize` is the edge of a square
 * simulation texture, so the cost is the square root of the count — 100k asks
 * for a 317² float texture updated every frame, on top of a bloom pass, for a
 * decoration. 30k reads the same in motion and asks a third as much.
 */
const PARTICLES = 30_000;
const SIZE = 1;
const BLOOM_STRENGTH = 0.5;

/** The library's decay is inverse to how long a particle lives (0…15). */
function toDecay(lifetime: number) {
  const t = Math.max(0, Math.min(1, lifetime / 15));
  return 0.01 - t * (0.01 - 5e-4);
}

/** The library divides its own `noiseIntensity` by 100 before the shader sees
 *  it, so the value it wants here is already a hundredth. */
const NOISE = { coordScale: 0.5, intensity: 0.001, timeCoef: 0.1 };

export function FireworkCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ nx: 0, ny: 0, over: false });
  const snapRef = useRef(true);
  const [enabled, setEnabled] = useState(false);

  // Fine pointer + motion allowed. Matched live rather than read once.
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(fine.matches && !still.matches);
    sync();
    fine.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  // Pointer in normalised (-1…1, y up) space, and the native cursor.
  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    const previousCursor = root.style.cursor;
    root.style.cursor = "none";

    const onMove = (e: PointerEvent) => {
      const p = pointerRef.current;
      p.nx = (e.clientX / window.innerWidth) * 2 - 1;
      p.ny = 1 - (e.clientY / window.innerHeight) * 2;
      if (!p.over) snapRef.current = true;
      p.over = true;
      const el = canvasRef.current;
      if (el) el.style.opacity = "1";
    };
    const onLeave = () => {
      pointerRef.current.over = false;
      const el = canvasRef.current;
      if (el) el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      root.style.cursor = previousCursor;
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  // The simulation.
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let app: Particles1App | null = null;
    let cancelled = false;

    (async () => {
      let create:
        | ((c: HTMLCanvasElement, o?: Particles1Options) => Particles1App)
        | undefined;
      try {
        // ⚠ The deep path, not the package root — see the note at the top.
        const mod = await import(
          /* webpackChunkName: "firework-cursor" */ "threejs-components/build/cursors/particles1.min.js"
        );
        create = mod.default;
      } catch (e) {
        console.warn("FireworkCursor: module failed to load", e);
        return;
      }
      if (cancelled) return;
      if (typeof create !== "function") {
        // The silent-failure mode the supplied component shipped with. If the
        // package ever moves this file, say so instead of rendering nothing.
        console.warn("FireworkCursor: particles1 did not export a factory");
        return;
      }

      try {
        app = create(canvas, {
          gpgpuSize: Math.ceil(Math.sqrt(PARTICLES)),
          color: BASE_COLOR,
          colors: COLORS,
          size: SIZE,
          decay: toDecay(2),
          noiseCoordScale: NOISE.coordScale,
          noiseIntensity: NOISE.intensity,
          noiseTimeCoef: NOISE.timeCoef,
        });
      } catch (e) {
        // A GPU without float-texture support must degrade to nothing, not
        // take the homepage down.
        console.warn("FireworkCursor: failed to start", e);
        return;
      }
      if (cancelled) {
        try { app?.dispose?.(); } catch { /* already gone */ }
        return;
      }

      if (app.bloomPass) app.bloomPass.strength = BLOOM_STRENGTH;

      // ⚠ These two do NOT make the canvas transparent, and were kept anyway:
      // they cost nothing and remove the scene's own background. Transparency
      // is impossible from out here — the library renders through an
      // EffectComposer with an UnrealBloomPass, which writes opaque alpha, so
      // a full-viewport canvas at this z-index painted the ENTIRE homepage
      // black. The trail rendered perfectly, over a black void where the site
      // used to be. The blend mode on the element is what actually solves it;
      // see the note on the canvas below.
      app.setBackgroundColor?.(null);
      app.three?.renderer?.setClearAlpha?.(0);

      // The library keeps its pointer private but hands it to
      // `particles.update({ time, pointer })` every frame, which is reachable.
      // Wrapping that call is the only way to feed it our own coordinates.
      const particles = app.particles;
      const baseUpdate = particles?.update;
      if (particles && typeof baseUpdate === "function") {
        particles.update = function patched(this: unknown, arg: unknown) {
          const pointer = (arg as { pointer?: Record<string, unknown> })?.pointer;
          if (pointer) {
            // ⚠ Pinned true. With `hover` false the library abandons the cursor
            // and flies the field around a Lissajous orbit in the middle of the
            // screen — which is neither configurable nor wanted.
            pointer.hover = true;
            const local = pointerRef.current;
            const np = pointer.nPosition as { x: number; y: number } | undefined;
            if (local.over && np) {
              np.x = local.nx;
              np.y = local.ny;
            }
            if (snapRef.current && np) {
              snapRef.current = false;
              // Start AT the pointer instead of streaking in from wherever the
              // field was left. Same world mapping the library uses.
              const size = (app as unknown as { three?: { size?: { wWidth: number; wHeight: number } } })
                ?.three?.size;
              const target = particles.uniforms?.uPointerPosition?.value as
                | { set: (x: number, y: number) => void }
                | undefined;
              if (size && target) target.set(np.x * size.wWidth * 0.5, np.y * size.wHeight * 0.5);
            }
          }
          return (baseUpdate as (a: unknown) => unknown).call(this, arg);
        };
      }
    })();

    return () => {
      cancelled = true;
      // ⚠ Guarded: the supplied cleanup called dispose() unconditionally, so a
      // failed init turned every unmount into a TypeError.
      try { app?.dispose?.(); } catch (e) { console.warn("FireworkCursor: dispose failed", e); }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 block h-full w-full opacity-0 transition-opacity duration-200"
      /* ⚠ `exclusion`, and the choice is forced. The canvas cannot be made
         transparent (see above), so a blend mode has to dispose of its black.
         `screen` is the usual answer and is WRONG here: it can only lighten, so
         over this site's near-white hero — most of what a visitor sees first —
         the trail is provably invisible. `exclusion` returns the source
         unchanged over black and inverts it over white, so the trail reads on
         both. The cost is that its colours invert on pale ground: the pink end
         of the palette arrives as teal there. `screen` is a one-word swap if
         that trade is the wrong way round. */
      style={{ zIndex: Z_INDEX.viewer + 10, mixBlendMode: "exclusion" }}
    />
  );
}
