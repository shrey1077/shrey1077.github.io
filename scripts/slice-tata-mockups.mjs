/**
 * slice-tata-mockups.mjs — turn the two OpenArt "contact sheet" grids into the
 * 17 individual mockup cutouts used on the Tata IIS accordion (4 family rows +
 * 13 sub-category chips).
 *
 * Input:  public/content/clients/tata-iis/brand/mockups/_sheets/sheet{A,B}.jpg
 *         (each a 1024×1024, 3×3 grid of isolated product mockups on pure white)
 * Output: public/content/clients/tata-iis/brand/mockups/{fam-*,sub-*}.png
 *         (transparent PNG cutouts, background keyed out, soft shadow kept)
 *
 * Keying: a flood fill from the four borders over near-white / near-neutral
 * pixels. Only background white that is CONNECTED to the edge is removed, so
 * enclosed whites (a billboard panel, a phone bezel, brochure inner pages) stay
 * solid — a naive white→alpha threshold would punch holes in them. Each object
 * is then trimmed to its bounding box and centred on a square transparent
 * canvas so the set shares one visual weight under `object-contain`.
 *
 * Idempotent: re-run any time the sheets change. Node ≥ 18, sharp.
 */

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRAND = path.join(__dirname, "..", "public", "content", "clients", "tata-iis", "brand");
const SHEETS = path.join(BRAND, "mockups", "_sheets");
const OUT = path.join(BRAND, "mockups");

const GRID = 3; // 3×3 per sheet

/** Cell (row-major, 0…8) → output basename. Order MUST match the prompt. */
const MAP = {
  sheetA: [
    "fam-brand-logo-guidelines", // open brand manual booklet
    "fam-print-media",           // fanned poster sheets
    "fam-digital-graphics",      // monitor + phone
    "fam-photography",           // DSLR camera
    "sub-certificates",          // certificate scroll + ribbon
    "sub-merchandise",           // folded polo
    "sub-stationery",            // letterhead + cards + envelope
    "sub-billboards-and-signages", // billboard on posts
    "sub-brochures",             // open tri-fold brochure
  ],
  sheetB: [
    "sub-banners",               // roll-up pull-up banner stand
    "sub-lab-standees",          // A-frame standee
    "sub-events",                // stage backdrop + podium
    "sub-flyers-and-campaigns",  // curled A5 flyer
    "sub-campus-posters",        // poster on easel
    "sub-films",                 // clapperboard
    "sub-socials-and-screens",   // smartphone social feed
    "sub-photography",           // stack of photo prints
    "_spare-lanyard",            // spare (lanyard + ID badge)
  ],
};

const WHITE_MIN = 234; // a pixel is "white-ish" when min(r,g,b) ≥ this …
const NEUTRAL_MAX = 18; // … and (max−min) ≤ this (so coloured light tints stay)
const ALPHA_CUT = 12; // alpha above this counts as object when finding the bbox
const PAD_FRAC = 0.07; // square-canvas padding, fraction of the long side

/** Flood-fill the connected background white from the borders → alpha 0. */
function keyOutBackground(data, w, h) {
  const isWhite = (p) => {
    const r = data[p * 4], g = data[p * 4 + 1], b = data[p * 4 + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    return mn >= WHITE_MIN && mx - mn <= NEUTRAL_MAX;
  };
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { stack.push(y * w, y * w + (w - 1)); }
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    if (!isWhite(p)) continue;
    data[p * 4 + 3] = 0; // transparent
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
}

/** Bounding box of the object (alpha > ALPHA_CUT). */
function objectBounds(data, w, h) {
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > ALPHA_CUT) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function sliceSheet(sheetKey) {
  const src = path.join(SHEETS, `${sheetKey}.jpg`);
  const base = sharp(src).ensureAlpha();
  const meta = await base.metadata();
  const W = meta.width, H = meta.height;
  const cw = Math.floor(W / GRID), ch = Math.floor(H / GRID);

  const names = MAP[sheetKey];
  const results = [];

  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const idx = r * GRID + c;
      const name = names[idx];
      if (!name) continue;

      // Full third-cell, last row/col extended to the edge.
      const left = c * cw;
      const top = r * ch;
      const width = c === GRID - 1 ? W - left : cw;
      const height = r === GRID - 1 ? H - top : ch;

      const { data, info } = await sharp(src)
        .ensureAlpha()
        .extract({ left, top, width, height })
        .raw()
        .toBuffer({ resolveWithObject: true });

      keyOutBackground(data, info.width, info.height);
      const bounds = objectBounds(data, info.width, info.height);
      if (!bounds) { results.push(`${name}: EMPTY`); continue; }

      // Crop to the object, then centre on a square transparent canvas.
      const long = Math.max(bounds.width, bounds.height);
      const pad = Math.round(long * PAD_FRAC);
      const side = long + pad * 2;
      const objPng = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
        .extract(bounds)
        .png()
        .toBuffer();

      await sharp({
        create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite([{ input: objPng, gravity: "centre" }])
        .png({ compressionLevel: 9 })
        .toFile(path.join(OUT, `${name}.png`));

      results.push(`${name}: ${bounds.width}×${bounds.height} → ${side}²`);
    }
  }
  return results;
}

const a = await sliceSheet("sheetA");
const b = await sliceSheet("sheetB");
console.log("Sheet A:\n  " + a.join("\n  "));
console.log("Sheet B:\n  " + b.join("\n  "));
console.log("Done → " + OUT);
