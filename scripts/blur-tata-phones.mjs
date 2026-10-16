/**
 * blur-tata-phones — blurs every phone number in the Tata IIS images the site
 * ships (owner, 2026-10-16: "blur all phone numbers related to tata iis on
 * images uploaded in the whole project").
 *
 * Found by Windows' own OCR over each full-size image (the OCR and its
 * review were run once, outside the repo); this script takes the boxes it
 * found — kept in scripts/tata-phone-boxes.json, in each image's own pixels —
 * and blurs them in place, and in the image's thumbnail (thumbs/<slug>/…, the
 * same file at a smaller size) at the same place. A block of numbers (an
 * admissions list) is blurred as ONE region, so a line the OCR missed
 * between two it read is covered too.
 *
 * Left alone on purpose, after review: dates, years, ID and registration
 * numbers, temperatures — numbers, but not phone numbers.
 *
 *   node scripts/blur-tata-phones.mjs
 *
 * ⚠ It edits the images in place (git keeps the originals). Re-running it
 * blurs the same places again, harmlessly.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// ⚠ Each image is read into memory and worked on there: sharp otherwise keeps
// the file open, and Windows will not let it be written back over.
sharp.cache(false);

const BOXES = JSON.parse(fs.readFileSync(path.resolve("scripts/tata-phone-boxes.json"), "utf8"));
const ROOT = path.resolve("public/content/clients/tata-iis");

/** catalogue/<Category>/<file> → thumbs/<slug>/<file>, where it exists. */
function thumbOf(file) {
  const m = /content\/clients\/tata-iis\/catalogue\/([^/]+)\/([^/]+)$/.exec(file);
  if (!m) return null;
  const slug = m[1].toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const t = path.join(ROOT, "thumbs", slug, m[2]);
  return fs.existsSync(t) ? t : null;
}

async function blurIn(file, regions, scale = 1) {
  const src = fs.readFileSync(file);
  const meta = await sharp(src).metadata();
  const W = meta.width;
  const H = meta.height;
  const layers = [];
  for (const r of regions) {
    const pad = Math.max(3, r.h * 0.35) * scale;
    const left = Math.max(0, Math.floor(r.x * scale - pad));
    const top = Math.max(0, Math.floor(r.y * scale - pad));
    const width = Math.min(W - left, Math.ceil(r.w * scale + 2 * pad));
    const height = Math.min(H - top, Math.ceil(r.h * scale + 2 * pad));
    if (width < 2 || height < 2) continue;
    // Pixelate, then blur: no edge of a figure left to read.
    const cell = Math.max(2, Math.round(r.h * scale * 0.45));
    const small = await sharp(src)
      .extract({ left, top, width, height })
      .resize(Math.max(1, Math.round(width / cell)), Math.max(1, Math.round(height / cell)), { kernel: "cubic" })
      .toBuffer();
    const patch = await sharp(small)
      .resize(width, height, { kernel: "cubic" })
      .blur(Math.max(1.2, r.h * scale * 0.18))
      .toBuffer();
    layers.push({ input: patch, left, top });
  }
  if (!layers.length) return 0;
  const out = sharp(src).composite(layers);
  const ext = path.extname(file).toLowerCase();
  const buf =
    ext === ".png"
      ? await out.png().toBuffer()
      : ext === ".jpg" || ext === ".jpeg"
        ? await out.jpeg({ quality: 88 }).toBuffer()
        : await out.webp({ quality: 84 }).toBuffer();
  fs.writeFileSync(file, buf);
  return layers.length;
}

let images = 0;
let regions = 0;
for (const { file, w, regions: rs } of BOXES) {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    console.log("missing", file);
    continue;
  }
  regions += await blurIn(abs, rs);
  images++;
  const t = thumbOf(file);
  if (t) {
    const tm = await sharp(fs.readFileSync(t)).metadata();
    await blurIn(t, rs, tm.width / w);
    images++;
  }
}
console.log("blurred", regions, "regions across", images, "files (originals and thumbnails)");
