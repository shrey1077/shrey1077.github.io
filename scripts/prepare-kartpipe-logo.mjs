/**
 * prepare-kartpipe-logo — Kartpipe's own wordmark (the pipe standing in for
 * the "i", a bowl hanging off the K), lifted off the brand's campaign plate
 * (work/kartpipe/02.webp, where it stands white on dark grey, top right) as
 * a clean mark on a clear ground, black and white (owner, 2026-10-16: "Use
 * original Kartpipe logo" — no file of the mark was ever on disk; it existed
 * only inside the artwork).
 *
 *   node scripts/prepare-kartpipe-logo.mjs
 *   → public/content/clients/abs/kartpipe-logo-black.png
 *   → public/content/clients/abs/kartpipe-logo-white.png
 */

import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("public/content/clients/abs/work/kartpipe/02.webp");
const OUT = path.resolve("public/content/clients/abs");
/** The wordmark's box on the plate (1080 × 1080). */
const BOX = { left: 755, top: 24, width: 305, height: 136 };
/** Enlarged this many times before the ink is read — smoother edges. */
const UP = 4;
/** Luminance from LO (clear) to HI (solid ink): the letters are white, the
 *  ground a dark grey, the pipe's bowl shaded in between. */
const LO = 145;
const HI = 212;

const { data, info } = await sharp(SRC)
  .extract(BOX)
  .resize(BOX.width * UP, BOX.height * UP, { kernel: "lanczos3" })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });
const alpha = Buffer.alloc(info.width * info.height);
for (let i = 0; i < alpha.length; i++) {
  const t = Math.max(0, Math.min(1, (data[i] - LO) / (HI - LO)));
  alpha[i] = Math.round(255 * t * t * (3 - 2 * t));
}
for (const [name, v] of [["kartpipe-logo-black.png", 0], ["kartpipe-logo-white.png", 255]]) {
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < alpha.length; i++) {
    rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = v;
    rgba[i * 4 + 3] = alpha[i];
  }
  const out = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .png()
    .toFile(path.join(OUT, name));
  console.log(name, out.width, out.height);
}
