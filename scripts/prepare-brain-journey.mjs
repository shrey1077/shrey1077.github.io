/**
 * prepare-brain-journey.mjs — the fly-through clip.
 *
 * The homepage's scroll journey opens by flying INTO the brain: the playhead
 * runs past the pointer-scrub window while the camera zooms toward the brain's
 * left extremity, and comes out at the Clients exsec. This cuts the footage
 * that phase plays.
 *
 * Source: _source/BWP/_masters/brain-alpha.webm  (6.039s)
 * Window: 3.72s → 6.04s — the part the scrub never reaches. Across it the brain
 *         rotates, saturates, and drifts LEFT until it sits hard against the
 *         left edge with the paint spray filling the right. That motion is why
 *         the journey works at all; it is in the master already.
 * Output: public/brain/journey.webm
 *
 * ⚠ THIS IS A VIDEO, NOT FRAMES, AND THAT IS THE WHOLE POINT. Measured
 * 2026-08-25, the same 2.32s as alpha-WebP stills at the sequence's own q75
 * would be ~70 frames ≈ 14MB. As VP9 it is 2.53MB — roughly a sixth. The
 * pointer scrub still uses stills because it needs RANDOM access; this phase is
 * monotonic, which is what video is good at.
 *
 * ⚠ ALPHA IS KEPT even though dropping it would more than halve the file
 * (measured: 3.45MB with alpha vs 1.45MB flattened onto #f9f9f9 at crf34).
 * The clip composites over CircuitBackdrop exactly as the still sequence does,
 * so a flattened version would blank the circuit traces out behind a flat grey
 * rectangle the instant the journey started.
 *
 * ⚠ CRF 40, chosen by looking. Measured at the same crop the fly-through
 * magnifies: crf34 = 3.45MB, crf40 = 2.53MB and near-identical, crf46 = 1.62MB
 * and visibly softer in the fine spray filaments. This footage gets ZOOMED
 * INTO, so detail loss compounds — 46 is a false economy.
 *
 * Idempotent. Node >= 18, ffmpeg on PATH (needs libvpx-vp9 to decode the
 * master's alpha).
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { BWP, PUBLIC } from "./sources.mjs";

const SRC = path.join(BWP, "_masters/brain-alpha.webm");
const DEST = path.join(PUBLIC, "brain/journey.webm");
const START = 3.72;
const DUR = 2.32;
const CRF = 40;

fs.mkdirSync(path.dirname(DEST), { recursive: true });

execFileSync(
  "ffmpeg",
  [
    "-y", "-loglevel", "error",
    "-c:v", "libvpx-vp9",
    "-i", SRC,
    "-ss", String(START), "-t", String(DUR),
    "-c:v", "libvpx-vp9",
    "-pix_fmt", "yuva420p",
    "-b:v", "0", "-crf", String(CRF),
    "-row-mt", "1",
    DEST,
  ],
  { stdio: "inherit" },
);

const mb = fs.statSync(DEST).size / 1048576;
console.log(`  journey.webm  ${START}s +${DUR}s  crf${CRF}  ${mb.toFixed(2)} MB`);
