/**
 * prepare-freelance-logos — the commissions' own marks, for the All Projects
 * wall (owner, 2026-10-16: "use original logos wherever possible and use
 * helvetica bold if not available"). None shipped as a file; each is lifted
 * off the client's own artwork, where it stands clear:
 *
 *   · Leder Warren — the wordmark on its banner's white pill (leder/01);
 *   · The Shri Ram Universal School — the TSUS crest on its flyer (tsus/01),
 *     cut to its circle;
 *   · Maxbox Creations — the mark in the corner of its render (maxbox/01).
 *
 * Maler Oswald's only "logo" file is a shopfront mockup, and Sotai is a
 * village's name on government boards — neither has a mark to lift; the wall
 * sets their names in Helvetica Bold.
 *
 *   node scripts/prepare-freelance-logos.mjs
 *   → public/content/clients/freelance/logos/<slug>.png
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const WORK = path.resolve("public/content/clients/freelance/work");
const OUT = path.resolve("public/content/clients/freelance/logos");
fs.mkdirSync(OUT, { recursive: true });

/** Near-white to clear: each pixel's alpha is how far it is from white,
 *  its colour kept — the mark comes off its white ground, edges soft. */
async function offWhite(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const d = 255 - Math.min(r, g, b);
    const a = Math.max(0, Math.min(1, (d - 18) / 70));
    data[i * 4 + 3] = Math.round(255 * a);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer();
}

// Leder Warren: inside the white pill.
{
  const buf = await sharp(path.join(WORK, "leder/01.webp")).extract({ left: 60, top: 57, width: 334, height: 70 }).resize({ width: 1320 }).toBuffer();
  const info = await sharp(await offWhite(buf)).toFile(path.join(OUT, "leder.png"));
  console.log("leder", info.width, info.height);
}
// TSUS: the crest, cut to its circle.
{
  const cx = 178, cy = 1792, r = 122;
  const size = r * 2;
  const crop = await sharp(path.join(WORK, "tsus/01.webp")).extract({ left: cx - r, top: cy - r, width: size, height: size }).resize(size * 3).png().toBuffer();
  const mask = Buffer.from(`<svg width="${size * 3}" height="${size * 3}"><circle cx="${size * 1.5}" cy="${size * 1.5}" r="${size * 1.5 - 2}" fill="#fff"/></svg>`);
  const info = await sharp(crop).composite([{ input: mask, blend: "dest-in" }]).png().toFile(path.join(OUT, "tsus.png"));
  console.log("tsus", info.width, info.height);
}
// Maxbox Creations: its white corner box.
{
  const buf = await sharp(path.join(WORK, "maxbox/01.webp")).extract({ left: 4, top: 690, width: 112, height: 82 }).resize({ width: 672 }).toBuffer();
  const info = await sharp(await offWhite(buf)).toFile(path.join(OUT, "maxbox.png"));
  console.log("maxbox", info.width, info.height);
}
