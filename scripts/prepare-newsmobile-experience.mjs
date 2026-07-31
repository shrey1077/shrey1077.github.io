/**
 * prepare-newsmobile-experience.mjs — assets for the bespoke NewsMobile page.
 *
 * A newsroom's graphics, told by editorial kind. Converts the curated cards to
 * numbered webp plates and writes a `_plates.json` manifest per category
 * (curated order + intrinsic dimensions) for the natural-aspect gallery.
 *
 * Source: D:/Assets/Clients/Newsmobile+
 * Output: public/content/clients/newsmobile/work/<category>/…
 * Idempotent. Node >= 18, sharp.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "D:/Assets/Clients/Newsmobile+";
const DEST = "D:/Brain Folio/public/content/clients/newsmobile";

const ensure = (p) => fs.mkdirSync(p, { recursive: true });
let ok = 0,
  fail = 0;
const good = (m) => {
  ok++;
  console.log("  ok " + m);
};
const bad = (m, e) => {
  fail++;
  console.error("  FAIL " + m + ": " + e.message);
};

async function webp(src, out, width = 1400, q = 84) {
  ensure(path.dirname(out));
  const info = await sharp(src, { limitInputPixels: false })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: q })
    .toFile(out);
  return { w: info.width, h: info.height };
}

/** Clean lightbox captions per category (source filenames are noisy). */
const LABELS = {
  data: "NewsMobile · Data journalism",
  quotes: "NewsMobile · News card",
  explainers: "NewsMobile · Explainers",
};

const WORK = {
  data: [
    "killer roads.jpg",
    "29249855_10212896458298481_6703955836044448910_n.jpg",
  ],
  quotes: ["gst launch.jpg"],
  explainers: [
    "29261573_10212896457538462_7967938824991730418_n.jpg",
    "29250177_10212896456378433_1734483741440550116_n.jpg",
    "29261939_10212896459218504_5372384996697891528_n.jpg",
  ],
};

for (const [folder, files] of Object.entries(WORK)) {
  console.log(`${folder}:`);
  const manifest = [];
  let n = 0;
  for (const f of files) {
    const src = path.join(SRC, f);
    if (!fs.existsSync(src)) {
      console.error(`  skip (missing) ${f}`);
      continue;
    }
    const name = `${String(++n).padStart(2, "0")}.webp`;
    const out = `${DEST}/work/${folder}/${name}`;
    try {
      const { w, h } = await webp(src, out);
      const label = LABELS[folder]
        ? `${LABELS[folder]} — ${String(n).padStart(2, "0")}`
        : path.parse(f).name;
      manifest.push({ src: name, w, h, name: label });
      good(name);
    } catch (e) {
      n--;
      bad(name, e);
    }
  }
  ensure(`${DEST}/work/${folder}`);
  fs.writeFileSync(
    `${DEST}/work/${folder}/_plates.json`,
    JSON.stringify(manifest, null, 2),
  );
}

console.log(`\nDone. ${ok} ok, ${fail} failed.`);
