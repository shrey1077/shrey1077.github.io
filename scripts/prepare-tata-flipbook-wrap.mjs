/**
 * prepare-tata-flipbook-wrap — where the handbook flipbook's ink is, frame by
 * frame, finely enough for text to wrap the drawing itself: the boy, the cage
 * and each bird on its own (the Tata slide on the home page, TataFlow; owner,
 * 2026-10-16: "birds are animating upwards into the text, perfect animated
 * text wrap is required").
 *
 * FlipbookFlow's outlines (prepare-tata-flipbook-flow.mjs) give one [first,
 * last] span per band — right for floats, which can only push from a side.
 * Text that runs on BOTH sides of a bird needs every span: so each frame of
 * the sheet is read here in bands BAND px tall, and each band lists all its
 * runs of ink, gaps narrower than GAP px closed (the cage's bars, the dots
 * the boy first appears as, a bird's open wing read as one shape).
 *
 * Writes public/content/clients/tata-iis/handbook/flipbook-wrap.json:
 *   { w, h, band, frames: [ "a,b,a,b;;a,b;…" ] } — per frame, its bands
 *   top to bottom, ";"-separated, each band's runs as start,end pairs in
 *   frame pixels. Fetched by the slide when it is near.
 *
 *   node scripts/prepare-tata-flipbook-wrap.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SHEET = path.resolve("public/content/clients/tata-iis/handbook/flipbook-sprite.webp");
const OUT = path.resolve("public/content/clients/tata-iis/handbook/flipbook-wrap.json");
const COLS = 10;
const ROWS = 8;
const FRAMES = 75;
/** Band height, frame px (a frame is 440 × 492). */
const BAND = 4;
/** Gaps narrower than this, frame px, are closed. */
const GAP = 12;
/** Alpha that counts as ink. */
const INK = 60;

const meta = await sharp(SHEET).metadata();
const fw = meta.width / COLS;
const fh = meta.height / ROWS;
const { data, info } = await sharp(SHEET).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
const W = info.width;

const frames = [];
for (let k = 0; k < FRAMES; k++) {
  const ox = (k % COLS) * fw;
  const oy = Math.floor(k / COLS) * fh;
  const bands = [];
  for (let b = 0; b * BAND < fh; b++) {
    // Which columns of this band hold any ink.
    const ink = new Uint8Array(fw);
    for (let y = b * BAND; y < Math.min(fh, (b + 1) * BAND); y++) {
      const row = (oy + y) * W + ox;
      for (let x = 0; x < fw; x++) if (data[row + x] > INK) ink[x] = 1;
    }
    const runs = [];
    for (let x = 0; x < fw; x++) {
      if (!ink[x]) continue;
      let e = x;
      while (e + 1 < fw && ink[e + 1]) e++;
      const last = runs[runs.length - 1];
      if (last && x - last[1] <= GAP) last[1] = e + 1;
      else runs.push([x, e + 1]);
      x = e;
    }
    bands.push(runs.map(([a, c]) => `${a},${c}`).join(","));
  }
  // Trailing empty bands carry no information.
  frames.push(bands.join(";").replace(/;+$/, ""));
}
fs.writeFileSync(OUT, JSON.stringify({ w: fw, h: fh, band: BAND, frames }));
console.log(FRAMES, "frames,", Math.round(fs.statSync(OUT).size / 1024), "KB");
