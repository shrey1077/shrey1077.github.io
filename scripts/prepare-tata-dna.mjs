/**
 * prepare-tata-dna — the four Brand DNA cards, cropped out of the rulebook.
 *
 * Band 03 of the Tata IIS page shows five small cards. Four of them want a
 * DIAGRAM, and the plates that hold those diagrams are full A4-ish pages
 * (1600×1138) with a title, a caption and a lot of white. Dropped into a card
 * whole, each one reads as a grey smudge; this cuts each page down to the part
 * that is actually the evidence.
 *
 * ⚠ THE CROPS ARE READ OFF THE PLATES, as fractions of the page, so they hold
 * if the source is ever re-exported at another size. They were taken off a
 * 10%-gridded contact sheet of the four plates, not guessed. Re-check them if
 * the rulebook itself is redesigned — a plate whose layout moved will crop to
 * the wrong thing silently, because every plate is the same size and the script
 * cannot tell.
 *
 * ⚠ The fifth card (Colour) has no entry here on purpose: it paints the
 * rulebooks' own hexes as swatches, which is truer than a screenshot of colour.
 *
 * Output: public/content/clients/tata-iis/brand/dna/*.webp
 * Safe to re-run; it only ever writes those four files.
 */

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const ROOT = process.cwd();
const PLATES = path.join(ROOT, "public/content/clients/tata-iis/brand/guidelines");
const OUT = path.join(ROOT, "public/content/clients/tata-iis/brand/dna");

/** left, top, right, bottom — as fractions of the plate. */
const CARDS = [
  {
    name: "grid",
    plate: "plate-03.webp",
    // The mark on its construction grid, with the 8x / 2x / 24x measures.
    box: [0.02, 0.05, 0.72, 0.5],
  },
  {
    name: "geometry",
    plate: "plate-08.webp",
    // The two boxed "T" marks and the alternate diamonds — the shapes the
    // system allows. ⚠ First pass took [0.06,0.18,0.46,0.43] and caught the
    // wordmark and its caption instead; the shapes sit in the plate's lower
    // half, not its upper.
    box: [0.1, 0.4, 0.95, 0.8],
  },
  {
    name: "typography",
    plate: "plate-10.webp",
    // The specimen with its 30mm/120mm dimensions, down to the line that names
    // Copperplate Gothic Bold.
    box: [0.1, 0.1, 0.72, 0.58],
  },
  {
    name: "usage",
    plate: "plate-11.webp",
    // The black-on-light / white-on-dark column of the precautions grid.
    box: [0.44, 0.17, 0.98, 0.62],
  },
];

await fs.mkdir(OUT, { recursive: true });

for (const card of CARDS) {
  const src = path.join(PLATES, card.plate);
  const image = sharp(src);
  const { width, height } = await image.metadata();
  if (!width || !height) throw new Error(`no size for ${card.plate}`);

  const [l, t, r, b] = card.box;
  const left = Math.round(l * width);
  const top = Math.round(t * height);
  const region = {
    left,
    top,
    width: Math.round(r * width) - left,
    height: Math.round(b * height) - top,
  };

  const out = path.join(OUT, `${card.name}.webp`);
  await image
    .extract(region)
    // Flattened onto white: the plates are opaque anyway, and the card sits on
    // white, so this keeps the edges from picking up the page's wash.
    .flatten({ background: "#ffffff" })
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);

  const { size } = await fs.stat(out);
  console.log(
    `${card.name.padEnd(11)} ${card.plate}  ${region.width}×${region.height}  →  ${(size / 1024).toFixed(1)} KB`,
  );
}
