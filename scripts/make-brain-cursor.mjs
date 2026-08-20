/**
 * make-brain-cursor.mjs — the brain pointer.
 *
 * The firework cursor was removed on 2026-08-20 and replaced by this: the site's
 * own motif as the pointer itself, at a cost of a couple of kilobytes instead of
 * 509KB of three.js.
 *
 * ⚠ IT HAS TO READ ON BOTH GROUNDS. The homepage hero is near-white and the
 * section panels are near-black, so a single-colour cursor disappears on one of
 * them. The brain is drawn TWICE: once scaled up in white as a halo, once at
 * size in near-black on top. That is why the shapes live in a reusable <g> —
 * the halo is the same geometry, not a second drawing that could drift.
 *
 * ⚠ THE HOTSPOT IS THE TOP-LEFT, not the brain's centre. A cursor whose hotspot
 * sits under its own artwork makes precise clicking guesswork; an arrow works
 * because the point that clicks is the point you can see. The brain is drawn
 * down-right of (0,0) and the hotspot stays at 4,4 so the tip of the mass is
 * what lands on a target.
 *
 * ⚠ PNG, NOT SVG. Chrome and Firefox accept an SVG `cursor:` url; Safari
 * ignores it and silently falls back to the arrow. Two PNGs ship — 1x and 2x —
 * and the CSS offers both through `image-set` so a retina pointer is not soft.
 *
 * Output: public/cursors/brain.png + brain@2x.png
 * Idempotent. Node >= 18, sharp.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = "D:/Brain Folio/public/cursors";
const SIZE = 40;

/** The silhouette: a central mass with bumps, so it reads as a brain and not a
 *  cloud at 40px. Drawn once and referenced twice. */
const SHAPES = `
  <ellipse cx="22" cy="23" rx="12" ry="9.5"/>
  <circle cx="13" cy="15" r="5.4"/>
  <circle cx="19" cy="12.4" r="5.6"/>
  <circle cx="26" cy="12.8" r="5.4"/>
  <circle cx="31.5" cy="17" r="4.8"/>
  <circle cx="12" cy="27" r="4.6"/>
  <circle cx="31" cy="27" r="4.4"/>
`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 40 40">
  <defs>
    <g id="brain">${SHAPES}</g>
  </defs>
  <use href="#brain" fill="#ffffff" stroke="#ffffff" stroke-width="4.5" stroke-linejoin="round"/>
  <use href="#brain" fill="#141414"/>
  <g stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.92">
    <path d="M21.5 8.5 C 21 14, 21.8 20, 21 31"/>
    <path d="M21.4 15 C 17.5 15.4, 15.6 17.6, 15.4 20.4"/>
    <path d="M21.6 20 C 25.5 20.4, 27.4 22.4, 27.6 25.2"/>
  </g>
</svg>`;

fs.mkdirSync(OUT, { recursive: true });

for (const [name, scale] of [["brain.png", 1], ["brain@2x.png", 2]]) {
  const out = path.join(OUT, name);
  await sharp(Buffer.from(svg), { density: 72 * scale * 4 })
    .resize(SIZE * scale, SIZE * scale, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  const kb = fs.statSync(out).size / 1024;
  console.log(`  ${name.padEnd(14)} ${SIZE * scale}x${SIZE * scale}  ${kb.toFixed(1)} KB`);
}
console.log(`\nhotspot: 4 4  —  see globals.css`);
