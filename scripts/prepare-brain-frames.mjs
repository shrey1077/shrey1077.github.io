/**
 * prepare-brain-frames.mjs — the brain turntable as a preloadable image sequence.
 *
 * Scrubbing a video via currentTime is laggy (every mouse frame is a decode-on-
 * seek, and VP9-with-alpha is heavy). Instead we render the small scrub window
 * (±0.8s around the resting frame ≈ ±15° of rotation) as still frames that the
 * hero preloads and draws to a canvas — no seeking, buttery smooth.
 *
 * Extracts the window from brain-alpha.webm with alpha (the VP9 alpha needs the
 * libvpx-vp9 decoder) and writes numbered alpha-WebP frames.
 *
 * Source: D:/Brain Website portfolio/_masters/brain-alpha.webm
 * Output: public/brain/frames/NNN.webp
 * Idempotent. Node ≥ 18, ffmpeg on PATH, sharp.
 */

import { execFileSync } from "node:child_process";
import sharp from "sharp";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// ⚠ The master lives OUTSIDE the repo, with every other pipeline source. It
// used to sit in public/videos/, where it shipped 7.9MB to every visitor for
// nothing — no component ever loaded it; its only consumer is this script.
// Moved 2026-08-21. Keep it: without it these frames cannot be regenerated,
// which is exactly what a re-encode of the 12.4MB sequence would need.
const SRC = "D:/Brain Website portfolio/_masters/brain-alpha.webm";
const DEST = "D:/Brain Folio/public/brain/frames";
const START = 2.12; // resting frame 2.92 − 0.8
const DUR = 1.6; // ±0.8s window

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "brainframes-"));
try {
  execFileSync(
    "ffmpeg",
    [
      "-y", "-loglevel", "error",
      "-c:v", "libvpx-vp9",
      "-i", SRC,
      "-ss", String(START), "-t", String(DUR),
      "-vsync", "0", "-start_number", "0",
      path.join(tmp, "%03d.png"),
    ],
    { stdio: "inherit" },
  );

  fs.rmSync(DEST, { recursive: true, force: true });
  fs.mkdirSync(DEST, { recursive: true });
  const files = fs.readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
  let total = 0;
  for (const f of files) {
    const out = path.join(DEST, f.replace(".png", ".webp"));
    await sharp(path.join(tmp, f))
      .webp({ quality: 82, alphaQuality: 92, effort: 5 })
      .toFile(out);
    total += fs.statSync(out).size;
  }
  console.log(
    `${files.length} frames → ${DEST}  (${(total / 1048576).toFixed(2)} MB, ${Math.round(total / files.length / 1024)} KB/frame)`,
  );
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
