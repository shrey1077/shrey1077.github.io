/**
 * prepare-tata-flipbook-flow.mjs — the handbook's flipbook, laid out for the
 * text to flow round it (owner, 2026-10-05): the boy freeing the birds sits in
 * the middle of a two-column paragraph, and the text moves aside as the birds
 * fly out.
 *
 * The looping flipbook.webp (scripts/prepare-tata-handbook.mjs) cannot do this
 * — a page cannot read where an animated image is, nor what shape it is. So
 * the same frames are cut again, larger, and written as:
 *
 *   → public/content/clients/tata-iis/handbook/flipbook-sprite.webp
 *       every frame on one sheet, so a frame change is a background-position
 *       change (no image swap, no flicker)
 *   → src/constants/tataFlipbookFlow.ts                    (generated)
 *       the sheet's grid, and per frame the drawing's OUTLINE: for each of
 *       ROWS bands down the frame, where the ink starts and ends across it.
 *       The page turns that into the shape-outside polygons the text wraps.
 *
 * The frames are cut exactly as in prepare-tata-handbook.mjs (same corner,
 * same first page, rules lifted the same way, blank corners dropped, one crop
 * for the whole run) — only larger. Keep the two in step.
 *
 *   node scripts/prepare-tata-flipbook-flow.mjs
 */

import { pdf } from "pdf-to-img";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { ASSETS, CONTENT, ROOT } from "./sources.mjs";

const PDF = path.join(ASSETS, "Clients/Tata IIS/Print/Handbook/IISA Handbook_one.pdf");
const OUT = path.join(CONTENT, "clients/tata-iis/handbook");
const TS = path.join(ROOT, "src/constants/tataFlipbookFlow.ts");
const URL = "/content/clients/tata-iis/handbook";

// ── as in prepare-tata-handbook.mjs ──
const CORNER = { x0: 0.72, x1: 0.96, y0: 0.69, y1: 0.915 };
const FIRST_FRAME_PAGE = 27;
// MIN_INK there is 60 dark pixels at scale 3.2; pixels grow with the square
// of the scale, so the same corners pass here.
const SCALE = 4.4;
const MIN_INK = Math.round(60 * (SCALE / 3.2) ** 2);

/** A frame's width on the sheet (px). Shown at up to ~21rem, so 2× there. */
const FRAME_W = 440;
/** Frames per row on the sheet. */
const COLS = 10;
/** Bands down the frame the outline is measured in. */
const ROWS = 36;
/** Ink, for the outline (0 black – 255 white). */
const INK = 200;

function liftRules(px, w, h) {
  const ink = (v) => v < 235;
  for (let y = 0; y < h; y++) {
    let n = 0;
    for (let x = 0; x < w; x++) if (ink(px[y * w + x])) n++;
    if (n < w * 0.45) continue;
    for (let x = 0; x < w; x++) {
      const up = y >= 3 ? px[(y - 3) * w + x] : 255;
      const down = y + 3 < h ? px[(y + 3) * w + x] : 255;
      if (!(ink(up) && ink(down))) px[y * w + x] = 255;
    }
  }
}

const doc = await pdf(PDF, { scale: SCALE });
const raws = [];
for (let n = FIRST_FRAME_PAGE; n <= doc.length; n += 2) {
  const png = await doc.getPage(n);
  const m = await sharp(png).metadata();
  const box = {
    left: Math.round(m.width * CORNER.x0),
    top: Math.round(m.height * CORNER.y0),
    width: Math.round(m.width * (CORNER.x1 - CORNER.x0)),
    height: Math.round(m.height * (CORNER.y1 - CORNER.y0)),
  };
  const { data, info } = await sharp(png)
    .flatten({ background: "#ffffff" })
    .extract(box)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  liftRules(data, info.width, info.height);
  let dark = 0;
  for (const v of data) if (v < 160) dark++;
  if (dark >= MIN_INK) raws.push({ data, w: info.width, h: info.height });
}

// One crop for the whole run, padded (prepare-tata-handbook.mjs pads 20px at
// scale 3.2; the same margin here).
const { w, h } = raws[0];
let x0 = w, y0 = h, x1 = 0, y1 = 0;
for (const { data } of raws)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (data[y * w + x] < INK) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
const pad = Math.round((20 * SCALE) / 3.2);
const crop = {
  left: Math.max(0, x0 - pad),
  top: Math.max(0, y0 - pad),
  width: Math.min(w, x1 + pad) - Math.max(0, x0 - pad),
  height: Math.min(h, y1 + pad) - Math.max(0, y0 - pad),
};

const frames = [];
const outlines = [];
for (const { data } of raws) {
  const { data: px, info } = await sharp(data, { raw: { width: w, height: h, channels: 1 } })
    .extract(crop)
    .resize({ width: FRAME_W })
    .toColourspace("b-w") // one channel out, as it came in
    .raw()
    .toBuffer({ resolveWithObject: true });
  frames.push({ px, fw: info.width, fh: info.height });

  // Per band: the first and last inked column, as fractions of the width.
  const bands = [];
  for (let r = 0; r < ROWS; r++) {
    const ya = Math.floor((r * info.height) / ROWS);
    const yb = Math.floor(((r + 1) * info.height) / ROWS);
    let a = info.width, b = -1;
    for (let y = ya; y < yb; y++)
      for (let x = 0; x < info.width; x++)
        if (px[y * info.width + x] < INK) {
          if (x < a) a = x;
          if (x > b) b = x;
        }
    bands.push(b < 0 ? null : [a / info.width, b / info.width]);
  }
  // Each band takes in its neighbours, so a lone bird does not notch the text
  // one line deep, and the outline reads as one shape.
  const smooth = bands.map((_, r) => {
    let a = 1, b = 0, any = false;
    for (const k of [r - 1, r, r + 1]) {
      const v = bands[k];
      if (!v) continue;
      any = true;
      a = Math.min(a, v[0]);
      b = Math.max(b, v[1]);
    }
    return any ? [+a.toFixed(3), +b.toFixed(3)] : null;
  });
  outlines.push(smooth);
}

// The sheet — black ink on TRANSPARENT, the ink's darkness as its alpha, so
// the drawing sits on whatever is behind it. (A white ground with
// mix-blend-mode cannot be relied on: the band's stacking keeps the blend from
// reaching the page's background, and the white shows as a box.)
const { fw, fh } = frames[0];
const rowsOnSheet = Math.ceil(frames.length / COLS);
const rgba = (px) => {
  const out = Buffer.alloc(px.length * 4);
  for (let i = 0; i < px.length; i++) out[i * 4 + 3] = Math.min(255, Math.round((255 - px[i]) * 1.12));
  return out;
};
const sheet = sharp({
  create: { width: fw * COLS, height: fh * rowsOnSheet, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
}).composite(
  await Promise.all(
    frames.map(async ({ px }, i) => ({
      input: await sharp(rgba(px), { raw: { width: fw, height: fh, channels: 4 } }).png().toBuffer(),
      left: (i % COLS) * fw,
      top: Math.floor(i / COLS) * fh,
    })),
  ),
);
const info = await sheet.webp({ quality: 82, alphaQuality: 90 }).toFile(path.join(OUT, "flipbook-sprite.webp"));
console.log("sheet", frames.length, "frames", fw, "x", fh, "→", info.width, "x", info.height, Math.round(info.size / 1024) + "KB");

const ts = `/**
 * GENERATED by scripts/prepare-tata-flipbook-flow.mjs — do not edit by hand.
 *
 * The handbook's flipbook as one sheet of frames, and per frame the drawing's
 * outline: ROWS bands down the frame, each [first, last] inked column as a
 * fraction of the frame's width, or null where the band is empty.
 */

export const FLIPBOOK_FLOW = {
  sprite: "${URL}/flipbook-sprite.webp",
  frames: ${frames.length},
  cols: ${COLS},
  rows: ${rowsOnSheet},
  w: ${fw},
  h: ${fh},
} as const;

export const FLIPBOOK_OUTLINE_ROWS = ${ROWS};

export const FLIPBOOK_OUTLINES: ReadonlyArray<ReadonlyArray<readonly [number, number] | null>> = ${JSON.stringify(outlines)};
`;
fs.writeFileSync(TS, ts);
console.log("wrote", path.relative(ROOT, TS));
