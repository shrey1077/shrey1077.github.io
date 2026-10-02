/**
 * prepare-azoth-hero-cut.mjs — the Azoth hero's flowering ridge with its SKY
 * cut away, so the headline can sit behind the rock and show only in the
 * negative space (owner, 2026-10-02).
 *
 * ⚠ The sky is found by FLOOD FILL from the top edge, not by keying all dark
 * pixels: the ridge has near-black crevices of its own, and a plain key would
 * punch them through and show the headline inside the rock. Only darkness
 * connected to the top of the frame is sky. The mask is then blurred a touch
 * so the glowing rim keeps a soft edge.
 *
 *   node scripts/prepare-azoth-hero-cut.mjs
 */

import sharp from "sharp";

const DIR = "public/content/clients/azoth-biotech/hero";
const SRC = `${DIR}/bg-reveal.webp`;
const OUT = `${DIR}/bg-reveal-cut.webp`;
/** A pixel is sky-dark when its brightest channel is at or below this. */
const DARK = 26;

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const sky = new Uint8Array(W * H);
const dark = (p) => Math.max(data[p * 3], data[p * 3 + 1], data[p * 3 + 2]) <= DARK;

// Scanline-free BFS from every dark pixel on the top row.
const queue = new Int32Array(W * H);
let head = 0, tail = 0;
for (let x = 0; x < W; x++) if (dark(x)) { sky[x] = 1; queue[tail++] = x; }
while (head < tail) {
  const p = queue[head++];
  const x = p % W, y = (p / W) | 0;
  for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) {
    if (q >= 0 && !sky[q] && dark(q)) { sky[q] = 1; queue[tail++] = q; }
  }
}

const alpha = Buffer.alloc(W * H);
for (let p = 0; p < W * H; p++) alpha[p] = sky[p] ? 0 : 255;
const softAlpha = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } })
  .blur(1.2)
  .extractChannel(0)
  .raw()
  .toBuffer();

const rgba = Buffer.alloc(W * H * 4);
for (let p = 0; p < W * H; p++) {
  rgba[p * 4] = data[p * 3];
  rgba[p * 4 + 1] = data[p * 3 + 1];
  rgba[p * 4 + 2] = data[p * 3 + 2];
  rgba[p * 4 + 3] = softAlpha[p];
}
await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .webp({ quality: 88, alphaQuality: 90 })
  .toFile(OUT);
console.log(`${OUT} ${W}×${H}, sky ${((tail / (W * H)) * 100).toFixed(1)}%`);
