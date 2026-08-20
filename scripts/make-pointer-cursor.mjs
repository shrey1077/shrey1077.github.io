/**
 * make-brain-cursor.mjs — the pointer.
 *
 * A black-stroked ring with a flat rainbow disc inside it, at 24px across in a
 * 32px canvas — the owner's brief on 2026-08-21, replacing the brain glyph that
 * replaced the three.js firework cursor. No trail, no canvas, no rAF: it is two
 * PNGs and a CSS declaration.
 *
 * ⚠ "Rainbow" is FLAT, not a gradient — eight solid wedges taken from
 * `.brain-paint`'s own stops, so the pointer carries the same palette the right
 * hemisphere throws rather than a generic spectrum. Wedges are drawn as paths
 * rather than a conic gradient because a conic would band badly at 24px and is
 * not reliably rasterised by sharp.
 *
 * ⚠ THE BLACK RING IS WHAT MAKES IT WORK ON BOTH GROUNDS. The hero is #f9f9f9
 * and the section panels are near-black; a bare rainbow disc dissolves into the
 * paint film on the creative side. The stroke gives it a hard edge everywhere,
 * which is the same problem the brain glyph solved with a white halo.
 *
 * ⚠ HOTSPOT IS THE CENTRE, unlike the brain's top-left. A ring reads as a
 * reticle — the thing under the middle of it is the thing you are pointing at —
 * whereas an arrow-shaped glyph reads as pointing from its tip.
 *
 * ⚠ PNG, not SVG: Chrome and Firefox accept an SVG `cursor:` url, Safari
 * ignores it and silently falls back to the arrow. 1x and 2x ship.
 *
 * Output: public/cursors/pointer.png + pointer@2x.png
 * Idempotent. Node >= 18, sharp.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = "D:/Brain Folio/public/cursors";
const SIZE = 32;
const CX = 16, CY = 16;
const R = 12;          // disc radius — 24px across, the "medium" the brief asked for
const STROKE = 2.2;    // the black ring

/** `.brain-paint`'s stops, in order. */
const PAINT = [
  "#ff2e8b", "#ff5a3c", "#ff8a00", "#f5c518",
  "#7fbf2e", "#00a6a6", "#3f6ad8", "#7a3fb0",
];

/** One pie wedge per colour, as a path — see the note on conic gradients. */
const wedges = PAINT.map((c, i) => {
  const a0 = (i / PAINT.length) * Math.PI * 2 - Math.PI / 2;
  const a1 = ((i + 1) / PAINT.length) * Math.PI * 2 - Math.PI / 2;
  const x0 = CX + R * Math.cos(a0), y0 = CY + R * Math.sin(a0);
  const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
  return `<path d="M${CX} ${CY} L${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z" fill="${c}"/>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${wedges}
  <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="#000000" stroke-width="${STROKE}"/>
</svg>`;

fs.mkdirSync(OUT, { recursive: true });

for (const [name, scale] of [["pointer.png", 1], ["pointer@2x.png", 2]]) {
  const out = path.join(OUT, name);
  await sharp(Buffer.from(svg), { density: 72 * scale * 4 })
    .resize(SIZE * scale, SIZE * scale, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  const kb = fs.statSync(out).size / 1024;
  console.log(`  ${name.padEnd(14)} ${SIZE * scale}x${SIZE * scale}  ${kb.toFixed(1)} KB`);
}
console.log(`\nhotspot: 4 4  —  see globals.css`);
