# 16 — Scroll journey spec (the "exsec" build)

Owner's brief, 2026-08-25, answered 2026-08-25. This is a FIVE-PART build across
several sessions. Read this before starting any part; it holds the decisions and
the two hard constraints that shape all of them.

⚠ This is a SPEC, not a record of what exists. Nothing below is built unless a
part is ticked. Update the ticks as parts land.

---

## The brief, as agreed

1. **Imagine** loses the liquid particle effect. The word becomes a slow
   animated rainbow **gradient**, and carries the **same mesh effect THINK has**
   (`ThinkMesh` — pointer drags the glyphs, springs back).
2. **All eight expanded sections ("exsecs") exist in the page at all times** —
   four left, four right. Not one-at-a-time overlays.
3. What a pin used to open is now always present and reached by scrolling.
   **Click-to-jump survives**: a pin jumps you to that exsec.
4. **The journey.** First scroll: the camera zooms *through* the brain's left
   extremity while the playhead runs past the current scrub window, and emerges
   at the **Clients** exsec. From there the exsecs sit on a **2D plane** in a
   zig-zag: Clients, then Arts down-and-right, then Projects down-and-left, and
   so on alternating. Navigation eases in/out.
5. **Narrow screens keep a simple vertical stack**, sections alternating
   left/right. No 2D plane below `lg`.
6. Gradient motion is **gentle and slow**.

---

## Two hard constraints — read before designing anything

### The master is 1280×720, and the hero already renders it ~1:1

Measured in the live DOM: the brain renders at **1265×712 CSS px**, and is
already UNDER-sampled on a dpr-1.75 display (which would want ~2215px). There is
no higher-resolution source — the `.webm` IS the master
(`_source/BWP/_masters/brain-alpha.webm`).

**Therefore a "fly through the brain" zoom WILL soften as it scales past native.**
This is not a bug to fix later; it is a ceiling. Decide how far the zoom goes
with that in mind, and consider ending the fly-through on a cut/dissolve at the
point where softening would become obvious rather than pushing to full screen.

### The footage the journey needs exists, but not as frames

The master is **6.039s**. The site uses only **2.12–3.72s** (48 frames) for the
pointer scrub. Frames sampled across the whole master:

| t | what the brain does |
|---|---|
| 0.1s | plain grey, small, side view |
| 1.0s | circuit diagrams enter left, colour starts on the right edge |
| 2.12s | **scrub window opens** |
| 3.0s | split grey/colour, spray begins right |
| 3.72s | **scrub window closes** |
| 4.5s | rotated further, drifting LEFT, colour dominant |
| 5.2s | further left, big spray |
| 5.9s | **hard left, fully coloured, spray fills the right** |

So 3.72→6.04s is exactly the "brain moves left and frees the right side" motion
the brief asks for. **But it is ~70 more frames ≈ +14MB** at the current q75
encoding, on top of the 9.39MB already shipping.

**Frames are not viable for this phase.** The likely answer is a `<video>` for
the journey phase. Note the original reason video was rejected (see
`BrainSequence`'s header) was *random seeking* being expensive — scroll-driven
playback is monotonic, which video handles well. **Part 2 exists to settle this
before anything is built on top of it.**

---

## The parts, in order

Sequence matters: **2 → 3 → 4**. Part 2's outcome decides the page's structure;
Part 3's layout decides what Part 4 animates. Part 1 is independent.

One part per session — parts 3 and 4 will each fill one.

### [ ] Part 1 — Imagine: rainbow + mesh  · Sonnet
- Remove `ImagineParticles` from `HeroName` (keep the file, unreferenced).
- `ThinkMesh` gains an opt-in animated rainbow.
- ⚠ Do the colour **in the shader**, not by re-rasterising. `paint()` builds a
  canvas and re-uploads via `texImage2D`; driving that per frame to animate a
  gradient is wasteful. Rasterise the glyphs ONCE as an alpha mask and colour
  them in the fragment shader from a `uPhase` uniform.
- ⚠ The texture is uploaded with `UNPACK_PREMULTIPLY_ALPHA_WEBGL`, so shader
  output must be premultiplied too (`rgb = colour * alpha`).
- THINK must keep its solid `THINK_GREY`. The rainbow is opt-in per instance.
- Palette: `.brain-paint`'s eight stops, so the word matches the site.

### [ ] Part 2 — Brain journey spike  · Opus
- Settle **video vs frames** for 3.72→6.04s. Measure both; do not assume.
- Establish how far the zoom goes given the 720p ceiling, and where the
  fly-through hands off to the plane.
- Deliverable: a working scroll→playhead+zoom prototype and a weight number.

### [ ] Part 3 — Exsec layout  · Opus
- Convert `SectionPanel` (454 lines, `AnimatePresence`, one section at a time,
  driven by `PIN_OPEN_EVENT`) into eight always-present blocks positioned on a
  2D plane in the zig-zag.
- Keep `PIN_OPEN_EVENT` alive as the click-to-jump route.
- Narrow screens: simple alternating stack, no plane.

### [ ] Part 4 — Scroll choreography  · Opus
- Drive the plane traversal from scroll with ease in/out.
- Couple the brain phase and the nav to scroll progress.
- Hand off cleanly between the fly-through and the plane.

### [ ] Part 5 — Responsive, reduced motion, a11y, polish  · Sonnet
- Mechanical once the system exists.
- ⚠ Reduced motion needs a real answer here, not a disabled animation: with the
  journey carrying the navigation, a visitor who asked for no motion still has
  to be able to reach all eight sections.

---

## Standing traps for this build

- **`document.hidden`.** `ResizeObserver` and `IntersectionObserver` do NOT
  deliver while the page is hidden, and screenshots fail outright. A hidden pane
  makes scroll-driven work look broken when it is fine. Check it FIRST and
  sample it INSIDE any measurement loop.
- **Stale bundles.** A change can be on disk, typecheck clean, and still not be
  in the browser. If the DOM disagrees with the source, hard-reload before
  concluding anything.
- **Verify in the DOM, but look as well.** Several things here (the zoom's
  softening, the zig-zag's rhythm) cannot be judged from numbers.
