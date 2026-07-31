/**
 * prepare-freelance-experience.mjs — assets for the bespoke Freelance page.
 *
 * The independent practice: several small brands, each a category. Converts the
 * curated source stills to numbered webp plates and writes a `_plates.json`
 * manifest per category (curated order + intrinsic dimensions) so the gallery
 * can lay them out at their true aspect ratios without cropping.
 *
 * Source: D:/Assets/Clients/Freelance
 * Output: public/content/clients/freelance/work/<category>/…
 * Idempotent. Node >= 18, sharp.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "D:/Assets/Clients/Freelance";
const DEST = "D:/Brain Folio/public/content/clients/freelance";

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

/** Raster -> web webp; returns the output's intrinsic size for the manifest. */
async function webp(src, out, width = 1500, q = 82) {
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
  vivid: "Vivid Process Technology",
  leder: "Leder Warren",
  "first-divine": "First Divine",
  tsus: "The Shri Ram Universal School",
  komono: "komono",
  "maler-oswald": "Maler Oswald",
  sotai: "Sotai",
  maxbox: "Maxbox Creations",
};

/** Each category: an ordered list of source files (relative to SRC). */
const WORK = {
  vivid: [
    "Vivid tech/vivid process tech.png",
    "Vivid tech/Soln for API-02.png",
    "Vivid tech/Soln for Biopharma-02.png",
    "Vivid tech/Soln for Formulations-03-03.png",
    "Vivid tech/Containment soln2.png",
    "Vivid tech/vivid slider 2.png",
  ],
  leder: [
    "Misc/Leden warren/lEDEN 22-01.png",
    "Misc/Leden warren/New-01.png",
    "Misc/Leden warren/New-02.png",
    "Misc/Leden warren/New-03.png",
    "Misc/Leden warren/Preview_final-01.png",
    "Misc/Leden warren/Preview_final-02.png",
  ],
  "first-divine": [
    "First Divine/Card_FD_name card front(vertical).png",
    "First Divine/Asset 4@2x.png",
    "First Divine/Asset 6@2x.png",
    "First Divine/Asset 7@2x.png",
    "First Divine/Asset 8@2x.png",
    "First Divine/Asset 9@2x.png",
  ],
  tsus: ["Sree Ram School/Artboard A.png", "Sree Ram School/Artboard B.png"],
  komono: [
    "komono/komono-01.png",
    "komono/komono1-01.png",
    "komono/komono2-01.png",
    "komono/komono3-01.png",
    "komono/komono4-01.png",
  ],
  "maler-oswald": ["Misc/Maler Oswald/logo oswald.png"],
  sotai: [
    "sotai Board/sotai-01.png",
    "sotai Board/WATERSUPPLY-01.png",
    "sotai Board/SewerPlan_PHE-01.png",
    "sotai Board/Water Supply _PHE-01.png",
  ],
  maxbox: [
    "Maxbox Creations/10286980_1410147702595102_2460365789775564992_o.jpg",
    "Maxbox Creations/10293849_1411502939126245_8772512400534564911_o.jpg",
    "Maxbox Creations/10406533_1443621305914408_3297850246705505207_n.jpg",
    "Maxbox Creations/10541465_1443621265914412_8749995307540947569_n.jpg",
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
      n--; // don't burn a number on a failed plate
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
