/**
 * make-vivid-mark — Vivid Process Technology's wordmark, lifted off the
 * corner of its own first plate (owner, 2026-10-15: Vivid needed a mark for
 * the home page's strip and its slide, and none was on disk).
 *
 * The plate carries the logo in WHITE over the brand blue in its bottom-right
 * corner. This crops that corner, turns the white into ink — alpha from how
 * far each pixel's red channel rises above the blue ground (white is high in
 * red, the blue is low) — sets it in near-black, and trims it to the ink.
 * Output: public/content/clients/vivid/vivid-mark.png
 *
 *   node scripts/make-vivid-mark.mjs
 */

import sharp from "sharp";
import path from "node:path";

const SRC = path.resolve("public/content/clients/freelance/work/vivid/01.webp");
const OUT = path.resolve("public/content/clients/vivid/vivid-mark.png");
/** The logo's corner of the 1200 × 800 plate, with a margin. */
const BOX = { left: 960, top: 740, width: 236, height: 52 };
/** The red channel of the blue ground, and of the white type. */
const GROUND = 60;
const INK = 235;

const { data, info } = await sharp(SRC).extract(BOX).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(info.width * info.height * 4);
for (let i = 0; i < info.width * info.height; i++) {
  const r = data[i * 3];
  const a = Math.max(0, Math.min(1, (r - GROUND) / (INK - GROUND)));
  out[i * 4] = 23;
  out[i * 4 + 1] = 23;
  out[i * 4 + 2] = 23;
  out[i * 4 + 3] = Math.round(a * 255);
}
const scale = 4;
await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ threshold: 1 })
  .resize({ width: info.width * scale, kernel: "lanczos3" })
  .png()
  .toFile(OUT);
const meta = await sharp(OUT).metadata();
console.log("wrote", OUT, meta.width, "x", meta.height);
