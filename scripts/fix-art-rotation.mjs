/**
 * fix-art-rotation — turns upright the pieces that were photographed or
 * scanned on their side (owner, 2026-10-16: "rotate all pics that are
 * inverted"). Each was checked by eye; the angle is clockwise. The files are
 * rotated IN PLACE (git keeps the originals) — run once, then re-run
 * make-art-thumbs.mjs and make-art-slides.mjs.
 *
 *   node scripts/fix-art-rotation.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

sharp.cache(false);
const ROOT = path.resolve("public/content/art");
const TURNS = {
  "Field Photographs/02.webp": 90,
  "Field Photographs/03.webp": 90,
  "Field Photographs/04.webp": 90,
  "Sketchbooks/08.webp": 270,
  "Sketchbooks/09.webp": 90,
};
for (const [file, angle] of Object.entries(TURNS)) {
  const p = path.join(ROOT, file);
  const buf = await sharp(fs.readFileSync(p)).rotate(angle).webp({ quality: 88 }).toBuffer();
  fs.writeFileSync(p, buf);
  const m = await sharp(buf).metadata();
  console.log(file, angle, m.width, m.height);
}
