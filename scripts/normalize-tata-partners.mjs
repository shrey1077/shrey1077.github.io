/**
 * normalize-tata-partners.mjs — make the partner-marquee logos read as a peer
 * group by equalising the *area* each occupies, not their height.
 *
 * A fixed-height row makes a wide wordmark (UNIVERSAL ROBOTS) tower over a
 * compact mark (ZEISS). Instead we trim each logo to its ink, then scale it so
 * every logo's ink area is the same target, and centre it on a canvas of one
 * shared height (widths vary, tight to each logo). The marquee then renders one
 * fixed height and the logos look equal-weight.
 *
 * Idempotent: originals are copied to partners/_orig once and always used as
 * the input, so re-running re-derives from pristine art.
 *
 * Run: node scripts/normalize-tata-partners.mjs
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DIR = "D:/Brain Folio/public/content/clients/tata-iis/brand/partners";
const ORIG = path.join(DIR, "_orig");

const TARGET_AREA = 8200; // ink area per logo, in output px²
const MARGIN = 14; // transparent breathing room around the ink

fs.mkdirSync(ORIG, { recursive: true });
const files = fs.readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".png"));

// One-time: stash pristine originals.
for (const f of files) {
  const bak = path.join(ORIG, f);
  if (!fs.existsSync(bak)) fs.copyFileSync(path.join(DIR, f), bak);
}
const sources = fs.readdirSync(ORIG).filter((f) => f.toLowerCase().endsWith(".png"));

/** Trim a logo to its opaque ink bounds. */
async function inkBounds(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 32) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

// Pass 1: measure trimmed aspect ratios and the scaled ink dimensions.
const plan = [];
for (const f of sources) {
  const src = path.join(ORIG, f);
  const b = await inkBounds(src);
  const aspect = b.width / b.height;
  const nh = Math.round(Math.sqrt(TARGET_AREA / aspect));
  const nw = Math.round(Math.sqrt(TARGET_AREA * aspect));
  plan.push({ f, src, b, nw, nh });
}
// One uniform canvas for every logo → identical intrinsic aspect (next/image
// stays undistorted) and even marquee spacing; only the centred ink differs.
const canvasW = Math.max(...plan.map((p) => p.nw)) + MARGIN * 2;
const canvasH = Math.max(...plan.map((p) => p.nh)) + MARGIN * 2;

// Pass 2: trim → scale to equal ink area → centre on the shared canvas.
for (const p of plan) {
  const ink = await sharp(p.src).extract(p.b).resize(p.nw, p.nh, { fit: "fill" }).png().toBuffer();
  await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: ink, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(DIR, p.f));
  console.log(`${p.f.padEnd(20)} ink ${p.nw}×${p.nh}`);
}
console.log(`\nDone. ${plan.length} logos on a uniform ${canvasW}×${canvasH} canvas.`);
