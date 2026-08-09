/**
 * render-iisa-guidelines.mjs — rasterise the IIS Ahmedabad logo-guideline PDF
 * into the plate strip shown in the Tata IIS experience (the IISA column),
 * mirroring the IISM plates that `prepare-tata-experience.mjs` produces.
 *
 * The IISM plates came pre-exported as PNGs; IISA only exists as a PDF, so we
 * render it with pdf-to-img (pdfjs + prebuilt canvas — no system poppler/gs).
 *
 * Curated run (1-indexed PDF pages): cover · the mark/construction · exclusion
 * zone · colour palette · logo usage · don'ts. Skips rationale, typography,
 * icon and the thank-you page. Output: brand/guidelines-iisa/plate-01..06.webp.
 *
 * Idempotent. Run: node scripts/render-iisa-guidelines.mjs
 */

import { pdf } from "pdf-to-img";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "D:/Assets/Clients/Tata IIS/Logos and Guidelines/IISA/IISA Logo Guidelines (1).pdf";
const DEST = "D:/Brain Folio/public/content/clients/tata-iis/brand/guidelines-iisa";

/** 1-indexed PDF pages to keep, in strip order. */
const PAGES = [1, 3, 4, 5, 6, 7];

fs.mkdirSync(DEST, { recursive: true });

const doc = await pdf(SRC, { scale: 2.2 });
const keep = new Map(PAGES.map((p, i) => [p, i + 1])); // pdfPage → plate number

let seen = 0, ok = 0;
for await (const pageBuf of doc) {
  seen++;
  const plate = keep.get(seen);
  if (!plate) continue;
  const out = path.join(DEST, `plate-${String(plate).padStart(2, "0")}.webp`);
  await sharp(pageBuf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 84 }).toFile(out);
  ok++;
}

console.log(`Done. rendered ${ok}/${PAGES.length} IISA plates from ${seen} PDF pages → ${DEST}`);
if (ok !== PAGES.length) process.exit(1);
