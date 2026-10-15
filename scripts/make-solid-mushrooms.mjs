/**
 * make-solid-mushrooms — the Azoth mushrooms without their see-through
 * patches (owner, 2026-10-15: "address the transparency patches in azoth
 * mushroom images").
 *
 * The supplied cutouts carry a lot of PART-transparent pixels — the logs and
 * moss they stand on, and much of the Turkey's Tail itself (61% of its ink):
 * a background removal that half-kept them. Over the dark ridge those read as
 * holes. This hardens the alpha: a pixel with any real ink becomes solid, the
 * faintest haze goes, and a one-pixel ramp keeps the outline smooth. The
 * colours are the files' own (WebP keeps them unpremultiplied). The originals
 * stay where they were; the solid copies are written beside them, in
 * mushrooms/solid/, and constants/azothHero.ts points at those.
 *
 *   node scripts/make-solid-mushrooms.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/content/clients/azoth-biotech/hero/mushrooms");
const OUT = path.join(DIR, "solid");
/** Alpha below LOW is haze (dropped); above HIGH, solid; a ramp between. */
const LOW = 24;
const HIGH = 72;

fs.mkdirSync(OUT, { recursive: true });
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".webp"))) {
  const { data, info } = await sharp(path.join(DIR, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i];
    data[i] = a <= LOW ? 0 : a >= HIGH ? 255 : Math.round(((a - LOW) / (HIGH - LOW)) * 255);
  }
  const out = path.join(OUT, file);
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ quality: 86, alphaQuality: 100 }).toFile(out);
  console.log(file.padEnd(18), Math.round(fs.statSync(out).size / 1024), "KB");
}
