/**
 * prepare-tata-showcase — the owner's artwork for band 04's five panels.
 *
 * Supplied 2026-09-27: one cover image per panel, plus the grid-line artwork
 * the composition sits on. This re-encodes them to the widths they actually
 * render at; the originals stay in `showcase/_orig/`.
 *
 * ⚠ THESE ARE COVERS, NOT THE WORK. They are composites the owner made to
 * dress the panels — devices showing a Tata IIS site that does not exist as
 * shown, print pieces that are not the real brochures, an edit timeline. The
 * REAL work is what the centre of the composition plays, and that comes from
 * the catalogue (see tataShowcase.ts). Keep it that way: a panel cover is
 * decoration, the centre is evidence. If these ever need captioning, they are
 * illustrations, not deliverables.
 *
 * Output: public/content/clients/tata-iis/showcase/*.webp
 * Safe to re-run.
 */

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "public/content/clients/tata-iis/showcase");
const ORIG = path.join(DIR, "_orig");

const FILES = [
  // A panel cover is never shown larger than about a third of the screen.
  { from: "brand.webp", to: "brand.webp", width: 1100 },
  { from: "print.webp", to: "print.webp", width: 1100 },
  { from: "digital.webp", to: "digital.webp", width: 1100 },
  { from: "photography.webp", to: "photography.webp", width: 1100 },
  { from: "video.webp", to: "video.webp", width: 1100 },
  // The grid lines wash the whole band, so it keeps its width — but it is
  // nearly white and compresses to almost nothing.
  { from: "grid-lines.webp", to: "grid-lines.webp", width: 1672 },
];

await fs.mkdir(DIR, { recursive: true });

for (const file of FILES) {
  const src = path.join(ORIG, file.from);
  const out = path.join(DIR, file.to);
  const before = (await fs.stat(src)).size;
  await sharp(src)
    .resize({ width: file.width, withoutEnlargement: true })
    .webp({ quality: 76 })
    .toFile(out);
  const after = (await fs.stat(out)).size;
  const { width, height } = await sharp(out).metadata();
  console.log(
    `${file.to.padEnd(18)} ${width}×${height}  ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB`,
  );
}
