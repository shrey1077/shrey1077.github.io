/**
 * make-art-slides — the copies the Arts & Crafts slide shows, one piece at a
 * time (owner, 2026-10-15: "Lets have one continuous slider with one image
 * only transitioning every 5 seconds to the left with pixel effect"). A piece
 * now fills the slide, so the 360 px row copies (make-art-thumbs) are too
 * small: each gets one up to 1080 px tall and 1440 wide, written beside it in
 * `<collection>/_slide/`, and one list, public/content/art/_slides.json, with
 * each one's size — in the order the slide plays them, the collections taken
 * in turn so one never runs on for long.
 *
 * Since the next round each piece also names its COLUMN (owner, 2026-10-16:
 * "three columns, one with pencil sketches and paintings, second with
 * typography and craft pics, and third for photography"): 0 sketches and
 * paintings, 1 typography and craft, 2 photography.
 *
 *   node scripts/make-art-slides.mjs
 *
 * LEFT OUT of the slide (they stay in the collections, and on /arts-and-crafts)
 * — owner, same day: "remove the icons i see there in a theme: energy brain
 * power etc, same square sizes and the mandala artworks, also the attached
 * first screenshot item to be removed" (that screenshot: the "Emphasis"
 * doodle sheet).
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public/content/art");
const IMG = /\.(webp|jpe?g|png|avif)$/i;
const LEAVE_OUT = new Set([
  // The "Emphasis" doodle sheet.
  "Ink and Pattern/02",
  // The mandalas.
  "Painting/01", "Painting/02", "Painting/03", "Painting/04", "Painting/05", "Painting/06", "Painting/07",
  // The icons: brain power, heart, immunity, energy.
  "Painting/08", "Painting/09", "Painting/10", "Painting/11",
]);

/** Which column each collection goes to; Ink and Pattern's first piece — a
 *  stippled drawing — stands with the sketches, its other pieces (pattern
 *  and layout studies) with the craft. */
const COLUMN = {
  "Drawing Studies": 0,
  Sketchbooks: 0,
  Portraits: 0,
  Painting: 0,
  "Type Studies": 1,
  "Model Making": 1,
  "Ink and Pattern": 1,
  "Field Photographs": 2,
};
const columnOf = (collection, stem) => (collection === "Ink and Pattern" && stem === "01" ? 0 : (COLUMN[collection] ?? 1));
const byCollection = [];
let kb = 0;
for (const collection of fs.readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  const dir = path.join(ROOT, collection);
  const out = path.join(dir, "_slide");
  const pieces = [];
  for (const file of fs.readdirSync(dir).filter((f) => IMG.test(f)).sort()) {
    const stem = file.replace(IMG, "");
    if (LEAVE_OUT.has(`${collection}/${stem}`)) continue;
    fs.mkdirSync(out, { recursive: true });
    const name = `${stem}.webp`;
    const info = await sharp(path.join(dir, file))
      .rotate()
      .resize({ width: 1440, height: 1080, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(path.join(out, name));
    kb += info.size / 1024;
    pieces.push({ collection, column: columnOf(collection, stem), src: `/content/art/${collection}/_slide/${name}`, w: info.width, h: info.height });
  }
  if (pieces.length) byCollection.push(pieces);
}
// The collections in turn: the first of each, then the second of each, …
const list = [];
for (let i = 0; byCollection.some((c) => i < c.length); i++) for (const c of byCollection) if (i < c.length) list.push(c[i]);
fs.writeFileSync(path.join(ROOT, "_slides.json"), JSON.stringify(list, null, 1));
console.log(list.length, "pieces,", Math.round(kb), "KB in all");
