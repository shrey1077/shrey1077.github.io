/**
 * make-art-thumbs — the small copies the Arts & Crafts slide's three moving
 * rows show (owner, 2026-10-15: "three rows picture slider showing the works
 * for Arts and Crafts"). The full pieces are ~11 MB across the collections;
 * a row only ever shows them a few hundred pixels tall, so each gets a copy
 * 360 px tall, written beside it in `<collection>/_thumbs/`, and one list of
 * them all, public/content/art/_thumbs.json, with each one's size.
 *
 *   node scripts/make-art-thumbs.mjs
 *
 * Re-run when a piece is added. readArtCollections() lists files only, so
 * the `_thumbs` folders never show up as pieces or collections.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public/content/art");
const H = 360;
const IMG = /\.(webp|jpe?g|png|avif)$/i;
const list = [];
for (const collection of fs.readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  const dir = path.join(ROOT, collection);
  const out = path.join(dir, "_thumbs");
  fs.mkdirSync(out, { recursive: true });
  for (const file of fs.readdirSync(dir).filter((f) => IMG.test(f)).sort()) {
    const name = file.replace(IMG, ".webp");
    const info = await sharp(path.join(dir, file)).rotate().resize({ height: H, withoutEnlargement: true }).webp({ quality: 72 }).toFile(path.join(out, name));
    list.push({ collection, src: `/content/art/${collection}/_thumbs/${name}`, w: info.width, h: info.height, kb: Math.round(info.size / 1024) });
  }
}
fs.writeFileSync(path.join(ROOT, "_thumbs.json"), JSON.stringify(list.map(({ kb, ...t }) => t), null, 1));
console.log(list.length, "thumbs,", list.reduce((n, t) => n + t.kb, 0), "KB in all");
