/**
 * prepare-tata-portrait-logos — IIS Ahmedabad's and IIS Mumbai's marks as
 * PORTRAIT lockups, the mark above its name (owner, 2026-10-16: "Under 1st
 * column put IISA and IISM portrait logos" — for the Tata slide, TataSlide).
 *
 * Neither campus ships one: both files are the landscape lockup, mark left,
 * name right (brand/iisa.png, brand/iism.png). So each is taken apart here —
 * the name cut from where it stands, the mark left whole — and the name set
 * centred under the mark, at the same scale (nothing redrawn, nothing
 * stretched). The cut lines were found by the ink:
 *   · IIS Mumbai: the mark is columns 20–200, the name from 223 on;
 *   · IIS Ahmedabad: the name is the block right of x 465 and below y 355,
 *     under the tree's canopy (whose right-hand dots run above it).
 *
 *   node scripts/prepare-tata-portrait-logos.mjs
 */

import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/content/clients/tata-iis/brand");
/** The gap between mark and name, as a share of the mark's height. */
const GAP = 0.08;

/** The ink's bounding box of an RGBA buffer region. */
function bbox(data, W, x0, y0, x1, y1) {
  let a = x1, b = y1, c = x0, d = y0;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++)
      if (data[(y * W + x) * 4 + 3] > 8) {
        if (x < a) a = x;
        if (y < b) b = y;
        if (x > c) c = x;
        if (y > d) d = y;
      }
  return { left: a, top: b, width: c - a + 1, height: d - b + 1 };
}

async function stack(file, out, nameBox) {
  const { data, info } = await sharp(path.join(DIR, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  // The name: its region, trimmed to its ink.
  const nb = bbox(data, W, nameBox.x0, nameBox.y0, nameBox.x1 ?? W, nameBox.y1 ?? H);
  const name = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).extract(nb).png().toBuffer();
  // The mark: everything else (the name's region cleared), trimmed.
  const rest = Buffer.from(data);
  for (let y = nameBox.y0; y < (nameBox.y1 ?? H); y++)
    for (let x = nameBox.x0; x < (nameBox.x1 ?? W); x++) rest[(y * W + x) * 4 + 3] = 0;
  const mb = bbox(rest, W, 0, 0, W, H);
  const mark = await sharp(rest, { raw: { width: W, height: H, channels: 4 } }).extract(mb).png().toBuffer();
  // Stacked: the mark, a gap, the name — each centred on the wider of the two.
  const gap = Math.round(mb.height * GAP);
  const w = Math.max(mb.width, nb.width);
  const h = mb.height + gap + nb.height;
  const info2 = await sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: mark, left: Math.round((w - mb.width) / 2), top: 0 },
      { input: name, left: Math.round((w - nb.width) / 2), top: mb.height + gap },
    ])
    .png()
    .toFile(path.join(DIR, out));
  console.log(out, info2.width, info2.height);
}

await stack("iisa.png", "iisa-portrait.png", { x0: 465, y0: 355 });
await stack("iism.png", "iism-portrait.png", { x0: 215, y0: 0 });
