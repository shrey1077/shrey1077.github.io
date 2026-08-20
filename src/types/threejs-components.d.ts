/**
 * Types for `threejs-components`, which ships none of its own.
 *
 * ⚠ The cursor is NOT reachable from the package root. Its module entry
 * (`build/module.min.js`) contains neither "cursors" nor "particles1", so the
 * documented `import("threejs-components").cursors.particles1` resolves to
 * `undefined` and fails silently. Only the deep path works, and only its
 * `default` export — which is why that is the single path declared here.
 *
 * The shape below is what FireworkCursor actually touches, not the library's
 * full surface: enough to be type-checked, and honest about the rest by
 * omission. `particles.update` is deliberately writable — the wrapper replaces
 * it to feed the simulation its own pointer.
 */

declare module "threejs-components/build/cursors/particles1.min.js" {
  export interface Vec2 {
    x: number;
    y: number;
    set(x: number, y: number): void;
  }

  export interface Particles1Options {
    /** Edge of the square GPGPU texture — the SQUARE ROOT of the particle
     *  count, since the library allocates one texel per particle. */
    gpgpuSize?: number;
    color?: string;
    colors?: string[];
    size?: number;
    /** Inverse of particle lifetime. */
    decay?: number;
    noiseCoordScale?: number;
    /** ⚠ Already divided by 100 inside the library before the shader sees it. */
    noiseIntensity?: number;
    noiseTimeCoef?: number;
  }

  export interface Particles1App {
    three?: {
      size?: { wWidth: number; wHeight: number };
      renderer?: {
        setClearAlpha?: (alpha: number) => void;
        setClearColor?: (color: number | string, alpha?: number) => void;
      };
    };
    bloomPass?: { strength: number; radius: number; threshold: number };
    particles?: {
      update?: (arg: { time?: number; pointer?: { hover?: boolean; nPosition?: Vec2 } }) => void;
      uniforms?: Record<string, { value?: unknown }>;
      setColors?: (colors: string[]) => void;
    };
    setBackgroundColor?: (color: string | null) => void;
    dispose?: () => void;
  }

  const createParticles1Cursor: (
    canvas: HTMLCanvasElement,
    options?: Particles1Options,
  ) => Particles1App;

  export default createParticles1Cursor;
}
