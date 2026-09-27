/**
 * prepare-tata-campus — the two campus photographs for band 01 ("Who we are").
 *
 * The owner supplied both on 2026-09-26: IIS Ahmedabad (the Lab 1 frontage with
 * the MSDE standee) and IIS Mumbai (the glass facade at Chunabhatti). They
 * arrive straight off a camera — one a 2000×1333 JPEG, the other a 1280×960
 * WebP, 850KB the pair — so this re-encodes them to the width the band
 * actually renders and nothing more.
 *
 * ⚠ THE ORIGINALS STAY in `campus/_orig/`. They are the only copies; the files
 * this writes are derived and can be regenerated at any time, the supplied ones
 * cannot. Same rule as the hero artwork.
 *
 * ⚠ These are the CLIENT'S OWN BUILDINGS, photographed on site — not stock, and
 * not the AI-composited campus in the comp. The band says so.
 *
 * Output: public/content/clients/tata-iis/campus/*.webp
 * Safe to re-run.
 */

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "public/content/clients/tata-iis/campus");
const ORIG = path.join(DIR, "_orig");

/** The band renders these at roughly half the shell's width, so 1400px covers
 *  a 2× display without carrying a full camera frame around. */
const WIDTH = 1400;

/** ⚠ AHMEDABAD HAS THREE, AND THE ORDER IS THE POINT: the frontage, then the
 *  lab entrance, then the workshop floor — outside in. Band 01 plays them in
 *  this order after the campus film. Mumbai still has one; the owner said to
 *  wait for its set. */
const PHOTOS = [
  { from: "iisa-frontage.jpg", to: "iisa-frontage.webp" },
  { from: "iisa-lab-1.jpg", to: "iisa-lab-1.webp" },
  { from: "iisa-workshop.jpg", to: "iisa-workshop.webp" },
  { from: "iism-facade.webp", to: "iism-facade.webp" },
];

await fs.mkdir(DIR, { recursive: true });

for (const photo of PHOTOS) {
  const src = path.join(ORIG, photo.from);
  const out = path.join(DIR, photo.to);
  const before = (await fs.stat(src)).size;
  await sharp(src)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(out);
  const after = (await fs.stat(out)).size;
  const { width, height } = await sharp(out).metadata();
  console.log(
    `${photo.to.padEnd(18)} ${width}×${height}  ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB`,
  );
}
