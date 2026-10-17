/**
 * prepare-zabraku-clients — the two clients the Zabraku slide names under its
 * button (owner, 2026-10-17: "include Clients: Casa Playa and RKB dark grey
 * logos, and include their sections in Zabraku page"), in one dark grey on a
 * clear ground:
 *
 *   public/content/clients/zabraku-media/clients/casa-playa-grey.png
 *     lifted off page 33 of the agency's Portfolio 2021 PDF (where it stands
 *     on white beside RK's), its black ink turned to the grey;
 *   public/content/clients/zabraku-media/clients/rkb-grey.png
 *     RKB's gold mark (rkb-logo.png), its ink turned to the grey.
 *
 *   node scripts/prepare-zabraku-clients.mjs "<Portfolio 2021.pdf>"
 */

import fs from "node:fs";
import path from "node:path";
import { pdf } from "pdf-to-img";
import sharp from "sharp";

sharp.cache(false);
const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) throw new Error('usage: node scripts/prepare-zabraku-clients.mjs "<Portfolio 2021.pdf>"');
const OUT = path.resolve("public/content/clients/zabraku-media/clients");
fs.mkdirSync(OUT, { recursive: true });
/** The grey (Tailwind neutral-700). */
const GREY = [64, 64, 64];

/** Ink → the grey, its strength the alpha; trimmed to the ink. */
async function toGrey(input, alphaOf, out, width) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const a = alphaOf(data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]);
    px[i * 4] = GREY[0];
    px[i * 4 + 1] = GREY[1];
    px[i * 4 + 2] = GREY[2];
    px[i * 4 + 3] = a;
  }
  const img = await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer();
  const res = await sharp(img).resize({ width, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(out);
  console.log(path.basename(out), res.width, res.height, Math.round(res.size / 1024) + " KB");
}

// Casa Playa: page 33, the mark's box at scale 6.
const doc = await pdf(SRC, { scale: 6 });
const page = await doc.getPage(33);
const casa = await sharp(page).extract({ left: 6110, top: 4040, width: 680, height: 640 }).toBuffer();
// Darkness as the ink: white → clear, black → solid (a soft knee, so the
// page's grey fringe falls away).
const ink = (r, g, b) => {
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return Math.round(255 * Math.max(0, Math.min(1, (0.86 - l) / 0.66)));
};
await toGrey(casa, ink, path.join(OUT, "casa-playa-grey.png"), 480);

// RKB: its own alpha, kept.
await toGrey(path.resolve("public/content/clients/zabraku-media/rkb-logo.png"), (_r, _g, _b, a) => a, path.join(OUT, "rkb-grey.png"), 480);
