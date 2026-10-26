// The brands ABS carried, as small dark-grey marks for the home page's ABS
// slide (owner, 2026-10-26: "in the area between upper text and lower logos,
// include dark grey logos of brands worked with and include Deathrow vapes
// and Tyson2.0 Puffco, Stundenglass, and find others from the posts you have").
//
// There are no logo files for these brands on this machine (D:/Assets_107/
// Clients/ABS+ is empty), so each mark is lifted from one of the owner's own
// ABS posts (public/content/clients/abs/work) — the post where it stands
// clearest, on the plainest ground: cut out by its colour against that ground
// (`ink`: how much a pixel is the mark, 0…1), set in one dark grey on
// transparency, trimmed, and doubled in size with its edges kept soft.
// Jungo Leaf's gold badge on purple would not separate cleanly; it's left out.
//
//   node scripts/prepare-abs-brand-marks.mjs
//
// → public/content/clients/abs/brands/<id>.png, and _marks.json (sizes).

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const WORK = "public/content/clients/abs/work";
const OUT = "public/content/clients/abs/brands";
/** The marks' one colour (the slide's own dark grey). */
const GREY = [58, 58, 60];

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const ramp = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));

/** [post, crop x, y, w, h, ink(r,g,b) → 0…1] — in reading order on the slide. */
const MARKS = {
  "death-row-vapes": {
    name: "Death Row Vapes",
    post: "deathrow/01",
    crop: [520, 130, 200, 230],
    // Black letters inside a white outline, on yellow and on dark grey: the
    // outline and what it holds — near-white or near-black, never the grounds.
    ink: (r, g, b) => Math.max(ramp(Math.min(r, g, b), 150, 215), 1 - ramp(Math.max(r, g, b), 38, 62)),
  },
  "tyson-2": {
    name: "Tyson 2.0",
    post: "tyson/03",
    crop: [240, 160, 650, 200],
    ink: (r, g, b) => ramp(Math.min(r, g, b), 120, 200),
  },
  puffco: { name: "Puffco", post: "puffco/01", crop: [30, 50, 360, 90], ink: (r, g, b) => 1 - ramp(lum(r, g, b), 90, 190) },
  stundenglass: { name: "Stündenglass", post: "misc/01", crop: [370, 220, 640, 160], ink: (r, g, b) => 1 - ramp(lum(r, g, b), 90, 200) },
  stiiizy: { name: "Stiiizy", post: "stiiizy/01", crop: [55, 38, 337, 214], ink: (r, g, b) => 1 - ramp(lum(r, g, b), 110, 175) },
  "diamond-shruumz": { name: "Diamond Shruumz", post: "shruumz/01", crop: [35, 20, 290, 165], ink: (r, g, b) => ramp(Math.min(r, g, b), 200, 245) },
  beamer: { name: "Beamer", post: "misc/05", crop: [285, 65, 490, 180], ink: (r, g, b) => ramp(Math.min(r, g, b), 110, 200) },
  "elf-bar": { name: "Elf Bar", post: "misc/08", crop: [815, 250, 145, 170], ink: (r, g, b) => 1 - ramp(lum(r, g, b), 80, 190) },
  "al-fakher": {
    name: "Al Fakher",
    post: "misc/09",
    crop: [400, 570, 285, 172],
    // Red on white: how far from white, and red.
    ink: (r, g, b) => ramp(r - (g + b) / 2, 30, 110) * (1 - ramp(lum(r, g, b), 200, 240) * 0.3),
  },
};

fs.mkdirSync(OUT, { recursive: true });
const sizes = {};
for (const [id, m] of Object.entries(MARKS)) {
  const [x, y, w, h] = m.crop;
  const { data, info } = await sharp(path.join(WORK, `${m.post}.webp`))
    .extract({ left: x, top: y, width: w, height: h })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const a = m.ink(data[i], data[i + 1], data[i + 2]);
    out[j] = GREY[0];
    out[j + 1] = GREY[1];
    out[j + 2] = GREY[2];
    out[j + 3] = Math.round(255 * a);
  }
  const file = path.join(OUT, `${id}.png`);
  const trimmed = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();
  const t = await sharp(trimmed).metadata();
  await sharp(trimmed)
    .resize({ width: t.width * 2, height: t.height * 2, kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(file);
  sizes[id] = { name: m.name, w: t.width * 2, h: t.height * 2 };
  console.log(id, `${t.width * 2}x${t.height * 2}`);
}
fs.writeFileSync(path.join(OUT, "_marks.json"), JSON.stringify(sizes, null, 2) + "\n");
