/**
 * prepare-career.mjs — the employer marks for the Career Path timeline.
 *
 * Most of these logos exist nowhere else on the drives as standalone artwork,
 * but the 2024 resume (a 3508×2481 layout) carries each one at usable size, so
 * they're cropped straight from it — original marks, not redrawn. The rest come
 * from folders already prepared for the client pages.
 *
 * Output: public/content/career/<slug>.png
 * Idempotent. Node ≥ 18, sharp.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { BWP, ROOT } from "./sources.mjs";

const RESUME = path.join(BWP, "Resume ShreySingh-2024-01.png");
const P = BWP;
const FOLIO = ROOT;
const DEST = path.join(FOLIO, "public/content/career");

/** Regions of the resume layout holding each employer's mark. */
const FROM_RESUME = {
  abs: { left: 990, top: 110, width: 270, height: 230 },
  zabraku: { left: 2090, top: 120, width: 290, height: 200 },
  newsmobile: { left: 2500, top: 800, width: 480, height: 110 },
  ndtv: { left: 2500, top: 1430, width: 380, height: 120 },
};

/** Marks already prepared elsewhere. */
const FROM_FILE = {
  "tata-iis": `${P}/All Logos/TATA IIS corrrcetd BLK@3x.png`,
  azoth: `${FOLIO}/public/content/clients/azoth-biotech/brand/logo.png`,
  uid: `${P}/UID/whitelogonew-01-01.png`,
};

fs.mkdirSync(DEST, { recursive: true });
let ok = 0, fail = 0;

for (const [slug, region] of Object.entries(FROM_RESUME)) {
  try {
    await sharp(RESUME, { limitInputPixels: false })
      .extract(region)
      .trim({ threshold: 12 })
      .resize({ width: 480, withoutEnlargement: false })
      .png()
      .toFile(path.join(DEST, `${slug}.png`));
    ok++;
    console.log(`  ✓ ${slug} (resume)`);
  } catch (e) { fail++; console.error(`  ✗ ${slug}: ${e.message}`); }
}

for (const [slug, src] of Object.entries(FROM_FILE)) {
  try {
    await sharp(src, { limitInputPixels: false })
      .trim({ threshold: 12 })
      .resize({ width: 480, withoutEnlargement: true })
      .png()
      .toFile(path.join(DEST, `${slug}.png`));
    ok++;
    console.log(`  ✓ ${slug}`);
  } catch (e) { fail++; console.error(`  ✗ ${slug}: ${e.message}`); }
}

console.log(`\nDone. ${ok} ok, ${fail} failed.`);
if (fail > 0) process.exit(1);
