/**
 * prepare-tata-experience.mjs — extra assets for the rebuilt Tata IIS
 * full-experience page (the bespoke video-hero / guidelines / marquee /
 * category-accordion layout).
 *
 * Produces:
 *   • brand/powered/*         — the "Powered by" endorsement logos
 *   • brand/guidelines-iism/* — IISM logo-guideline page rasters
 *   • brand/hero-poster.jpg   — placeholder still for the 16:9 hero (last
 *                               frame of the logo-render film) until the user
 *                               uploads the real hero video
 *
 * Idempotent. Images via sharp; the poster via ffmpeg. Run:
 *   node scripts/prepare-tata-experience.mjs
 */

import sharp from "sharp";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SRC = "D:/Assets/Clients/Tata IIS";
const DEST = "D:/Brain Folio/public/content/clients/tata-iis";

const IMAGES = [
  // Powered-by endorsement logos (normalized width; PNG keeps transparency).
  ["Logos and Guidelines/Tata Logos (2)/Tata Trusts Logo-01.png", "brand/powered/tata-trusts.png", 480, "png"],
  ["Logos and Guidelines/Tata Logos (2)/Skill India Logo-01.png", "brand/powered/skill-india.png", 480, "png"],
  ["Logos and Guidelines/Tata Logos (2)/Govt of Gujarat Logo-02.png", "brand/powered/govt-gujarat.png", 480, "png"],

  // IISM logo-guideline pages (a curated run of the deck).
  ...["01", "02", "03", "04", "05", "06"].map((n) => [
    `Logos and Guidelines/IISM/Logo IIS Mumbai Guidelines-${n}.png`,
    `brand/guidelines-iism/plate-${n}.webp`,
    1600,
  ]),
];

const ensure = (p) => fs.mkdirSync(p, { recursive: true });
let ok = 0, fail = 0;

for (const [src, dest, width, format = "webp"] of IMAGES) {
  const from = path.join(SRC, src);
  const to = path.join(DEST, dest);
  try {
    ensure(path.dirname(to));
    const img = sharp(from, { limitInputPixels: false }).resize({
      width,
      withoutEnlargement: true,
    });
    if (format === "png") await img.png().toFile(to);
    else await img.webp({ quality: 82 }).toFile(to);
    ok++;
  } catch (e) {
    fail++;
    console.error(`IMAGE FAIL: ${src}: ${e.message}`);
  }
}

// Hero placeholder poster — the closing frame of the logo-render film.
try {
  const posterSrc = path.join(SRC, "Digital/Videos/- RENDER.mp4");
  const posterOut = path.join(DEST, "brand/hero-poster.jpg");
  ensure(path.dirname(posterOut));
  // -sseof -0.5 grabs a frame half a second before the end (the settled mark).
  execFileSync("ffmpeg", [
    "-y", "-sseof", "-0.5", "-i", posterSrc, "-frames:v", "1", "-q:v", "3",
    "-vf", "scale=1600:-2", posterOut,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  ok++;
} catch (e) {
  fail++;
  console.error(`POSTER FAIL: ${e.message}`);
}

console.log(`\nDone. ${ok} ok, ${fail} failed.`);
if (fail > 0) process.exit(1);
