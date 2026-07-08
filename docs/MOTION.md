# MOTION

Nothing flashy. Everything calm, intentional, architectural, premium, confident.

## Principles

1. **Motion explains, never performs.** Every animation communicates a spatial
   fact: the sheet rises from below the wall; the brain leans toward what you
   consider; type settles into place. If it doesn't explain, cut it.
2. **Slow settles, no snaps.** Ease-out curves with long tails; damped physics
   on the 3D side. Nothing bounces, nothing overshoots.
3. **One system, one feel.** All UI motion uses the shared tokens; the 3D brain
   uses one damping function. Two vocabularies, each internally consistent.
4. **Reduced motion always wins.** Every animated surface checks
   `prefers-reduced-motion` (Framer's `useReducedMotion`, the scroll helper in
   PreviewPane, the CSS scroll-behavior media query) and degrades to instant.

## Tokens — `src/constants/motion.ts`

| Token | Value | Use |
|---|---|---|
| `EASE_OUT` | `[0.16, 1, 0.3, 1]` | everything that enters or reacts — the confident settle |
| `EASE_IN_OUT` | `[0.65, 0, 0.35, 1]` | A→B travel (future camera/section choreography) |
| `EASE_GENTLE` | `[0.4, 0.1, 0.6, 0.9]` | ambient drift (veil fades, future brain breathing) |
| `DURATION.fast` | 0.4s | micro-interactions, content crossfades |
| `DURATION.medium` | 0.5s | hovers, opacity pairs |
| `DURATION.slow` | 0.7s | the preview sheet's height — the "cinematic" one |
| `DURATION.settle` | 0.8s | nav/identity/experience content settling in |
| `DURATION.verySlow` | 1.4s | arrivals at experience scale (canvas fade-in, the future memory dive) |

**Utilities — `src/utils/motion.ts`:** the system's two entrance gestures as
variant factories — `fadeRiseVariants()` and `staggerContainerVariants()`.
Every settling surface builds from these; no hand-rolled variants.

Framer Motion is the UI engine (in use since Phase 2). GSAP stays installed but
idle — reserved for future timeline/scroll choreography. No bounce, elastic, or
overshoot easings exist in the system — deliberately.

## The motion inventory (everything that moves, and why)

| Surface | Motion | Why |
|---|---|---|
| Canvas on load | 1.4s opacity settle | the installation arrives; no pop |
| Nav + identity on load | staggered rise/fade (0.08s stagger) | labels settle into the scene |
| Brain ↔ mouse | damped rotation, ±10°, framerate-independent | the object has weight (see BRAIN_SYSTEM.md) |
| Brain ↔ nav hover | additional ±4° lean + 1.5° nod, same damping | the artwork acknowledges consideration |
| Nav hover | label darkens, arrow nudges 4–6px, rule darkens | quiet affordance |
| Preview sheet | height 0↔auto (slow) + opacity (medium) | the sheet physically rises/retracts |
| Sheet content swap | crossfade + 8px rise (fast), keyed by section | change in place, никогда re-opening |
| Scroll to sheet / to top | native smooth scroll (CSS + JS), instant under reduced motion | travel reads as one continuous gesture |
| Cards / links hover | border darkens + ≤2px translate | breath, not bounce |
| TypeReveal `settle` | per-letter rise/fade, 0.02s stagger | type composing itself — the Constitution's voice |
| ExperienceTransition | fade-rise settle on experience mount | arriving inside a memory |
| MediaViewer | fast opacity in/out | focus shifts to one asset, nothing travels |
| Typography pipeline (3B) | write-in (jittered cadence) → 0.75s pause → 42ms/letter paper flips | thought literally becoming design |
| Brain hover pulse (3B) | ≤0.7% scale, decaying sine, ~1s | the mind registering attention |
| Lighting breath (3B) | key/rim +5–7%, damped | the room noticing, not a spotlight |
| Scroll awakening (3B) | ≤2.5° tilt + rim lift across first 60vh of scroll | the mind stirring as you move deeper |
| Memory dive (3B) | thread draws (0.5s) → veil settles (450ms in) → route at 950ms | retrieval, not navigation — never a spinner |

## Future motion (reserved, not started)

The handwriting→paper-flip pipeline (inside TypeReveal), guidelines-driven logo
construction (inside BrandOpening), paint flow / circuits / particles (Phase 3
systems), scroll-driven camera (GSAP). Each lands inside an existing component
boundary — that's what the boundaries are for.
