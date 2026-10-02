/**
 * prepare-azoth-marks.mjs — the Azoth identity files the owner supplied on
 * 2026-10-03: the monogram, its construction sketch ("strains of mycelium" in
 * a "petri dish"), the three lockups, and Naturalist's Brain Fuel bottle.
 *
 *   _source/BWP/Azoth/marks-2026-10-03/*   (gitignored originals)
 *   → public/content/clients/azoth-biotech/brand/marks/*.webp
 *
 * Marks and lockups are trimmed to their ink and keep their transparency (the
 * white lockup is white-on-clear and only reads on a dark plate). The sketch
 * and the bottle are opaque artwork on white and are only re-encoded.
 *
 *   node scripts/prepare-azoth-marks.mjs
 */

import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SOURCE, ROOT } from "./sources.mjs";

const SRC = path.join(SOURCE, "BWP", "Azoth", "marks-2026-10-03");
const OUT = path.join(ROOT, "public", "content", "clients", "azoth-biotech", "brand", "marks");
mkdirSync(OUT, { recursive: true });

/** A transparent mark: trim to ink, a hair of padding, WebP with alpha. */
async function mark(file, out, width) {
  const meta = await sharp(path.join(SRC, file))
    .ensureAlpha()
    .trim({ threshold: 1 })
    .extend({ top: 8, bottom: 8, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(path.join(OUT, out));
  console.log(`${out} ${meta.width}×${meta.height}`);
}

/** A black mark supplied on OPAQUE white (the monogram's PNG has no
 *  transparency): the ink becomes alpha — alpha = 255 − luminance over pure
 *  black — so it sits on any plate without a white box, edges kept soft. */
async function inkMark(file, out, width) {
  const { data, info } = await sharp(path.join(SRC, file))
    .flatten({ background: "#ffffff" })
    .greyscale()
    .trim({ threshold: 10 })
    .extend({ top: 8, bottom: 8, left: 8, right: 8, background: "#ffffff" })
    .resize({ width, withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const rgba = Buffer.alloc(W * H * 4);
  for (let p = 0; p < W * H; p++) rgba[p * 4 + 3] = 255 - data[p * info.channels];
  const meta = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(path.join(OUT, out));
  console.log(`${out} ${meta.width}×${meta.height} (white keyed out)`);
}

/** Opaque artwork: re-encoded only. */
async function art(file, out, width) {
  const meta = await sharp(path.join(SRC, file))
    .flatten({ background: "#ffffff" })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(path.join(OUT, out));
  console.log(`${out} ${meta.width}×${meta.height}`);
}

await inkMark("azoth-mark-black.png", "mark-black.webp", 830);
await art("azoth-mark-construction.png", "mark-construction.webp", 1100);
await mark("azoth-lockup-horizontal-black.png", "lockup-horizontal-black.webp", 512);
await mark("azoth-lockup-horizontal-white.png", "lockup-horizontal-white.webp", 500);
await mark("azoth-lockup-stacked-colour.png", "lockup-stacked-colour.webp", 700);
await art("naturalist-brain-fuel.jpg", "naturalist-brain-fuel.webp", 800);
