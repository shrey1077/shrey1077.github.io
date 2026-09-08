# 16 — The scroll journey: built, then discarded

⚠⚠ **THIS WAS BUILT AND THEN REVERTED AT THE OWNER'S REQUEST, 2026-08-25.**
The site uses the CLICK-TO-VIEW overlay (`SectionPanel`), as it did before. Do
not implement anything below without asking: the owner saw it working and
preferred what was already there.

Kept from the same brief: **the Imagine change** (rainbow gradient + THINK's
mesh, commit `4e859dc8`) and the **PORTFOLIO / 2026 and footing wordmark**
(`1d8b915f`). Those are live and unaffected by any of this.

The journey lived in `be9a8bf3` and `20f221dd`, both reverted. Recover the code
from those if it is ever wanted again.

---

## Why this file still exists

The plan was wrong for the site, but several things MEASURED along the way are
true regardless and cost real time to establish.

### The brain master's full timeline

`_source/BWP/_masters/brain-alpha.webm` is **6.039s**; the hero's pointer scrub
uses only **2.12–3.72s** (the 48 stills in `public/brain/frames`). Sampled
across the whole file:

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

There IS unused footage in which the brain vacates the right-hand side. If a
future idea needs that motion, it exists and does not have to be animated.

### What that footage costs, measured

For the 3.72→6.04s tail:

| form | size |
|---|---|
| alpha-WebP stills at the sequence's own q75 (~70 frames) | ~14 MB |
| VP9 **with** alpha, crf 34 | 3.45 MB |
| VP9 **with** alpha, crf 40 | 2.53 MB |
| VP9 **with** alpha, crf 46 | 1.62 MB |
| VP9 flattened onto #f9f9f9, no alpha, crf 34 | 1.45 MB |

⚠ Alpha costs roughly 2.4x, but the brain composites over `CircuitBackdrop` —
a flattened clip blanks the circuit traces behind a grey rectangle.
⚠ crf 40 is indistinguishable from 34 under magnification; 46 visibly loses the
fine spray filaments.

### The resolution ceiling — the important one

Measured in the live DOM: the brain renders at **1265×712 CSS px**, i.e. ~1:1
with its 1280×720 source, and is already UNDER-sampled on a dpr-1.75 display
(which would want ~2215px across). **There is no higher-resolution master** —
the `.webm` IS the master.

Any idea that magnifies the brain magnifies past native and will soften. That is
a property of the source, not something to tune later.

---

## Traps worth carrying forward

- **`document.hidden`.** `ResizeObserver` and `IntersectionObserver` do NOT
  deliver while the page is hidden, and screenshots fail outright. Observer- and
  scroll-driven work looks broken when it is fine. Check it FIRST and sample it
  INSIDE any measurement loop.
- **Stale bundles.** A change can be on disk, typecheck clean, and still not be
  in the browser. If the DOM disagrees with the source, hard-reload before
  concluding anything.
- **`readPixels` on a WebGL canvas** returns 0,0,0,0 from outside the draw call
  (there is no `preserveDrawingBuffer`). It looks like a definitive negative and
  is not one.
- **`inset-0` plus an overridden `left`/`top` collapses the box.** `inset-0` also
  sets `right:0`/`bottom:0`, which stay in force — width computes as
  (parent − left − right). This silently made every journey cell 154×112px while
  every DOM check passed.
- **`SectionBody` is NOT the live section renderer.** It belongs to the parked
  `SidesShowcase` chain and is poorer than what `SectionPanel` renders: it sends
  `publications` to "coming soon" and gives `logofolio` the flat grid rather than
  the wall. Anything needing section content should use SectionPanel's
  renderers.
