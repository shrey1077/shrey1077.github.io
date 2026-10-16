/**
 * prepare-azoth-white-brands — the Azoth family's marks in white, for the
 * home page's Azoth slide, which is dark (owner, 2026-10-16: "include Azoth
 * brands except mycoveda in azoth slide as white logos"). Mycoveda is a
 * separate client (see azothExperience), so it is left out.
 *
 * The files are dark ink on a clear or white ground; each mark's ink — how
 * dark a pixel is, and how solid — becomes the white mark's alpha, so the
 * colours (Mushroomworks' teal, its grey) come out solid white too.
 *
 *   node scripts/prepare-azoth-white-brands.mjs
 *   → public/content/clients/azoth-biotech/brand/brands/white/<slug>.png
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/content/clients/azoth-biotech/brand/brands");
const OUT = path.join(DIR, "white");
fs.mkdirSync(OUT, { recursive: true });

for (const slug of ["naturalist", "mushroomworks", "mycoactive", "kavaka"]) {
  const { data, info } = await sharp(path.join(DIR, `${slug}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3] / 255;
    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
    const ink = Math.max(0, Math.min(1, ((255 - lum) / 255) * 2.6));
    out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = 255;
    out[i * 4 + 3] = Math.round(255 * a * ink);
  }
  const res = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .png()
    .toFile(path.join(OUT, `${slug}.png`));
  console.log(slug, res.width, res.height);
}
