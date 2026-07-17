# 08 — VIDEO SCRUB v3 (execution plan)

A complete, self-contained plan for rebuilding the homepage video interaction.
Written for an implementation session (any model): follow it top to bottom.
Everything you need is here — do not re-derive decisions, do not redesign.

**Scope: exactly one file of app code** — `src/components/home/HeroVideo.tsx` —
plus the calibration step below. Do NOT touch the homepage layout, NavItem,
navigation, globals.css, or anything else. Do NOT commit unless the user asks.

---

## 1. Context (already true — verify, don't rebuild)

- Homepage hero background = `public/videos/upscale.mp4`, scrubbed by the mouse.
- The file is **H.264 ALL-INTRA** (every one of its 145 frames is a keyframe,
  24 fps, duration 6.0417s, 1920×1080). Seeks land instantly — this is what
  makes frame-stepping (including backwards) smooth. Never re-encode it.
- Current `HeroVideo.tsx` behavior: loads on the temporal middle frame; mouse X
  across the page maps to the FULL timeline; damped follow; and an
  "overshoot breath" on mouse-stop (drifts ~0.25s forward then settles back).
- Site background is `#f9f9f9` (`bg-gallery`), matched to the footage. Leave it.

### The footage's arc (measured from extracted frames)

| time | pose |
|---|---|
| t = 0.0s | **LOGIC POSE** — pure white brain, left profile, no color |
| t ≈ 2.9s | **CENTER** — split view: white left / painted right, fissure centered (the user's reference screenshot) |
| t = 6.0417s | **CREATIVE POSE** — colored hemisphere in profile, full paint explosion |

The sweep start→end is roughly a ~110° turntable rotation, i.e. ≈18°/s.

---

## 2. What v3 must do (the user's spec, confirmed)

1. **New center**: the resting/load frame is the USER'S visual center (§3), not
   the temporal middle.
2. **±15° scrub clamp**: mouse X now scrubs only a narrow window around the
   center — full-left reaches ≈15° of rotation left of center, full-right ≈15°
   right. At ≈18°/s, 15° ≈ **0.8 s** of video either side (`SCRUB_WINDOW_S`,
   tunable).
3. **NO overshoot**: the old "drift a bit forward then return" on mouse-stop is
   **removed entirely**. The playhead just eases to the pointer's frame and
   stops there.
4. **More eased movement**: replace the exponential follow with a
   **critically-damped spring** (position + velocity). The exponential's
   instant-start reads harsh; the spring gives true ease-in AND ease-out —
   this is the "smoother" the user asked for. Stiffness/damping are the
   feel knobs.
5. **Click → cinematic pose change**:
   - Click on the hero's **LEFT half** → the video PLAYS backwards (reverse
     frame-stepping at natural 1× speed) from wherever it is to **t=0** and
     **freezes** there (the logic pose).
   - Click on the **RIGHT half** → plays forward to the **last frame** and
     freezes (the creative pose).
   - While playing or frozen, mouse scrubbing is SUSPENDED (otherwise the
     pointer would yank the playhead back).
   - From a frozen pose, clicking the **opposite** side plays across the whole
     range to the other pose. Clicking the **same** side again = no-op.
   - A click **mid-play** on the opposite side reverses direction immediately.
   - There is NO automatic return to center (deliberate).
   - Clicks that land on interactive elements (nav pills/strokes, links,
     buttons) must NOT trigger any of this; those keep their own behavior.
   - Clicks below the hero (preview pane, footer) do nothing to the video.
6. **Reduced motion**: hold the center frame; clicks SNAP instantly to the end
   poses (no playback); no scrubbing.

---

## 3. Step A — calibrate `CENTER_T` (do this FIRST, with the user)

The user's center is a specific frame they identified from a screenshot
(hemispheres balanced, fissure at the crown of the brain, pink streams
top-right present but not yet at full spread). Best current estimate:
**CENTER_T ≈ 2.92s**. Confirm it with the user:

```
ffmpeg -y -loglevel error -i public/videos/upscale.mp4 -vf "select='between(t,2.70,3.20)',fps=20,scale=300:-1,drawtext=text='%{pts\:hms}':x=8:y=8:fontsize=24:fontcolor=red:box=1:boxcolor=white,tile=5x2:padding=4" -vsync vfr <SCRATCHPAD>/center-strip.png
```

(If `drawtext` fails on this machine — Windows fontconfig — drop the drawtext
filter; tiles then run left→right, top→bottom from 2.70s in 0.05s steps.)

Read the strip, show/describe it to the user, let them pick the tile; set
`CENTER_T` to that time. If they decline to pick, keep 2.92.

## 4. Step B — rewrite `src/components/home/HeroVideo.tsx`

Replace the whole component with the reference implementation below. It keeps
the existing public contract (`<HeroVideo active={inView} />`, decorative
`<video>` styling, `useLayoutEffect` ref-sync pattern — the repo's eslint
forbids ref writes during render and mutations inside `useMemo`).

```tsx
"use client";

/**
 * HeroVideo — the homepage's video background (Phase 5, v3).
 *
 * upscale.mp4 is an all-intra turntable of the brain: t=0 is the white LOGIC
 * profile, CENTER_T the split-view resting pose, the last frame the painted
 * CREATIVE profile. The video never plays natively — a rAF loop drives
 * currentTime through three modes:
 *
 *   scrub  — mouse X eases the playhead through a narrow ±SCRUB_WINDOW_S
 *            around CENTER_T via a critically-damped spring (true ease-in/out,
 *            no overshoot, stops on the pointer's frame).
 *   play   — a background click launches real-time frame-stepping (1×,
 *            backwards to 0 for a left-half click, forward to the end for a
 *            right-half click). Opposite-side clicks mid-play reverse it.
 *   frozen — parked on an end pose; scrubbing stays off. Only the opposite
 *            side's click (plays across) leaves this state.
 *
 * Clicks on interactive elements (a, button, role=button) or below the hero
 * never reach the machine. Reduced motion: center frame, clicks snap.
 * Seeks are paced to the decoder (only when !video.seeking).
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/videos/upscale.mp4";

/** The user-calibrated resting frame (§3 of the plan). */
const CENTER_T = 2.92; // ← set from calibration
/** ±15° of rotation, in video-seconds (≈18°/s footage sweep). */
const SCRUB_WINDOW_S = 0.8;
/** Critically-damped spring for the scrub follow — the feel knobs.
 *  Higher STIFFNESS = quicker catch-up; damping stays critical (no bounce). */
const STIFFNESS = 26;
const DAMPING = 2 * Math.sqrt(STIFFNESS); // critical — eases in AND out
/** Don't issue seeks smaller than ~half a frame (24fps ⇒ 41.7ms/frame). */
const MIN_SEEK_DELTA = 0.02;
/** Freeze on the LAST REAL FRAME, not t=duration (which can present blank). */
const END_EPS = 1 / 24;

type Mode = "scrub" | "play" | "frozen";

export function HeroVideo({ active = true }: { active?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef(active);
  useLayoutEffect(() => {
    activeRef.current = active;
  }, [active]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let duration = 0;
    let lo = 0; // scrub window lower bound
    let hi = 0; // scrub window upper bound
    let mode: Mode = "scrub";
    let playDir: 1 | -1 = 1;
    let target = CENTER_T; // where the pointer wants the playhead (scrub mode)
    let pos = CENTER_T; // spring position (the virtual playhead)
    let vel = 0; // spring velocity
    let raf = 0;
    let last = 0;

    const clampAll = (v: number) => Math.min(duration - END_EPS, Math.max(0, v));

    const onMeta = () => {
      duration = video.duration || 0;
      lo = Math.max(0, CENTER_T - SCRUB_WINDOW_S);
      hi = Math.min(duration - END_EPS, CENTER_T + SCRUB_WINDOW_S);
      pos = CENTER_T;
      target = CENTER_T;
      try {
        video.currentTime = CENTER_T;
      } catch {
        /* not seekable yet — the loop catches up */
      }
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

    /* Clicks: hero background only — never interactive elements, never below
       the hero. Left half ⇒ play to the logic pose; right ⇒ creative pose. */
    const onClick = (e: MouseEvent) => {
      if (!duration) return;
      const el = e.target as Element | null;
      if (el?.closest("a, button, [role='button'], input, textarea")) return;
      const rect = video.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;

      const dir: 1 | -1 = e.clientX < window.innerWidth / 2 ? -1 : 1;
      const bound = dir === -1 ? 0 : duration - END_EPS;

      if (mode === "frozen" && Math.abs(pos - bound) < 0.05) return; // same side
      if (reduceMotion) {
        pos = bound;
        try {
          video.currentTime = bound;
        } catch {}
        mode = "frozen";
        return;
      }
      mode = "play";
      playDir = dir;
      vel = 0;
    };
    window.addEventListener("click", onClick);

    if (reduceMotion) {
      // No scrub loop; the click handler above snaps between poses.
      return () => {
        video.removeEventListener("loadedmetadata", onMeta);
        window.removeEventListener("click", onClick);
      };
    }

    const onMove = (e: PointerEvent) => {
      if (!duration || mode !== "scrub") return;
      const f = Math.min(1, Math.max(0, e.clientX / window.innerWidth));
      target = lo + f * (hi - lo);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (t - last) / 1000) || 0.016;
      last = t;
      if (!duration || !activeRef.current) return;

      if (mode === "play") {
        // Natural-speed frame-stepping toward the pose; all-intra keeps every
        // step cheap in both directions.
        pos = clampAll(pos + playDir * dt);
        if (pos <= 0 || pos >= duration - END_EPS) {
          pos = clampAll(pos);
          mode = "frozen";
        }
      } else if (mode === "scrub") {
        // Critically-damped spring — smooth ease-in and ease-out, no bounce,
        // settles exactly on the pointer's frame (no overshoot effect).
        const accel = STIFFNESS * (target - pos) - DAMPING * vel;
        vel += accel * dt;
        pos += vel * dt;
      }
      // frozen: pos holds.

      if (
        !video.seeking &&
        video.seekable.length > 0 &&
        Math.abs(pos - video.currentTime) > MIN_SEEK_DELTA
      ) {
        try {
          video.currentTime = pos;
        } catch {
          /* transient — retry next frame */
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, [reduceMotion]);

  return (
    <video
      ref={videoRef}
      aria-hidden
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      src={VIDEO_SRC}
    />
  );
}
```

Implementation notes (do not skip):
- The spring runs on `pos`, and seeks are **paced** (`!video.seeking`) — this
  is what keeps the scrub jitter-free; don't "optimize" it away.
- `mode`/`pos` live in the effect closure on purpose (hot path, no React
  state). Do not convert to useState.
- The repo's eslint (React compiler rules) rejects: ref writes during render,
  mutations of hook-returned objects inside `useMemo`. Keep the
  `useLayoutEffect` ref-sync pattern.

## 5. Step C — verify (this machine has traps; follow exactly)

Environment facts (hard-won — trust them):
- `preview_screenshot`/`computer screenshot` HANG while anything animates.
  To capture: `javascript_exec` → stub `window.requestAnimationFrame = () => 0`
  (and inject `*{animation-play-state:paused!important}` if CSS anims run),
  THEN screenshot. Reload to restore.
- **rAF is throttled/frozen in the unfocused preview pane** — the scrub loop
  may not tick at all there. A frozen playhead in the pane is NOT a bug.
  Verify LOGIC structurally; only the user's real mouse verifies FEEL.
- Synthetic `PointerEvent`/`MouseEvent` dispatches DO reach window listeners,
  but the pane's real cursor position re-asserts itself after repaints —
  expect late samples to drift toward the physical cursor.
- Don't run `npm run dev` via Bash — use the preview/browser tools
  (`.claude/launch.json` → `brain-folio-dev`).
- `globals.css` edits need `.next` deleted + server restart (Turbopack cache
  bug on this drive) — v3 does NOT touch globals.css, so this shouldn't apply.

Checks (all via `javascript_exec` on the homepage tab):
1. After load: `video.currentTime ≈ CENTER_T` (±0.05), `video.paused === true`.
2. Dispatch `new PointerEvent('pointermove', {clientX: 0, clientY: 450})`,
   wait ~600ms, read `currentTime` → should move toward `CENTER_T − 0.8` and
   NEVER below `CENTER_T − 0.8 − 0.05` (clamp). Same for `clientX: innerWidth`
   toward `CENTER_T + 0.8`. (If rAF is throttled and nothing moves, note it
   and move on — logic is still verifiable via the click test's samples.)
3. Dispatch `new MouseEvent('click', {clientX: 200, clientY: 450, bubbles: true})`
   on `document.body` → sample `currentTime` a few times over ~4s: it must
   DECREASE monotonically toward 0 and stop at ~0 (frozen). Then dispatch a
   right-half click → samples INCREASE toward `duration − 1/24` and freeze.
4. Same-side click while frozen: `currentTime` unchanged.
5. Click on a nav pill (`document.querySelector('nav button')`) — video time
   must NOT change; the preview pane may open (that's its normal behavior).
6. `npx tsc --noEmit` · `npx eslint src` · `npm run build` — all exit 0.
   (PowerShell: run each separately; `&&` doesn't exist in PS 5.1.)

## 6. Step D — wrap up

- Report what was verified and what the pane's rAF throttling made
  unverifiable (the FEEL — ask the user to move/click with a real mouse).
- Offer the tuning knobs, don't tune preemptively:

| knob | default | effect |
|---|---|---|
| `CENTER_T` | 2.92 (calibrated §3) | the resting pose |
| `SCRUB_WINDOW_S` | 0.8 | how far ±15° reaches (bigger = wider sway) |
| `STIFFNESS` | 26 | scrub responsiveness (lower = dreamier, higher = tighter) |
| play speed | 1× (`playDir * dt`) | multiply `dt` for slower/faster pose changes |

- Commit ONLY if the user asks. This repo's PowerShell mangles multi-line
  `-m` here-strings (a stray `/` becomes a pathspec) — write the message to a
  scratchpad file and use `git commit -F <file>`.

## 7. Acceptance checklist

- [ ] Load shows the user's center frame (their screenshot pose)
- [ ] Full-left/right mouse only sways ~15° around it, buttery ease, no jitter
- [ ] NO forward-drift-and-return when the mouse stops (old effect gone)
- [ ] Left-half background click → smooth reverse play → frozen white profile
- [ ] Right-half background click → smooth forward play → frozen color profile
- [ ] Opposite click from a pose plays across; same-side click does nothing
- [ ] Nav pills/strokes still open previews; their clicks never move the video
- [ ] Reduced motion: static center, snap poses
- [ ] tsc · eslint · build all green; only HeroVideo.tsx changed
