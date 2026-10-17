/**
 * prepare-zabraku-sections — the Zabraku page's two client sections, Casa
 * Playa and RKB Entertainment (owner, 2026-10-17: "include Clients: Casa
 * Playa and RKB dark grey logos, and include their sections in Zabraku
 * page"), and every phone number on the Zabraku images blurred (the site
 * shows none — owner's standing rule).
 *
 *   1. Casa Playa's work, cut off page 33 of the agency's Portfolio 2021 PDF
 *      (the page that names it: "Casa Playa is a luxury resort in Goa…"): the
 *      five event posters, the social posts on three phones, and the screens
 *      — written to public/content/clients/zabraku-media/clients/casa-playa/.
 *   2. The phone numbers blurred: the RSVP lines on those pieces; the same
 *      posters on the deck's page 33 (catalogue/Portfolio 2021/p33.webp);
 *      the reservation and contact lines on three event posters
 *      (catalogue/Event Campaigns). Found by Windows' OCR where it could read
 *      them, by eye where the type is too small or styled for it.
 *
 *   node scripts/prepare-zabraku-sections.mjs "<Portfolio 2021.pdf>"
 *
 * ⚠ Part 2 edits catalogue images in place (git keeps the originals).
 * Re-running it blurs the same places again, harmlessly.
 */

import fs from "node:fs";
import path from "node:path";
import { pdf } from "pdf-to-img";
import sharp from "sharp";

// Each image is worked on in memory: sharp otherwise holds the file open, and
// Windows will not let it be written back over.
sharp.cache(false);

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) throw new Error('usage: node scripts/prepare-zabraku-sections.mjs "<Portfolio 2021.pdf>"');
const ZAB = path.resolve("public/content/clients/zabraku-media");
const CASA = path.join(ZAB, "clients/casa-playa");
fs.mkdirSync(CASA, { recursive: true });

/** Blur the boxes [x, y, w, h] (padded) of an image buffer; returns a sharp. */
async function blurred(buf, boxes, pad = 6) {
  const img = sharp(buf);
  const { width, height } = await img.metadata();
  const parts = [];
  for (const [x, y, w, h] of boxes) {
    const left = Math.max(0, Math.round(x - pad));
    const top = Math.max(0, Math.round(y - pad));
    const bw = Math.min(width - left, Math.round(w + 2 * pad));
    const bh = Math.min(height - top, Math.round(h + 2 * pad));
    const sigma = Math.max(4, Math.min(bh, bw) / 3);
    parts.push({ input: await sharp(buf).extract({ left, top, width: bw, height: bh }).blur(sigma).toBuffer(), left, top });
  }
  return sharp(buf).composite(parts);
}

// ── 1. Casa Playa's pieces. The page renders at scale 6 (7143 px wide); the
//       boxes are in a 1800-wide copy's pixels, k = 7143 / 1800.
const k = 7143 / 1800;
/** name: [x, y, w, h] on the page; then its phone lines in the piece's own
 *  pixels (at scale 6). */
const PIECES = {
  "poster-01": { box: [82, 190, 240, 341], phones: [[115, 1203, 430, 40]] },
  "poster-02": { box: [328, 190, 240, 341], phones: [[290, 1248, 505, 44]] },
  "poster-03": { box: [573, 190, 242, 341], phones: [[330, 1276, 345, 34]] },
  "poster-04": { box: [1222, 193, 241, 340], phones: [[305, 1281, 460, 34]] },
  "poster-05": { box: [1473, 193, 241, 340], phones: [[420, 1247, 315, 31]] },
  "social-posts": { box: [70, 780, 525, 325], phones: [[78, 960, 182, 50], [1490, 989, 457, 27]] },
  "screens": { box: [1005, 660, 730, 295], phones: [[824, 769, 154, 46], [1448, 679, 182, 36], [2607, 485, 181, 22]] },
};
const doc = await pdf(SRC, { scale: 6 });
const page = await doc.getPage(33);
for (const [name, { box: [x, y, w, h], phones }] of Object.entries(PIECES)) {
  const piece = await sharp(page).extract({ left: Math.round(x * k), top: Math.round(y * k), width: Math.round(w * k), height: Math.round(h * k) }).png().toBuffer();
  const out = await (await blurred(piece, phones)).png().toBuffer();
  const info = await sharp(out).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(CASA, `${name}.webp`));
  console.log("casa-playa", name, info.width, info.height, Math.round(info.size / 1024) + " KB");
}

// ── 2. The catalogue's phone numbers, in place.
const p33 = [];
for (const name of ["poster-01", "poster-02", "poster-03", "poster-04", "poster-05"]) {
  const { box: [px, py], phones } = PIECES[name];
  for (const [bx, by, bw, bh] of phones) p33.push([px + bx / k, py + by / k, bw / k, bh / k]);
}
const IN_PLACE = {
  "catalogue/Portfolio 2021/p33.webp": { boxes: p33, pad: 2 },
  "catalogue/Event Campaigns/ohm-2-lineup-15-aug.webp": { boxes: [[528, 2498, 544, 56]] },
  "catalogue/Event Campaigns/ohm-2-lineup-a-to-z.webp": { boxes: [[528, 2497, 544, 57]] },
  "catalogue/Event Campaigns/phantom-halloween.webp": { boxes: [[141, 1142, 185, 16]], pad: 4 },
};
for (const [rel, { boxes, pad }] of Object.entries(IN_PLACE)) {
  const file = path.join(ZAB, rel);
  const buf = fs.readFileSync(file);
  const out = await (await blurred(buf, boxes, pad ?? 6)).webp({ quality: 86 }).toBuffer();
  fs.writeFileSync(file, out);
  console.log("blurred", rel, boxes.length, "region(s)");
}
