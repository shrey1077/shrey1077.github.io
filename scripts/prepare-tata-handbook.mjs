/**
 * prepare-tata-handbook.mjs — band 03 of the Tata IIS page, "The handbook"
 * (owner, 2026-10-04): the slider's pages from both editions, and the
 * flipbook from the corners of the right-hand pages.
 *
 *   _source/Assets/Clients/Tata IIS/Print/Handbook/IISA Handbook_one.pdf
 *   _source/Assets/Clients/Tata IIS/Print/Handbook/IISM Handbook_one.pdf
 *     (gitignored; copied 2026-10-04 from D:/Assets_107/Clients/Tata IIS/Print/
 *      Handbook — the two files the owner named. The "AMD/MUM MAY28" files
 *      beside them are the earlier printing.)
 *   → public/content/clients/tata-iis/handbook/{iisa,iism}/NN-<slug>.webp
 *   → public/content/clients/tata-iis/handbook/flipbook.webp   (animated)
 *   → public/content/clients/tata-iis/handbook/flipbook-still.webp (last frame)
 *   → src/constants/tataHandbook.ts                            (generated)
 *
 * THE PAGES are the same ten in both editions, so switching edition on the
 * page shows the same page in the other theme. The two books run in step for
 * their front matter and drift by up to four pages in the weekly section (the
 * Mumbai book's week openers sit later) — hence a page number per edition.
 *
 * THE FLIPBOOK: every right-hand page from the first week on carries one frame
 * of a boy freeing birds from a cage in its lower-right corner. Those corners
 * are cut from the Ahmedabad book's odd pages, the ruled lines that cross them
 * are lifted out (a row-wide run of grey is a rule; a pixel in it is kept only
 * where the drawing continues above and below it), corners with no drawing in
 * them (puzzle pages) are dropped, and what is left is joined into one
 * animated webp.
 *
 * ENGINE: pdf-to-img (pdfjs), as for the Extincts reports — the PDFium shim
 * needs a Python this machine does not have.
 *
 *   node scripts/prepare-tata-handbook.mjs
 */

import { pdf } from "pdf-to-img";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { ASSETS, CONTENT, ROOT } from "./sources.mjs";

const SRC = path.join(ASSETS, "Clients/Tata IIS/Print/Handbook");
const OUT = path.join(CONTENT, "clients/tata-iis/handbook");
const TS = path.join(ROOT, "src/constants/tataHandbook.ts");
const URL = "/content/clients/tata-iis/handbook";

const EDITIONS = {
  iisa: "IISA Handbook_one.pdf",
  iism: "IISM Handbook_one.pdf",
};

/** The slider: slug, caption, and the page in each edition.
 *  ⚠ NO POLICY PAGES, NO LETTERS (owner, 2026-10-04: keep what the page
 *  discloses about the institute professional). The fee and attendance
 *  policies and the COO's letter — a named executive, with a photograph —
 *  were in the first cut and came out; the band names those contents in
 *  general terms instead. The declaration stays: it is a blank form. */
const SLIDES = [
  { slug: "cover", caption: "The cover", iisa: 1, iism: 1 },
  { slug: "belongs-to", caption: "This handbook belongs to…", iisa: 3, iism: 3 },
  { slug: "welcome", caption: "Welcome", iisa: 5, iism: 5 },
  { slug: "pledge", caption: "The pledge", iisa: 11, iism: 11 },
  { slug: "declaration", caption: "The trainee’s declaration", iisa: 24, iism: 24 },
  { slug: "notes", caption: "Notes — and the flipbook in the corner", iisa: 141, iism: 145 },
  { slug: "week-1", caption: "Week 1’s puzzle", iisa: 36, iism: 40 },
  { slug: "crossword", caption: "Week 2: a crossword", iisa: 50, iism: 54 },
  { slug: "sudoku", caption: "Week 7: sudoku", iisa: 120, iism: 124 },
  { slug: "answer-key", caption: "The answer key, hidden behind a QR code", iisa: 197, iism: 197 },
];

/** Pages render to this long edge (the page is US Letter, 612×792pt). */
const LONG_EDGE = 1500;
const QUALITY = 80;

/** The flipbook's corner, as fractions of the page, and its frame timing. */
const CORNER = { x0: 0.72, x1: 0.96, y0: 0.69, y1: 0.915 };
const FRAME_W = 280;
const FIRST_FRAME_PAGE = 27;
const FRAME_MS = 90;
const HOLD_MS = 1600;
/** A corner with fewer dark pixels than this has no drawing in it. */
const MIN_INK = 60;

async function renderPages(file, pages, scale) {
  const doc = await pdf(path.join(SRC, file), { scale });
  const out = new Map();
  for (const n of pages) out.set(n, await doc.getPage(n));
  return out;
}

async function slides() {
  const sizes = {};
  for (const [ed, file] of Object.entries(EDITIONS)) {
    const dir = path.join(OUT, ed);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const pngs = await renderPages(file, SLIDES.map((s) => s[ed]), LONG_EDGE / 792 + 0.01);
    for (const [i, s] of SLIDES.entries()) {
      const name = `${String(i + 1).padStart(2, "0")}-${s.slug}.webp`;
      const info = await sharp(pngs.get(s[ed]))
        .resize({ height: LONG_EDGE })
        .flatten({ background: "#ffffff" })
        .webp({ quality: QUALITY })
        .toFile(path.join(dir, name));
      sizes[`${ed}/${name}`] = info;
      console.log(ed, s[ed], name, info.width, info.height, Math.round(info.size / 1024) + "KB");
    }
  }
  return sizes;
}

/** Lift the ruled lines out of a greyscale corner, in place. */
function liftRules(px, w, h) {
  const ink = (v) => v < 235;
  for (let y = 0; y < h; y++) {
    let n = 0;
    for (let x = 0; x < w; x++) if (ink(px[y * w + x])) n++;
    if (n < w * 0.45) continue; // not a rule
    for (let x = 0; x < w; x++) {
      const up = y >= 3 ? px[(y - 3) * w + x] : 255;
      const down = y + 3 < h ? px[(y + 3) * w + x] : 255;
      if (!(ink(up) && ink(down))) px[y * w + x] = 255;
    }
  }
}

async function flipbook() {
  const doc = await pdf(path.join(SRC, EDITIONS.iisa), { scale: 3.2 });
  const raws = [];
  // From page 27: page 25, the Week 1 opener, carries the first frame on a
  // gridded ground that would flash in as frame one.
  for (let n = FIRST_FRAME_PAGE; n <= doc.length; n += 2) {
    const png = await doc.getPage(n);
    const m = await sharp(png).metadata();
    const box = {
      left: Math.round(m.width * CORNER.x0),
      top: Math.round(m.height * CORNER.y0),
      width: Math.round(m.width * (CORNER.x1 - CORNER.x0)),
      height: Math.round(m.height * (CORNER.y1 - CORNER.y0)),
    };
    const { data, info } = await sharp(png)
      .flatten({ background: "#ffffff" })
      .extract(box)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    liftRules(data, info.width, info.height);
    let dark = 0;
    for (const v of data) if (v < 160) dark++;
    if (dark >= MIN_INK) raws.push({ data, w: info.width, h: info.height });
  }

  // One crop for every frame: the box the drawing fills across the WHOLE run
  // (the boy at its foot, the last bird at its top), padded — so nothing moves
  // but the drawing, and the drawing fills the frame.
  const { w, h } = raws[0];
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (const { data } of raws)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (data[y * w + x] < 200) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
  const pad = 20;
  const crop = {
    left: Math.max(0, x0 - pad),
    top: Math.max(0, y0 - pad),
    width: Math.min(w, x1 + pad) - Math.max(0, x0 - pad),
    height: Math.min(h, y1 + pad) - Math.max(0, y0 - pad),
  };
  const frames = [];
  for (const { data } of raws)
    frames.push(
      await sharp(data, { raw: { width: w, height: h, channels: 1 } })
        .extract(crop)
        .resize({ width: FRAME_W })
        .toColourspace("srgb")
        .png()
        .toBuffer(),
    );

  const delay = frames.map((_, i) => (i === frames.length - 1 ? HOLD_MS : FRAME_MS));
  const info = await sharp(frames, { join: { animated: true } })
    .webp({ quality: 82, loop: 0, delay })
    .toFile(path.join(OUT, "flipbook.webp"));
  // Its last frame, still — for anyone who has asked for less motion.
  await sharp(frames[frames.length - 1]).webp({ quality: 85 }).toFile(path.join(OUT, "flipbook-still.webp"));
  console.log("flipbook", frames.length, "frames, crop", JSON.stringify(crop), Math.round(info.size / 1024) + "KB");
  const meta = await sharp(frames[0]).metadata();
  return { frames: frames.length, w: meta.width, h: meta.height };
}

fs.mkdirSync(OUT, { recursive: true });
await slides();
const fb = await flipbook();

const ts = `/**
 * GENERATED by scripts/prepare-tata-handbook.mjs — do not edit by hand.
 *
 * Band 03's slider: the same ten pages from each edition of the trainee
 * handbook (IIS Ahmedabad's and IIS Mumbai's), and the flipbook cut from the
 * corners of the Ahmedabad book's right-hand pages.
 */

export type HandbookEdition = "iisa" | "iism";

/** Every page is US Letter, rendered ${Math.round((LONG_EDGE * 612) / 792)}×${LONG_EDGE}. */
export const HANDBOOK_PAGE = { w: 612, h: 792 } as const;

export const HANDBOOK_SLIDES = [
${SLIDES.map(
  (s, i) =>
    `  {\n    slug: "${s.slug}",\n    caption: ${JSON.stringify(s.caption)},\n    iisa: "${URL}/iisa/${String(i + 1).padStart(2, "0")}-${s.slug}.webp",\n    iism: "${URL}/iism/${String(i + 1).padStart(2, "0")}-${s.slug}.webp",\n  },`,
).join("\n")}
] as const;

/** ${fb.frames} frames, looping, the last one held. */
export const HANDBOOK_FLIPBOOK = {
  src: "${URL}/flipbook.webp",
  /** The last frame, for reduced motion. */
  still: "${URL}/flipbook-still.webp",
  w: ${fb.w},
  h: ${fb.h},
} as const;
`;
fs.writeFileSync(TS, ts);
console.log("wrote", path.relative(ROOT, TS));
