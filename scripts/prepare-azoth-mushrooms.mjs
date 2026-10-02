/**
 * prepare-azoth-mushrooms.mjs — cut the four species out of their black
 * grounds so they can stand on the Azoth hero's flowering ridge.
 *
 * The owner generated the four (2026-10-02) on pure black, each on a mossy
 * stone with small purple flowers — the same vocabulary as the hero's
 * `bg-reveal` exposure, so the STONE STAYS: it is what seats each mushroom on
 * the ridge. Only the black is keyed out.
 *
 * The key is on each pixel's BRIGHTEST channel, not luminance: Cordyceps'
 * orange and Reishi's red are dim in luma but bright in one channel, and a luma
 * key ate their edges. Below LO is gone, above HI is solid, a smoothstep in
 * between feathers the edge. The result is trimmed to its own ink.
 *
 *   node scripts/prepare-azoth-mushrooms.mjs
 *
 * ⚠ Reishi's source carries a faint "dreamstime" watermark across the middle
 * caps — the generator reproduced a stock site's mark. Flagged to the owner;
 * replace `ganoderma` with a clean render before this ships.
 */

import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SRC = join(homedir(), "Downloads");
const OUT = "public/content/clients/azoth-biotech/hero/mushrooms";
const LO = 16;
const HI = 46;
const WIDTH = 900;

const FILES = {
  cordyceps:
    "gemini-2.5-flash-image_A_small_cluster_of_5_7_Cordyceps_militaris_fruiting_bodies_emerging_from_the_mos-0 (1).jpg",
  lionsmane:
    "gemini-2.5-flash-image_A_large_tall_Lion_s_Mane_mushroom_Hericium_erinaceus_with_a_stacked_tiered_form_-0.jpg",
  turkeystail:
    "lucid-origin_A_layered_rosette_of_Turkey_Tail_mushrooms_Trametes_versicolor_thin_fan-shaped_b-0.jpg",
  ganoderma:
    "gemini-2.5-flash-image_A_cluster_of_four_overlapping_Ganoderma_lucidum_Reishi_mushrooms_arranged_in_sta-0.jpg",
};

mkdirSync(OUT, { recursive: true });

for (const [id, file] of Object.entries(FILES)) {
  const { data, info } = await sharp(join(SRC, file))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const m = Math.max(data[i], data[i + 1], data[i + 2]);
    const t = Math.min(1, Math.max(0, (m - LO) / (HI - LO)));
    rgba[j] = data[i];
    rgba[j + 1] = data[i + 1];
    rgba[j + 2] = data[i + 2];
    rgba[j + 3] = Math.round(t * t * (3 - 2 * t) * 255);
  }
  const out = join(OUT, `${id}.webp`);
  const meta = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(out);
  console.log(`${id}: ${meta.width}×${meta.height} → ${out}`);
}
