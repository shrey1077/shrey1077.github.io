/**
 * prepare-azoth-experience.mjs — assets for the bespoke Azoth Biotech client
 * experience (identity → design foundations → brand architecture → per-brand
 * social work → rejected logos).
 *
 * Sources (the user's own design work):
 *   D:/Assets/Clients/Azoth+                     — the social posts + cert
 *   D:/Brain Website portfolio/Azoth             — logos, sub-brand marks, sheets
 *   D:/Brain Website portfolio/logos             — the Naturalist logo (PDF)
 *
 * Output: public/content/clients/azoth-biotech/{brand,work}/…
 * Idempotent. Node ≥ 18, sharp (+ pdf-to-img for the Naturalist logo PDF).
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const AZ = "D:/Assets/Clients/Azoth+";
const BR = "D:/Brain Website portfolio/Azoth";
const LG = "D:/Brain Website portfolio/logos";
const DEST = "D:/Brain Folio/public/content/clients/azoth-biotech";

const ensure = (p) => fs.mkdirSync(p, { recursive: true });
let ok = 0, fail = 0;
const done = (m) => { ok++; console.log("  ✓ " + m); };
const err = (m, e) => { fail++; console.error("  ✗ " + m + ": " + e.message); };

/** Trim a logo to its ink and re-pad a hair, keeping transparency if present. */
async function logo(src, out, width = 720) {
  try {
    ensure(path.dirname(out));
    await sharp(src, { limitInputPixels: false })
      .trim({ threshold: 12 })
      .resize({ width, withoutEnlargement: true })
      .png()
      .toFile(out);
    done(path.basename(out));
  } catch (e) { err(path.basename(out), e); }
}

/** A social post / artwork → web webp. */
async function webp(src, out, width = 1080, q = 82) {
  try {
    ensure(path.dirname(out));
    await sharp(src, { limitInputPixels: false }).resize({ width, withoutEnlargement: true }).webp({ quality: q }).toFile(out);
    done(path.basename(out));
  } catch (e) { err(path.basename(out), e); }
}

/** Crop a fractional region of a sheet, then trim to ink (for logos on sheets). */
async function cropLogo(src, out, frac, width = 720) {
  try {
    ensure(path.dirname(out));
    const m = await sharp(src).metadata();
    const left = Math.round(m.width * frac.x), top = Math.round(m.height * frac.y);
    const w = Math.round(m.width * frac.w), h = Math.round(m.height * frac.h);
    await sharp(src, { limitInputPixels: false })
      .extract({ left, top, width: w, height: h })
      .trim({ threshold: 12 })
      .resize({ width, withoutEnlargement: true })
      .png()
      .toFile(out);
    done(path.basename(out));
  } catch (e) { err(path.basename(out), e); }
}

console.log("Logos:");
await logo(`${BR}/Asset 1@4x.png`, `${DEST}/brand/logo.png`, 560);            // Azoth monogram
await logo(`${BR}/Asset 13@2x.png`, `${DEST}/brand/brands/mycoactive.png`, 720);
await logo(`${BR}/kavaka 1@2x.png`, `${DEST}/brand/brands/kavaka.png`, 720);
await cropLogo(`${BR}/mw_sheet-01-01.png`, `${DEST}/brand/brands/mushroomworks.png`, { x: 0, y: 0.354, w: 0.451, h: 0.3 });
await cropLogo(`${BR}/LOGOS SHEETSMYCO-01.png`, `${DEST}/brand/brands/mycoveda.png`, { x: 0.08, y: 0.6, w: 0.84, h: 0.13 });

console.log("Naturalist logo (PDF):");
try {
  const { pdf } = await import("pdf-to-img");
  const doc = await pdf(`${LG}/Naturalist Logo_ Resolution Free.pdf`, { scale: 3 });
  let i = 0;
  for await (const page of doc) { if (i === 0) { ensure(`${DEST}/brand/brands`); await sharp(page).trim({ threshold: 12 }).resize({ width: 720 }).png().toFile(`${DEST}/brand/brands/naturalist.png`); done("naturalist.png"); } i++; }
} catch (e) { err("naturalist.png", e); }

console.log("Naturalist full brand artwork:");
await webp(`${BR}/Naturalist-01.png`, `${DEST}/brand/naturalist-artwork.webp`, 1600, 86);

console.log("Rejected-logo sheets:");
await webp(`${BR}/lOGOS-01.png`, `${DEST}/brand/rejected/azoth.webp`, 1400, 84);
await webp(`${BR}/mw_sheet-01-01.png`, `${DEST}/brand/rejected/mushroomworks.webp`, 1400, 84);
await webp(`${BR}/LOGOS SHEETSMYCO-01.png`, `${DEST}/brand/rejected/mycoveda.webp`, 1400, 84);

console.log("Social posts — Naturalist:");
const NATURALIST = [
  "Athletes.png", "Benefits of cordy.png", "Benefits of cordy copy.png", "Benefits of cordy copy 3.png",
  "Benefits of cordy copy 5refsdtg.png", "Benefits of cordy11.png", "CHinese influence.png",
  "History of cordy4.png", "History cordy copy 5.png", "Historycordy.png", "Smoker Lungs.png",
  "athletes3.png", "athletescordycep.png", "nutra1.png", "sex drive.png", "sex drive3.png",
  "smokers2.png", "smoking4.png",
];
let n = 0;
for (const f of NATURALIST) await webp(`${AZ}/${f}`, `${DEST}/work/naturalist/${String(++n).padStart(2, "0")}.webp`, 1080);

console.log("Social posts — Mushroomworks:");
const MUSHROOMWORKS = [
  "MW_MP.png", "Mycelium packaging.png", "Packaging1.png", "mworkssept.png", "mycpack.png",
  "vleather.png", "vleather copy.png", "vleather copyOIUYFG.png", "vleather2.png", "vleather3.png",
  "vleather4.png", "vleather5.png", "vleather6.png", "vleather7.png",
];
n = 0;
for (const f of MUSHROOMWORKS) await webp(`${AZ}/${f}`, `${DEST}/work/mushroomworks/${String(++n).padStart(2, "0")}.webp`, 1080);

console.log("Social posts — Azoth (parent):");
await webp(`${AZ}/AZTrainingPost2.png`, `${DEST}/work/azoth/training.webp`, 1080);

console.log(`\nDone. ${ok} ok, ${fail} failed.`);
if (fail > 0) process.exit(1);
